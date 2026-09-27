import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/Usuario.js';
import { asyncHandler } from '../middlewares/errores.js';
import { config } from '../config.js';

export const authRoutes = Router();

authRoutes.post('/register', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ email, passwordHash });
    res.status(201).json({ id: usuario.id, email: usuario.email });
}));

authRoutes.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });
    const ok = await bcrypt.compare(password, usuario.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign({ sub: usuario.id, email: usuario.email }, config.jwtSecret, { expiresIn: '2h' });
    res.json({ token });
}));