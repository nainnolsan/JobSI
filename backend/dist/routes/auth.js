"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = (0, express_1.Router)();
function authenticateJWT(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'No token provided' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        return res.status(401).json({ error: 'Token inválido' });
    }
}
// Obtener datos personales del usuario autenticado
router.get('/user', authenticateJWT, async (req, res) => {
    const userId = req.user?.userId;
    try {
        // Obtener datos básicos del usuario
        const userResult = await db_1.pool.query('SELECT username, nombres, apellidos, fecha_nacimiento, telefono, direccion, email FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0)
            return res.status(404).json({ error: 'Usuario no encontrado' });
        // Obtener todas las redes sociales de user_links
        const socialLinksResult = await db_1.pool.query('SELECT type, title, url FROM user_links WHERE user_id = $1', [userId]);
        // Combinar los datos
        const userData = userResult.rows[0];
        // Procesar redes sociales
        const socialLinks = {};
        socialLinksResult.rows.forEach(row => {
            const platformName = row.type === 'linkedin' ? 'LinkedIn' :
                row.type.charAt(0).toUpperCase() + row.type.slice(1);
            socialLinks[platformName] = row.url;
        });
        // Agregar LinkedIn para compatibilidad con el código existente
        userData.linkedin = socialLinks.LinkedIn || null;
        userData.socialLinks = socialLinks;
        res.json(userData);
    }
    catch (err) {
        res.status(500).json({ error: 'Error al obtener datos', details: err.message });
    }
});
// Actualizar datos personales opcionales
router.put('/profile', authenticateJWT, async (req, res) => {
    const { telefono, direccion, linkedin } = req.body;
    const userId = req.user?.userId;
    try {
        // Actualizar datos básicos en users
        await db_1.pool.query(`UPDATE users SET telefono = $1, direccion = $2 WHERE id = $3`, [telefono || null, direccion || null, userId]);
        // Manejar LinkedIn en user_links
        if (linkedin) {
            // Verificar si ya existe un registro de LinkedIn
            const existingLinkedin = await db_1.pool.query('SELECT id FROM user_links WHERE user_id = $1 AND type = $2', [userId, 'linkedin']);
            if (existingLinkedin.rows.length > 0) {
                // Actualizar LinkedIn existente
                await db_1.pool.query('UPDATE user_links SET url = $1 WHERE user_id = $2 AND type = $3', [linkedin, userId, 'linkedin']);
            }
            else {
                // Crear nuevo registro de LinkedIn
                await db_1.pool.query('INSERT INTO user_links (user_id, type, title, url) VALUES ($1, $2, $3, $4)', [userId, 'linkedin', 'LinkedIn', linkedin]);
            }
        }
        else {
            // Si linkedin está vacío, eliminar el registro existente
            await db_1.pool.query('DELETE FROM user_links WHERE user_id = $1 AND type = $2', [userId, 'linkedin']);
        }
        res.json({ message: 'Datos actualizados correctamente' });
    }
    catch (err) {
        let message = 'Unknown error';
        if (err instanceof Error)
            message = err.message;
        res.status(500).json({ error: 'Error al actualizar datos', details: message });
    }
});
// Manejar redes sociales del usuario
router.put('/social-links', authenticateJWT, async (req, res) => {
    const { socialLinks } = req.body; // { platform: url, platform2: url2, ... }
    const userId = req.user?.userId;
    try {
        // Obtener todas las redes sociales existentes (excepto LinkedIn)
        const existingLinks = await db_1.pool.query('SELECT id, type, url FROM user_links WHERE user_id = $1 AND type != $2', [userId, 'linkedin']);
        // Crear un mapa de los links existentes
        const existingMap = new Map();
        existingLinks.rows.forEach(row => {
            const platformName = row.type.charAt(0).toUpperCase() + row.type.slice(1);
            existingMap.set(platformName, { id: row.id, url: row.url });
        });
        // Procesar cada red social del frontend
        for (const [platform, url] of Object.entries(socialLinks)) {
            if (platform !== 'LinkedIn' && url && typeof url === 'string' && url.trim() !== '') {
                const cleanUrl = url.trim();
                const existing = existingMap.get(platform);
                if (existing) {
                    // Si existe pero la URL cambió, actualizar
                    if (existing.url !== cleanUrl) {
                        await db_1.pool.query('UPDATE user_links SET url = $1 WHERE id = $2', [cleanUrl, existing.id]);
                    }
                    // Marcar como procesado
                    existingMap.delete(platform);
                }
                else {
                    // No existe, crear nuevo
                    await db_1.pool.query('INSERT INTO user_links (user_id, type, title, url) VALUES ($1, $2, $3, $4)', [userId, platform.toLowerCase(), platform, cleanUrl]);
                }
            }
        }
        // Eliminar las redes sociales que ya no están en el frontend
        for (const [platform, data] of existingMap.entries()) {
            await db_1.pool.query('DELETE FROM user_links WHERE id = $1', [data.id]);
        }
        res.json({ message: 'Redes sociales actualizadas correctamente' });
    }
    catch (err) {
        let message = 'Unknown error';
        if (err instanceof Error)
            message = err.message;
        res.status(500).json({ error: 'Error al actualizar redes sociales', details: message });
    }
});
// Obtener redes sociales del usuario
router.get('/social-links', authenticateJWT, async (req, res) => {
    const userId = req.user?.userId;
    try {
        const result = await db_1.pool.query('SELECT type, title, url FROM user_links WHERE user_id = $1', [userId]);
        // Convertir a objeto { platform: url }
        const socialLinks = {};
        result.rows.forEach(row => {
            // Capitalizar el nombre de la plataforma para consistencia con el frontend
            const platformName = row.type === 'linkedin' ? 'LinkedIn' :
                row.type.charAt(0).toUpperCase() + row.type.slice(1);
            socialLinks[platformName] = row.url;
        });
        res.json(socialLinks);
    }
    catch (err) {
        let message = 'Unknown error';
        if (err instanceof Error)
            message = err.message;
        res.status(500).json({ error: 'Error al obtener redes sociales', details: message });
    }
});
// Endpoint unificado para guardar toda la información de contacto
router.put('/contact-info', authenticateJWT, async (req, res) => {
    const { telefono, direccion, socialLinks } = req.body;
    const userId = req.user?.userId;
    try {
        // 1. Actualizar datos básicos en users
        await db_1.pool.query(`UPDATE users SET telefono = $1, direccion = $2 WHERE id = $3`, [telefono || null, direccion || null, userId]);
        // 2. Manejar LinkedIn específicamente (para compatibilidad)
        const linkedin = socialLinks?.LinkedIn;
        if (linkedin) {
            const existingLinkedin = await db_1.pool.query('SELECT id FROM user_links WHERE user_id = $1 AND type = $2', [userId, 'linkedin']);
            if (existingLinkedin.rows.length > 0) {
                await db_1.pool.query('UPDATE user_links SET url = $1 WHERE user_id = $2 AND type = $3', [linkedin, userId, 'linkedin']);
            }
            else {
                await db_1.pool.query('INSERT INTO user_links (user_id, type, title, url) VALUES ($1, $2, $3, $4)', [userId, 'linkedin', 'LinkedIn', linkedin]);
            }
        }
        else {
            await db_1.pool.query('DELETE FROM user_links WHERE user_id = $1 AND type = $2', [userId, 'linkedin']);
        }
        // 3. Manejar otras redes sociales
        if (socialLinks) {
            const existingLinks = await db_1.pool.query('SELECT id, type, url FROM user_links WHERE user_id = $1 AND type != $2', [userId, 'linkedin']);
            const existingMap = new Map();
            existingLinks.rows.forEach(row => {
                const platformName = row.type.charAt(0).toUpperCase() + row.type.slice(1);
                existingMap.set(platformName, { id: row.id, url: row.url });
            });
            for (const [platform, url] of Object.entries(socialLinks)) {
                if (platform !== 'LinkedIn' && url && typeof url === 'string' && url.trim() !== '') {
                    const cleanUrl = url.trim();
                    const existing = existingMap.get(platform);
                    if (existing) {
                        if (existing.url !== cleanUrl) {
                            await db_1.pool.query('UPDATE user_links SET url = $1 WHERE id = $2', [cleanUrl, existing.id]);
                        }
                        existingMap.delete(platform);
                    }
                    else {
                        await db_1.pool.query('INSERT INTO user_links (user_id, type, title, url) VALUES ($1, $2, $3, $4)', [userId, platform.toLowerCase(), platform, cleanUrl]);
                    }
                }
            }
            // Eliminar redes sociales que ya no están
            for (const [platform, data] of existingMap.entries()) {
                await db_1.pool.query('DELETE FROM user_links WHERE id = $1', [data.id]);
            }
        }
        res.json({ message: 'Información de contacto actualizada correctamente' });
    }
    catch (err) {
        let message = 'Unknown error';
        if (err instanceof Error)
            message = err.message;
        res.status(500).json({ error: 'Error al actualizar información de contacto', details: message });
    }
});
// Registro de usuario
router.post('/signup', async (req, res) => {
    try {
        const { username, nombres, apellidos, fecha_nacimiento, telefono, email, password } = req.body;
        // Validación básica
        if (!username || !nombres || !apellidos || !fecha_nacimiento || !email || !password) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }
        // Verifica unicidad de username y email
        const userExists = await db_1.pool.query('SELECT 1 FROM users WHERE username = $1 OR email = $2', [username, email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ error: 'El usuario o email ya existe' });
        }
        // Hash de contraseña
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Insertar usuario
        const result = await db_1.pool.query(`INSERT INTO users (username, nombres, apellidos, fecha_nacimiento, telefono, email, password)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, fecha_registro`, [username, nombres, apellidos, fecha_nacimiento, telefono, email, hashedPassword]);
        return res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: result.rows[0]
        });
    }
    catch (err) {
        console.error('Error en /signup:', err);
        let message = 'Unknown error';
        if (err instanceof Error)
            message = err.message;
        return res.status(500).json({ error: 'Error en el servidor', details: message });
    }
});
router.post('/signin', async (req, res) => {
    console.log("/signin called");
    try {
        const { username, password } = req.body;
        console.log("Body received", { username });
        // Verifica conexión a la base de datos
        console.log("Testing DB connection...");
        await db_1.pool.query('SELECT 1');
        console.log("DB connection OK");
        console.log("Querying user...");
        const result = await db_1.pool.query('SELECT * FROM users WHERE username = $1', [username]);
        console.log("Query result:", result.rows);
        const user = result.rows[0];
        if (!user) {
            console.log("User not found", { username });
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        // Verifica contraseña con bcrypt
        const validPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!validPassword) {
            console.log("Password mismatch", { username });
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET not set");
            return res.status(500).json({ error: 'JWT secret not set' });
        }
        console.log("User nombres:", user.nombres);
        console.log("Signing JWT...");
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            username: user.username,
            nombres: user.nombres,
            apellidos: user.apellidos,
            email: user.email
        }, process.env.JWT_SECRET);
        console.log("Login success for", username);
        res.json({ token });
    }
    catch (err) {
        console.error("Server error in /signin:", err);
        let message = 'Unknown error';
        if (err instanceof Error)
            message = err.message;
        res.status(500).json({ error: 'Server error', details: message });
    }
});
exports.default = router;
