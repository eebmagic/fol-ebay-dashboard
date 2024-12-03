import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('isAuthSuccessful') === 'true' && params.get('code')) {
      handleSuccessfulAuth(params.get('code'));
    }
  }, []);

  const handleSuccessfulAuth = async (code) => {
    console.log('Got EBay code');
    console.log(code);

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
