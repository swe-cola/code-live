import os
from flaskapp import app, auth, document, user
from flask import (
    make_response,
    render_template,
    redirect,
    request,
    send_from_directory,
    url_for,
    session
)

from .document import *

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
        document_id = document.create_doc_id()
        login = True if 'email' in session.keys() else False
        # cookie = user collection id
        save_document_info(document_id, cookie, login)

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

    key = ('code-live', document_id)

    rendered = render_template("index.html", API_URL=os.environ['YORKIE_AGENT_URL'], document_key=key, user_cookie=cookie)
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
        session[key] = data[key]

    cookie = request.cookies.get(CODE_LIVE_COOKIE)
    user.set_kakao_id(cookie, data['email'])

    update_document_login(cookie)

    return "success"


@app.route('/api/delete_user_info', methods=["POST"])
def route_delete_user_info():
    info_keys = ['nickname', 'email', 'thumbnail']
    session_keys = list(session.keys())

    for session_key in session_keys:
        if session_key in info_keys:
            session.pop(session_key)

    return "success"


@app.route('/api/update_client_list', methods=["POST"])
def route_update_client_list():
    data = request.form.to_dict()
    update_document_clients(data['docid'], data['clientID'], data['user_cookie'])

    return "success"
