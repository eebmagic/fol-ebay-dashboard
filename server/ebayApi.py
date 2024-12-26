import requests
import xmltodict
import yaml
import os
import json

from oauthclient.credentialutil import credentialutil
from oauthclient.oauth2api import oauth2api
from oauthclient.model.model import environment

creds = credentialutil()
creds.load(os.path.join(os.path.dirname(__file__), 'config.yaml'))
ebayAPI = oauth2api()

def generate_scopes():
    # load the scopes from the config file
    with open(os.path.join(os.path.dirname(__file__), 'settings.yaml'), 'r') as file:
        settings = yaml.safe_load(file)
    scopes = settings['scopes']

    return scopes


### Get the login URL ###

def generate_login_url():
    scopes = generate_scopes()

    loginURL = ebayAPI.generate_user_authorization_url(environment.PRODUCTION, scopes)

    return loginURL


### Endpoint Interactions ###

def get_orders(token):
    url = 'https://api.ebay.com/sell/fulfillment/v1/order'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

    response = requests.get(url, headers=headers)

    if (not response.ok) or (response.status_code != 200):
        raise Exception(f'Failed to get orders: {response.status_code} {response.text}')

    return response.json()

def get_item(token, item_id):
    url = 'https://api.ebay.com/ws/api.dll'

    headers = {
        'X-EBAY-API-SITEID': '0',
        'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
        'X-EBAY-API-CALL-NAME': 'GetItem',
        'X-EBAY-API-IAF-TOKEN': token,
        'Content-Type': 'text/xml'
    }

    xml_request = f'''<?xml version="1.0" encoding="utf-8"?>
<GetItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
    <ErrorLanguage>en_US</ErrorLanguage>
    <WarningLevel>High</WarningLevel>
    <ItemID>{item_id}</ItemID>
</GetItemRequest>'''

    response = requests.post(url, headers=headers, data=xml_request)

    if (not response.ok) or (response.status_code != 200):
        raise Exception(f'Failed to get item: {response.status_code} {response.text}')

    # Convert XML response to JSON
    response_dict = xmltodict.parse(response.text)
    if response_dict['GetItemResponse']['Ack'] != 'Success':
        # raise Exception(f'Failed to get item: {response_dict["GetItemResponse"]["Errors"]}')
        return None

    response_dict = response_dict['GetItemResponse']['Item']

    return response_dict


### Auth Tokens ###

def get_token(code):
    tokenResponse = ebayAPI.exchange_code_for_access_token(environment.PRODUCTION, code)

    return tokenResponse


def refresh_token(refresh_token):
    scopes = generate_scopes()

    refreshedToken = ebayAPI.get_access_token(environment.PRODUCTION, refresh_token=refresh_token, scopes=scopes)

    return refreshedToken.to_json()
