import express from 'express';
import cors from 'cors';
import classesRouter from './routes/classes.routes.js';
import subclassesRouter from './routes/subclasses.routes.js';
import racesRouter from './routes/races.routes.js';
import rolesRouter from './routes/roles.routes.js';
import devilFruitsRouter from './routes/devilFruits.routes.js';
import willsRouter from './routes/wills.routes.js';
import charactersRouter from './routes/characters.routes.js';
import usersRouter from './routes/users.routes.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/classes', classesRouter);
app.use('/api/subclasses', subclassesRouter);
app.use('/api/races', racesRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/devil-fruits', devilFruitsRouter);
app.use('/api/wills', willsRouter);
app.use('/api/characters', charactersRouter);
app.use('/api/users', usersRouter);

app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.status(204).end();
});

app.use((req, res) => {
  res.status(404).json({ error: 'Не найдено' });
});

export default app;