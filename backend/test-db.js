const { query, run } = require("./database/db");

async function test() {
  console.log("🔍 Probando conexión a la base de datos...");

  try {
    const result = await query("SELECT * FROM Users");
    console.log("✅ Conexión exitosa!");
    console.log("📊 Usuarios encontrados:", result.recordset.length);
    console.log("👥 Lista de usuarios:", result.recordset);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

test();
