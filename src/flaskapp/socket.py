from flask import request
from flaskapp import app, socketio
from flask_socketio import send,emit, join_room, leave_room

_docs = dict() # docid -> sids
_sids = dict() # sid -> { sid, docid}


def create_peer_info(rq, data):
    pi = {**data}
    pi['sid']=rq.sid
    return pi

def _doc_room(pi):
    return f"d:{pi['docid']}"

def _soc_room(pi):
    return f"s:{pi['sid']}"

#forward msg
@socketio.on("rtc offer")
def on_rtc_offer(data):
    if('sid' not in data):
        return
    if( (request.sid not in _sids) or (data['sid'] not in _sids)):
        return
    pi = create_peer_info(request,data)
    emit("rtc offer", pi, room=_soc_room(data))
    return

#forward msg
@socketio.on("rtc answer")
def on_rtc_answer(data):
    if('sid' not in data):
        return
    if( (request.sid not in _sids) or (data['sid'] not in _sids)):
        return
    pi = create_peer_info(request,data)
    emit("rtc answer", pi, room=_soc_room(data))
    return

#forward msg
@socketio.on("rtc iceCandidate")
def on_rtc_iceCandidate(data):
    if('sid' not in data):
        return
    if( (request.sid not in _sids) or (data['sid'] not in _sids)):
        return
    pi = create_peer_info(request,data)
    emit("rtc iceCandidate", pi, room=_soc_room(data))
    return

@socketio.on("peer join")
def on_peer_join(data):
    if('docid' not in data):
        return
    if(request.sid in _sids):
        return

    if(data['docid'] not in _docs.keys()):
        _docs[ data['docid']]=set()

    pi = create_peer_info(request,data)

    _sids[request.sid] = pi
    peers = _docs[ pi['docid']]
    peers.add(pi['sid'])

    emit("peer new", pi, room=_doc_room(pi))
    join_room(_doc_room(pi))
    join_room(_soc_room(pi))
    emit("result peer join", [_sids[peer] for peer in peers] )

@socketio.on("peer list")
def on_peer_list(data):

    if('docid' not in data):
        return
    if(data['docid'] not in _docs.keys()):
        emit("result peer list", [])
        return

    pi = create_peer_info(request,data)
    peers = _docs[ pi['docid']]
    emit("result peer list", [_sids[peer] for peer in peers] )

@socketio.on("peer quit")
def on_peer_quit():
    if(request.sid not in _sids):
        return

    pi = _sids[request.sid]

    leave_room(_doc_room(pi))
    leave_room(_soc_room(pi))
    emit("peer del", pi, room=_doc_room(pi))

    _docs[pi['docid']].remove(pi['sid'])
    del _sids[pi['sid']]

@socketio.on('connect')
def on_connect():
    pass

@socketio.on('disconnect')
def on_disconnect():
    if(request.sid in _sids):
        on_peer_quit()
        return
