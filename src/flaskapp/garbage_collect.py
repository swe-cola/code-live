import multiprocessing as mp
import os

def remove_inactive_documents():
    '''Naive garbage collection implementation.
    This wakes up every hour and cleans all documents
    that are inactive for the last 24 hours.
    '''
    pass

def gc_inactive_documents():
    while True:
        time.sleep(3600)
        remove_inactive_documents()


def run_gc():
    gc = mp.Process(target=gc_inactive_documents, daemon=True)
    gc.start()
    return gc
