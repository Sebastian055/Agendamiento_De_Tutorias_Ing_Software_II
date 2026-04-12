//Modulo paramanejar los datos en reservaModel
const { query, run } = require("../database/db");

async function crearReserva(estudiante_id, tutor_id, fecha, hora) {
  return run(
    `INSERT INTO Reservas (estudiante_id, tutor_id, fecha, hora, estado)
     VALUES (?, ?, ?, ?, 'pendiente')`,
    [estudiante_id, tutor_id, fecha, hora],
  );
}

async function listarReservas() {
  return query(`
    SELECT R.id, U1.nombre AS estudiante, U2.nombre AS tutor, R.fecha, R.hora, R.estado
    FROM Reservas R
    JOIN Users U1 ON R.estudiante_id = U1.id
    JOIN Users U2 ON R.tutor_id = U2.id
  `);
}

async function listarReservasPorUsuario(estudiante_id) {
  return query(
    `
    SELECT R.id, U.nombre AS tutor, R.fecha, R.hora, R.estado, U.id AS tutor_id
    FROM Reservas R
    JOIN Users U ON R.tutor_id = U.id
    WHERE R.estudiante_id = ?
    ORDER BY R.fecha DESC, R.hora DESC
  `,
    [estudiante_id],
  );
}

async function completarReserva(id) {
  return run(`UPDATE Reservas SET estado = 'completada' WHERE id = ?`, [id]);
}

async function cancelarReserva(id) {
  return run(`UPDATE Reservas SET estado = 'cancelada' WHERE id = ?`, [id]);
}

async function listarReservasPorTutor(tutor_id) {
  return query(
    `
    SELECT R.id, U.nombre AS estudiante, R.fecha, R.hora, R.estado,
           C.rating AS calificacion, C.comentario
    FROM Reservas R
    JOIN Users U ON R.estudiante_id = U.id
    LEFT JOIN Calificaciones C ON C.reserva_id = R.id
    WHERE R.tutor_id = ?
    ORDER BY R.fecha DESC, R.hora DESC
  `,
    [tutor_id],
  );
}

async function obtenerReservas() {
  return query(`
    SELECT R.id, U1.nombre AS estudiante, U2.nombre AS tutor, R.fecha, R.hora, R.estado
    FROM Reservas R
    JOIN Users U1 ON R.estudiante_id = U1.id
    JOIN Users U2 ON R.tutor_id = U2.id
  `);
}

module.exports = {
  crearReserva,
  listarReservas,
  listarReservasPorUsuario,
  completarReserva,
  cancelarReserva,
  listarReservasPorTutor,
  obtenerReservas,
};
