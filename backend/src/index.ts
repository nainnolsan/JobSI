
import type { Request, Response, NextFunction } from 'express';
const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth');
const dotenv = require('dotenv');
dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

// Middleware global para loguear todas las peticiones
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

app.use('/api', authRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
