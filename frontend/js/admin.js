// ========== VARIABLES GLOBALES ==========
let currentUser = null;
let usuariosGlobal = [];

// ========== UTILIDADES ==========
function getAuthHeaders() {
  return { "Content-Type": "application/json" };
}

// ========== CARGAR DATOS DEL ADMIN ==========
function loadUserData() {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) {
    window.location.href = "login.html";
    return null;
  }
  currentUser = JSON.parse(userStr);

  if (currentUser.role !== "admin") {
    alert("⚠️ Acceso no autorizado");
    window.location.href = "login.html";
    return null;
  }

  document.getElementById("user-name").innerHTML =
    `👋 Bienvenido, ${currentUser.nombre}`;
  return currentUser;
}

// ========== CARGAR ESTADÍSTICAS ==========
async function cargarEstadisticas() {
  try {
    const res = await fetch("http://localhost:3000/api/admin/reportes", {
      headers: getAuthHeaders(),
    });
    const data = await res.json();

    document.getElementById("total-usuarios").innerHTML = data.totalUsuarios;
    document.getElementById("total-estudiantes").innerHTML =
      data.estudiantes || 0;
    document.getElementById("total-tutores-estudiantes").innerHTML =
      data.tutoresEstudiantes || 0;
    document.getElementById("total-tutores-profesores").innerHTML =
      data.tutoresProfesores || 0;
    document.getElementById("total-reservas").innerHTML = data.totalReservas;
    document.getElementById("total-calificaciones").innerHTML =
      data.totalCalificaciones;
    document.getElementById("promedio-general").innerHTML = data.promedioGeneral
      ? `${data.promedioGeneral}/5`
      : "Sin calificaciones";

    document.getElementById("reservas-pendientes").innerHTML =
      data.reservasPendientes || 0;
    document.getElementById("reservas-confirmadas").innerHTML =
      data.reservasConfirmadas || 0;
    document.getElementById("reservas-completadas").innerHTML =
      data.reservasCompletadas || 0;
    document.getElementById("reservas-canceladas").innerHTML =
      data.reservasCanceladas || 0;
  } catch (err) {
    console.error("Error al cargar estadísticas:", err);
  }
}

// ========== CARGAR USUARIOS ==========
async function cargarUsuarios() {
  try {
    const res = await fetch("http://localhost:3000/api/admin/usuarios", {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    usuariosGlobal = data;
    mostrarUsuarios(data);
  } catch (err) {
    console.error("Error al cargar usuarios:", err);
  }
}

function mostrarUsuarios(usuarios) {
  const container = document.getElementById("usuarios-container");
  const filterRole = document.getElementById("filter-role").value;
  const searchText = document.getElementById("search-user").value.toLowerCase();

  let filtrados = usuarios;

  if (filterRole !== "all") {
    filtrados = filtrados.filter((u) => u.role === filterRole);
  }

  if (searchText) {
    filtrados = filtrados.filter(
      (u) =>
        u.nombre.toLowerCase().includes(searchText) ||
        u.email.toLowerCase().includes(searchText),
    );
  }

  if (filtrados.length === 0) {
    container.innerHTML = '<div class="no-results">📭 No hay usuarios</div>';
    return;
  }

  container.innerHTML = filtrados
    .map(
      (usuario) => `
    <div class="usuario-card" data-id="${usuario.id}">
      <div class="usuario-info">
        <h4>${usuario.nombre}</h4>
        <p>📧 ${usuario.email}</p>
        <p>🎭 ${getRoleTexto(usuario.role)}</p>
        ${usuario.materia ? `<p>📖 Materia: ${usuario.materia}</p>` : ""}
        ${usuario.promedio ? `<p>⭐ Promedio: ${usuario.promedio}/5</p>` : ""}
      </div>
      <div class="usuario-actions">
        <button class="btn-edit" data-id="${usuario.id}" data-nombre="${usuario.nombre}" data-email="${usuario.email}" data-role="${usuario.role}" data-materia="${usuario.materia || ""}" data-promedio="${usuario.promedio || ""}">✏️ Editar</button>
        <button class="btn-delete" data-id="${usuario.id}">🗑️ Eliminar</button>
      </div>
    </div>
  `,
    )
    .join("");

  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      abrirModalEditar(
        btn.dataset.id,
        btn.dataset.nombre,
        btn.dataset.email,
        btn.dataset.role,
        btn.dataset.materia,
        btn.dataset.promedio,
      );
    });
  });

  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (confirm("¿Eliminar este usuario?")) {
        await eliminarUsuario(btn.dataset.id);
        cargarUsuarios();
        cargarEstadisticas();
      }
    });
  });
}

