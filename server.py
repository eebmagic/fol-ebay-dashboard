import uuid

# Library imports
from flask import Flask, request, jsonify

# Local imports
import auth
import ebayApi
import formatOrders

app = Flask(__name__)

@app.route('/signInUrl', methods=['GET'])
def get_signin_url():
    '''
    Get the URL that the client should forward the user to in order to get an ebay auth code.
    '''
    print('Getting signin URL')
    url = ebayApi.generate_login_url()
    payload = {'url': url}
    return jsonify(payload)

@app.route('/logIn', methods=['POST'])
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
    tokenData = auth.get_token(code)
    session_id = str(uuid.uuid4())

    # Store session ID and token mapping for future requests
    auth.store_session(session_id, tokenData)

    return jsonify({'session_id': session_id})

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
