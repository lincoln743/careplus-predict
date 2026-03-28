export const API_BASE_URL = "http://192.168.0.200:3333";

export async function loginRequest(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    console.log("LOGIN STATUS:", response.status);
    console.log("LOGIN RESPONSE:", data);

    return data;
  } catch (error) {
    console.log("LOGIN ERROR:", error);

    return {
      ok: false,
      error: "network_error"
    };
  }
}

export async function registerRequest(email, password, type) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password, type })
    });

    return await response.json();
  } catch (error) {
    console.log("REGISTER ERROR:", error);

    return {
      ok: false,
      error: "network_error"
    };
  }
}
