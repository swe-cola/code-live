import os
from flaskapp import app
from flask import send_from_directory, render_template, redirect, url_for


@app.route('/')
def route_index():
    # FIXME. Should either return an existing document or a new one depending on the user's cookie
    document_id = 'example'
    url = url_for('route_document', document_id=document_id)
    return redirect(url)

@app.route('/favicon.ico')
def favicon():
    dirname = os.path.join(app.root_path, 'static')
    return send_from_directory(dirname, 'favicon.ico')

@app.route('/<document_id>')
def route_document(document_id):
    return render_template("index.html", API_URL=os.environ['YORKIE_AGENT_URL'])
