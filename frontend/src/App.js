import { useState, useEffect } from 'react';

import logo from './logo.svg';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

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

    // TODO: Send code to backend to get sessionId

    setIsAuthenticated(true);
  }

  const fetchSignInUrl = async () => {
    const response = await fetch('http://127.0.0.1:5000/signInUrl');
    const data = await response.json();
    window.location.href = data.url;
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {isAuthenticated ? (
          <p style={{color: 'green'}}><i>Successfully authenticated with eBay!</i></p>
        ) : isFailed ? (
          <div>
            <p style={{color: 'red'}}><i>Failed to authenticate with eBay!</i></p>
            <p>Try clearing out the url and signing in again.</p>
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
