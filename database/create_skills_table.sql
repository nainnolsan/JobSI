-- Tabla de habilidades
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- "JavaScript", "Liderazgo"
    category VARCHAR(50), -- "technical", "soft", "language"
    level VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')), -- Nivel de habilidad
    years_experience INTEGER, -- Años de experiencia con esta habilidad
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);