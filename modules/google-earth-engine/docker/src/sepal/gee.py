import json
import sys
from threading import Semaphore

import ee
from flask import request
from oauth2client.client import OAuth2Credentials
from oauth2client.service_account import ServiceAccountCredentials

export_semaphore = Semaphore(5)
get_info_semaphore = Semaphore(2)

service_account_credentials = ServiceAccountCredentials.from_p12_keyfile(
    service_account_email=sys.argv[1],
    filename=sys.argv[2],
    private_key_password='notasecret',
    scopes=ee.oauth.SCOPE + ' https://www.googleapis.com/auth/drive ')


def init_ee():
    credentials = service_account_credentials
    if 'sepal-user' in request.headers:
        user = json.loads(request.headers['sepal-user'])
        googleTokens = user.get('googleTokens', None)
        if googleTokens:
            credentials = OAuth2Credentials(googleTokens['accessToken'], None, None, None, None, None, None)
    ee.InitializeThread(credentials)


def get_info(ee_object):
    try:
        get_info_semaphore.acquire()
        return ee_object.getInfo()
    finally:
        get_info_semaphore.release()
