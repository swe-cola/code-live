import unittest
import sys
sys.path.insert(2, 'src/flaskapp')
from document import create_doc_id
import re


class TestCreatedocID(unittest.TestCase):

    def test_if_doc_id_six_letters(self):
        doc_id = create_doc_id()
        if len(doc_id) == 6:
            result = True
        else:
            result = False

        self.assertTrue(result)

    def test_if_doc_id_only_letters_and_numbers(self):
        doc_id = create_doc_id()
        if re.match("^[\w\d]*$", doc_id):
            result = True
        else:
            result = False
        self.assertTrue(result)


if __name__ == '__main__':
    unittest.main()

