import os
from flask import Flask
from flask_mongoengine import MongoEngine
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['MONGODB_SETTINGS'] = {
    'db': 'code-live',
    'host': os.environ['MONGO_USER_HOST'],
    'port': int(os.environ['MONGO_USER_PORT']),
    'connect': False,
}
app.secret_key = os.urandom(24)

db = MongoEngine(app)


from flaskapp import views
