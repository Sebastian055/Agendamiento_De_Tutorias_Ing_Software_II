// backend/controllers/calificacionController.js
const CalificacionModel = require("../models/CalificacionModel");
const UserModel = require("../models/UserModel");

async function crearCalificacion(req, res) {
  const { reserva_id, estudiante_id, tutor_id, rating, comentario } = req.body;

  console.log("📝 Creando calificación:", {
    reserva_id,
    estudiante_id,
    tutor_id,
    rating,
  });

  try {
    // Insertar calificación
    await CalificacionModel.insertarCalificacion(
      reserva_id,
      estudiante_id,
      tutor_id,
      rating,
      comentario,
    );

    // Actualizar promedio del tutor
    const { promedio, total } =
      await CalificacionModel.actualizarPromedioTutor(tutor_id);
    console.log(
      `✅ Tutor ${tutor_id} - Promedio: ${promedio} (${total} calificaciones)`,
    );

    // Marcar reserva como completada (si no lo está)
    await marcarReservaComoCompletada(reserva_id);

    res.status(201).json({ message: "Calificación enviada correctamente" });
  } catch (err) {
    console.error("Error al crear calificación:", err);
    res
      .status(500)
      .json({ message: "Error al crear calificación", error: err.message });
  }
}

async function marcarReservaComoCompletada(reserva_id) {
  const { run } = require("../database/db");
  await run(`UPDATE Reservas SET estado = 'completada' WHERE id = ?`, [
    reserva_id,
  ]);
}

async function listarCalificaciones(req, res) {
  try {
    const result = await CalificacionModel.obtenerCalificaciones();
    res.json(result.recordset);
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ message: "Error al listar calificaciones", error: err.message });
  }
}

module.exports = { crearCalificacion, listarCalificaciones };
