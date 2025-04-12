import express from 'express';
import cors from 'cors';
import classesRouter from './routes/classes.routes.js';
import subclassesRouter from './routes/subclasses.routes.js';
// Импортируйте остальные роутеры

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
app.use('/api/subclasses', subclassesRouter);
// Добавьте остальные маршруты

// Обработка OPTIONS для CORS
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.status(204).end();
});

export default app;