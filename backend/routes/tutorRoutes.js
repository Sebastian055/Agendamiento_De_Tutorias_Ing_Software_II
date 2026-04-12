//Rutas las cuales el frontend usara para poder hablar con el backend
//Ruta para que el frontend se pueda comunicar con el backend
const express = require("express");
const router = express.Router();
const {
  searchTutors,
  verCalificaciones,
} = require("../controllers/tutorController");

router.get("/search", searchTutors);
router.get("/calificaciones", verCalificaciones);

module.exports = router;
