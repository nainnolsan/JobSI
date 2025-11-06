"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth').default;
const profileRouter = require('./routes/profile').default;
const coverLettersRouter = require('./routes/cover-letters').default;
const dotenv = require('dotenv');
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
// Middleware global para loguear todas las peticiones
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl}`);
    next();
});
// Mount cover-letters router before the generic /api router so
// specific /api/cover-letters routes are handled by the dedicated router.
app.use('/api/cover-letters', coverLettersRouter);
app.use('/api', authRouter);
app.use('/api', profileRouter);
// Health check
app.get('/health', (req, res) => {
    res.json({ ok: true, uptime: process.uptime() });
});
// Global error handlers to surface crashes during development
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err.message);
    console.error(err.stack);
    // do not exit in dev — log and continue
});
process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason);
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
