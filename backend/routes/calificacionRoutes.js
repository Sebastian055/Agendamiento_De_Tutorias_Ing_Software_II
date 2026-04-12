const express = require("express");
const router = express.Router();
const {
  crearCalificacion,
  listarCalificaciones,
} = require("../controllers/CalificacionController");

// POST /api/calificaciones - Crear una calificación
router.post("/", crearCalificacion);

// GET /api/calificaciones - Listar todas las calificaciones
router.get("/", listarCalificaciones);

module.exports = router;
