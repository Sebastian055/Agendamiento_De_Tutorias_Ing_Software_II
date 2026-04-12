//Logica de negocio del tutor

const { buscarTutores } = require("../models/TutorModel"); //Importamos buscar tutores para poder buscar tutores desde la BD
const { obtenerCalificaciones } = require("../models/CalificacionModel"); //Importamos para que el tutor pueda verlas calificaciones

//Funcion para poder buscar tutores
async function searchTutors(req, res) {
  const { materia, minPromedio, dia, hora } = req.query; //Recibe los parametros de busqueda y se pone .query ya que es un get
  try {
    const result = await buscarTutores(materia, minPromedio, dia, hora); //Llama al modelo con todos los filtros y se encarga de buscar en la base de datos
    res.json(result.recordset); //Devuelve el array con las calificaciones
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al buscar tutores", error: err.message });
  }
}

//Funcion para poder ver calificaciones
async function verCalificaciones(req, res) {
  try {
    const result = await obtenerCalificaciones(); //Obtiene las calificaciones para poder verlas
    res.json(result.recordset); //Devuelve todas las calificaciones
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener calificaciones", error: err.message });
  }
}

module.exports = { searchTutors, verCalificaciones };
