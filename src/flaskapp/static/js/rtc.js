var socket;
var rtc_peers = {};
var local_rtc_stream = null;
const rtc_configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}

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
    constructor(){
        this.pc = new RTCPeerConnection(rtc_configuration);
        this.pc.onicecandidate= e=>{
            if(e.candidate){
                socket.emit("rtc iceCandidate",{'sid':this.sid,'iceCandidate':e.candidate});
            }
        }
        this.pc.addEventListener('connectionstatechange', event => {
            //console.log("connectionStateChanged", this.pc.connectionState)
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
    set_peer_info = (pi)=>{
        this.sid = pi.sid
        this.dom = $("#voice_peers").find(`[data-sid="${pi.sid}"]`);
        var dom_status = this.dom.find("p");
        var dom_video = this.dom.find("video");
        dom_video[0].srcObject = this.remoteStream;
    }
    on_offer = async (pi)=>{
        this.set_peer_info(pi);
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
    on_new_peer = async (pi)=>{
        this.set_peer_info(pi);

        const offer = await this.pc.createOffer();
        this.pc.setLocalDescription(offer);
        socket.emit("rtc offer",{'sid':pi.sid,'offer':offer});
    }
}
$(function(){
    socket = io();

    var callback_voice_join = async function(){
        try{
            local_rtc_stream = await navigator.mediaDevices.getUserMedia({audio: true});
        }catch(err){
            console.log("failed to get local rtc stream: ",err.message);

            local_rtc_stream=null;
        }
        
        socket.emit("peer join",{docid:documentName});
    };
    var callback_voice_quit = async function(){
        socket.emit("peer quit");
        for( peer in rtc_peers){
            rtc_peers[peer].pc.close();
        }
        $("#voice_peers").empty()
        $("#remote_voice_tracks").empty()
        if(local_rtc_stream!=null){
            local_rtc_stream.getTracks().forEach(function(track) { track.stop(); })
            local_rtc_stream=null;
        }
    }
    var voice_connected = false;

    $('#voice_toggle').on('click', function(){
        if(voice_connected){
            callback_voice_quit();
            $(this).text("Join Voice Chat")
        }else{
            callback_voice_join();
            $(this).text("Quit Voice Chat")
        }
        voice_connected = !voice_connected;
    });

    socket.on("connect", function(){
    })

    add_dom = function(sid){
        var container = document.createElement("div")
        container.dataset['sid']=sid
        container.className = "connectedPeer"
        var ad = null;
        var isme = sid==socket.io.engine.id;

        if(isme){
            ;
        }
        else if(!(sid in rtc_peers) || rtc_peers[sid].pc.connectionState!="connected" )
        {
            container.className += " connectionPending"
        }
        $("#voice_peers").append(container)

        var mute_button=document.createElement("button")
        mute_button.type = "button"
        mute_button.className="btn btn-secondary"
        mute_button.innerText="Mute"
        if(isme){
            if(local_rtc_stream){
                mute_button.onclick=function(){
                    var tracks =local_rtc_stream.getTracks()
                    tracks.forEach(function(track) { track.enabled=!track.enabled; })
                    mute_button.innerText = tracks[0].enabled?"Mute" : "Unmute";
                }
            }else{
                mute_button.innerText="Mic N/A"
                mute_button.disabled=true
            }
        }else{
            mute_button.onclick=function(){
                ad.muted = !ad.muted;
                mute_button.innerText = ad.muted?"Unmute" : "Mute";
            }
        }  
        container.append(mute_button)
        
        var lbl = document.createElement("p")
        lbl.innerText= isme ? "(me)" + sid : sid
        container.append(lbl)

        if(!isme){
            ad = document.createElement("video")
            ad.autoplay= true;
            ad.playsinline=true;
            ad.controls="false";
            ad.style.display='none';
            container.append(ad)
        }
    }


    // peer

    socket.on("result peer join", function(pis){
        for (var pi of pis){
            add_dom(pi.sid)
        }
    })

    socket.on("peer new", function(pi){
        add_dom(pi.sid)
        if(pi.sid!=socket.io.engine.id){
            peer = new Peer();
            rtc_peers[pi.sid] = peer;
            peer.on_new_peer(pi);
        }
    })

    socket.on("peer del", function(pi){
        rtc_peers[pi.sid].dom.remove();
        // close connection
        rtc_peers[pi.sid].pc.close();
        delete rtc_peers[pi.sid];
    })


    // rtc
    
    socket.on("rtc offer", function(pi){
        var peer = new Peer();
        rtc_peers[pi.sid]=peer;
        peer.on_offer(pi);
    })

    socket.on("rtc answer", function(pi){
        rtc_peers[pi.sid].on_answer(pi);
    })

    socket.on("rtc iceCandidate", function(pi){
        rtc_peers[pi.sid].pc.addIceCandidate(pi.iceCandidate);
    })
});