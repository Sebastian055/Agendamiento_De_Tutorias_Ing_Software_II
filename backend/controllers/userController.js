// backend/controllers/userController.js
const UserModel = require("../models/UserModel");

async function actualizarPerfil(req, res) {
  const { id } = req.params;
  const { materia, gratuito } = req.body;

  try {
    await UserModel.actualizarPerfil(id, materia, gratuito);
    res.json({ message: "Perfil actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar perfil:", err);
    res
      .status(500)
      .json({ message: "Error al actualizar perfil", error: err.message });
  }
}

async function obtenerUsuario(req, res) {
  const { id } = req.params;

  try {
    const result = await UserModel.obtenerUsuarioPorId(id);
    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ message: "Error al obtener usuario", error: err.message });
  }
}

module.exports = { actualizarPerfil, obtenerUsuario };
