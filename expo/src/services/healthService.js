// healthService.js – versão simples, estável e sem OAuth
// Funciona 100% no Expo Go + Backend atual

const API_URL = "https://careplus-predict.onrender.com";

// ----------------------------------------------------
// Mock simples usado como fallback automático
// ----------------------------------------------------
function generateMock() {
  return {
    steps: 4000 + Math.floor(Math.random() * 4000),
    distance: 1.5 + Math.random() * 2.5,
    sleep: 5.0 + Math.random() * 2.5,
  };
}

// ----------------------------------------------------
// NÃO EXISTE mais tentativa real via Google Fit aqui.
// Toda tentativa real retorna fallback, sem crash.
// ----------------------------------------------------
export async function initHealthPermissions() {
  console.log("[healthService] Permissões Google Fit não disponíveis neste ambiente EXPO GO.");
  return true;
}

export async function getRealHealthData() {
  console.log("[healthService] Google Fit real indisponível. Usando fallback mock.");
  return generateMock();
}

// ----------------------------------------------------
// Envio REAL para o backend (funciona igual ao botão TEST)
// ----------------------------------------------------
export async function sendRealHealthData(userId) {
  try {
    const data = await getRealHealthData();

    const response = await fetch(`${API_URL}/health/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...data }),
    });

    const json = await response.json();
    console.log("[REAL HEALTH] enviado:", json);
    return json;

  } catch (err) {
    console.log("[REAL HEALTH ERRO]", err);
    return { ok: false, error: err };
  }
}

// ----------------------------------------------------
// Mock manual (usado no botão TEST)
// ----------------------------------------------------
export async function sendMockHealthData(userId) {
  try {
    const data = generateMock();

    const response = await fetch(`${API_URL}/health/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...data }),
    });

    const json = await response.json();
    console.log("[MOCK HEALTH] enviado:", json);
    return json;
  } catch (err) {
    console.log("[MOCK HEALTH ERRO]", err);
    return { ok: false, error: err };
  }
}
