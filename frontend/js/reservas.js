//Logica cuando se hace una reserva
async function reservar(tutorId) {
  const fecha = prompt("Ingrese la fecha (YYYY-MM-DD):"); //Se muestra una ventana para que el usuario escriba lo q se solicite
  const hora = prompt("Ingrese la hora (HH:MM):");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  //Verifica que el usuario exista
  if (!currentUser) {
    alert("Debes iniciar sesión primero.");
    return;
  }

  //Envia la reserva al backend
  try {
    const res = await fetch("/api/reservas/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estudiante_id: currentUser.id,
        tutor_id: tutorId,
        fecha,
        hora,
      }),
    });

    const data = await res.json(); //Espera y procesa la respuesta
    if (res.ok) {
      //Verifica que fue exitoso
      alert(data.message);
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert("Error al conectar con el servidor");
  }
}

//Funcion para verlas reservas
async function listarReservas() {
  try {
    const res = await fetch("/api/reservas/list"); //Hace una peticion GET a la API
    const reservas = await res.json();

    //Borra el contendor para poder optimizar las reservas
    const container = document.getElementById("reservas-container");
    container.innerHTML = "";

    //Muestra cada reserva
    reservas.forEach((r) => {
      const card = document.createElement("div");
      card.className = "reserva-card";
      card.innerHTML = `
        <h4>Reserva #${r.id}</h4>
        <p><strong>Estudiante:</strong> ${r.estudiante}</p>
        <p><strong>Tutor:</strong> ${r.tutor}</p>
        <p><strong>Fecha:</strong> ${r.fecha} - ${r.hora}</p>
        <p><strong>Estado:</strong> ${r.estado}</p>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    alert("Error al listar reservas");
  }
}
