import os
import sys
import logging
from datetime import datetime
from mongoengine.errors import ValidationError

sys.path.insert(1, os.path.join(os.getcwd(), '../', 'src'))

from flaskapp.model import User

logger = logging.getLogger()


def create_user():
    new_user = User(lastAccess=datetime.utcnow(), documents=[])
    new_user.save()
    return new_user


def get_user(cookie):
    try:
        user = User.objects.with_id(cookie)
        return user
    except ValidationError:
        logger.warning(f'Cookie {cookie} is invalid')
        return None


def get_doc_id(cookie, policy='last'):
    '''Retrieves a document associated with the user based on the policy
    cookie (str): cookie associated with a user
    policy (str): policy used to select which document to return
    '''
    policies = ['first', 'last']
    assert policy in policies, f"policy should be one of: {policies}"

    user = get_user(cookie)
    if user is None:
        logger.info('User is None')
        return None
    if not user.documents:
        logger.info(f'User (cookie {cookie}) has no document')
        return None

    if policy == 'first':
        return user.documents[0]
    elif policy == 'last':
        return user.documents[-1]
    raise RuntimeError('Something went wrong')


def log_access(cookie, document_id):
    '''Update the user account in the database
    cookie (str): cookie associated with a user
    document_id (str): document id (usually generated with document.create_doc_id())
    '''
    user = get_user(cookie)
    if user is None:
        logger.info(f'User is None')
        return
    user.lastAccess = datetime.utcnow()
    if document_id not in user.documents:
        if len(user.documents) == user.maxDocuments:
            user.documents.pop(0)
        user.documents.append(document_id)
    user.save()


def set_kakao_id(cookie, nickname: str):
    user = get_user(cookie)

    if user is None:
        logger.info(f'User is None')
        return

    user.kakaoid = nickname
    user.save()
