import sys, os, uuid
import random

sys.path.insert(1, os.path.join(os.getcwd(), 'src'))

from flaskapp.document import *
from flaskapp.user import create_user


def test_generate_nickname():
    random.seed(100)
    # random generated nickname with seed 100
    result = generate_nickname(['Beautiful Nyan cat'])
    assert result == "Fancy Dog"


def test_save_document_info():
    random.seed(150)
    doc_id, owner, login = "test"+str(uuid.uuid4()), "admin", False
    save_document_info(doc_id, owner, login)
    client_list = get_document_peers(doc_id)
    assert len(client_list) == 0

    client_id = str(create_user().id)
    client_id2 = str(create_user().id)

    nickname = get_nickname(doc_id, client_id)
    nickname2 = get_nickname(doc_id, client_id2)

    update_document_clients(doc_id, client_id, False)
    update_document_clients(doc_id, client_id2, False)

    client_list = get_document_peers(doc_id)
    assert len(client_list) == 2

    update_document_login(doc_id)
    delete_document_peers(doc_id, client_id)

    client_list = get_document_peers(doc_id)
    assert len(client_list) == 1

    delete_doc(doc_id)


def test_create_doc_id():
    doc_id = create_doc_id(6)
    assert len(doc_id) == 6 and doc_id.isalnum()

    doc_id = create_doc_id(8)
    assert len(doc_id) == 8 and doc_id.isalnum()
