import os
from flask import Flask
from flask_mongoengine import MongoEngine
from dotenv import load_dotenv
from flask_socketio import SocketIO

load_dotenv()

app = Flask(__name__)
app.config['MONGODB_SETTINGS'] = {
    'db': 'code-live',
    'host': os.environ['MONGO_USER_HOST'],
    'port': int(os.environ['MONGO_USER_PORT']),
}
app.secret_key = os.urandom(24)

db = MongoEngine(app)
socketio = SocketIO(app)


from flaskapp import views
from flaskapp import socket
