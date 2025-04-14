import express from 'express';
import cors from 'cors';
import classesRouter from './routes/classes.routes.js';
import racesRouter from './routes/races.routes.js';
import subclassesRouter from './routes/subclasses.routes.js';
import spellsRouter from './routes/spells.routes.js';

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/classes', classesRouter);
app.use('/api/races', racesRouter);
app.use('/api/subclasses', subclassesRouter);
app.use('/api/spells', spellsRouter);
// Добавьте остальные маршруты

// Обработка OPTIONS для CORS
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.status(204).end();
});

export default app;