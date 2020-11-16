from datetime import datetime
from flaskapp import user


def generate_cookie():
    new_user = user.create_user()
    return str(new_user.pk)


def cookie_is_valid(cookie):
    if user.get_user(cookie) is None:
        return False
    return True
