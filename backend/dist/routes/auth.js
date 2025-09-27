"use strict";
const { Router } = require('express');
const { pool } = require('../db');
const jwt = require('jsonwebtoken');
const router = Router();
router.post('/signin', async (req, res) => {
    console.log("/signin called");
    try {
        const { email, password } = req.body;
        console.log("Body received", { email, password });
        // Verifica conexión a la base de datos
        console.log("Testing DB connection...");
        await pool.query('SELECT 1');
        console.log("DB connection OK");
        console.log("Querying user...");
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        console.log("Query result:", result.rows);
        const user = result.rows[0];
        if (!user) {
            console.log("User not found", { email });
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (user.password !== password) {
            console.log("Password mismatch", { email });
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET not set");
            return res.status(500).json({ error: 'JWT secret not set' });
        }
        console.log("Signing JWT...");
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
        console.log("Login success for", email);
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
