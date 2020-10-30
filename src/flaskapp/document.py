import random
import string


def create_doc_id(length=6):
    s = string.ascii_letters + string.digits
    # FIXME. Might rarely end up with duplicate IDs
    document_id = ''.join(random.choices(s, k=length))
    return document_id
