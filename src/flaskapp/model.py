import mongoengine as me

class User(me.Document):
    lastAccess = me.DateTimeField(required=True)
    documents = me.ListField()
    maxDocuments = me.IntField(default=10)
    nickname = me.StringField()
    kakaoid = me.StringField()
