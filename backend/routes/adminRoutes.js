//Rutas las cuales el frontend usara para poder hablar con el backend
//Ruta para que el frontend se pueda comunicar con el backend
const express = require("express");
const router = express.Router();
const {
  generarReporte,
  listarUsuarios,
  actualizarUsuario,
  eliminarUsuario,
} = require("../controllers/adminController");

router.get("/reportes", generarReporte);
router.get("/usuarios", listarUsuarios);
router.put("/usuarios/:id", actualizarUsuario);
router.delete("/usuarios/:id", eliminarUsuario);

module.exports = router;
