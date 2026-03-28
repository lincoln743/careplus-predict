const Database = require('better-sqlite3');

const db = new Database('./db/careplus.db');

// Criar tabela users se não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('patient', 'doctor'))
  );
`);

module.exports = db;
