//Logica para ver las calificaciones que los estudiantes le han dado a lo tutores
async function listarCalificaciones() {
  try {
    const res = await fetch("/api/tutors/calificaciones"); //Le pide las calificaciones al backend
    const calificaciones = await res.json(); //Convierte la respuesta en .JSON

    const container = document.getElementById("calificaciones-container"); //Busca el contenedor HTML
    container.innerHTML = ""; //Borra todo lo que habia antes en el contenedor, lo que hace que se eviten duplicaciones en las calificaciones

    calificaciones.forEach((c) => {
      //Recorre cada calificacion
      //Crea una tarjeta para cada calificacion
      const card = document.createElement("div");
      card.className = "calificacion-card";
      //Llena la tarjeta con los datos
      card.innerHTML = `
        <h4>Estudiante: ${c.estudiante}</h4>
        <p><strong>Rating:</strong> ${c.rating}/5</p>
        <p><strong>Comentario:</strong> ${c.comentario}</p>
      `;
      container.appendChild(card); //Agrega la tarjeta al contenedor
    });
  } catch (err) {
    alert("Error al listar calificaciones");
  }
}
