-- Seed data para las tablas de uroflowmetría (estructura correcta)

-- Insertar pacientes de prueba
INSERT INTO pacientes (documento, nombre) VALUES
('12345678A', 'Juan Pérez García'),
('87654321B', 'María López Rodríguez'),
('11223344C', 'Carlos Martínez López'),
('44332211D', 'Ana García Moreno'),
('55667788E', 'Francisco Ruiz Díaz'),
('88776655F', 'Rosa Fernández Pérez');

-- Insertar sesiones de prueba
INSERT INTO sesiones (paciente_id, numero_sesion_dispositivo, fecha_hora) VALUES
(1, 1, '2026-01-25 09:30:00+00'),
(1, 2, '2026-01-26 10:15:00+00'),
(2, 1, '2026-01-25 14:45:00+00'),
(3, 1, '2026-01-24 11:00:00+00'),
(3, 2, '2026-01-26 14:30:00+00'),
(4, 1, '2026-01-25 16:20:00+00'),
(5, 1, '2026-01-26 08:45:00+00'),
(6, 1, '2026-01-25 13:10:00+00');

-- Insertar mediciones para sesión 1 (paciente 1 - sesion 1)
INSERT INTO mediciones (sesion_id, numero_secuencia, peso) VALUES
(1, 0, 0.000),
(1, 1, 7.500),
(1, 2, 21.000),
(1, 3, 47.000),
(1, 4, 84.000),
(1, 5, 135.000),
(1, 6, 183.000),
(1, 7, 221.000),
(1, 8, 246.000),
(1, 9, 260.000);

-- Insertar mediciones para sesión 2 (paciente 1 - sesion 2)
INSERT INTO mediciones (sesion_id, numero_secuencia, peso) VALUES
(2, 0, 0.000),
(2, 1, 5.000),
(2, 2, 15.000),
(2, 3, 35.000),
(2, 4, 61.000),
(2, 5, 87.000),
(2, 6, 108.000),
(2, 7, 121.000);

-- Insertar mediciones para sesión 3 (paciente 2)
INSERT INTO mediciones (sesion_id, numero_secuencia, peso) VALUES
(3, 0, 0.000),
(3, 1, 3.000),
(3, 2, 8.000),
(3, 3, 12.000),
(3, 4, 15.000),
(3, 5, 17.000);

-- Insertar mediciones para sesión 4 (paciente 3 - sesion 1)
INSERT INTO mediciones (sesion_id, numero_secuencia, peso) VALUES
(4, 0, 0.000),
(4, 1, 13.000),
(4, 2, 35.000),
(4, 3, 72.000),
(4, 4, 120.000),
(4, 5, 150.000),
(4, 6, 168.000);

-- Insertar mediciones para sesión 5 (paciente 3 - sesion 2)
INSERT INTO mediciones (sesion_id, numero_secuencia, peso) VALUES
(5, 0, 0.000),
(5, 1, 10.000),
(5, 2, 27.000),
(5, 3, 52.000),
(5, 4, 80.000),
(5, 5, 111.000),
(5, 6, 136.000);

-- Insertar mediciones para sesión 6 (paciente 4)
INSERT INTO mediciones (sesion_id, numero_secuencia, peso) VALUES
(6, 0, 0.000),
(6, 1, 3.000),
(6, 2, 8.000),
(6, 3, 11.000),
(6, 4, 13.000);

-- Insertar mediciones para sesión 7 (paciente 5)
INSERT INTO mediciones (sesion_id, numero_secuencia, peso) VALUES
(7, 0, 0.000),
(7, 1, 13.000),
(7, 2, 36.000),
(7, 3, 72.000),
(7, 4, 108.000),
(7, 5, 140.000),
(7, 6, 160.000);

-- Insertar mediciones para sesión 8 (paciente 6)
INSERT INTO mediciones (sesion_id, numero_secuencia, peso) VALUES
(8, 0, 0.000),
(8, 1, 3.000),
(8, 2, 10.000),
(8, 3, 15.000),
(8, 4, 18.000);
