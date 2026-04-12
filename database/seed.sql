-- Insertar usuarios de prueba (contraseña: 1234 - en producción usar hash)
INSERT OR IGNORE INTO Users (nombre, email, password, role, materia, promedio, gratuito)
VALUES 
('Pedro Estudiante', 'pedro@pascualbravo.edu.co', '1234', 'student', NULL, NULL, NULL),
('Carlos Tutor', 'carlos@pascualbravo.edu.co', '1234', 'tutor_student', 'Matemáticas', 4.5, 1),
('Dr. Juan Pérez', 'juan.perez@pascualbravo.edu.co', '1234', 'tutor_teacher', 'Matemáticas Avanzadas', NULL, 1),
('Admin Sistema', 'admin@pascualbravo.edu.co', '1234', 'admin', NULL, NULL, NULL);

-- Insertar reservas de ejemplo
INSERT OR IGNORE INTO Reservas (estudiante_id, tutor_id, fecha, hora, estado)
VALUES 
(1, 2, '2026-04-15', '10:00', 'pendiente'),
(1, 3, '2026-04-16', '14:00', 'confirmada');

-- Insertar calificaciones de ejemplo
INSERT OR IGNORE INTO Calificaciones (reserva_id, estudiante_id, tutor_id, rating, comentario)
VALUES 
(1, 1, 2, 5, 'Excelente tutoría, muy clara'),
(2, 1, 3, 4, 'Buena explicación, aunque un poco rápida');