import { useState, useEffect } from 'react';

import logo from './logo.svg';
import './App.css';

function App() {
  const [code, setCode] = useState(null);
  const [isFailed, setIsFailed] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [prevCode, setPrevCode] = useState(null);
  const [prevSessionId, setPrevSessionId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
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
    let validated = false;
    if (sessionId) {
      // Check the session is live or refresh it
    }

    if (code && !validated) {
      // Start new session
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });
      const data = await response.json();
      console.log('got this login data back:', data);
      if (data.session_id) {
        setSessionId(data.session_id);
        validated = true;
      }
    }

    return validated;
  }

  useEffect(() => {
    console.log('Code or SessionId changed:', {
      before: {
        code: prevCode,
        sessionId: prevSessionId
      },
      after: {
        code: code,
        sessionId: sessionId
      }
    });

    setPrevCode(code);
    setPrevSessionId(sessionId);
    login({code, sessionId});
  }, [code]);

  const fetchSignInUrl = async () => {
    const response = await fetch('http://127.0.0.1:5000/signInUrl');
    const data = await response.json();
    window.location.href = data.url;
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {sessionId ? (
          <div>
            <p style={{color: 'green'}}><i>Received sessionId from eBay!</i></p>
            <p style={{fontSize: '0.4em', fontFamily: 'monospace'}}>SessionId: {sessionId}</p>
            <button onClick={() => window.location.href = '/'}>RESET</button>
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
