//***Server para conectar las rutas entre si
//Importamos las librerias correspondientes
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");

//Importamos las rutas (CADA UNA UNA SOLA VEZ)
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const tutorRoutes = require("./routes/tutorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reservaRoutes = require("./routes/reservaRoutes");
const userRoutes = require("./routes/userRoutes");
const calificacionRoutes = require("./routes/calificacionRoutes");
const horarioRoutes = require("./routes/horarioRoutes");

//Creamos el servidor que se llamara app
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(
  session({
    secret: "supersecret",
    resave: false,
    saveUninitialized: true,
  }),
);

// Rutas (CADA UNA UNA SOLA VEZ)
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reservas", reservaRoutes);
app.use("/api/users", userRoutes);
app.use("/api/calificaciones", calificacionRoutes);
app.use("/api/horarios", horarioRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API de Tutorías funcionando correctamente" });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Base de datos: backend/database/gestion_tutorias.db`);
});
