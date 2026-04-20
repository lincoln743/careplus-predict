function parseTs(ts) {
  if (!ts) return null;

  // aceita "2026-03-28 19:41:28" e ISO
  const normalized = String(ts).includes('T')
    ? String(ts)
    : String(ts).replace(' ', 'T');

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getPatientStatusFromTs(ts) {
  const lastDate = parseTs(ts);
  if (!lastDate) {
    return {
      status: 'offline',
      statusLabel: 'Offline',
      lastSeen: null,
    };
  }

  const now = new Date();
  const diffMs = now.getTime() - lastDate.getTime();
  const diffMin = diffMs / 60000;

  const sameDay =
    now.getFullYear() === lastDate.getFullYear() &&
    now.getMonth() === lastDate.getMonth() &&
    now.getDate() === lastDate.getDate();

  if (sameDay && diffMin <= 15) {
    return {
      status: 'online',
      statusLabel: 'Online',
      lastSeen: lastDate.toISOString(),
    };
  }

  if (sameDay) {
    return {
      status: 'active_today',
      statusLabel: 'Ativo hoje',
      lastSeen: lastDate.toISOString(),
    };
  }

  return {
    status: 'offline',
    statusLabel: 'Offline',
    lastSeen: lastDate.toISOString(),
  };
}

module.exports = { getPatientStatusFromTs };
