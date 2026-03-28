import axios from 'axios';

const API_URL = 'http://192.168.0.200:3333';

export async function loginUser(email, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    console.log('LOGIN STATUS:', response.status);
    console.log('LOGIN RESPONSE:', response.data);

    const data = response.data;

    // 🔥 FIX: sem data.data
    return {
      ok: data.ok,
      token: data.token,
      userId: data.userId,
      userType: data.userType,
    };

  } catch (error) {
    console.log('LOGIN ERROR:', error.response?.data || error.message);

    return {
      ok: false,
      error: 'Erro de conexão',
    };
  }
}
