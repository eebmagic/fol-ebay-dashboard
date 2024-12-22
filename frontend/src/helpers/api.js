const API_BASE_URL = 'http://127.0.0.1:5000';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

export const login = async ({code, sessionId}) => {
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
    return data.session_id ? data.session_id : false;

  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const fetchSignInUrl = async () => {
  const response = await fetch(`${API_BASE_URL}/signInUrl`, {
    method: 'GET',
    headers: DEFAULT_HEADERS,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.url;
};

export const fetchData = async (sessionId) => {
  if (!sessionId) {
    console.log('Can\'t get data because session id is: ', sessionId);
    return;
  }

  const url = new URL(`${API_BASE_URL}/viewData`);
  url.searchParams.set('sessionId', sessionId);

  const response = await fetch(url, {
    method: 'GET',
    headers: DEFAULT_HEADERS,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}; 