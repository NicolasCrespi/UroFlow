-- Seed data para las tablas de uroflowmetría

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

-- Insertar mediciones para sesión 1 (paciente 1)
INSERT INTO mediciones (sesion_id, tiempo_ms, peso) VALUES
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '12345678A') LIMIT 1), 0, 0),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '12345678A') LIMIT 1), 500, 7.5),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '12345678A') LIMIT 1), 1000, 21),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '12345678A') LIMIT 1), 1500, 47),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '12345678A') LIMIT 1), 2000, 84),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '12345678A') LIMIT 1), 2500, 135),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '12345678A') LIMIT 1), 3000, 183),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '12345678A') LIMIT 1), 3500, 221),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '12345678A') LIMIT 1), 4000, 246),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '12345678A') LIMIT 1), 4500, 260);

-- Insertar mediciones para sesión 2 (paciente 1 - segunda micción)
INSERT INTO mediciones (sesion_id, tiempo_ms, peso) VALUES
((SELECT id FROM sesiones WHERE numero_miccion = 2 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '12345678A') LIMIT 1), 0, 0),
((SELECT id FROM sesiones WHERE numero_miccion = 2 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '12345678A') LIMIT 1), 300, 5),
((SELECT id FROM sesiones WHERE numero_miccion = 2 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '12345678A') LIMIT 1), 600, 15),
((SELECT id FROM sesiones WHERE numero_miccion = 2 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '12345678A') LIMIT 1), 900, 35),
((SELECT id FROM sesiones WHERE numero_miccion = 2 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '12345678A') LIMIT 1), 1200, 61),
((SELECT id FROM sesiones WHERE numero_miccion = 2 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '12345678A') LIMIT 1), 1500, 87),
((SELECT id FROM sesiones WHERE numero_miccion = 2 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '12345678A') LIMIT 1), 1800, 108),
((SELECT id FROM sesiones WHERE numero_miccion = 2 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '12345678A') LIMIT 1), 2100, 121);

-- Insertar mediciones para sesión 3 (paciente 2)
INSERT INTO mediciones (sesion_id, tiempo_ms, peso) VALUES
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '87654321B') LIMIT 1), 0, 0),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '87654321B') LIMIT 1), 400, 3),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '87654321B') LIMIT 1), 800, 8),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '87654321B') LIMIT 1), 1200, 12),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '87654321B') LIMIT 1), 1600, 15),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '87654321B') LIMIT 1), 2000, 17);

-- Insertar mediciones para sesión 4 (paciente 3 - primera micción)
INSERT INTO mediciones (sesion_id, tiempo_ms, peso) VALUES
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '11223344C') LIMIT 1), 0, 0),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '11223344C') LIMIT 1), 600, 13),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '11223344C') LIMIT 1), 1200, 35),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '11223344C') LIMIT 1), 1800, 72),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '11223344C') LIMIT 1), 2400, 120),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '11223344C') LIMIT 1), 3000, 150),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '11223344C') LIMIT 1), 3600, 168);

-- Insertar mediciones para sesión 5 (paciente 3 - segunda micción)
INSERT INTO mediciones (sesion_id, tiempo_ms, peso) VALUES
((SELECT id FROM sesiones WHERE numero_miccion = 2 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '11223344C') LIMIT 1), 0, 0),
((SELECT id FROM sesiones WHERE numero_miccion = 2 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '11223344C') LIMIT 1), 500, 10),
((SELECT id FROM sesiones WHERE numero_miccion = 2 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '11223344C') LIMIT 1), 1000, 27),
((SELECT id FROM sesiones WHERE numero_miccion = 2 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '11223344C') LIMIT 1), 1500, 52),
((SELECT id FROM sesiones WHERE numero_miccion = 2 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '11223344C') LIMIT 1), 2000, 80),
((SELECT id FROM sesiones WHERE numero_miccion = 2 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '11223344C') LIMIT 1), 2500, 111),
((SELECT id FROM sesiones WHERE numero_miccion = 2 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '11223344C') LIMIT 1), 3000, 136);

-- Insertar mediciones para sesión 6 (paciente 4)
INSERT INTO mediciones (sesion_id, tiempo_ms, peso) VALUES
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '44332211D') LIMIT 1), 0, 0),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '44332211D') LIMIT 1), 700, 3),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '44332211D') LIMIT 1), 1400, 8),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '44332211D') LIMIT 1), 2100, 11),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '44332211D') LIMIT 1), 2800, 13);

-- Insertar mediciones para sesión 7 (paciente 5)
INSERT INTO mediciones (sesion_id, tiempo_ms, peso) VALUES
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '55667788E') LIMIT 1), 0, 0),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '55667788E') LIMIT 1), 400, 13),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '55667788E') LIMIT 1), 800, 36),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '55667788E') LIMIT 1), 1200, 72),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '55667788E') LIMIT 1), 1600, 108),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '55667788E') LIMIT 1), 2000, 140),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '55667788E') LIMIT 1), 2400, 160);

-- Insertar mediciones para sesión 8 (paciente 6)
INSERT INTO mediciones (sesion_id, tiempo_ms, peso) VALUES
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '88776655F') LIMIT 1), 0, 0),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '88776655F') LIMIT 1), 350, 3),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '88776655F') LIMIT 1), 700, 10),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '88776655F') LIMIT 1), 1050, 15),
((SELECT id FROM sesiones WHERE numero_miccion = 1 AND paciente_id = (SELECT id FROM pacientes WHERE dni = '88776655F') LIMIT 1), 1400, 18);
