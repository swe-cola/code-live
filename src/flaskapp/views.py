from flaskapp import app
from flask import render_template


@app.route('/')
def route_index():
    return render_template("index.html")
