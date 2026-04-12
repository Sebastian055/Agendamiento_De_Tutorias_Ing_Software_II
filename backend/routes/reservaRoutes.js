//Rutas las cuales el frontend usara para poder hablar con el backend
//Rutas de autenticacion
const express = require("express");
const router = express.Router();
const {
  crearReserva,
  listarReservas,
  listarReservasPorUsuario,
  listarReservasPorTutor,
  completarReserva,
  cancelarReserva,
} = require("../controllers/reservaController");

router.post("/", crearReserva);
router.get("/", listarReservas);
router.get("/usuario/:id", listarReservasPorUsuario);
router.get("/tutor/:id", listarReservasPorTutor);
router.put("/:id/completar", completarReserva);
router.put("/:id/cancelar", cancelarReserva);

module.exports = router;
