const Database = require('better-sqlite3');
const path = require('path');

// 🔥 resolve espaço no caminho automaticamente
const dbPath = path.resolve(__dirname, 'db', 'careplus.db');

console.log("DB PATH:", dbPath);

const db = new Database(dbPath);

module.exports = db;
