//Inicializacion de la base de datos
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const dbPath = path.join(
  __dirname,
  "..",
  "backend",
  "database",
  "gestion_tutorias.db",
);

// Eliminar archivo anterior si existe
if (fs.existsSync(dbPath)) {
  console.log("🗑️ Eliminando base de datos anterior...");
  fs.unlinkSync(dbPath);
}

console.log("📁 Creando nueva base de datos en:", dbPath);
const db = new sqlite3.Database(dbPath);

// Leer schema.sql
const schemaPath = path.join(__dirname, "schema.sql");
const schemaSQL = fs.readFileSync(schemaPath, "utf8");

console.log("📄 Ejecutando schema.sql...");

// Ejecutar todo el schema.sql de una vez
db.exec(schemaSQL, (err) => {
  if (err) {
    console.error("❌ Error ejecutando schema:", err.message);
    db.close();
    return;
  }
  console.log("✅ Tablas creadas correctamente");

  // Leer seed.sql
  const seedPath = path.join(__dirname, "seed.sql");

  if (fs.existsSync(seedPath)) {
    const seedSQL = fs.readFileSync(seedPath, "utf8");
    console.log("📄 Ejecutando seed.sql...");

    db.exec(seedSQL, (err2) => {
      if (err2) {
        console.error("❌ Error ejecutando seed:", err2.message);
      } else {
        console.log("✅ Datos insertados correctamente");
      }

      // Verificar tablas
      db.all(
        "SELECT name FROM sqlite_master WHERE type='table'",
        [],
        (err3, tables) => {
          if (err3) {
            console.error("Error:", err3);
          } else {
            console.log("\n📋 Tablas creadas:");
            tables.forEach((table) => {
              console.log("  ✅", table.name);
            });
          }

          // Verificar usuarios
          db.all(
            "SELECT id, nombre, email, role FROM Users",
            [],
            (err4, users) => {
              if (err4) {
                console.log("\n⚠️ No hay usuarios aún");
              } else {
                console.log("\n👥 Usuarios en la base de datos:");
                users.forEach((user) => {
                  console.log(
                    `  👤 ${user.nombre} | ${user.email} | ${user.role}`,
                  );
                });
              }

              // Mostrar tamaño del archivo
              const stats = fs.statSync(dbPath);
              console.log(
                `\n📦 Tamaño de la base de datos: ${stats.size} bytes`,
              );

              db.close();
              console.log("\n🎉 Base de datos inicializada con éxito!");
            },
          );
        },
      );
    });
  } else {
    console.log("⚠️ No se encuentra seed.sql");
    db.close();
  }
});
