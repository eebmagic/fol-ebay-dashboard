'''
Handles the authentication sessions for users.
'''
import json
import os
from datetime import datetime
import ebayApi

SESSIONS_FILE = os.path.join(os.path.dirname(__file__), 'data/sessions.json')

def load_session_store():
    # Check if sessions file exists
    if os.path.exists(SESSIONS_FILE):
        with open(SESSIONS_FILE, 'r') as f:
            try:
                sessions = json.load(f)
            except json.JSONDecodeError:
                sessions = {}
    else:
        sessions = {}

    return sessions


### Session functions ###

def get_session(sessionId):
    sessions = load_session_store()

    result = sessions.get(sessionId, None)
    if type(result) == str:
        return json.loads(result)

    return result


def check_session(sessionId):
    '''
    Checks that the session presented from the user is valid.
    Tries to refresh the session if it is expired.
    '''
    sessions = load_session_store()

    # Check if session exists
    if sessionId not in sessions:
        return {
            'success': False,
            'message': 'Session not found'
        }

    session = sessions[sessionId]

    # Check if session is expired, refresh if so
    latestData = refresh_session(sessionId, session)

    return {
        'success': True,
        'message': 'Session found',
        'result': latestData
    }


def refresh_session(sessionId, sessionData):
    current_time = datetime.now()
    token_expiry = datetime.fromisoformat(sessionData['token_expiry'])
    refresh_expiry = datetime.fromisoformat(sessionData['refresh_token_expiry'])

    # Session NOT YET expired, return the current session
    if current_time < token_expiry:
        return sessionData

    # Session expired AND refresh expired
    if current_time > refresh_expiry:
        # Erase the session from the store
        remove_session(sessionId)

        return None

    # Refresh the token
    refreshed = ebayApi.refresh_token(sessionData['refresh_token'])

    # Store the refreshed data and return
    updateResult = update_session(sessionId, refreshed)

    return updateResult


def store_session(sessionId, tokenData):
    '''
    Stores a session in the sessions file.
    '''
    # Load existing sessions
    if 'error' in tokenData:
        return False
    sessions = load_session_store()

    # Add new session
    sessions[sessionId] = tokenData

    # TODO: Add check to see if > 10 sessions, if so, delete the oldest one
    # sessions = pop_old(sessions)

    # Save updated sessions
    os.makedirs(os.path.dirname(SESSIONS_FILE), exist_ok=True)
    with open(SESSIONS_FILE, 'w') as f:
        json.dump(sessions, f)

    return True


def update_session(sessionId, update):
    oldSessionData = get_session(sessionId)

    newSessionData = oldSessionData.copy()
    for key, value in update.items():
        newSessionData[key] = value

    updateWasSaved = store_session(sessionId, newSessionData)

    if updateWasSaved:
        return newSessionData

    return False


def remove_session(sessionId):
    sessions = load_session_store()

    if sessionId not in sessions:
        return True

    del sessions[sessionId]

    # Save updated sessions
    os.makedirs(os.path.dirname(SESSIONS_FILE), exist_ok=True)
    with open(SESSIONS_FILE, 'w') as f:
        json.dump(sessions, f)

    print(f'STORED SESSION: {sessionId}')

    return True


if __name__ == '__main__':
    print('hello from auth.py')
