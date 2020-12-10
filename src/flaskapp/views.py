import os
from flaskapp import app, auth, document, user
from flask_cors import cross_origin
from flask import (
    make_response,
    render_template,
    redirect,
    request,
    send_from_directory,
    url_for,
    session,
    jsonify
)

from .document import (
    get_document,
    save_document_info,
    update_document_clients,
    update_document_login,
    get_document_peers,
    delete_document_peers,
    create_doc_id,
    get_nickname,
)

from . import runner

CODE_LIVE_COOKIE = 'code-live'


@app.route('/')
def route_index():
    # Cookie is used to identify a user
    cookie = request.cookies.get(CODE_LIVE_COOKIE)
    new_cookie = False
    if cookie is None or not auth.cookie_is_valid(cookie):
        cookie = auth.generate_cookie()
        new_cookie = True

    document_id = user.get_doc_id(cookie)
    if document_id is None:
        document_id = create_doc_id()

    url = url_for('route_document', document_id=document_id)
    redirected = redirect(url)
    response = make_response(redirected)
    if new_cookie:
        response.set_cookie(CODE_LIVE_COOKIE, cookie)
    return response


@app.route('/<document_id>')
def route_document(document_id):
    cookie = request.cookies.get(CODE_LIVE_COOKIE)
    new_cookie = False
    if cookie is None or not auth.cookie_is_valid(cookie):
        cookie = auth.generate_cookie()
        new_cookie = True
    user.log_access(cookie, document_id)

    if not document.exists(document_id):
        logged_in = True if 'email' in session.keys() else False
        save_document_info(document_id, cookie, logged_in)

    key = ('code-live', document_id)

    config = {
        'API_URL': os.environ['YORKIE_AGENT_URL'],
        'CODE_LIVE_COOKIE': CODE_LIVE_COOKIE,
        'CHAT_SERVER_HOST': os.environ['CHAT_SERVER_HOST'],
        'CHAT_SERVER_PORT': os.environ['CHAT_SERVER_PORT'],
    }
    doc = get_document(document_id)
    doc_info = {
        'title': doc.title,
        'desc': doc.desc,
        'mime': doc.mime_type,
    }
    rendered = render_template("index.html", document_key=key, config=config, docInfo=doc_info)
    response = make_response(rendered)
    if new_cookie:
        response.set_cookie(CODE_LIVE_COOKIE, cookie)
    return response


@app.route('/favicon.ico')
def favicon():
    dirname = os.path.join(app.root_path, 'static')
    return send_from_directory(dirname, 'favicon.ico')


# --- ajax api ---

@app.route('/api/save_user_info', methods=["POST"])
def route_save_user_info():
    data = request.form.to_dict()
    info_keys = ['nickname', 'email', 'thumbnail']

    for key in info_keys:
        if key in data.keys():
            session[key] = data[key]

    cookie = request.cookies.get(CODE_LIVE_COOKIE)
    user.set_kakao_id(cookie, data['nickname'])

    update_document_clients(data['docid'], data['user_cookie'], data['logged_in'], new_conn=False)
    update_document_login(cookie)

    return "success"


@app.route('/api/delete_user_info', methods=["POST"])
def route_delete_user_info():
    data = request.form.to_dict()

    # delete from session
    info_keys = ['nickname', 'email', 'thumbnail']
    session_keys = list(session.keys())

    for session_key in session_keys:
        if session_key in info_keys:
            session.pop(session_key)

    # update database to logged_in = False
    update_document_clients(data['doc_id'], data['user_cookie'], data['logged_in'], new_conn=False)

    return "success"


@app.route('/api/update_client_list', methods=["POST"])
def route_update_client_list():
    data = request.form.to_dict()
    update_document_clients(data['docid'], data['user_cookie'], data['logged_in'])
    client_dict = get_document_peers(data['docid'])

    return jsonify(client_dict)


@app.route('/api/get_peers_name', methods=["POST"])
def route_get_peers_name():
    data = request.form.to_dict()
    mapping_dict = get_document_peers(data['docid'])

    return jsonify(mapping_dict)


@app.route('/api/delete_client', methods=["POST"])
def route_delete_client():
    data = request.form.to_dict()
    delete_document_peers(data['docid'], data['user_cookie'])

    return "success"

@app.route('/api/nickname', methods=["POST"])
def route_get_nickname():
    data = request.form.to_dict()
    docID, clientID = data['docID'], data['clientID']
    doc = get_document(docID)
    client_data = doc.clients.get(clientID)
    if client_data:
        _, _, logged_in = client_data
        if logged_in == 'true':
            return user.get_user(clientID).kakaoid
    return get_nickname(data['docID'], data['clientID'])

@app.route('/api/runner/create', methods=["POST"])
def route_runner_create():
    data = request.form.to_dict()
    res = runner.create(data['language'],data['source_code'],data['input'])

    return res

@app.route('/api/runner/get_status', methods=["POST"])
def route_runner_getStatus():
    data = request.form.to_dict()
    res = runner.get_status(data['id'])

    return res

@app.route('/api/runner/get_details', methods=["POST"])
def route_runner_getDetails():
    data = request.form.to_dict()
    res = runner.get_details(data['id'])

    return res
