-- Tabla de pasantías
CREATE TABLE internships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    empresa VARCHAR(100) NOT NULL,
    puesto VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    descripcion TEXT,
    ubicacion VARCHAR(100)
);