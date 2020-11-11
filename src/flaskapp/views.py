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

CODE_LIVE_COOKIE = 'code-live'


@app.route('/')
def route_index():
    print(session)
    # Cookie is used to identify a user
    info_keys = ['nickname', 'email', 'thumbnail']
    print("index")
    print(session.keys())
    try:
        for key in info_keys:
            print(key, session[key])
    except:
        pass

    cookie = request.cookies.get(CODE_LIVE_COOKIE)
    new_cookie = False
    if cookie is None or not auth.cookie_is_valid(cookie):
        cookie = auth.generate_cookie()
        new_cookie = True

    document_id = user.get_doc_id(cookie)
    if document_id is None:
        document_id = document.create_doc_id()

    url = url_for('route_document', document_id=document_id)
    redirected = redirect(url)
    response = make_response(redirected)
    if new_cookie:
        response.set_cookie(CODE_LIVE_COOKIE, cookie)
    return response


@app.route('/<document_id>')
def route_document(document_id):
    info_keys = ['nickname', 'email', 'thumbnail']
    print("document")
    print(session.keys())
    try:
        for key in info_keys:
            print(key, session[key])
    except:
        pass

    cookie = request.cookies.get(CODE_LIVE_COOKIE)
    new_cookie = False
    if cookie is None or not auth.cookie_is_valid(cookie):
        cookie = auth.generate_cookie()
        new_cookie = True
    user.log_access(cookie, document_id)

    key = ('code-live', document_id)

    rendered = render_template("index.html", API_URL=os.environ['YORKIE_AGENT_URL'], document_key=key)
    response = make_response(rendered)
    if new_cookie:
        response.set_cookie(CODE_LIVE_COOKIE, cookie)
    return response


@app.route('/favicon.ico')
def favicon():
    dirname = os.path.join(app.root_path, 'static')
    return send_from_directory(dirname, 'favicon.ico')


# --- ajax ---

@app.route('/save_user_info', methods=["POST"])
def route_save_user_info():
    data = request.form.to_dict()
    info_keys = ['nickname', 'email', 'thumbnail']

    print("save user info")
    print(session.keys())
    for key in info_keys:
        session[key] = data[key]
        print(session[key])
    print(session.keys())

    return "success"


@app.route('/delete_user_info', methods=["POST"])
def route_delete_user_info():
    info_keys = ['nickname', 'email', 'thumbnail']
    session_keys = list(session.keys())

    for session_key in session_keys:
        if session_key in info_keys:
            session.pop(session_key)

    return "success"
