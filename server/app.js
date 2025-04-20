import express from 'express';
import cors from 'cors';
import classesRouter from './routes/classes.routes.js';
import racesRouter from './routes/races.routes.js';
import rolesRouter from './routes/roles.routes.js';
import subclassesRouter from './routes/subclasses.routes.js';
import spellsRouter from './routes/spells.routes.js';
import authRouter from './routes/auth.routes.js';
import devilFruitsRouter from './routes/devilFruits.routes.js';
import visibilityRouter from './routes/visibility.routes.js';
import usersRouter from './routes/users.routes.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/classes', classesRouter);
app.use('/api/races', racesRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/subclasses', subclassesRouter);
app.use('/api/spells', spellsRouter);
app.use('/api/auth', authRouter);
app.use('/api/devil-fruits', devilFruitsRouter);
app.use('/api/visibility', visibilityRouter);
app.use('/api/users', usersRouter);

app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.status(204).end();
});

export default app;