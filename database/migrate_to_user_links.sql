-- Script de migración para unificar links en user_links

-- 1. Crear la nueva tabla user_links
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

-- 2. Migrar datos de linkedin desde la tabla users
INSERT INTO user_links (user_id, type, title, url, display_order)
SELECT id, 'linkedin', 'LinkedIn', linkedin, 1
FROM users 
WHERE linkedin IS NOT NULL AND linkedin != '';

-- 3. Migrar datos de portfolios (si existen)
INSERT INTO user_links (user_id, type, title, url, display_order)
SELECT user_id, 'portfolio', 'Mi Portafolio', url, 2
FROM portfolios;

-- 4. Eliminar el campo linkedin de la tabla users
ALTER TABLE users DROP COLUMN linkedin;

-- 5. Eliminar la tabla portfolios
DROP TABLE portfolios;