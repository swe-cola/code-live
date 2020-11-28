# some_file.py
import sys, os

sys.path.insert(1, os.path.join(os.getcwd(), '../', 'src'))

from flaskapp.document import generate_nickname, create_doc_id


def test_generate_nickname():
    result = generate_nickname(['ra'])
    print(result)


def test_create_doc_id():
    doc_id = create_doc_id(6)
    print(doc_id)
