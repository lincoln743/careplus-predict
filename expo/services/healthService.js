export async function sendMockHealthData() {
  try {
    const response = await fetch("http://192.168.0.60:3333/health/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: 1,
        steps: 1234,
        distance: 0.85,
        sleep: 6.2
      })
    });

    const json = await response.json();
    console.log("Resposta da API:", json);
    return json;

  } catch (err) {
    console.log("Erro ao enviar dados:", err);
    return null;
  }
}
