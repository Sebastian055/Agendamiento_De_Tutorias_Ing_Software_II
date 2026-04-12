// backend/models/CalificacionModel.js
const { query, run } = require("../database/db");

async function insertarCalificacion(
  reserva_id,
  estudiante_id,
  tutor_id,
  rating,
  comentario,
) {
  console.log("📝 Insertando calificación:", {
    reserva_id,
    estudiante_id,
    tutor_id,
    rating,
  });

  return run(
    `INSERT INTO Calificaciones (reserva_id, estudiante_id, tutor_id, rating, comentario)
     VALUES (?, ?, ?, ?, ?)`,
    [reserva_id, estudiante_id, tutor_id, rating, comentario || ""],
  );
}

async function obtenerCalificaciones() {
  return query(`
    SELECT C.id, U1.nombre AS estudiante, U2.nombre AS tutor, C.rating, C.comentario
    FROM Calificaciones C
    JOIN Users U1 ON C.estudiante_id = U1.id
    JOIN Users U2 ON C.tutor_id = U2.id
  `);
}

async function obtenerPromedioTutor(tutor_id) {
  const result = await query(
    `SELECT AVG(rating) as promedio, COUNT(*) as total
     FROM Calificaciones
     WHERE tutor_id = ?`,
    [tutor_id],
  );
  return result.recordset[0];
}

async function actualizarPromedioTutor(tutor_id) {
  const { promedio, total } = await obtenerPromedioTutor(tutor_id);

  if (total > 0) {
    await run(`UPDATE Users SET promedio = ? WHERE id = ?`, [
      Math.round(promedio * 10) / 10,
      tutor_id,
    ]);
  }
  return { promedio, total };
}

module.exports = {
  insertarCalificacion,
  obtenerCalificaciones,
  obtenerPromedioTutor,
  actualizarPromedioTutor,
};
