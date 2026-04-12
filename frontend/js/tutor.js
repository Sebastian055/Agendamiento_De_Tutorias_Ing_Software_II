// ========== VARIABLES GLOBALES ==========
let currentUser = null;
let tutoriasGlobal = [];
let horariosGlobal = [];

// ========== UTILIDADES ==========
function getAuthHeaders() {
  return { "Content-Type": "application/json" };
}

// ========== CARGAR DATOS DEL USUARIO ==========
function loadUserData() {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) {
    window.location.href = "login.html";
    return null;
  }
  currentUser = JSON.parse(userStr);

  // Verificar que el usuario es tutor
  if (!currentUser.role || !currentUser.role.includes("tutor")) {
    alert("⚠️ Acceso no autorizado. Solo tutores pueden acceder.");
    window.location.href = "login.html";
    return null;
  }

  document.getElementById("user-name").innerHTML =
    `👋 Bienvenido, ${currentUser.nombre}`;

  // Cargar datos del perfil
  document.getElementById("perfil-materia").value = currentUser.materia || "";
  document.getElementById("perfil-gratuito").value = currentUser.gratuito
    ? 1
    : 0;
  document.getElementById("materia-tutor").innerHTML =
    currentUser.materia || "No especificada";

  return currentUser;
}

// ========== CARGAR MIS TUTORÍAS ==========
async function cargarMisTutorias() {
  try {
    const res = await fetch(
      `http://localhost:3000/api/reservas/tutor/${currentUser.id}`,
      {
        headers: getAuthHeaders(),
      },
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const tutorias = await res.json();
    tutoriasGlobal = tutorias;
    mostrarTutorias(tutorias, "pendiente");
    actualizarEstadisticas(tutorias);
  } catch (err) {
    console.error("Error al cargar tutorías:", err);
    document.getElementById("tutorias-container").innerHTML =
      '<div class="error">Error al cargar tutorías</div>';
  }
}
function mostrarTutorias(tutorias, estado) {
  const container = document.getElementById("tutorias-container");
  const filtradas = tutorias.filter((t) => t.estado === estado);

  if (filtradas.length === 0) {
    container.innerHTML = `<div class="no-results">📭 No hay tutorías ${estado === "pendiente" ? "pendientes" : estado === "completada" ? "completadas" : "canceladas"}</div>`;
    return;
  }

  container.innerHTML = filtradas
    .map(
      (tutoria) => `
    <div class="tutoria-card estado-${tutoria.estado}">
      <h4>📚 ${tutoria.estudiante || "Estudiante"}</h4>
      <p>📅 Fecha: ${tutoria.fecha} - ⏰ Hora: ${tutoria.hora.substring(0, 5)}</p>
      <p>📌 Estado: ${getEstadoTexto(tutoria.estado)}</p>
      ${
        tutoria.calificacion
          ? `
        <p>⭐ Calificación: ${tutoria.calificacion}/5</p>
        <p>💬 Comentario: "${tutoria.comentario || "Sin comentario"}"</p>
      `
          : tutoria.estado === "completada"
            ? `
        <p>⏳ Esperando calificación del estudiante...</p>
      `
            : ""
      }
      ${
        tutoria.estado === "pendiente"
          ? `
        <button class="btn-completar" data-id="${tutoria.id}">✅ Marcar como completada</button>
      `
          : ""
      }
    </div>
  `,
    )
    .join("");

  // Eventos para botones de completar
  document.querySelectorAll(".btn-completar").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      await marcarComoCompletada(id);
      cargarMisTutorias();
    });
  });
}

function getEstadoTexto(estado) {
  switch (estado) {
    case "pendiente":
      return "⏳ Pendiente";
    case "confirmada":
      return "✅ Confirmada";
    case "completada":
      return "📝 Completada";
    case "cancelada":
      return "❌ Cancelada";
    default:
      return estado;
  }
}

async function marcarComoCompletada(reservaId) {
  try {
    const res = await fetch(
      `http://localhost:3000/api/reservas/${reservaId}/completar`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      },
    );
    if (res.ok) {
      alert("✅ Tutoría marcada como completada");
    }
  } catch (err) {
    alert("Error al completar");
  }
}

