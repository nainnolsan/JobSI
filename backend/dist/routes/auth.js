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
        const result = await db_1.pool.query('SELECT username, nombres, apellidos, fecha_nacimiento, telefono, direccion, linkedin, email FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(result.rows[0]);
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
        await db_1.pool.query(`UPDATE users SET telefono = $1, direccion = $2, linkedin = $3 WHERE id = $4`, [telefono || null, direccion || null, linkedin || null, userId]);
        res.json({ message: 'Datos actualizados correctamente' });
    }
    catch (err) {
        let message = 'Unknown error';
        if (err instanceof Error)
            message = err.message;
        res.status(500).json({ error: 'Error al actualizar datos', details: message });
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
