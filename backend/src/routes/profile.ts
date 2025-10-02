import express from 'express';
import { authenticateJWT as authenticateToken } from '../authenticateToken';
import { pool } from '../db';

const router = express.Router();

// EXPERIENCES
router.get('/experiences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query('SELECT * FROM experiences WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching experiences' });
  }
});

router.post('/experiences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { empresa, puesto, fechaInicio, fechaFin, descripcion, ubicacion } = req.body;
    const result = await pool.query(
      'INSERT INTO experiences (user_id, empresa, puesto, fecha_inicio, fecha_fin, descripcion, ubicacion) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, empresa, puesto, fechaInicio, fechaFin, descripcion, ubicacion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    let details = 'Unknown error';
    if (err instanceof Error) details = err.message;
    res.status(500).json({ error: 'Error creating experience', details });
  }
});

// INTERNSHIPS
router.get('/internships', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query('SELECT * FROM internships WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching internships' });
  }
});

router.post('/internships', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, company, start_date, end_date, description } = req.body;
    const result = await pool.query(
      'INSERT INTO internships (user_id, title, company, start_date, end_date, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, title, company, start_date, end_date, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error creating internship' });
  }
});

// PORTFOLIOS
router.get('/portfolios', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query('SELECT * FROM portfolios WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching portfolios' });
  }
});

router.post('/portfolios', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, link, description } = req.body;
    const result = await pool.query(
      'INSERT INTO portfolios (user_id, title, link, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title, link, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error creating portfolio' });
  }
});

export default router;
