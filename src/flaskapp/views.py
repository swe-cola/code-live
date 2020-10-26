import os
from flaskapp import app, auth, document, user
from flask import (
    make_response,
    render_template,
    redirect,
    request,
    send_from_directory,
    url_for,
)

CODE_LIVE_COOKIE = 'code-live'

viewData=None

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
<<<<<<< HEAD
=======

@app.route('/<document_id>')
def route_document(document_id):
    return render_template("index.html", API_URL=os.environ['YORKIE_AGENT_URL'])

def get_scriptData(scriptID): # simulate DB query
    found = dict()
    found['id'] = scriptID
    if scriptID=="rrr":
        found['title'] = 'Hello world!'
        found['lang'] = 'Python'
        found['contents'] = 'print("hello")'
    else:
        found['title'] = 'Untitled'
        found['lang'] = 'Javascript'
        found['contents'] = ''
    return found

def init_viewData():
    global viewData
    viewData = dict()
    viewData['langs'] = ['C','C++','C#','Python','Java','Javascript']
    viewData['themes'] = ['Light','Dark','Cobalt']
    return

@app.route('/s/<scriptID>')
def route_script(scriptID):
    return render_template("snippet.html", ScriptData=get_scriptData(scriptID), ViewData=viewData, API_URL=os.environ['YORKIE_AGENT_URL'])

init_viewData()
>>>>>>> 2f33dad... improved html/css
