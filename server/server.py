import uuid
from urllib.parse import quote
import json

# Library imports
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import asyncio

# Local imports
import auth
import ebayApi
import formatOrders

app = Flask(__name__,
    static_folder='../frontend/build',
    static_url_path='')
CORS(app)

# Serve React App
@app.route('/')
def serve():
    print(f'Serving static files from {app.static_folder}')
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/signInUrl', methods=['GET'])
def get_signin_url():
    '''
    Get the URL that the client should forward the user to in order to get an ebay auth code.
    '''
    url = ebayApi.generate_login_url()
    url = quote(url, safe=':/?=&')
    payload = {'url': url}
    return jsonify(payload)

@app.route('/api/login', methods=['POST'])
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
        tokenData = ebayApi.get_token(code).to_json()
        if not tokenData['access_token']:
            print(f'Failed to mint token from user code. Got this token data back: {json.dumps(tokenData, indent=2)}')
            return jsonify({'error': 'Failed to mint token from user code'}), 400

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


@app.route('/api/viewData', methods=['GET'])
def view_data():
    try:
        session_id = request.args.get('sessionId')
        if not session_id:
            return jsonify({'error': 'No session_id provided'}), 400

        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')

        # Get latest token for the session
        session_result = auth.check_session(session_id)
        if 'success' not in session_result or not session_result['success']:
            return jsonify({'error': 'Invalid session'}), 401
        session_data = session_result['result']
        print(f'Using session data: {json.dumps(session_data, indent=2)}')
        token = session_data['access_token']

        # Make request to get orders and then return them
        response = ebayApi.get_orders(token, start_date=start_date, end_date=end_date)

        orders = response['orders']
        orders = asyncio.run(formatOrders.format_orders(orders=orders, token=token))

        payload = jsonify({'message': 'success', 'orders': orders})
        return payload

    except Exception as e:
        import traceback
        print('An exception occurred:', e)
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3000)
