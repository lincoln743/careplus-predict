import { API_BASE_URL } from "../config/api";

export async function predictHeartRate(window) {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ window }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      ok: false,
      source: "app-fallback",
      predicted_hr: 72,
      warning: "backend unavailable",
    };
  }
}
