import uuid
from urllib.parse import quote

# Library imports
from flask import Flask, request, jsonify
from flask_cors import CORS

# Local imports
import auth
import ebayApi
import formatOrders

app = Flask(__name__)
CORS(app)
@app.route('/signInUrl', methods=['GET'])
def get_signin_url():
    '''
    Get the URL that the client should forward the user to in order to get an ebay auth code.
    '''
    # url = ebayApi.generate_login_url()
    url = 'https://auth.ebay.com/oauth2/authorize?client_id=EthanBol-Testing-PRD-037e7d927-ec1fd3b8&response_type=code&redirect_uri=Ethan_Bolton-EthanBol-Testin-xbaywwy&scope=https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.marketing.readonly https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.inventory.readonly https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account.readonly https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.analytics.readonly https://api.ebay.com/oauth/api_scope/sell.finances https://api.ebay.com/oauth/api_scope/sell.payment.dispute https://api.ebay.com/oauth/api_scope/commerce.identity.readonly https://api.ebay.com/oauth/api_scope/sell.reputation https://api.ebay.com/oauth/api_scope/sell.reputation.readonly https://api.ebay.com/oauth/api_scope/commerce.notification.subscription https://api.ebay.com/oauth/api_scope/commerce.notification.subscription.readonly https://api.ebay.com/oauth/api_scope/sell.stores https://api.ebay.com/oauth/api_scope/sell.stores.readonly'
    url = quote(url, safe=':/?=&')
    payload = {'url': url}
    return jsonify(payload)

@app.route('/login', methods=['POST'])
def login():
    code = request.json.get('code')
    session_id = request.json.get('sessionId')

    if not code and not session_id:
        return jsonify({'error': 'No code or sessionId provided'}), 400

    # Try login with sessionId
    if session_id:
        checkResult = auth.check_session(session_id)
        if not checkResult or not checkResult['success']:
            return jsonify({
                'message': 'Invalid session',
                'error': checkResult
            }), 401

        return jsonify({
            'message': 'Session valid',
            'result': checkResult
        }), 200

    # Try login with code
    try:
        tokenData = ebayApi.get_token(code)
        session_id = str(uuid.uuid4())
        auth.store_session(session_id, tokenData)
        payload = {
            'success': True,
            'message': 'Session created',
            'session_id': session_id
        }
        return jsonify(payload), 200
    except Exception as e:
        import traceback
        print('Error getting token from code:', e)
        print('Full stack trace:')
        print(traceback.format_exc())
        payload = {
            'error': str(e),
            'message': 'Failed to get token from code',
            'session_id': None
        }
        return jsonify(payload), 500


@app.route('/viewData', methods=['GET'])
def view_data():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'No token provided'}), 401

    try:
        orders_data = ebayApi.get_orders(token)
        formatted_data = formatOrders.format_orders(orders_data['orders'])
        return jsonify(formatted_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
