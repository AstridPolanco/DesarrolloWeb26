import { Router } from 'express';
import { asyncHandler } from '../middlewares/errores.js';
import { authJWT } from '../middlewares/auth.js';
import { validarCurso, revisarErrores } from '../validators/cursoValidator.js';
import { registrarLog } from '../services/logService.js';

export function cursosRoutes(repo) {
 const router = Router();

 router.get('/', asyncHandler(async (req, res) => {
    res.json(await repo.listar());
}));

 router.post('/', authJWT, validarCurso, revisarErrores,
    asyncHandler(async (req, res) => {
        const curso = await repo.crear(req.body);
        registrarLog('curso_creado', { id: curso.id, codigo: curso.codigo })
            .catch(err => console.error('Error al registro del registrador:', err));
        res.status(201).json(curso);
        }));

 return router;
}