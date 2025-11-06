"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = authenticateJWT;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    // Debug logs to help trace why handlers may not run
    console.log(`\n--- authenticateJWT called for ${req.method} ${req.originalUrl} ---`);
    console.log('Authorization header:', authHeader ?? '<none>');
    if (!token) {
        console.log('authenticateJWT: No token provided — rejecting request');
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // attach user and continue
        // @ts-ignore - augmenting req with user field
        req.user = decoded;
        console.log('authenticateJWT: token verified');
        next();
    }
    catch (err) {
        console.log('authenticateJWT: token invalid —', err?.message ?? err);
        return res.status(401).json({ error: 'Token inválido' });
    }
}
