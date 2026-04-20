import { API_URL } from "./config";

export const getPatientDashboard = async (token) => {
  const res = await fetch(`${API_URL}/patient/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  console.log("RAW DASHBOARD:", json);

  // 🔥 normalização
  const data = json.data || json;

  return {
    history: data.history || [],
    latest: data.latest || {},
    healthScore: data.healthScore || 0,
    steps: data.steps || 0,
    sleep: data.sleep || 0,
    heartRate: data.heartRate || 0,
    progress: data.progress || 0,
    recommendations: data.recommendations || [],
  };
};
