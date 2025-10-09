-- Script de migración para unificar experiences e internships en work_experiences

-- 1. Crear la nueva tabla work_experiences
CREATE TABLE work_experiences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(20) NOT NULL CHECK (category IN ('trabajo', 'pasantia')),
    time_type VARCHAR(20) NOT NULL CHECK (time_type IN ('part_time', 'full_time')),
    empresa VARCHAR(100) NOT NULL,
    puesto VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    descripcion TEXT,
    ubicacion VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Migrar datos existentes de experiences (asumir que son trabajo full_time)
INSERT INTO work_experiences (user_id, category, time_type, empresa, puesto, fecha_inicio, fecha_fin, descripcion, ubicacion)
SELECT user_id, 'trabajo', 'full_time', empresa, puesto, fecha_inicio, fecha_fin, descripcion, ubicacion
FROM experiences;

-- 3. Migrar datos existentes de internships (asumir que son pasantia full_time)
INSERT INTO work_experiences (user_id, category, time_type, empresa, puesto, fecha_inicio, fecha_fin, descripcion, ubicacion)
SELECT user_id, 'pasantia', 'full_time', empresa, puesto, fecha_inicio, fecha_fin, descripcion, ubicacion
FROM internships;

-- 4. Eliminar las tablas antiguas (CUIDADO: esto eliminará los datos permanentemente)
DROP TABLE experiences;
DROP TABLE internships;

-- Nota: Descomenta las líneas DROP solo cuando estés seguro de que la migración fue exitosa