const { query, run } = require("../database/db");

async function buscarUsuarioPorEmail(email) {
  console.log("Buscando usuario por email:", email);
  const result = await query(`SELECT * FROM Users WHERE email = ?`, [email]);
  console.log("Resultado:", result);
  return result;
}

async function insertarUsuario(
  nombre,
  email,
  password,
  role,
  materia,
  promedio,
  gratuito,
) {
  console.log("Insertando usuario:", { nombre, email, role });
  const result = await run(
    `INSERT INTO Users (nombre, email, password, role, materia, promedio, gratuito)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      nombre,
      email,
      password,
      role,
      materia || null,
      promedio || null,
      gratuito || 0,
    ],
  );
  console.log("Usuario insertado, ID:", result.lastID);
  return result;
}

async function obtenerUsuarios() {
  return query(`SELECT * FROM Users`);
}

async function actualizarPerfil(id, materia, gratuito) {
  return run(`UPDATE Users SET materia = ?, gratuito = ? WHERE id = ?`, [
    materia || null,
    gratuito ? 1 : 0,
    id,
  ]);
}

async function obtenerUsuarioPorId(id) {
  return query(
    `SELECT id, nombre, email, role, materia, promedio, gratuito FROM Users WHERE id = ?`,
    [id],
  );
}

async function actualizarUsuarioPorAdmin(
  id,
  nombre,
  email,
  role,
  materia,
  promedio,
) {
  return run(
    `UPDATE Users 
     SET nombre = ?, email = ?, role = ?, materia = ?, promedio = ?
     WHERE id = ?`,
    [nombre, email, role, materia || null, promedio || null, id],
  );
}

async function eliminarUsuarioPorAdmin(id) {
  return run(`DELETE FROM Users WHERE id = ?`, [id]);
}

module.exports = {
  buscarUsuarioPorEmail,
  insertarUsuario,
  obtenerUsuarios,
  actualizarPerfil,
  obtenerUsuarioPorId,
  actualizarUsuarioPorAdmin,
  eliminarUsuarioPorAdmin,
};
