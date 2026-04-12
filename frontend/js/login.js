// Logica para que los datos se autentifiquen con el backend

document.getElementById("btn-login").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-pass").value.trim();

  if (!email || !password) {
    alert("Por favor, ingresa tu correo y contraseña.");
    return;
  }

  try {
    // Enviar petición al backend
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // Guardar sesión en localStorage
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      localStorage.setItem("userName", data.user.nombre);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userId", data.user.id);

      alert(`Bienvenido, ${data.user.nombre}`);

      // Redirigir según rol
      if (data.user.role === "admin") {
        window.location.href = "admin.html";
      } else if (data.user.role && data.user.role.includes("tutor")) {
        window.location.href = "tutor.html";
      } else {
        window.location.href = "app.html";
      }
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error("Error en login:", err);
    alert("Error de conexión con el servidor. ¿El backend está corriendo?");
  }
});
