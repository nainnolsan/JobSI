-- Script para crear las tablas de educación, certificaciones y habilidades

-- 1. Crear tabla de educación formal
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

-- 2. Crear tabla de certificaciones
CREATE TABLE certifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL, -- "AWS Cloud Practitioner"
    issuing_organization VARCHAR(100), -- "Amazon Web Services"
    issue_date DATE,
    expiration_date DATE,
    credential_id VARCHAR(100), -- ID del certificado
    credential_url VARCHAR(500), -- Link para verificar
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Crear tabla de habilidades
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