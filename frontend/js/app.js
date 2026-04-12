// ========== VARIABLES GLOBALES ==========
let currentUser = null;
let tutoresGlobal = [];
let reservaActual = null;

// ========== UTILIDADES ==========
function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

// ========== CARGAR DATOS DEL USUARIO ==========
function loadUserData() {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) {
    window.location.href = "login.html";
    return null;
  }
  currentUser = JSON.parse(userStr);
  document.getElementById("user-name").innerHTML =
    `👋 Bienvenido, ${currentUser.nombre}`;
  return currentUser;
}

// ========== BUSCAR TUTORES ==========
async function buscarTutores() {
  const materia = document.getElementById("search-materia").value.trim();
  const nombre = document.getElementById("search-nombre").value.trim();
  const minPromedio = document.getElementById("search-promedio").value;

  let url = "http://localhost:3000/api/tutors/search?";
  const params = [];
  if (materia) params.push(`materia=${encodeURIComponent(materia)}`);
  if (nombre) params.push(`nombre=${encodeURIComponent(nombre)}`);
  if (minPromedio) params.push(`minPromedio=${minPromedio}`);
  url += params.join("&");

  try {
    const res = await fetch(url, { headers: getAuthHeaders() });
    const data = await res.json();
    tutoresGlobal = data;
    mostrarTutores(data);
    llenarSelectTutores(data);
  } catch (err) {
    console.error("Error al buscar tutores:", err);
    document.getElementById("tutors-container").innerHTML =
      '<div class="error">❌ Error al conectar con el servidor</div>';
  }
}

function mostrarTutores(tutores) {
  const container = document.getElementById("tutors-container");
  if (!container) return;

  if (!tutores || tutores.length === 0) {
    container.innerHTML =
      '<div class="no-results">😕 No se encontraron tutores</div>';
    return;
  }

  container.innerHTML = tutores
    .map(
      (tutor) => `
    <div class="tutor-card" data-id="${tutor.id}">
      <h3>${tutor.nombre}</h3>
      <p class="tutor-role">${tutor.role === "tutor_student" ? "🎓 Tutor Estudiante" : "👨‍🏫 Tutor Profesor"}</p>
      <p>📖 <strong>Materia:</strong> ${tutor.materia || "No especificada"}</p>
      <p>⭐ <strong>Promedio:</strong> ${tutor.promedio ? tutor.promedio + "/5" : "Sin calificaciones"}</p>
      <button class="btn-select-tutor" data-id="${tutor.id}" data-nombre="${tutor.nombre}">Seleccionar para reservar</button>
    </div>
  `,
    )
    .join("");

  // Eventos para seleccionar tutor
  document.querySelectorAll(".btn-select-tutor").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const nombre = btn.dataset.nombre;
      const select = document.getElementById("res-tutor");
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value == id) {
          select.selectedIndex = i;
          break;
        }
      }
      alert(`Tutor "${nombre}" seleccionado. Ahora elige fecha y hora.`);
    });
  });
}

function llenarSelectTutores(tutores) {
  const select = document.getElementById("res-tutor");
  if (!select) return;

  select.innerHTML = '<option value="">Selecciona un tutor</option>';
  tutores.forEach((tutor) => {
    const option = document.createElement("option");
    option.value = tutor.id;
    option.textContent = `${tutor.nombre} - ${tutor.materia || "General"} (${tutor.promedio || "Nuevo"}/5)`;
    select.appendChild(option);
  });
}

// ========== RESERVAR TUTORÍA ==========
let reservando = false;

