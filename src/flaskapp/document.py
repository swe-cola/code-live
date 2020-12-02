import os
import sys
import random
import string
from datetime import datetime
from pymongo import MongoClient
from bson.objectid import ObjectId

sys.path.insert(1, os.path.join(os.getcwd(), '../', 'src'))

from flaskapp.model import Document
from flaskapp.user import get_user


def exists(doc_id):
    if Document.objects(document_id=doc_id):
        return True
    return False


def get_document(doc_id):
    if not exists(doc_id):
        return None
    return Document.objects(document_id=doc_id).first()


def save_document_info(doc_id, owner, login):
    doc = get_document(doc_id)
    if doc:
        doc.lastAccess = datetime.utcnow()
        doc.owner = owner
        doc.login = login
    else:
        now = datetime.utcnow()
        title = now.strftime('%Y-%m-%dT%H:%M:%S.code')
        doc = Document(
            lastAccess=datetime.utcnow(),
            document_id=doc_id,
            owner=owner,
            login=login,
            title=title,
            desc=f'CodeLive snippet created at {title}',
            mime_type='website',
        )
    doc.save()


def update_document_clients(doc_id, client_id):
    if not exists(doc_id):
        raise ValueError('Document does not exist')

    doc = get_document(doc_id)
    clients = doc.clients

    nickname, count = clients.get(client_id)
    clients[client_id] = (nickname, count + 1)
    doc.save()

    return clients.copy()


def update_document_login(owner):
    Document.objects(owner=owner).update(set__login=True)


def update_document_title(doc_id, client_id, title):
    if not exists(doc_id):
        raise ValueError('Document does not exist')

    doc = get_document(doc_id)
    doc.title = title
    doc.save()


def update_document_desc(doc_id, client_id, desc):
    if not exists(doc_id):
        raise ValueError('Document does not exist')

    doc = get_document(doc_id)
    doc.desc = desc
    doc.save()


def get_document_peers(doc_id):
    if not exists(doc_id):
        raise ValueError('Document does not exist')

    doc = get_document(doc_id)
    if doc is None:
        return {}
    clients = doc.clients

    peers = {}
    for client_id, (client_name, _) in clients.items():
        user = get_user(client_id)
        if user is not None and 'kakaoid' in user:
            client_name = user.kakaoid
        peers[client_id] = client_name
    return peers


def delete_document_peers(doc_id, user_id):
    if not exists(doc_id):
        return

    doc = get_document(doc_id)
    if doc is None:
        return
    clients = doc.clients
    if user_id in clients:
        nickname, count = clients[user_id]
        if count > 1:
            clients[user_id] = (nickname, count - 1)
        else:
            clients.pop(user_id)
    doc.save()


def create_doc_id(length=6):
    s = string.ascii_letters + string.digits
    # FIXME. Might rarely end up with duplicate IDs
    document_id = ''.join(random.choices(s, k=length))
    return document_id


def generate_nickname(ignore=None):
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

    def __generate_nickname():
        adjective = random.choice(adjectives)
        animal = random.choice(animals)

        return adjective + " " + animal

    nickname = __generate_nickname()
    if ignore is not None:
        while nickname in ignore:
            nickname = __generate_nickname()
    return nickname


def get_nickname(doc_id, client_id):
    doc = get_document(doc_id)
    clients = doc.clients
    data = clients.get(client_id)
    if data is None:
        taken = set(x[0] for x in doc['clients'].values())
        nickname = generate_nickname(ignore=taken)
        clients[client_id] = (nickname, 0)
        doc.save()
    else:
        nickname, _ = data
    return nickname
