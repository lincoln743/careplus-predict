const API_URL = "https://careplus-predict.onrender.com";

export async function initHealthPermissions() {
  return true;
}

export async function getRealHealthData() {
  throw new Error('[healthService] Google Fit indisponível neste ambiente.');
}

export async function sendRealHealthData(userId) {
  const response = await fetch(`${API_URL}/health/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) throw new Error(`[sendRealHealthData] HTTP ${response.status}`);
  return response.json();
}

export async function sendMockHealthData(userId, data) {
  if (!data) throw new Error('[sendMockHealthData] dados obrigatórios');
  const response = await fetch(`${API_URL}/health/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...data }),
  });
  if (!response.ok) throw new Error(`[sendMockHealthData] HTTP ${response.status}`);
  return response.json();
}
