import requests
from flask import jsonify

_urls={
    'create':'http://api.paiza.io:80/runners/create',
    'get_status':'http://api.paiza.io:80/runners/get_status',
    'get_details':'http://api.paiza.io:80/runners/get_details'
}
_api_key = 'guest'

def _fetch_json_post(url, params):
    result = requests.post(url,json=params)
    return jsonify(result.json())

def _fetch_json(url, params):
    result = requests.get(url,params=params)
    return jsonify(result.json())

def create(scriptLang, scriptContents, scriptInput):
    params = {
        'source_code': scriptContents,
        'language': scriptLang,
        'input':scriptInput,
        'api_key':_api_key
    }
    return _fetch_json_post(_urls['create'], params)


def get_status(session_id):
    params = {
        'id': session_id,
        'api_key':_api_key
    }
    return _fetch_json(_urls['get_status'], params)


def get_details(session_id):
    params = {
        'id': session_id,
        'api_key':_api_key
    }
    return _fetch_json(_urls['get_details'], params)
