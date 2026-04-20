import { Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';

// gera números realistas sem variar demais
function jitter(value, delta, min, max) {
  const v = value + (Math.random() - 0.5) * delta;
  return Math.min(max, Math.max(min, v));
}

// mock fixo semanal base (em passos)
const baseWeekData = [
  { label: 'Sex', date: '23/10/2025', steps: 7784 },
  { label: 'Sáb', date: '24/10/2025', steps: 3214 },
  { label: 'Dom', date: '25/10/2025', steps: 3505 },
  { label: 'Seg', date: '26/10/2025', steps: 7998 },
  { label: 'Ter', date: '27/10/2025', steps: 3806 },
  { label: 'Qua', date: '28/10/2025', steps: 4709 },
  { label: 'Qui', date: '29/10/2025', steps: 6063 },
];

// gera uma cópia da semana com leve ruído
function getWeekDataWithJitter(prevWeek) {
  return prevWeek.map(day => {
    const newSteps = Math.round(
      jitter(day.steps, 400, 2500, 10000)
    );
    return { ...day, steps: newSteps };
  });
}

// calcula métricas semanais
function summarizeWeek(weekArr) {
  const stepsArr = weekArr.map(d => d.steps);
  const total = stepsArr.reduce((acc, v) => acc + v, 0);
  const max = Math.max(...stepsArr);
  const min = Math.min(...stepsArr);
  const avg = total / stepsArr.length;

  return {
    total,
    max,
    min,
    avg,
  };
}

async function getLastWeekSteps() {
  // ANDROID: range não suportado -> mock seguro
  if (Platform.OS === 'android') {
    // retorna mock da semana + resumo
    const week = getWeekDataWithJitter(baseWeekData);
    const stats = summarizeWeek(week);
    return { week, stats };
  }

  // iOS: tentar pegar passos reais; se falhar, mock
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 1);

    // no iOS, getStepCountAsync aceita range
    const { steps } = await Pedometer.getStepCountAsync(startDate, endDate);

    // vamos montar uma semana fake usando esse valor como base
    const ref = steps || 5000;
    const mockWeek = baseWeekData.map(d => ({
      ...d,
      steps: Math.round(jitter(ref, 1000, 2500, 10000)),
    }));
    const stats = summarizeWeek(mockWeek);

    return { week: mockWeek, stats };
  } catch (err) {
    console.warn('⚠️ fallback mock (iOS erro ao ler passos):', err);
    const week = getWeekDataWithJitter(baseWeekData);
    const stats = summarizeWeek(week);
    return { week, stats };
  }
}

export default {
  getLastWeekSteps,
};
