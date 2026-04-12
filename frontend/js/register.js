// Mostrar/ocultar campos según rol
document.getElementById("reg-role").addEventListener("change", (e) => {
  const role = e.target.value;
  const gpaContainer = document.getElementById("gpa-container");
  const subjectContainer = document.getElementById("subject-container");
  const freeContainer = document.getElementById("free-container");

  gpaContainer.style.display = "none";
  subjectContainer.style.display = "none";
  freeContainer.style.display = "none";

  if (role === "tutor_student") {
    gpaContainer.style.display = "block";
    subjectContainer.style.display = "block";
    freeContainer.style.display = "block";
  } else if (role === "tutor_teacher") {
    subjectContainer.style.display = "block";
    freeContainer.style.display = "block";
  }
});

// Registrar usuario
document.getElementById("btn-register").addEventListener("click", async () => {
  const role = document.getElementById("reg-role").value;
  const nombre = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-pass").value.trim();
  const gpa = document.getElementById("reg-gpa")?.value || "";
  const subject = document.getElementById("reg-subject")?.value.trim() || "";
  const free = document.getElementById("reg-free")?.checked || false;

  // Validaciones básicas
  if (!nombre || !email || !password) {
    alert("⚠️ Por favor, completa los campos obligatorios.");
    return;
  }

  // Validar correo institucional
  if (!email.endsWith("@pascualbravo.edu.co")) {
    alert("⚠️ Debes usar tu correo institucional (@pascualbravo.edu.co)");
    return;
  }

  // ✅ VALIDACIÓN PARA TUTOR ESTUDIANTE: promedio mínimo 4.5
  if (role === "tutor_student") {
    const promedio = parseFloat(gpa);
    if (isNaN(promedio) || promedio < 4.5) {
      alert("⚠️ Para ser tutor estudiante necesitas un promedio mínimo de 4.5");
      return;
    }
  }

  // Crear objeto usuario
  const userData = {
    nombre,
    email,
    password,
    role,
    materia: null,
    promedio: null,
    gratuito: false,
  };

  if (role === "tutor_student") {
    userData.materia = subject || null;
    userData.promedio = parseFloat(gpa) || null;
    userData.gratuito = free;
  } else if (role === "tutor_teacher") {
    userData.materia = subject || null;
    userData.gratuito = free;
  }

  try {
    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (res.ok) {
      alert(
        "✅ Usuario registrado correctamente. Ahora puedes iniciar sesión.",
      );
      window.location.href = "login.html";
    } else {
      alert("❌ " + data.message);
    }
  } catch (err) {
    console.error("Error en registro:", err);
    alert("❌ Error de conexión con el servidor");
  }
});
