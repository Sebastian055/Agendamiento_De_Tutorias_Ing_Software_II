-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    materia TEXT,
    promedio REAL,
    gratuito INTEGER
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS Reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estudiante_id INTEGER NOT NULL,
    tutor_id INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    estado TEXT DEFAULT 'pendiente',
    FOREIGN KEY (estudiante_id) REFERENCES Users(id),
    FOREIGN KEY (tutor_id) REFERENCES Users(id)
);

-- Tabla de calificaciones
CREATE TABLE IF NOT EXISTS Calificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reserva_id INTEGER NOT NULL,
    estudiante_id INTEGER NOT NULL,
    tutor_id INTEGER NOT NULL,
    rating INTEGER CHECK(rating BETWEEN 1 AND 5),
    comentario TEXT,
    FOREIGN KEY (reserva_id) REFERENCES Reservas(id),
    FOREIGN KEY (estudiante_id) REFERENCES Users(id),
    FOREIGN KEY (tutor_id) REFERENCES Users(id)
);

-- Tabla de horarios
CREATE TABLE IF NOT EXISTS Horarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tutor_id INTEGER NOT NULL,
    dia_semana TEXT NOT NULL,
    hora_inicio TEXT NOT NULL,
    hora_fin TEXT NOT NULL,
    FOREIGN KEY (tutor_id) REFERENCES Users(id)
);