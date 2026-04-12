// backend/routes/horarioRoutes.js
const express = require("express");
const router = express.Router();
const {
  crearHorario,
  listarHorariosPorTutor,
  eliminarHorario,
} = require("../controllers/horarioController");

router.post("/", crearHorario);
router.get("/tutor/:id", listarHorariosPorTutor);
router.delete("/:id", eliminarHorario);

module.exports = router;
