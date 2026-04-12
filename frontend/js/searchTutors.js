//Logica para buscar tutores
async function buscarTutores() {
  //Obtiene los filtros de busqueda (toma los valores que el usuario selecciono, si algun campo esta vacio, se envia como string vacio)
  const materia = document.getElementById("search-materia").value;
  const dia = document.getElementById("search-dia").value;
  const hora = document.getElementById("search-hora").value;
  const minPromedio = document.getElementById("search-promedio").value;

  const params = new URLSearchParams({ materia, dia, hora, minPromedio }); //Convierte el objeto en parametros URL

  try {
    const res = await fetch(`/api/tutors/search?${params.toString()}`); //envia la peticion al backend
    const tutors = await res.json(); //Convierte la respuesta .JSON a una lista de tutores

    //Busca el contenedor donde se mostraran los tutores para borrar los resultados anteriores
    const container = document.getElementById("tutors-container");
    container.innerHTML = "";

    //Logica para mostrar cada tutor
    tutors.forEach((t) => {
      const card = document.createElement("div");
      card.className = "tutor-card";
      card.innerHTML = `
        <h3>${t.nombre}</h3>
        <p><strong>Materia:</strong> ${t.materia}</p>
        <p><strong>Promedio:</strong> ${t.promedio || "N/A"}</p>
        <button onclick="reservar(${t.id})">Reservar</button>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    alert("Error al buscar tutores");
  }
}
