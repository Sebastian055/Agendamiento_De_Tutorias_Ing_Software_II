//Controladores para el estudiante
const { obtenerUsuarios } = require("../models/UserModel"); //Obtiene todos los usuarios de la BD
const { obtenerReservas } = require("../models/ReservaModel"); //Obtiene todas las reservas de la BD

//Llama el modelo para traer todos los usuarios (estudiante, tutores, admin)
async function listarEstudiantes(req, res) {
  try {
    const result = await obtenerUsuarios(); //Llama al modelo para traer los usuarios
    const estudiantes = result.recordset.filter((u) => u.role === "student"); //Filtra SOLO los que tienen el rol estudiantes
    res.json(estudiantes); //Devuelve SOLO los estudiantes (no todos los usuarios)
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al listar estudiantes", error: err.message }); //Si no lista los estudiantes genera un error
  }
}

async function historialReservas(req, res) {
  try {
    const result = await obtenerReservas(); //Obtiene las reservas
    res.json(result.recordset); //Toma solamente el array de resultados
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener historial", error: err.message }); //Si no tiene array ejecuta un error
  }
}

module.exports = { listarEstudiantes, historialReservas };
