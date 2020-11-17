from pymongo import MongoClient
import os
import random
import string


def connect_db():
    client = MongoClient(
        host=os.environ['MONGO_USER_HOST'],
        port=int(os.environ['MONGO_USER_PORT']),
    )
    return client


def save_document_info(doc_id, owner, login):
    client = connect_db()
    db = client["code-live"]
    col = db["documents"]
    doc_info = {"document_id": doc_id, "owner": owner, "login": login}

    col.insert_one(doc_info)


def update_document_login(owner):
    client = connect_db()
    db = client["code-live"]
    col = db["documents"]

    owner_query = {"owner": owner}
    newvalues = {"$set": {"login": True}}

    col.update_one(owner_query, newvalues)


def create_doc_id(length=6):
    s = string.ascii_letters + string.digits
    # FIXME. Might rarely end up with duplicate IDs
    document_id = ''.join(random.choices(s, k=length))
    return document_id
