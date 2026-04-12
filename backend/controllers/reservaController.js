const ReservaModel = require("../models/ReservaModel");

async function crearReserva(req, res) {
  const { estudiante_id, tutor_id, fecha, hora } = req.body;

  console.log("📝 Creando reserva:", { estudiante_id, tutor_id, fecha, hora });

  try {
    await ReservaModel.crearReserva(estudiante_id, tutor_id, fecha, hora);
    res.status(201).json({ message: "Reserva creada correctamente" });
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ message: "Error al crear reserva", error: err.message });
  }
}

async function listarReservas(req, res) {
  try {
    const result = await ReservaModel.listarReservas();
    res.json(result.recordset);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al listar reservas", error: err.message });
  }
}

async function listarReservasPorUsuario(req, res) {
  const { id } = req.params;

  try {
    const result = await ReservaModel.listarReservasPorUsuario(id);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ message: "Error al listar reservas", error: err.message });
  }
}

async function completarReserva(req, res) {
  const { id } = req.params;

  try {
    await ReservaModel.completarReserva(id);
    res.json({ message: "Reserva marcada como completada" });
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ message: "Error al completar reserva", error: err.message });
  }
}

async function cancelarReserva(req, res) {
  const { id } = req.params;

  try {
    await ReservaModel.cancelarReserva(id); // Llama al modelo para que ejecute en la BD
    res.json({ message: "Reserva cancelada correctamente" });
  } catch (err) {
    console.error("Error al cancelar:", err);
    res
      .status(500)
      .json({ message: "Error al cancelar reserva", error: err.message });
  }
}

async function listarReservasPorTutor(req, res) {
  const { id } = req.params;

  try {
    const result = await ReservaModel.listarReservasPorTutor(id);
    console.log("📋 Reservas del tutor:", result.recordset);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      message: "Error al listar reservas del tutor",
      error: err.message,
    });
  }
}

module.exports = {
  crearReserva,
  listarReservas,
  listarReservasPorUsuario,
  completarReserva,
  cancelarReserva,
  listarReservasPorTutor,
};
