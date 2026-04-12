// backend/controllers/horarioController.js
const HorarioModel = require("../models/HorarioModel");

async function crearHorario(req, res) {
  const { tutor_id, dia_semana, hora_inicio, hora_fin } = req.body;

  try {
    await HorarioModel.crearHorario(
      tutor_id,
      dia_semana,
      hora_inicio,
      hora_fin,
    );
    res.status(201).json({ message: "Horario agregado correctamente" });
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ message: "Error al crear horario", error: err.message });
  }
}

async function listarHorariosPorTutor(req, res) {
  const { id } = req.params;

  try {
    const result = await HorarioModel.listarHorariosPorTutor(id);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ message: "Error al listar horarios", error: err.message });
  }
}

async function eliminarHorario(req, res) {
  const { id } = req.params;

  try {
    await HorarioModel.eliminarHorario(id);
    res.json({ message: "Horario eliminado correctamente" });
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ message: "Error al eliminar horario", error: err.message });
  }
}

module.exports = { crearHorario, listarHorariosPorTutor, eliminarHorario };
