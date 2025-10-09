-- Nueva tabla unificada de experiencias laborales (reemplaza experiences e internships)
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