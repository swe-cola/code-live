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


def update_document_clients(doc_id, clientID, cookie):
    client = connect_db()
    db = client["code-live"]
    col = db["documents"]

    doc_query = {"document_id": doc_id}
    result = list(col.find(doc_query))

    nickname = route_generate_nickname(doc_id, clientID)
    if 'clients' in result:
        while nickname in result['clients'].values():
            nickname = route_generate_nickname(doc_id, clientID)

    # {yorkie_id: codelive_id}
    if "clients" in result[0]:
        client_dict = result[0]["clients"]
        client_dict[clientID] = [cookie, nickname]
    else:
        client_dict = {clientID: [cookie, nickname]}

    newvalues = {"$set": {"clients": client_dict}}
    col.update_one(doc_query, newvalues)

    result_dict = {}
    for key, value in client_dict.items():
        result_dict[key] = value[1]

    return result_dict


def update_document_login(owner):
    client = connect_db()
    db = client["code-live"]
    col = db["documents"]

    owner_query = {"owner": owner}
    newvalues = {"$set": {"login": True}}

    col.update_one(owner_query, newvalues)


def get_document_peers(doc_id, peers):
    client = connect_db()
    db = client["code-live"]
    col = db["documents"]

    doc_query = {"document_id": doc_id}
    result = list(col.find(doc_query))
    mapping_dict = {}
    update_document_dict = {}
    for peer in peers:
        try:
            data = result[0]['clients'][peer]
            mapping_dict[peer] = data[1]
            update_document_dict[peer] = data
        except:
            # to prevent errors
            pass

    newvalues = {"$set": {"clients": update_document_dict}}
    col.update_one(doc_query, newvalues)

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
