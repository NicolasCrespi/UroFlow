-- Tabla de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  fecha_nacimiento DATE,
  sexo TEXT CHECK (sexo IN ('M', 'F', 'Otro')),
  telefono TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de sesiones (cada visita/examen del paciente)
CREATE TABLE IF NOT EXISTS sesiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  numero_miccion INTEGER NOT NULL DEFAULT 1,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mediciones (datos crudos de la celda de carga)
CREATE TABLE IF NOT EXISTS mediciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id UUID NOT NULL REFERENCES sesiones(id) ON DELETE CASCADE,
  tiempo_ms INTEGER NOT NULL, -- tiempo en milisegundos desde inicio
  peso DECIMAL(10, 4) NOT NULL, -- peso en gramos de la celda de carga
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_sesiones_paciente_id ON sesiones(paciente_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_fecha ON sesiones(fecha);
CREATE INDEX IF NOT EXISTS idx_mediciones_sesion_id ON mediciones(sesion_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_numero_miccion ON sesiones(numero_miccion);
CREATE INDEX IF NOT EXISTS idx_pacientes_dni ON pacientes(dni);
CREATE INDEX IF NOT EXISTS idx_pacientes_nombre ON pacientes(nombre);

-- Insertar datos de ejemplo para pruebas
INSERT INTO pacientes (id, nombre, dni, fecha_nacimiento, sexo, telefono, email) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Juan Carlos García López', '12345678A', '1975-03-15', 'M', '+34 612 345 678', 'juan.garcia@email.com'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'María Fernanda Rodríguez', '87654321B', '1982-07-22', 'F', '+34 623 456 789', 'maria.rodriguez@email.com'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Pedro Antonio Martínez', '11223344C', '1968-11-08', 'M', '+34 634 567 890', 'pedro.martinez@email.com')
ON CONFLICT (dni) DO NOTHING;

-- Insertar sesiones de ejemplo
INSERT INTO sesiones (id, paciente_id, fecha, numero_miccion, notas) VALUES
  ('d4e5f6a7-b8c9-0123-def0-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026-01-20 09:30:00+00', 1, 'Primera consulta - evaluación inicial'),
  ('e5f6a7b8-c9d0-1234-ef01-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026-01-25 10:00:00+00', 1, 'Seguimiento semanal'),
  ('a7b8c9d0-e1f2-3456-0123-567890123456', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026-01-25 14:00:00+00', 2, 'Segunda micción del día'),
  ('f6a7b8c9-d0e1-2345-f012-456789012345', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', '2026-01-22 14:15:00+00', 1, 'Consulta de control')
ON CONFLICT DO NOTHING;

-- Generar mediciones realistas para la primera sesión de Juan (micción 1)
-- Simulando una curva de uroflujometría típica con volumen acumulado
DO $$
DECLARE
  i INTEGER;
  peso_actual DECIMAL;
  incremento DECIMAL;
BEGIN
  -- Solo insertar si no existen mediciones para esta sesión
  IF NOT EXISTS (SELECT 1 FROM mediciones WHERE sesion_id = 'd4e5f6a7-b8c9-0123-def0-234567890123') THEN
    peso_actual := 0;
    FOR i IN 0..300 LOOP
      -- Simular curva de flujo: inicio lento, pico, descenso
      IF i < 30 THEN
        incremento := (i / 30.0) * 2.5; -- Fase de inicio
      ELSIF i < 100 THEN
        incremento := 2.5 + SIN((i - 30) * 3.14159 / 140) * 1.5; -- Fase de pico
      ELSIF i < 250 THEN
        incremento := 2.0 - ((i - 100) / 150.0) * 1.8; -- Fase de descenso
      ELSE
        incremento := 0.2 - ((i - 250) / 50.0) * 0.2; -- Fase final
      END IF;
      
      IF incremento < 0 THEN incremento := 0; END IF;
      peso_actual := peso_actual + incremento;
      
      INSERT INTO mediciones (sesion_id, tiempo_ms, peso)
      VALUES ('d4e5f6a7-b8c9-0123-def0-234567890123', i * 100, peso_actual);
    END LOOP;
  END IF;
END $$;

-- Generar mediciones para la segunda sesión de Juan (micción 1)
DO $$
DECLARE
  i INTEGER;
  peso_actual DECIMAL;
  incremento DECIMAL;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM mediciones WHERE sesion_id = 'e5f6a7b8-c9d0-1234-ef01-345678901234') THEN
    peso_actual := 0;
    FOR i IN 0..280 LOOP
      IF i < 25 THEN
        incremento := (i / 25.0) * 2.8;
      ELSIF i < 90 THEN
        incremento := 2.8 + SIN((i - 25) * 3.14159 / 130) * 1.8;
      ELSIF i < 230 THEN
        incremento := 2.2 - ((i - 90) / 140.0) * 2.0;
      ELSE
        incremento := 0.2 - ((i - 230) / 50.0) * 0.2;
      END IF;
      
      IF incremento < 0 THEN incremento := 0; END IF;
      peso_actual := peso_actual + incremento;
      
      INSERT INTO mediciones (sesion_id, tiempo_ms, peso)
      VALUES ('e5f6a7b8-c9d0-1234-ef01-345678901234', i * 100, peso_actual);
    END LOOP;
  END IF;
END $$;

-- Generar mediciones para María (micción 1)
DO $$
DECLARE
  i INTEGER;
  peso_actual DECIMAL;
  incremento DECIMAL;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM mediciones WHERE sesion_id = 'f6a7b8c9-d0e1-2345-f012-456789012345') THEN
    peso_actual := 0;
    FOR i IN 0..220 LOOP
      IF i < 20 THEN
        incremento := (i / 20.0) * 3.0;
      ELSIF i < 70 THEN
        incremento := 3.0 + SIN((i - 20) * 3.14159 / 100) * 2.0;
      ELSIF i < 180 THEN
        incremento := 2.5 - ((i - 70) / 110.0) * 2.3;
      ELSE
        incremento := 0.2 - ((i - 180) / 40.0) * 0.2;
      END IF;
      
      IF incremento < 0 THEN incremento := 0; END IF;
      peso_actual := peso_actual + incremento;
      
      INSERT INTO mediciones (sesion_id, tiempo_ms, peso)
      VALUES ('f6a7b8c9-d0e1-2345-f012-456789012345', i * 100, peso_actual);
    END LOOP;
  END IF;
END $$;

-- Generar mediciones para Juan (micción 2 del 25 de enero)
DO $$
DECLARE
  i INTEGER;
  peso_actual DECIMAL;
  incremento DECIMAL;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM mediciones WHERE sesion_id = 'a7b8c9d0-e1f2-3456-0123-567890123456') THEN
    peso_actual := 0;
    FOR i IN 0..250 LOOP
      IF i < 22 THEN
        incremento := (i / 22.0) * 2.6;
      ELSIF i < 80 THEN
        incremento := 2.6 + SIN((i - 22) * 3.14159 / 116) * 1.6;
      ELSIF i < 200 THEN
        incremento := 2.0 - ((i - 80) / 120.0) * 1.8;
      ELSE
        incremento := 0.2 - ((i - 200) / 50.0) * 0.2;
      END IF;
      
      IF incremento < 0 THEN incremento := 0; END IF;
      peso_actual := peso_actual + incremento;
      
      INSERT INTO mediciones (sesion_id, tiempo_ms, peso)
      VALUES ('a7b8c9d0-e1f2-3456-0123-567890123456', i * 100, peso_actual);
    END LOOP;
  END IF;
END $$;
