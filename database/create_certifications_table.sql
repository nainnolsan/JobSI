-- Tabla de certificaciones
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