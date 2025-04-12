import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'fs';
import multer from 'multer';
import classesRouter from './routes/classes.routes.js';
import subclassesRouter from './routes/subclasses.routes.js';
import racesRouter from './routes/races.routes.js';
import rolesRouter from './routes/roles.routes.js';
import devilFruitsRouter from './routes/devilFruits.routes.js';
import willsRouter from './routes/wills.routes.js';
import charactersRouter from './routes/characters.routes.js';
import usersRouter from './routes/users.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const entityType = req.baseUrl.split('/').pop().replace('api/', '');
    const uploadPath = path.join(__dirname, 'public', 'images', entityType);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `img-${uniqueSuffix}${ext}`);
  }
});

export const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});

app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
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
  res.status(404).json({ error: 'Not Found' });
});

export default app;