function actualizarEstadisticas(tutorias) {
  const total = tutorias.length;
  const completadas = tutorias.filter(
    (t) => t.estado === "completada" && t.calificacion,
  );
  const promedio =
    completadas.length > 0
      ? (
          completadas.reduce((sum, t) => sum + t.calificacion, 0) /
          completadas.length
        ).toFixed(1)
      : 0;

  document.getElementById("total-tutorias").innerHTML = total;
  document.getElementById("promedio-calificaciones").innerHTML =
    promedio > 0 ? `${promedio}/5` : "Sin calificaciones";
}

// ========== ACTUALIZAR PERFIL ==========
async function actualizarPerfil() {
  const materia = document.getElementById("perfil-materia").value.trim();
  const gratuito = document.getElementById("perfil-gratuito").value === "1";

  try {
    const res = await fetch(
      `http://localhost:3000/api/users/${currentUser.id}/perfil`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ materia, gratuito }),
      },
    );

    const data = await res.json();
    if (res.ok) {
      alert("✅ Perfil actualizado correctamente");
      currentUser.materia = materia;
      currentUser.gratuito = gratuito;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      document.getElementById("materia-tutor").innerHTML =
        materia || "No especificada";
    } else {
      alert("❌ " + data.message);
    }
  } catch (err) {
    alert("❌ Error al actualizar perfil");
  }
}

// ========== GESTIONAR HORARIOS ==========
async function cargarHorarios() {
  try {
    const res = await fetch(
      `http://localhost:3000/api/horarios/tutor/${currentUser.id}`,
      {
        headers: getAuthHeaders(),
      },
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const horarios = await res.json();
    horariosGlobal = horarios;
    mostrarHorarios(horarios);
  } catch (err) {
    console.error("Error al cargar horarios:", err);
  }
}

function mostrarHorarios(horarios) {
  const container = document.getElementById("horarios-container");

  if (!horarios || horarios.length === 0) {
    container.innerHTML =
      '<div class="no-results">⏰ No tienes horarios configurados</div>';
    return;
  }

  container.innerHTML = horarios
    .map(
      (h) => `
    <div class="horario-item">
      <span>📅 ${h.dia_semana} - ${h.hora_inicio.substring(0, 5)} a ${h.hora_fin.substring(0, 5)}</span>
      <button class="btn-eliminar-horario" data-id="${h.id}">Eliminar</button>
    </div>
  `,
    )
    .join("");

  document.querySelectorAll(".btn-eliminar-horario").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await eliminarHorario(btn.dataset.id);
      cargarHorarios();
    });
  });
}

async function agregarHorario() {
  const dia = document.getElementById("horario-dia").value;
  const horaInicio = document.getElementById("horario-inicio").value;
  const horaFin = document.getElementById("horario-fin").value;

  if (!dia || !horaInicio || !horaFin) {
    alert("⚠️ Completa todos los campos");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/horarios", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        tutor_id: currentUser.id,
        dia_semana: dia,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ Horario agregado");
      document.getElementById("horario-inicio").value = "";
      document.getElementById("horario-fin").value = "";
      cargarHorarios();
    } else {
      alert("❌ " + data.message);
    }
  } catch (err) {
    alert("❌ Error al agregar horario");
  }
}

async function eliminarHorario(horarioId) {
  try {
    const res = await fetch(`http://localhost:3000/api/horarios/${horarioId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (res.ok) {
      alert("✅ Horario eliminado");
    }
  } catch (err) {
    alert("❌ Error al eliminar horario");
  }
}

// ========== LOGOUT ==========
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

// ========== INICIALIZACIÓN ==========
document.addEventListener("DOMContentLoaded", async () => {
  if (!loadUserData()) return;

  // Configurar eventos
  document.getElementById("btn-logout").addEventListener("click", logout);
  document
    .getElementById("btn-actualizar-perfil")
    .addEventListener("click", actualizarPerfil);
  document
    .getElementById("btn-agregar-horario")
    .addEventListener("click", agregarHorario);

  // Tabs
  document.getElementById("tab-pendientes").addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document.getElementById("tab-pendientes").classList.add("active");
    mostrarTutorias(tutoriasGlobal, "pendiente");
  });

  document.getElementById("tab-completadas").addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document.getElementById("tab-completadas").classList.add("active");
    mostrarTutorias(tutoriasGlobal, "completada");
  });

  document.getElementById("tab-canceladas").addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document.getElementById("tab-canceladas").classList.add("active");
    mostrarTutorias(tutoriasGlobal, "cancelada");
  });

  // Cargar datos
  await cargarMisTutorias();
  await cargarHorarios();
});
