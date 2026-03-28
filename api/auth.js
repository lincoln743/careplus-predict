const db = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET = "careplus_secret_key";

// Registrar usuário com hash
function registerUser(email, password, type) {
  const hash = bcrypt.hashSync(password, 10);

  const stmt = db.prepare(`
    INSERT INTO users (email, password, type)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(email, hash, type);

  return { id: result.lastInsertRowid, email, type };
}

// Login verificando hash
function loginUser(email, password) {
  const stmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
  const user = stmt.get(email);

  if (!user) return null;

  // Compara senha informada com a hash do banco
  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) return null;

  const token = jwt.sign(
    { id: user.id, type: user.type },
    SECRET,
    { expiresIn: "2h" }
  );

  return {
    ok: true,
    token,
    type: user.type,
    id: user.id
  };
}

module.exports = { registerUser, loginUser };
