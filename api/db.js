const Database = require('better-sqlite3');

// Caminho correto do banco
const db = new Database('./db/careplus.db');

// Criação da tabela users (garantia)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('patient', 'doctor'))
  );
`);

module.exports = db;
