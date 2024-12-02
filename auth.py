import json
import os

SESSIONS_FILE = 'data/sessions.json'

### Session functions ###

def check_session(session_id):
    '''
    Checks that the session presented from the user is valid.
    Tries to refresh the session if it is expired.
    '''
    # Check if sessions file exists
    if not os.path.exists(SESSIONS_FILE):
        return {
            'success': False,
            'message': 'No sessions file found'
        }
        
    # Load sessions from file
    try:
        with open(SESSIONS_FILE, 'r') as f:
            sessions = json.load(f)
    except json.JSONDecodeError as e:
        return {
            'success': False,
            'message': 'Error loading sessions file',
            'error': e
        }
        
    # Check if session exists
    if session_id not in sessions:
        return {
            'success': False,
            'message': 'Session not found'
        }
    
    # TODO: Check if session is expired
    
    return {
        'success': True,
        'message': 'Session found',
        'result': sessions[session_id]
    }

def store_session(session_id, tokenData):
    '''
    Stores a session in the sessions file.
    '''
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
    sessions[session_id] = tokenData
    
    # Save updated sessions
    with open(SESSIONS_FILE, 'w') as f:
        json.dump(sessions, f)
    
    return True


### Auth functions ###

def get_signIn_url():
    return 'TODO: implement'

def get_token(signInCode):
    return 'TODO: implement'


if __name__ == '__main__':
    print('hello from auth.py')