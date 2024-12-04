import requests
import yaml
import os

from oauthclient.credentialutil import credentialutil
from oauthclient.oauth2api import oauth2api
from oauthclient.model.model import environment

creds = credentialutil()
creds.load(os.path.join(os.path.dirname(__file__), 'config.yaml'))
ebayAPI = oauth2api()

### Get the login URL ###
def generate_login_url():
    # load the scopes from the config file
    with open(os.path.join(os.path.dirname(__file__), 'settings.yaml'), 'r') as file:
        settings = yaml.safe_load(file)
    scopes = settings['scopes']

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

    if not response.ok:
        raise Exception(f'Failed to get orders: {response.status_code} {response.text}')

    if response.status_code != 200:
        raise Exception(f'Failed to get orders: {response.status_code} {response.text}')

    return response.json()

def get_item(token, item_id):
    return 'TODO: implement'


### Auth Tokens ###
def get_token(code):
    tokenResponse = ebayAPI.exchange_code_for_access_token(environment.PRODUCTION, code)

    return tokenResponse
