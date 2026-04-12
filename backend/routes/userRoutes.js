// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  actualizarPerfil,
  obtenerUsuario,
} = require("../controllers/userController");

router.put("/:id/perfil", actualizarPerfil);
router.get("/:id", obtenerUsuario);

module.exports = router;
