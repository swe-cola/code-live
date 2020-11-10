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
