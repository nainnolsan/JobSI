-- Script completo para crear toda la base de datos
-- Este archivo crea todas las tablas en el orden correcto

-- 1. Crear tabla de usuarios (debe ir primero por las foreign keys)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    direccion TEXT,
);

-- 2. Crear tabla de links del usuario
CREATE TABLE user_links (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL, -- 'linkedin', 'github', 'portfolio', 'website', etc.
    title VARCHAR(100), -- Nombre personalizable: "Mi Portfolio", "GitHub Personal"
    url VARCHAR(500) NOT NULL,
    is_public BOOLEAN DEFAULT true, -- Si quiere mostrar este link públicamente
    display_order INTEGER DEFAULT 0, -- Para ordenar los links
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Crear tabla unificada de experiencias laborales
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

-- 4. Crear tabla de educación formal
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

-- 5. Crear tabla de certificaciones
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

-- 6. Crear tabla de habilidades
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

-- 7. Crear tabla para cover letters
CREATE TABLE cover_letters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255), -- Titulo descriptivo para la carta
    company VARCHAR(255),
    status VARCHAR(20) DEFAULT 'draft', -- draft, generated, sent
    raw_job_text TEXT, -- Texto pegado del job post (guardado por defecto)
    parsed JSONB, -- Resultado del parser: { title, company, location, responsibilities, requirements, keywords }
    config JSONB, -- Configuración usada para generar (template, tone, length, language)
    generated_draft TEXT, -- Último borrador generado
    variants JSONB, -- Array con variantes generadas
    scheduled_send_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

