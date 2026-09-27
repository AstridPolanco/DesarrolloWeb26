import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { config } from './config.js';
import { pool } from './db/pool.js';
import { conectar } from './db/sequelize.js';
import { manejadorErrores } from './middlewares/errores.js';
import { authRoutes } from './routes/auth.routes.js';
import { cursosRoutes } from './routes/cursos.routes.js';
import { SequelizeCursosRepository } from './repositories/SequelizeCursosRepository.js';
import { Curso } from './models/Curso.js';
import './models/Usuario.js';

const app = express();
const PgSession = connectPgSimple(session);

app.use(express.json());

app.use(session({
    store: new PgSession({ pool, tableName: 'session', createTableIfMissing: true }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 },
}));

const cursosRepo = new SequelizeCursosRepository(Curso);

app.use('/auth', authRoutes);
app.use('/cursos', cursosRoutes(cursosRepo));

app.use(manejadorErrores);

conectar().then(() => {
  app.listen(config.port, () => console.log(`Servidor en puerto ${config.port}`));
});