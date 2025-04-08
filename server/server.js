import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import pkg from 'pg';

const { Pool } = pkg;
dotenv.config();

// Инициализация приложения
const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Обработка OPTIONS для CORS
app.options('/api/classes', (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.status(204).end();
});

// Роут POST /api/classes
app.post('/api/classes', async (req, res) => {
  console.log('Получен POST запрос:', req.body);
  
  try {
    const { name, description, hit_dice, parent_class_id, is_subclass } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Имя класса обязательно' });
    }

    const result = await pool.query(
      `INSERT INTO classes 
       (name, description, hit_dice, parent_class_id, is_subclass) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        name,
        description || null,
        hit_dice || null,
        parent_class_id || null,
        is_subclass || false
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка базы данных:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Остальные роуты (GET, PUT, DELETE)
app.get('/api/classes', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM classes');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении классов' });
  }
});

app.get('/api/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM classes WHERE id = $1', [id]);
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении класса' });
  }
});

app.put('/api/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, hit_dice, parent_class_id, is_subclass } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE classes SET 
       name = $1, 
       description = $2, 
       hit_dice = $3, 
       parent_class_id = $4, 
       is_subclass = $5 
       WHERE id = $6 
       RETURNING *`,
      [name, description, hit_dice, parent_class_id, is_subclass, id]
    );
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при обновлении класса' });
  }
});

app.delete('/api/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM classes WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при удалении класса' });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log('POST /api/classes доступен');
});