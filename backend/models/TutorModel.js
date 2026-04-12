// Logica para manejar los datos del tutor

const { query } = require("../database/db"); //Metodo para poder ejecutar comandos en la base de datos

//Funcion para busar tutores por materia, minPromedio, dia y hora
async function buscarTutores(materia, minPromedio, dia, hora) {
  let sqlQuery = `
    SELECT U.id, U.nombre, U.email, U.role, U.materia, U.promedio
    FROM Users U
    LEFT JOIN Horarios H ON U.id = H.tutor_id
    WHERE (U.role = 'tutor_student' OR U.role = 'tutor_teacher')
  `;

  const params = [];

  if (materia) {
    sqlQuery += ` AND U.materia = ?`;
    params.push(materia);
  }
  if (minPromedio) {
    sqlQuery += ` AND U.promedio >= ?`;
    params.push(minPromedio);
  }
  if (dia && hora) {
    sqlQuery += ` AND H.dia_semana = ? AND ? BETWEEN H.hora_inicio AND H.hora_fin`;
    params.push(dia, hora);
  }

  return query(sqlQuery, params);
}

module.exports = { buscarTutores };
