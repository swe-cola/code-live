var socket;
var mysid = null;
var rtc_peers = {};
var local_rtc_stream = null;
const rtc_configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}


var map_socketid_to_handlename = function(sid){
    return sid.substr(0,5); //replace this line with handle name
}
var is_me = function(sid){
    return sid==mysid;
}
var is_peer_available = function(sid){
    return sid in rtc_peers;
}
var is_peer_connected = function(sid){
    if(is_me(sid)) return true;

    return is_peer_available(sid) && rtc_peers[sid].pc.connectionState!="connected";
}

var on_peer_new_passive = function(sid){
    if(sid in rtc_peers)
        return;
    peer = new Peer(sid);
    rtc_peers[sid] = peer;
}
var on_peer_new_active = function(sid){
    on_peer_new_passive(sid);
    if(!is_me(sid))
        peer.on_new_remote_peer(sid);
}

var on_peer_del = function(sid){
    if(!(sid in rtc_peers) || is_me(sid))
        return;
    
    // close connection
    if(rtc_peers[sid].dom)
        rtc_peers[sid].dom.remove();
    rtc_peers[sid].close();
    delete rtc_peers[sid];
}

class Peer{
    sid=null;
    dc=null;
    pc=null;
    volumn=0;
    muted=false;
    video_available=false;
    audio_available=false;
    stream=null;
    dom=null;
    constructor(sid){
        if(this.sid in rtc_peers)
            on_peer_del(this);
        this.sid = sid;
        this.set_identity();
        this.create_dom();
        if(!is_me(this.sid)){
            var dom_video = this.dom.find("video");
            dom_video[0].srcObject = this.remoteStream;
        }
    }
    set_identity(){
        if(is_me(this.sid))
            this.set_as_myself();
        else
            this.set_as_remote_peer();
    }
    set_as_myself(){

    }
    set_as_remote_peer(){
        this.pc = new RTCPeerConnection(rtc_configuration);
        this.pc.onicecandidate= e=>{
            if(e.candidate){
                socket.emit("rtc iceCandidate",{'sid':this.sid,'iceCandidate':e.candidate});
            }
        }
        this.pc.addEventListener('connectionstatechange', event => {
            if (this.pc.connectionState === 'connected') {
                this.dom.removeClass("connectionPending")
            }
        });

        this.remoteStream = new MediaStream();
        this.pc.ontrack = (event) => {
            this.remoteStream.addTrack(event.track);
        };
        if(local_rtc_stream!=null){
            local_rtc_stream.getTracks().forEach(track => {
                this.pc.addTrack(track);
            });
        }else{
            let silence = () => {
                let ctx = new AudioContext(), oscillator = ctx.createOscillator();
                let dst = oscillator.connect(ctx.createMediaStreamDestination());
                oscillator.start();
                return Object.assign(dst.stream.getAudioTracks()[0], {enabled: false});
            }
            this.pc.addTrack(silence())
        }
    }
    on_offer = async (pi)=>{
        const offer = new RTCSessionDescription(pi.offer);
        await this.pc.setRemoteDescription( offer );
        const ans = await this.pc.createAnswer();
        this.pc.setLocalDescription(ans);

        socket.emit("rtc answer",{'sid':pi.sid,'answer':ans});
    }
    on_answer = (pi)=>{
        const ans = new RTCSessionDescription(pi.answer);

        this.pc.setRemoteDescription( ans );

    }
    on_new_remote_peer = async (peer_sid)=>{
        const offer = await this.pc.createOffer();
        this.pc.setLocalDescription(offer);
        var timervar = null;
        var do_offer = _=>{
            //console.log("do_offer(timer):",this.pc.connectionState);
            if(this.pc.connectionState === 'connected'
            || this.pc.connectionState === 'closed'){
                clearInterval(timervar);
                timervar= null;
            }else{
                socket.emit("rtc offer",{'sid':peer_sid,'offer':offer});
            }
        }
        do_offer();
        timervar = setInterval(do_offer,5000);
    }
    create_dom(){
        if(this.dom)
            return;
        
        var container = document.createElement("div")
        container.dataset['sid']=this.sid
        container.className = "connectedPeer"
        var ad = null;

        if(!is_peer_connected(this.sid))
        {
            container.classList.add("connectionPending");
        }

        var mute_button=$("#rtc_ui_template .mute_button").clone()[0];//document.createElement("button")
        if(is_me(this.sid)){
            if(local_rtc_stream){
                mute_button.onclick=function(){
                    var tracks =local_rtc_stream.getTracks()
                    tracks.forEach(function(track) { track.enabled=!track.enabled; })
                    if(tracks[0].enabled)
                        container.classList.remove("muted")
                    else
                        container.classList.add("muted")
                }
            }else{
                container.classList.add("nomic")
                mute_button.disabled=true
            }
        }else{
            mute_button.onclick=function(){
                ad.muted = !ad.muted;
                if(ad.muted)
                    container.classList.add("muted")
                else
                    container.classList.remove("muted")
            }
        }  
        container.append(mute_button)
        
        var lbl = document.createElement("p")
        var handle = map_socketid_to_handlename(this.sid);
        lbl.innerText= is_me(this.sid) ? "(me)" + handle : handle;
        container.append(lbl)

        if(!is_me(this.sid)){
            ad = document.createElement("video")
            ad.autoplay= true;
            ad.playsinline=true;
            ad.controls="false";
            ad.style.display='none';
            container.append(ad)
        }

        $("#voice_peers").append(container);
        this.dom = $(container);
    }
    close(){
        if(this.pc)
            this.pc.close();
    }
}
$(function(){
    socket = io(`${CHAT_SERVER_HOST}:${CHAT_SERVER_PORT}`);
    var timervar = null;
    var am_I_connected = false;

    var timer_event = function(){
        socket.emit("peer list");
    }

    var callback_voice_join = async function(){
        try{
            local_rtc_stream = await navigator.mediaDevices.getUserMedia({audio: true});
        }catch(err){
            console.log("failed to get local rtc stream: ",err.message);

            local_rtc_stream=null;
        }
        timervar = setInterval(timer_event, 5000);
        
        socket.emit("peer join",{docid:documentName});
        am_I_connected=true;
    };
    var callback_voice_quit = async function(){
        clearInterval(timervar);
        timervar=null;

        socket.emit("peer quit");
        for( peer in rtc_peers){
            rtc_peers[peer].close();
        }
        rtc_peers={};
        $("#voice_peers").empty();
        if(local_rtc_stream!=null){
            local_rtc_stream.getTracks().forEach(function(track) { track.stop(); })
            local_rtc_stream=null;
        }
        am_I_connected=false;
    }

    var callback_toggle_voice_chat = function(transition_to){
        if(transition_to == am_I_connected)
            return;
        
        if(transition_to){
            callback_voice_join();
            $("#voice_toggle").text("Quit Voice Chat")
        }else{
            callback_voice_quit();
            $("#voice_toggle").text("Join Voice Chat")
        }
    }

    $('#voice_toggle').on('click', function(){
        callback_toggle_voice_chat(!am_I_connected);
    });

    // peer

    socket.on("result peer join", function(result){
        mysid = result.me;
        for (var peer_sid of result.list){
            on_peer_new_passive(peer_sid)
        }
    })


    socket.on("peer new", on_peer_new_active);
    socket.on("peer del", on_peer_del);

    socket.on("result peer list", function(sids){
        if(!am_I_connected) return;
        const sids_real = sids;
        const sids_visible = Object.keys(rtc_peers);
        const parted = sids_visible.filter(x=>!sids_real.includes(x));
        const joined = sids_real.filter(x=>!sids_visible.includes(x));
        const am_I_real = sids_real.includes(mysid);

        // console.log("result peer list:",{sids_real,sids_visible,parted,joined,am_I_real});

        if(!am_I_real){
            callback_toggle_voice_chat(false);
            callback_toggle_voice_chat(true);
            // reconnect
            return;
        }

        for(var p in parted){
            on_peer_del({'sid':p});
            // part from local
        }

        for(var j in joined){
            on_peer_new_active({'sid':j});
            // join from local
        }
    })


    // rtc
    
    socket.on("rtc offer", function(pi){
        on_peer_new_passive(pi.sid);
        rtc_peers[pi.sid].on_offer(pi);
    })

    socket.on("rtc answer", function(pi){
        if(pi.sid in rtc_peers)
            rtc_peers[pi.sid].on_answer(pi);
    })

    socket.on("rtc iceCandidate", function(pi){
        if(pi.sid in rtc_peers)
            rtc_peers[pi.sid].pc.addIceCandidate(pi.iceCandidate);
    })
});
