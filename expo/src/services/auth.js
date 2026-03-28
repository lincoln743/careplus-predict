import { loginRequest } from './api';

export async function loginUser(email, password) {
  const result = await loginRequest(email, password);

  if (!result?.ok) {
    return {
      ok: false,
      message: 'Usuário ou senha inválidos',
    };
  }

  return {
    ok: true,
    userId: String(result.id),
    userType: result.type,
    token: result.token,
  };
}
