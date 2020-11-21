from pymongo import MongoClient
from bson.objectid import ObjectId
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


def update_document_clients(doc_id, clientID, cookie):
    client = connect_db()
    db = client["code-live"]
    col = db["documents"]

    doc_query = {"document_id": doc_id}
    result = list(col.find(doc_query))
    result_doc = result[0]

    nickname = route_generate_nickname(doc_id, clientID)
    if 'clients' in result_doc and len(result_doc['clients']) != 0:
        while nickname in result_doc['clients'].values():
            nickname = route_generate_nickname(doc_id, clientID)

    # {codelive_id: nickname}
    if "clients" in result_doc:
        client_dict = result_doc["clients"]
        client_dict[cookie] = nickname
    else:
        client_dict = {clientID: nickname}
    newvalues = {"$set": {"clients": client_dict}}
    col.update_one(doc_query, newvalues)

    result_dict = {}
    for key, value in client_dict.items():
        result_dict[key] = value

    return result_dict


def update_document_login(owner):
    client = connect_db()
    db = client["code-live"]
    col = db["documents"]

    owner_query = {"owner": owner}
    newvalues = {"$set": {"login": True}}

    col.update_one(owner_query, newvalues)


def get_document_peers(doc_id):
    client = connect_db()
    db = client["code-live"]

    col = db["documents"]

    doc_query = {"document_id": doc_id}
    result = list(col.find(doc_query))
    
    result_doc = result[0]
    clients = result_doc['clients']

    mapping_dict = {}

    for client_key, client_name in clients.items():
        mapping_dict[client_key] = client_name

    return mapping_dict


def create_doc_id(length=6):
    s = string.ascii_letters + string.digits
    # FIXME. Might rarely end up with duplicate IDs
    document_id = ''.join(random.choices(s, k=length))
    return document_id


def route_generate_nickname(docid, clientid):
    adjectives = ['Adorable', 'Ambitious', 'Angry', 'Attractive', 'Beautiful', 'Big', 'Bored', 'Brave', 'Calm',
                  'Chubby', 'Clean', 'Dazzling', 'Delightful', 'Elegant', 'Fancy', 'Friendly', 'Gentle', 'Glamorous',
                  'Gorgeous', 'Handsome', 'Happy', 'Lazy', 'Muscular', 'Mysterious', 'Nervous', 'Nice', 'Polite',
                  'Scary', 'Small', 'Worried']

    animals = [
        'Alligator', 'Anteater', 'Armadillo', 'Auroch', 'Axolotl', 'Badger', 'Bat', 'Bear', 'Beaver',
        'Blobfish', 'Buffalo', 'Camel', 'Chameleon', 'Cheetah', 'Chipmunk', 'Chinchilla', 'Chupacabra',
        'Cormorant', 'Coyote', 'Crow', 'Dingo', 'Dinosaur', 'Dog', 'Dolphin', 'Dragon',
        'Duck', 'Dumbo octopus', 'Elephant', 'Ferret', 'Fox', 'Frog', 'Giraffe', 'Goose',
        'Gopher', 'Grizzly', 'Hamster', 'Hedgehog', 'Hippo', 'Hyena', 'Jackal', 'Jackalope',
        'Ibex', 'Ifrit', 'Iguana', 'Kangaroo', 'Kiwi', 'Koala', 'Kraken', 'Lemur',
        'Leopard', 'Liger', 'Lion', 'Llama', 'Manatee', 'Mink', 'Monkey', 'Moose',
        'Narwhal', 'Nyan cat', 'Orangutan', 'Otter', 'Panda', 'Penguin', 'Platypus', 'Python',
        'Pumpkin', 'Quagga', 'Quokka', 'Rabbit', 'Raccoon', 'Rhino', 'Sheep', 'Shrew',
        'Skunk', 'Slow loris', 'Squirrel', 'Tiger', 'Turtle', 'Unicorn', 'Walrus', 'Wolf',
        'Wolverine', 'Wombat'
    ]

    key = (docid, clientid)
    adjective = adjectives[hash(key) % len(adjectives)]
    animal = animals[hash(key) % len(animals)]

    return adjective + " " + animal