async function reservarTutoria(event) {
  // Prevenir propagación del evento
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Evitar envíos múltiples
  if (reservando) {
    console.log("⚠️ Ya hay una reserva en proceso, ignorando...");
    return;
  }

  const tutorId = document.getElementById("res-tutor").value;
  const fecha = document.getElementById("res-fecha").value;
  const hora = document.getElementById("res-hora").value;

  console.log("=== DIAGNÓSTICO DE RESERVA ===");
  console.log("tutorId:", tutorId);
  console.log("fecha:", fecha);
  console.log("hora:", hora);

  if (!tutorId) {
    alert("⚠️ Selecciona un tutor primero");
    return;
  }
  if (!fecha || !hora) {
    alert("⚠️ Selecciona fecha y hora");
    return;
  }
  if (!currentUser) {
    alert("⚠️ Debes iniciar sesión");
    window.location.href = "login.html";
    return;
  }

  const hoy = new Date().toISOString().split("T")[0];
  if (fecha < hoy) {
    alert("⚠️ No puedes reservar en fechas pasadas");
    return;
  }

  // Deshabilitar botón mientras se procesa
  const btn = document.getElementById("btn-book");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "⏳ Procesando...";
  }
  reservando = true;

  try {
    const payload = {
      estudiante_id: currentUser.id,
      tutor_id: parseInt(tutorId),
      fecha: fecha,
      hora: hora,
    };
    console.log("Payload a enviar:", payload);

    const res = await fetch("http://localhost:3000/api/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("Status de respuesta:", res.status);
    const data = await res.json();
    console.log("Respuesta:", data);

    if (res.ok) {
      alert(data.message);
      // Limpiar formulario
      document.getElementById("res-fecha").value = "";
      document.getElementById("res-hora").value = "";
      document.getElementById("res-tutor").value = "";
      // Recargar reservas
      await cargarMisReservas();
    } else {
      alert("❌ " + (data.message || "Error desconocido"));
    }
  } catch (err) {
    console.error("Error detallado:", err);
    alert("Error de conexión con el servidor: " + err.message);
  } finally {
    // Rehabilitar botón
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Confirmar Reserva";
    }
    reservando = false;
  }
}
// ========== MIS RESERVAS ==========
async function cargarMisReservas() {
  // ✅ Agrega esta verificación al inicio
  if (!currentUser || !currentUser.id) {
    console.log("No hay usuario logueado, no se pueden cargar reservas");
    return;
  }

  console.log("🔍 Cargando reservas para usuario:", currentUser.id);

  try {
    const res = await fetch(
      `http://localhost:3000/api/reservas/usuario/${currentUser.id}`,
      {
        headers: getAuthHeaders(),
      },
    );

    console.log("📡 Status de respuesta:", res.status);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const reservas = await res.json();
    console.log("Reservas recibidas:", reservas);
    mostrarReservas(reservas);
  } catch (err) {
    console.error("Error detallado al cargar reservas:", err);
    document.getElementById("reservas-container").innerHTML =
      '<div class="error"> Error al cargar reservas. ¿El backend está corriendo?</div>';
  }
}

function mostrarReservas(reservas) {
  const container = document.getElementById("reservas-container");
  if (!container) return;

  if (!reservas || reservas.length === 0) {
    container.innerHTML =
      '<div class="no-results">📭 No tienes reservas aún</div>';
    return;
  }

  const calificaciones = obtenerCalificacionesLocal();
  const reservasCalificadas = calificaciones.map((c) => c.reserva_id);

  container.innerHTML = reservas
    .map(
      (reserva) => `
    <div class="reserva-card estado-${reserva.estado}">
      <h4>📚 Tutoría con ${reserva.tutor}</h4>
      <p>📅 Fecha: ${reserva.fecha} - ⏰ Hora: ${reserva.hora.substring(0, 5)}</p>
      <p>📌 Estado: ${getEstadoTexto(reserva.estado)}</p>
      <!-- Botón de prueba para marcar como completada (solo visible para pruebas) -->
      <button class="btn-completar" data-reserva-id="${reserva.id}" style="background:#6c757d; margin-right:8px;">✅ Marcar como completada (test)</button>
      ${
        reserva.estado === "completada" &&
        !reservasCalificadas.includes(reserva.id)
          ? `
        <button class="btn-calificar" data-reserva-id="${reserva.id}" data-tutor-id="${reserva.tutor_id}" data-tutor-nombre="${reserva.tutor}">⭐ Calificar tutor</button>
      `
          : ""
      }
      ${
        reserva.estado === "pendiente"
          ? `
        <button class="btn-cancelar" data-reserva-id="${reserva.id}">❌ Cancelar reserva</button>
      `
          : ""
      }
    </div>
  `,
    )
    .join("");

  // Evento para marcar como completada (prueba)
  document.querySelectorAll(".btn-completar").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const reservaId = btn.dataset.reservaId;
      await marcarComoCompletada(reservaId);
      cargarMisReservas();
    });
  });

  // Eventos calificar
  document.querySelectorAll(".btn-calificar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const reservaId = parseInt(btn.dataset.reservaId);
      const tutorId = parseInt(btn.dataset.tutorId);
      const tutorNombre = btn.dataset.tutorNombre;
      abrirModalCalificar(reservaId, tutorId, tutorNombre);
    });
  });

  // Eventos cancelar
  document.querySelectorAll(".btn-cancelar").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const reservaId = btn.dataset.reservaId;
      if (confirm("¿Estás seguro de cancelar esta reserva?")) {
        await cancelarReserva(reservaId);
        cargarMisReservas();
      }
    });
  });
}

