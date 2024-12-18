import { useState, useEffect, useMemo } from 'react';

import logo from './logo.svg';
import './App.css';

const API_BASE_URL = 'http://127.0.0.1:5000';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

function App() {
  const [code, setCode] = useState(null);
  const [isFailed, setIsFailed] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const foundSessionId = localStorage.getItem('sessionId');
    console.log('foundSessionId', foundSessionId);
    if (foundSessionId) {
      setSessionId(foundSessionId);
    }

    if (params.get('isAuthSuccessful') === 'true' && params.get('code')) {
      handleSuccessfulAuth(params.get('code'));
    } else if (params.get('isAuthSuccessful') === 'false') {
      setIsFailed(true);
    }
  }, []);

  const handleSuccessfulAuth = async (code) => {
    console.log('Got EBay code');
    console.log(code);

    setCode(code);

    // TODO: Send code to backend to get sessionId
  }

  const login = async ({code, sessionId}) => {
    if (!code && !sessionId) {
      return false;
    }

    try {
      const payload = {
        ...(sessionId && { sessionId }),
        ...(code && { code })
      };


      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('got this login data back:', data);

      if (data.session_id) {
        setSessionId(data.session_id);
        localStorage.setItem('sessionId', data.session_id);
        return true;
      }
      return false;

    } catch (error) {
      console.error('Login error:', error);
      setIsFailed(true);
      return false;
    }
  };

  useMemo(() => {
    console.log('Code or SessionId changed:', {
      code,
      sessionId
    });

    login({code, sessionId});
  }, [code, sessionId]);

  const fetchSignInUrl = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/signInUrl`, {
        method: 'GET',
        headers: DEFAULT_HEADERS,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error('Error fetching sign in URL:', error);
      setIsFailed(true);
    }
  };

  const fetchData = async () => {
    if (!sessionId) {
      console.log('Can\'t get data because session id is: ', sessionId);
      return;
    }

    try {
      const url = new URL(`${API_BASE_URL}/viewData`);
      url.searchParams.set('sessionId', sessionId);
      console.log(`Making request to ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: DEFAULT_HEADERS,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Data fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsFailed(true);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {sessionId ? (
          <div>
            <p style={{color: 'green'}}><i>Received sessionId from eBay!</i></p>
            <p style={{fontSize: '0.4em', fontFamily: 'monospace'}}>SessionId: {sessionId}</p>
            <button onClick={() => window.location.href = '/'}>RESET</button>
            <div>
              <button onClick={fetchData}>GET DATA</button>
            </div>
          </div>
        ) : code ? (
          <div>
            <p style={{color: 'orange'}}><i>Received code from eBay!</i></p>
            <p style={{fontSize: '0.4em', fontFamily: 'monospace'}}>Code: {code}</p>
            {/* Take this out later */}
            <button onClick={() => window.location.href = '/'}>RESET</button>
          </div>
        ) : isFailed ? (
          <div>
            <p style={{color: 'red'}}><i>Failed to authenticate with eBay!</i></p>
            <p>Try clearing out the url and signing in again.</p>
            <button onClick={() => window.location.href = '/'}>RESET</button>
          </div>
        ) : (
          <>
            <p>Click the button below to sign in with eBay</p>
            <button onClick={fetchSignInUrl}>
              Sign in with eBay
            </button>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
