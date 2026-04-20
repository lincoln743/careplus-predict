import { API_URL } from './config';

async function tryLogin(url, email, password) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  let data = null;

  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  return {
    ok: response.ok && data?.ok,
    status: response.status,
    data,
  };
}

export async function loginUser(email, password) {
  try {
    const attempts = [
      `${API_URL}/login`,
      `${API_URL}/auth/login`,
    ];

    for (const url of attempts) {
      const result = await tryLogin(url, email, password);

      if (result.ok) {
        return {
          ok: true,
          token: result.data.token,
          userId: result.data.userId,
          userType: result.data.userType,
        };
      }

      if (result.status !== 404) {
        return {
          ok: false,
          error: result.data?.error || result.data?.message || 'Falha no login',
        };
      }
    }

    return {
      ok: false,
      error: 'Not Found',
    };
  } catch (_) {
    return {
      ok: false,
      error: 'Erro de conexão com o servidor',
    };
  }
}
