// backend/models/HorarioModel.js
const { query, run } = require("../database/db");

async function crearHorario(tutor_id, dia_semana, hora_inicio, hora_fin) {
  return run(
    `INSERT INTO Horarios (tutor_id, dia_semana, hora_inicio, hora_fin)
     VALUES (?, ?, ?, ?)`,
    [tutor_id, dia_semana, hora_inicio, hora_fin],
  );
}

async function listarHorariosPorTutor(tutor_id) {
  return query(
    `SELECT * FROM Horarios WHERE tutor_id = ? ORDER BY 
       CASE dia_semana
         WHEN 'Lunes' THEN 1
         WHEN 'Martes' THEN 2
         WHEN 'Miércoles' THEN 3
         WHEN 'Jueves' THEN 4
         WHEN 'Viernes' THEN 5
       END, hora_inicio`,
    [tutor_id],
  );
}

async function eliminarHorario(id) {
  return run(`DELETE FROM Horarios WHERE id = ?`, [id]);
}

module.exports = { crearHorario, listarHorariosPorTutor, eliminarHorario };
