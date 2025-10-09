-- Nueva tabla para manejar todos los links del usuario
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