import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function authJWT(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = header.split(' ')[1];
    try {
        req.usuario = jwt.verify(token, config.jwtSecret);
        next();
    } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}