import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('DATABASE_URL =', process.env.DATABASE_URL);
});

app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при запросе к БД');
  }
});

// Получить все классы
app.get('/api/classes', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM classes');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при получении классов');
  }
});

// Получить один класс по ID
app.get('/api/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM classes WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при получении класса');
  }
});
