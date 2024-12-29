const API_BASE_URL = 'http://127.0.0.1:3000/api';
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

export const fetchData = async (sessionId, startDate, endDate) => {
  if (!sessionId) {
    console.log('Can\'t get data because session id is: ', sessionId);
    return;
  }

  const url = new URL(`${API_BASE_URL}/viewData`);
  url.searchParams.set('sessionId', sessionId);
  if (startDate) {
    url.searchParams.set('startDate', startDate);
    if (endDate) {
      // Cap endDate to current time to avoid future dates
      const now = new Date().toISOString();
      endDate = endDate > now ? now : endDate;
      url.searchParams.set('endDate', endDate);
    }
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: DEFAULT_HEADERS,
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      if (errorData) {
        return errorData;
      }
    } catch {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  const data = await response.json();
  return data;
}; 