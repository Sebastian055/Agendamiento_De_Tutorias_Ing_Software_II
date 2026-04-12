const bcrypt = require("bcryptjs");
const {
  buscarUsuarioPorEmail,
  insertarUsuario,
} = require("../models/UserModel");

console.log(
  "Modelos cargados - buscarUsuarioPorEmail:",
  typeof buscarUsuarioPorEmail,
);
console.log("Modelos cargados - insertarUsuario:", typeof insertarUsuario);

async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    const result = await buscarUsuarioPorEmail(email);
    const user = result.recordset[0];
    if (!user) return res.status(401).json({ message: "Correo no registrado" });
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass)
      return res.status(401).json({ message: "Contraseña incorrecta" });
    res.json({ message: "Login exitoso", user });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ message: "Error en login", error: err.message });
  }
}

async function registerUser(req, res) {
  const { nombre, email, password, role, materia, promedio, gratuito } =
    req.body;
  console.log("Datos recibidos:", { nombre, email, role });
  try {
    const existingUser = await buscarUsuarioPorEmail(email);
    if (existingUser.recordset && existingUser.recordset.length > 0) {
      return res
        .status(400)
        .json({ message: "Este correo ya está registrado" });
    }
    const hashedPass = await bcrypt.hash(password, 10);
    await insertarUsuario(
      nombre,
      email,
      hashedPass,
      role,
      materia,
      promedio,
      gratuito,
    );
    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (err) {
    console.error("Error en registerUser:", err);
    res.status(500).json({ message: "Error en registro", error: err.message });
  }
}

module.exports = { loginUser, registerUser };
