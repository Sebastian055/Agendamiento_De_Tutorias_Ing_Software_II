//Logica de negocio del admin
const { obtenerUsuarios } = require("../models/UserModel");
const { obtenerReservas } = require("../models/ReservaModel");
const { obtenerCalificaciones } = require("../models/CalificacionModel");
const { query, run } = require("../database/db");

// Función generarReporte con estadísticas detalladas
async function generarReporte(req, res) {
  try {
    // Usuarios
    const usuarios = await obtenerUsuarios();
    const estudiantes = usuarios.recordset.filter(
      (u) => u.role === "student",
    ).length;
    const tutoresEstudiantes = usuarios.recordset.filter(
      (u) => u.role === "tutor_student",
    ).length;
    const tutoresProfesores = usuarios.recordset.filter(
      (u) => u.role === "tutor_teacher",
    ).length;
    const admins = usuarios.recordset.filter((u) => u.role === "admin").length;

    // Reservas
    const reservas = await obtenerReservas();
    const reservasPendientes = reservas.recordset.filter(
      (r) => r.estado === "pendiente",
    ).length;
    const reservasConfirmadas = reservas.recordset.filter(
      (r) => r.estado === "confirmada",
    ).length;
    const reservasCompletadas = reservas.recordset.filter(
      (r) => r.estado === "completada",
    ).length;
    const reservasCanceladas = reservas.recordset.filter(
      (r) => r.estado === "cancelada",
    ).length;

    // Calificaciones
    const calificaciones = await obtenerCalificaciones();
    const promedioGeneral =
      calificaciones.recordset.length > 0
        ? (
            calificaciones.recordset.reduce((sum, c) => sum + c.rating, 0) /
            calificaciones.recordset.length
          ).toFixed(1)
        : 0;

    res.json({
      totalUsuarios: usuarios.recordset.length,
      estudiantes,
      tutoresEstudiantes,
      tutoresProfesores,
      admins,
      totalReservas: reservas.recordset.length,
      reservasPendientes,
      reservasConfirmadas,
      reservasCompletadas,
      reservasCanceladas,
      totalCalificaciones: calificaciones.recordset.length,
      promedioGeneral,
    });
  } catch (err) {
    console.error("Error en generarReporte:", err);
    res
      .status(500)
      .json({ message: "Error al generar reporte", error: err.message });
  }
}

// Función para listar todos los usuarios (con filtros)
async function listarUsuarios(req, res) {
  try {
    const result = await query(`
      SELECT id, nombre, email, role, materia, promedio, gratuito
      FROM Users
      ORDER BY 
        CASE role
          WHEN 'admin' THEN 1
          WHEN 'tutor_teacher' THEN 2
          WHEN 'tutor_student' THEN 3
          WHEN 'student' THEN 4
        END, nombre
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error en listarUsuarios:", err);
    res
      .status(500)
      .json({ message: "Error al listar usuarios", error: err.message });
  }
}

// Función para actualizar un usuario
async function actualizarUsuario(req, res) {
  const { id } = req.params;
  const { nombre, email, role, materia, promedio } = req.body;

  try {
    await run(
      `UPDATE Users 
       SET nombre = ?, email = ?, role = ?, materia = ?, promedio = ?
       WHERE id = ?`,
      [nombre, email, role, materia || null, promedio || null, id],
    );
    res.json({ message: "Usuario actualizado correctamente" });
  } catch (err) {
    console.error("Error en actualizarUsuario:", err);
    res
      .status(500)
      .json({ message: "Error al actualizar usuario", error: err.message });
  }
}

// Función para eliminar un usuario
async function eliminarUsuario(req, res) {
  const { id } = req.params;

  try {
    // Verificar que no sea el último admin
    const admins = await query(
      `SELECT COUNT(*) as total FROM Users WHERE role = 'admin'`,
    );
    const usuario = await query(`SELECT role FROM Users WHERE id = ?`, [id]);

    if (
      usuario.recordset[0]?.role === "admin" &&
      admins.recordset[0].total <= 1
    ) {
      return res
        .status(400)
        .json({ message: "No se puede eliminar el único administrador" });
    }

    // Eliminar calificaciones asociadas primero
    await run(
      `DELETE FROM Calificaciones WHERE estudiante_id = ? OR tutor_id = ?`,
      [id, id],
    );
    // Eliminar reservas asociadas
    await run(`DELETE FROM Reservas WHERE estudiante_id = ? OR tutor_id = ?`, [
      id,
      id,
    ]);
    // Eliminar horarios asociados
    await run(`DELETE FROM Horarios WHERE tutor_id = ?`, [id]);
    // Eliminar usuario
    await run(`DELETE FROM Users WHERE id = ?`, [id]);

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("Error en eliminarUsuario:", err);
    res
      .status(500)
      .json({ message: "Error al eliminar usuario", error: err.message });
  }
}

// Función para validar tutores (con más detalles)
async function validarTutores(req, res) {
  try {
    const usuarios = await obtenerUsuarios();
    const tutores = usuarios.recordset.filter((u) => u.role.includes("tutor"));

    // Enriquecer con información de calificaciones
    const tutoresConInfo = await Promise.all(
      tutores.map(async (tutor) => {
        const calificaciones = await query(
          `SELECT AVG(rating) as promedio, COUNT(*) as total FROM Calificaciones WHERE tutor_id = ?`,
          [tutor.id],
        );
        return {
          ...tutor,
          promedioCalificaciones: calificaciones.recordset[0]?.promedio || 0,
          totalCalificaciones: calificaciones.recordset[0]?.total || 0,
        };
      }),
    );

    res.json(tutoresConInfo);
  } catch (err) {
    console.error("Error en validarTutores:", err);
    res
      .status(500)
      .json({ message: "Error al validar tutores", error: err.message });
  }
}

module.exports = {
  generarReporte,
  validarTutores,
  listarUsuarios,
  actualizarUsuario,
  eliminarUsuario,
};
