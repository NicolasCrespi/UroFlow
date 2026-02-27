# Configuración de Supabase - Uroflowmetry Dashboard

## Variables de Entorno Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Cómo obtenerlas:**
1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Abre Settings → API
3. Copia `Project URL` → NEXT_PUBLIC_SUPABASE_URL
4. Copia `anon public` → NEXT_PUBLIC_SUPABASE_ANON_KEY

## Tablas Requeridas en Supabase

El dashboard espera estas tablas:

### 1. Tabla `pacientes`
```sql
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  edad INTEGER,
  sexo VARCHAR(1),
  diagnostico TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Tabla `sesiones`
```sql
CREATE TABLE sesiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  fecha TIMESTAMP NOT NULL,
  numero_miccion INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Tabla `mediciones`
```sql
CREATE TABLE mediciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id UUID NOT NULL REFERENCES sesiones(id) ON DELETE CASCADE,
  tiempo_ms INTEGER NOT NULL,
  caudal FLOAT NOT NULL,
  volumen FLOAT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Script de Inicialización

Hay un script SQL en `scripts/001_create_uroflowmetry_tables.sql` que puedes ejecutar directamente en Supabase.

## Verificar Conexión

Una vez configurado:
1. Reinicia el servidor: `npm run dev`
2. Abre `http://localhost:3000`
3. Intenta buscar un paciente en la barra de búsqueda
4. Si conecta correctamente, debería cargar los pacientes de tu BD

## Troubleshooting

- **Error: "Cannot find variable"**: Las variables de entorno no están cargadas. Reinicia el servidor.
- **Error: "table does not exist"**: Las tablas no fueron creadas en Supabase.
- **No data appears**: Verifica que tengas datos en tus tablas de Supabase.
