import { useState, useEffect, useMemo, useRef } from 'react';

import { PrimeReactProvider } from 'primereact/api';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

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

  useMemo(() => {
    login({code, sessionId});
  }, [code, sessionId]);


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

  useEffect(() => {
    console.log('orders state changed', orders);
  }, [orders]);

  useEffect(() => {
    // TODO: Check if this is actually working, else remove it.
    buttonFunc();
  }, []); // Empty dependency array means this only runs once on mount

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
        {sessionId ? (
          <div>
            <div>
              <Button label="GET DATA" onClick={buttonFunc} />
            </div>
            <p style={{color: 'green'}}><i>Received sessionId from eBay!</i></p>
            <p style={{fontSize: '0.4em', fontFamily: 'monospace'}}>SessionId: {sessionId}</p>
            <button onClick={() => window.location.href = '/'}>RESET</button>
          </div>
        ) : code ? (
          <div>
            <p style={{color: 'orange'}}><i>Received code from eBay!</i></p>
            <p style={{fontSize: '0.4em', fontFamily: 'monospace'}}>Code: {code}</p>
            {/* Take this out later */}
            <Button label="RESET" onClick={() => window.location.href = '/'} />
          </div>
        ) : isFailed ? (
          <div>
            <p style={{color: 'red'}}><i>Failed to authenticate with eBay!</i></p>
            <p>Try clearing out the url and signing in again.</p>
            <Button label="RESET" onClick={() => window.location.href = '/'} />
          </div>
        ) : (
          <>
            <p>Click the button below to sign in with eBay</p>
            <Button label="Sign in with eBay" onClick={fetchSignInUrl} />
          </>
        )}
      </header>
    </div>
    </PrimeReactProvider>
  );
}

export default App;
