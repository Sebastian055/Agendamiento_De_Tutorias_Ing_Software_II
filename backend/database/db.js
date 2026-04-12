//Logica para conectarse a la base de datos (SQLite)
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Ruta fija a la base de datos
const dbPath = path.join(__dirname, "gestion_tutorias.db");
console.log("Conectando a:", dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error al conectar con SQLite:", err.message);
  } else {
    console.log("Conectado a SQLite en", dbPath);
  }
});

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve({ recordset: rows });
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

module.exports = { query, run };