function getRoleTexto(role) {
  switch (role) {
    case "student":
      return "🎓 Estudiante";
    case "tutor_student":
      return "📚 Tutor Estudiante";
    case "tutor_teacher":
      return "👨‍🏫 Tutor Profesor";
    case "admin":
      return "👑 Administrador";
    default:
      return role;
  }
}

// ========== EDITAR USUARIO ==========
let usuarioEditando = null;

function abrirModalEditar(id, nombre, email, role, materia, promedio) {
  usuarioEditando = id;
  document.getElementById("edit-nombre").value = nombre;
  document.getElementById("edit-email").value = email;
  document.getElementById("edit-role").value = role;
  document.getElementById("edit-materia").value = materia;
  document.getElementById("edit-promedio").value = promedio;

  // Mostrar/ocultar campos según rol
  const isTutor = role.includes("tutor");
  document.getElementById("edit-materia-group").style.display = isTutor
    ? "block"
    : "none";
  document.getElementById("edit-promedio-group").style.display =
    role === "tutor_student" ? "block" : "none";

  document.getElementById("modal-editar").classList.remove("hidden");
}

async function guardarUsuario() {
  const data = {
    nombre: document.getElementById("edit-nombre").value,
    email: document.getElementById("edit-email").value,
    role: document.getElementById("edit-role").value,
    materia: document.getElementById("edit-materia").value || null,
    promedio: document.getElementById("edit-promedio").value || null,
  };

  try {
    const res = await fetch(
      `http://localhost:3000/api/admin/usuarios/${usuarioEditando}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      },
    );

    if (res.ok) {
      alert("✅ Usuario actualizado");
      document.getElementById("modal-editar").classList.add("hidden");
      cargarUsuarios();
      cargarEstadisticas();
    } else {
      const error = await res.json();
      alert("❌ " + error.message);
    }
  } catch (err) {
    alert("❌ Error al guardar");
  }
}

async function eliminarUsuario(id) {
  try {
    const res = await fetch(`http://localhost:3000/api/admin/usuarios/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      alert("✅ Usuario eliminado");
    } else {
      alert("❌ Error al eliminar");
    }
  } catch (err) {
    alert("❌ Error al eliminar");
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

  document.getElementById("btn-logout").addEventListener("click", logout);
  document
    .getElementById("btn-guardar")
    .addEventListener("click", guardarUsuario);
  document
    .getElementById("btn-cancelar-modal")
    .addEventListener("click", () => {
      document.getElementById("modal-editar").classList.add("hidden");
    });
  document
    .getElementById("btn-search-user")
    .addEventListener("click", () => mostrarUsuarios(usuariosGlobal));
  document
    .getElementById("filter-role")
    .addEventListener("change", () => mostrarUsuarios(usuariosGlobal));
  document
    .getElementById("search-user")
    .addEventListener("keyup", () => mostrarUsuarios(usuariosGlobal));

  document.getElementById("tab-reportes").addEventListener("click", () => {
    document.getElementById("tab-reportes").classList.add("active");
    document.getElementById("tab-usuarios").classList.remove("active");
    document.getElementById("reportes-section").classList.remove("hidden");
    document.getElementById("usuarios-section").classList.add("hidden");
    cargarEstadisticas();
  });

  document.getElementById("tab-usuarios").addEventListener("click", () => {
    document.getElementById("tab-usuarios").classList.add("active");
    document.getElementById("tab-reportes").classList.remove("active");
    document.getElementById("usuarios-section").classList.remove("hidden");
    document.getElementById("reportes-section").classList.add("hidden");
    cargarUsuarios();
  });

  await cargarEstadisticas();
});
