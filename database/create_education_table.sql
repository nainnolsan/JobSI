-- Tabla de educación formal (universidades, institutos, bachillerato)
CREATE TABLE education (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    institution VARCHAR(150) NOT NULL, -- "Universidad Nacional"
    degree VARCHAR(100) NOT NULL, -- "Ingeniería en Sistemas"
    field_of_study VARCHAR(100), -- "Ciencias de la Computación"
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    grade VARCHAR(20), -- "8.5", "Cum Laude", etc.
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);