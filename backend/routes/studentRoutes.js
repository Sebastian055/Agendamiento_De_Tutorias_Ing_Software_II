//Rutas las cuales el frontend usara para poder hablar con el backend
//Ruta para que el frontend se pueda comunicar con el backend
const express = require("express");
const router = express.Router();
const {
  listarEstudiantes,
  historialReservas,
} = require("../controllers/studentController");

router.get("/list", listarEstudiantes);
router.get("/historial", historialReservas);

module.exports = router;
