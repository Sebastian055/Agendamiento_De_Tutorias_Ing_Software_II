// Rutas para poder acceder al login y al register
const express = require("express");
const router = express.Router();
const { loginUser, registerUser } = require("../controllers/authController");

// Verificar que los controladores existen
console.log("loginUser:", typeof loginUser);
console.log("registerUser:", typeof registerUser);

router.post("/login", loginUser);
router.post("/register", registerUser);

module.exports = router;
