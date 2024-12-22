import { useState, useEffect, useMemo, useRef } from 'react';

import { PrimeReactProvider } from 'primereact/api';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import './App.css';
import { login, fetchSignInUrl, fetchData } from './helpers/api';

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

  useMemo(() => {
    console.log('Code or SessionId changed:', {
      code,
      sessionId
    });

    login({code, sessionId});
  }, [code, sessionId]);


  const buttonFunc = async (func) => {
    setIsLoading(true);
    try {
      const orderResponse = await func(sessionId)
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

  return (
    <PrimeReactProvider>
      <div className="App">
        <header className="App-header">
          <Toast ref={toast} />
          <div style={{ maxWidth: '300px' }}>
            {
              // eslint-disable-next-line jsx-a11y/no-distracting-elements
              isLoading ? <marquee>Loading...</marquee> : <p>Not loading</p>
            }
          </div>
          <div name="orders">
            {(orders && orders.length > 0) ? orders.map((order) => (
              <div key={order.Title}>
                <p>{order['Date Sold']}</p>
              </div>
            )) : <p>No orders found</p>}
          </div>
        {sessionId ? (
          <div>
            <p style={{color: 'green'}}><i>Received sessionId from eBay!</i></p>
            <p style={{fontSize: '0.4em', fontFamily: 'monospace'}}>SessionId: {sessionId}</p>
            <button onClick={() => window.location.href = '/'}>RESET</button>
            <div>
              <Button label="GET DATA" onClick={() => buttonFunc(fetchData)} />
            </div>
            <div>
              {orders ? orders.map((order) => (
                <div key={order.orderId}>
                  <p>{order.orderId}</p>
                </div>
              )) : <p>No orders found</p>}
            </div>
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
