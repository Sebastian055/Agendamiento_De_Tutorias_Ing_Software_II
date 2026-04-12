const {
  buscarUsuarioPorEmail,
  insertarUsuario,
} = require("./models/UserModel");

async function test() {
  console.log("🔍 Probando modelo...");
  console.log("buscarUsuarioPorEmail es tipo:", typeof buscarUsuarioPorEmail);
  console.log("insertarUsuario es tipo:", typeof insertarUsuario);

  if (typeof buscarUsuarioPorEmail === "function") {
    const result = await buscarUsuarioPorEmail("test@test.com");
    console.log("Resultado de búsqueda:", result);
  } else {
    console.log("❌ buscarUsuarioPorEmail NO es una función");
  }
}

test();
