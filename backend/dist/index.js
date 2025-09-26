"use strict";
const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', authRouter);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