// Función para marcar reserva como completada (temporal para pruebas)
async function marcarComoCompletada(reservaId) {
  try {
    const res = await fetch(
      `http://localhost:3000/api/reservas/${reservaId}/completar`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      },
    );
    const data = await res.json();
    if (res.ok) {
      alert("Reserva marcada como completada");
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert("Error al completar reserva");
  }
}

// ========== CANCELAR RESERVA ==========
async function cancelarReserva(reservaId) {
  try {
    const res = await fetch(
      `http://localhost:3000/api/reservas/${reservaId}/cancelar`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      },
    );
    const data = await res.json();
    if (res.ok) {
      alert("Reserva cancelada correctamente");
      return true;
    } else {
      alert(data.message || "Error al cancelar");
      return false;
    }
  } catch (err) {
    console.error("Error al cancelar:", err);
    alert("Error de conexión al cancelar reserva");
    return false;
  }
}

// ========== FUNCIÓN DE APOYO ==========
function getEstadoTexto(estado) {
  switch (estado) {
    case "pendiente":
      return "Pendiente";
    case "confirmada":
      return "Confirmada";
    case "completada":
      return "Completada";
    case "cancelada":
      return "Cancelada";
    default:
      return estado;
  }
}

// ========== CALIFICACIONES (LOCAL STORAGE TEMPORAL) ==========
function obtenerCalificacionesLocal() {
  const califs = localStorage.getItem("calificaciones");
  return califs ? JSON.parse(califs) : [];
}

function guardarCalificacionesLocal(calificaciones) {
  localStorage.setItem("calificaciones", JSON.stringify(calificaciones));
}

// ========== MODAL DE CALIFICACIÓN ==========
function abrirModalCalificar(reservaId, tutorId, tutorNombre) {
  reservaActual = { id: reservaId, tutorId: tutorId };
  document.getElementById("modal-tutor-name").innerHTML =
    `Calificando a: <strong>${tutorNombre}</strong>`;
  document.getElementById("modal-calificar").classList.remove("hidden");
  document.getElementById("calificacion-rating").value = "5";
  document.getElementById("calificacion-comentario").value = "";
}

function cerrarModalCalificar() {
  document.getElementById("modal-calificar").classList.add("hidden");
  reservaActual = null;
}

async function enviarCalificacion() {
  if (!reservaActual) {
    alert("Error: No hay reserva seleccionada");
    return;
  }

  const rating = parseInt(document.getElementById("calificacion-rating").value);
  const comentario = document.getElementById("calificacion-comentario").value;

  try {
    const res = await fetch("http://localhost:3000/api/calificaciones", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        reserva_id: reservaActual.id,
        estudiante_id: currentUser.id,
        tutor_id: reservaActual.tutorId,
        rating: rating,
        comentario: comentario,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Calificación enviada correctamente");

      // Guardar localmente también
      const calificaciones = obtenerCalificacionesLocal();
      calificaciones.push({
        reserva_id: reservaActual.id,
        calificacion: rating,
        comentario: comentario,
      });
      guardarCalificacionesLocal(calificaciones);

      cerrarModalCalificar();
      cargarMisReservas();
      buscarTutores();
    } else {
      alert("❌ " + data.message);
    }
  } catch (err) {
    console.error("Error:", err);
    alert("❌ Error al enviar calificación");
  }
}

// ========== LOGOUT ==========
function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userId");
  window.location.href = "login.html";
}

/// ========== INICIALIZACIÓN ==========
document.addEventListener("DOMContentLoaded", async () => {
  if (!loadUserData()) return;

  // Configurar eventos
  document
    .getElementById("btn-search")
    ?.addEventListener("click", buscarTutores);

  // Previene los eventos duplicados en btn-book con prevención adicional
  const oldBookBtn = document.getElementById("btn-book");
  if (oldBookBtn) {
    const newBookBtn = oldBookBtn.cloneNode(true);
    oldBookBtn.replaceWith(newBookBtn);
    // Agregar evento con prevención de propagación
    newBookBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      reservarTutoria(e);
    });
  }

  document
    .getElementById("btn-refresh")
    ?.addEventListener("click", cargarMisReservas);
  document.getElementById("btn-logout")?.addEventListener("click", logout);
  document
    .getElementById("btn-submit-calificacion")
    ?.addEventListener("click", enviarCalificacion);
  document
    .getElementById("btn-close-modal")
    ?.addEventListener("click", cerrarModalCalificar);

  // Cargar datos iniciales
  await buscarTutores();
  await cargarMisReservas();
});
