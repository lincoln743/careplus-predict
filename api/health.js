const db = require('./database');

// Criação da tabela health_data (idempotente)
db.exec(`
  CREATE TABLE IF NOT EXISTS health_data (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    userId   INTEGER,
    steps    INTEGER,
    distance REAL,
    sleep    REAL,
    ts       TEXT DEFAULT (datetime('now'))
  );
`);

function saveHealthData({ userId, steps, distance, sleep }) {
  const stmt = db.prepare(`
    INSERT INTO health_data (userId, steps, distance, sleep)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(userId, steps, distance, sleep);
}

function getLatestHealthData(userId) {
  const stmt = db.prepare(`
    SELECT userId, steps, distance, sleep, ts
    FROM health_data
    WHERE userId = ?
    ORDER BY ts DESC
    LIMIT 1
  `);
  return stmt.get(userId);
}

function getAllHealthData(userId) {
  const stmt = db.prepare(`
    SELECT userId, steps, distance, sleep, ts
    FROM health_data
    WHERE userId = ?
    ORDER BY ts DESC
  `);
  return stmt.all(userId);
}

function getDailyGroupedData(userId) {
  const stmt = db.prepare(`
    SELECT
      DATE(ts) AS day,
      SUM(steps) AS steps,
      SUM(distance) AS distance,
      AVG(sleep) AS sleep,
      COUNT(*) AS entries
    FROM health_data
    WHERE userId = ?
    GROUP BY DATE(ts)
    ORDER BY DATE(ts) DESC
  `);
  return stmt.all(userId);
}

module.exports = {
  saveHealthData,
  getLatestHealthData,
  getAllHealthData,
  getDailyGroupedData
};
