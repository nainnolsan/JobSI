"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Router } = require('express');
const { pool } = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = Router();
// Registro de usuario
router.post('/signup', async (req, res) => {
    try {
        const { username, nombres, apellidos, fecha_nacimiento, telefono, email, password } = req.body;
        // Validación básica
        if (!username || !nombres || !apellidos || !fecha_nacimiento || !email || !password) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }
        // Verifica unicidad de username y email
        const userExists = await pool.query('SELECT 1 FROM users WHERE username = $1 OR email = $2', [username, email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ error: 'El usuario o email ya existe' });
        }
        // Hash de contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        // Insertar usuario
        const result = await pool.query(`INSERT INTO users (username, nombres, apellidos, fecha_nacimiento, telefono, email, password)
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
        await pool.query('SELECT 1');
        console.log("DB connection OK");
        console.log("Querying user...");
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        console.log("Query result:", result.rows);
        const user = result.rows[0];
        if (!user) {
            console.log("User not found", { username });
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        // Verifica contraseña con bcrypt
        const validPassword = await bcrypt.compare(password, user.password);
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
        const token = jwt.sign({
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
module.exports = router;
