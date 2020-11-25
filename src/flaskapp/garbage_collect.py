import multiprocessing as mp
import os
import time
from datetime import datetime, timedelta
from pymongo import MongoClient


def seconds_till_next_hour():
    '''Returns the seconds left until the next hour.
    If now is 14H:25M:17S, this returns the seconds left until 15H:00M:00S
    '''
    now = datetime.utcnow()
    target = datetime(now.year, now.month, now.day, now.hour) + timedelta(hours=1)
    delta = target - now
    return delta.seconds + 1


def remove_inactive_documents(client):
    '''Naive garbage collection implementation.
    This cleans all documents that have been inactive
    for the last 24 hours.
    '''
    cl = client['code-live']
    ym = client['yorkie-meta']

    now = datetime.utcnow()
    criteria = now - timedelta(hours=24)
    print(f'Now is {now}. Will run GC for inactive elements since {criteria}')

    # handle code-live
    x = cl.user.delete_many({'lastAccess': {'$lt': criteria}, 'kakaoid': {'$exists': False}})
    print(f'Deleted {x.deleted_count} users from the code-live database')

    # handle yorkie-meta
    x = ym.clients.delete_many({'updated_at': {'$lt': criteria}})
    print(f'Deleted {x.deleted_count} clients from the yorkie-meta database')
    for doc in ym.documents.find({'updated_at': {'$lt': criteria}}):
        docid = doc['_id']
        print(f'Processing document {docid}')
        x = ym.changes.delete_many({'doc_id': docid})
        print(f'  Deleted {x.deleted_count} changes from the yorkie-meta database')
        x = ym.snapshots.delete_many({'doc_id': docid})
        print(f'  Deleted {x.deleted_count} snapshots from the yorkie-meta database')
        x = ym.syncedseqs.delete_many({'doc_id': docid})
        print(f'  Deleted {x.deleted_count} syncedseqs from the yorkie-meta database')

    x = ym.documents.delete_many({'updated_at': {'$lt': criteria}})
    print(f'Deleted {x.deleted_count} documents from the yorkie-meta database')


def gc_inactive_documents():
    client = MongoClient(
        host=os.environ['MONGO_USER_HOST'],
        port=int(os.environ['MONGO_USER_PORT']),
    )
    while True:
        remove_inactive_documents(client)
        seconds = seconds_till_next_hour()
        time.sleep(seconds)


def run_gc():
    gc = mp.Process(target=gc_inactive_documents, daemon=True)
    gc.start()
    return gc
