"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticateToken_1 = require("../authenticateToken");
const db_1 = require("../db");
const router = express_1.default.Router();
// GET COMPLETE PROFILE - for cover letter generation
router.get('/complete', authenticateToken_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        // Parallel queries for better performance
        const [userResult, workExpResult, educationResult, skillsResult, certsResult, linksResult] = await Promise.all([
            db_1.pool.query('SELECT nombres, apellidos, email, telefono, direccion FROM users WHERE id = $1', [userId]),
            db_1.pool.query('SELECT empresa, puesto, fecha_inicio, fecha_fin, descripcion, ubicacion, category, time_type FROM work_experiences WHERE user_id = $1 ORDER BY fecha_inicio DESC', [userId]),
            db_1.pool.query('SELECT institution, degree, field_of_study, start_date, end_date, is_current, grade, description FROM education WHERE user_id = $1 ORDER BY start_date DESC', [userId]),
            db_1.pool.query('SELECT name, category, level, years_experience FROM skills WHERE user_id = $1', [userId]),
            db_1.pool.query('SELECT name, issuing_organization, issue_date, expiration_date FROM certifications WHERE user_id = $1 ORDER BY issue_date DESC', [userId]),
            db_1.pool.query('SELECT type, title, url FROM user_links WHERE user_id = $1 AND is_public = true', [userId])
        ]);
        const profile = {
            personal: userResult.rows[0] || {},
            work_experiences: workExpResult.rows,
            education: educationResult.rows,
            skills: skillsResult.rows,
            certifications: certsResult.rows,
            links: linksResult.rows
        };
        res.json(profile);
    }
    catch (err) {
        console.error('Error fetching complete profile:', err);
        res.status(500).json({ error: 'Error fetching complete profile' });
    }
});
// EXPERIENCES
router.get('/experiences', authenticateToken_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await db_1.pool.query('SELECT * FROM experiences WHERE user_id = $1', [userId]);
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({ error: 'Error fetching experiences' });
    }
});
router.post('/experiences', authenticateToken_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { empresa, puesto, fechaInicio, fechaFin, descripcion, ubicacion } = req.body;
        const result = await db_1.pool.query('INSERT INTO experiences (user_id, empresa, puesto, fecha_inicio, fecha_fin, descripcion, ubicacion) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [userId, empresa, puesto, fechaInicio, fechaFin, descripcion, ubicacion]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        let details = 'Unknown error';
        if (err instanceof Error)
            details = err.message;
        res.status(500).json({ error: 'Error creating experience', details });
    }
});
// INTERNSHIPS
router.get('/internships', authenticateToken_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await db_1.pool.query('SELECT * FROM internships WHERE user_id = $1', [userId]);
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({ error: 'Error fetching internships' });
    }
});
router.post('/internships', authenticateToken_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { title, company, start_date, end_date, description } = req.body;
        const result = await db_1.pool.query('INSERT INTO internships (user_id, title, company, start_date, end_date, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [userId, title, company, start_date, end_date, description]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        res.status(500).json({ error: 'Error creating internship' });
    }
});
// PORTFOLIOS
router.get('/portfolios', authenticateToken_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await db_1.pool.query('SELECT * FROM portfolios WHERE user_id = $1', [userId]);
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({ error: 'Error fetching portfolios' });
    }
});
router.post('/portfolios', authenticateToken_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { title, link, description } = req.body;
        const result = await db_1.pool.query('INSERT INTO portfolios (user_id, title, link, description) VALUES ($1, $2, $3, $4) RETURNING *', [userId, title, link, description]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        res.status(500).json({ error: 'Error creating portfolio' });
    }
});
exports.default = router;
