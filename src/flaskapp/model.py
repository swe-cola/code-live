import mongoengine as me

class User(me.Document):
    lastAccess = me.DateTimeField(required=True)
    documents = me.ListField()
    maxDocuments = me.IntField(default=10)
    nickname = me.StringField()
    kakaoid = me.StringField()


class Document(me.Document):
    lastAccess = me.DateTimeField(required=True)
    document_id = me.StringField(required=True)
    owner = me.StringField(required=True)
    login = me.BooleanField(default=False)
    clients = me.DictField() # clientID => (nickname, count)
    title = me.StringField()
    desc = me.StringField()
    mime_type = me.StringField()
