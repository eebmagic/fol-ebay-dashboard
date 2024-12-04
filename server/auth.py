'''
Handles the authentication sessions for users.
'''
import json
import os

SESSIONS_FILE = os.path.join(os.path.dirname(__file__), 'data/sessions.json')

### Session functions ###

def check_session(sessionId):
    '''
    Checks that the session presented from the user is valid.
    Tries to refresh the session if it is expired.
    '''
    # Check if sessions file exists
    if os.path.exists(SESSIONS_FILE):
        with open(SESSIONS_FILE, 'r') as f:
            try:
                sessions = json.load(f)
            except json.JSONDecodeError:
                sessions = {}
    else:
        sessions = {}

    # Check if session exists
    if sessionId not in sessions:
        return {
            'success': False,
            'message': 'Session not found'
        }

    # TODO: Check if session is expired

    return {
        'success': True,
        'message': 'Session found',
        'result': sessions[sessionId]
    }

def store_session(sessionId, tokenData):
    '''
    Stores a session in the sessions file.
    '''
    if tokenData.error:
        return False

    # Load existing sessions
    if os.path.exists(SESSIONS_FILE):
        with open(SESSIONS_FILE, 'r') as f:
            try:
                sessions = json.load(f)
            except json.JSONDecodeError:
                sessions = {}
    else:
        sessions = {}

    # Add new session
    sessions[sessionId] = tokenData.to_json()

    # TODO: Add check to see if > 10 sessions, if so, delete the oldest one

    # Save updated sessions
    os.makedirs(os.path.dirname(SESSIONS_FILE), exist_ok=True)
    with open(SESSIONS_FILE, 'w') as f:
        json.dump(sessions, f)

    return True


if __name__ == '__main__':
    print('hello from auth.py')
