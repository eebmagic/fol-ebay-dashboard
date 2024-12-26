import { useState, useEffect, useMemo, useRef } from 'react';

import { PrimeReactProvider } from 'primereact/api';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import { login, fetchSignInUrl, fetchData } from './helpers/api';
import DataView from './components/DataView';

import './App.css';

function App() {
  const toast = useRef(null);

  const [code, setCode] = useState(null);
  const [isFailed, setIsFailed] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const foundSessionId = localStorage.getItem('sessionId');
    if (foundSessionId && typeof foundSessionId === 'string') {
      setSessionId(foundSessionId);
      return;
    }

    if (params.get('isAuthSuccessful') === 'true' && params.get('code')) {
      handleSuccessfulAuth(params.get('code'));
    } else if (params.get('isAuthSuccessful') === 'false') {
      setIsFailed(true);
    }
  }, []);

  /**
   * Delete the sessionId from local storage and set it to null here.
   */
  const reset = () => {
    localStorage.removeItem('sessionId');
    setSessionId(null);
    setCode(null);
    setOrders([]);
  }

  const handleSuccessfulAuth = async (code) => {
    console.log('Got EBay code', code);
    setCode(code);
    // This triggers the useMemo hook below.
  }

  useMemo(async () => {
    console.log(`Logging in with code: ${code} and sessionId: ${sessionId}`);
    const loginResultSessionId = await login({code, sessionId});
    if (loginResultSessionId && typeof loginResultSessionId === 'string') {
      setSessionId(loginResultSessionId);
      // This triggers the useEffect hook below.
    }
  }, [code]);

  useEffect(() => {
    if (sessionId !== null && sessionId !== undefined) {
      console.log(`Saving sessionId to local storage: ${sessionId}`);
      localStorage.setItem('sessionId', sessionId);
    }
    buttonFunc(); // TODO: Remove this. Just avoids an extra click during dev.
  }, [sessionId]);

  const buttonFunc = async () => {
    console.log('Getting order data ...');
    setIsLoading(true);
    try {
      const orderResponse = await fetchData(sessionId)
      setIsLoading(false);

      console.log('orderResponse', orderResponse);
      if (orderResponse.message) {
        toast.current.show({
          severity: orderResponse.message === 'success' ? 'success' : 'error',
          summary: orderResponse.message === 'success' ? 'Success!' : 'Error',
          detail: orderResponse.message === 'success' ? `Pulled ${orderResponse.orders.length} orders` : orderResponse.message,
        });
      }

      if (orderResponse.message === 'success') {
        setOrders(orderResponse.orders)
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  }


  return (
    <PrimeReactProvider>
      <div className="App">
        <header className="App-header">
          <Toast ref={toast} />
          <div style={{ maxWidth: '300px' }}>
            {
              // eslint-disable-next-line jsx-a11y/no-distracting-elements
              isLoading ? <marquee>Loading...</marquee> : null
            }
          </div>
          <DataView orders={orders} toast={toast} />
        {(sessionId !== null && sessionId !== undefined) ? (
          <div>
            <div>
              <Button label="GET DATA" onClick={buttonFunc} />
            </div>
            <p style={{color: 'green'}}><i>Received sessionId from eBay!</i></p>
            <p style={{fontSize: '0.4em', fontFamily: 'monospace'}}>SessionId: {sessionId}</p>
            <Button label="RESET" onClick={reset} />
          </div>
        ) : code ? (
          <div>
            <p style={{color: 'orange'}}><i>Received code from eBay!</i></p>
            <p style={{fontSize: '0.4em', fontFamily: 'monospace'}}>Code: {code}</p>
            {/* Take this out later */}
            <Button label="RESET" onClick={reset} />
          </div>
        ) : isFailed ? (
          <div>
            <p style={{color: 'red'}}><i>Failed to authenticate with eBay!</i></p>
            <p>Try clearing out the url and signing in again.</p>
            <Button label="RESET" onClick={reset} />
          </div>
        ) : (
          <>
            <p>Click the button below to sign in with eBay</p>
            <Button label="Sign in with eBay" onClick={async () => {
              const url = await fetchSignInUrl();
              window.location.href = url;
            }} />
          </>
        )}
      </header>
    </div>
    </PrimeReactProvider>
  );
}

export default App;
