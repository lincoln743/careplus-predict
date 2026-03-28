export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    token = null,
    body = null,
    headers = {},
    baseUrl = 'http://192.168.0.200:3333',
  } = options;

  const finalHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : null,
  });

  let data = null;

  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}
