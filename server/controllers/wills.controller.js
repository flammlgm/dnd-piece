import pool from '../config/db.js';

export const getWills = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM wills');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении воль' });
  }
};

export const getWillById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM wills WHERE id = $1', [id]);
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении воли' });
  }
};

export const createWill = async (req, res) => {
  try {
    const { name, description, abilities } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Имя обязательно' });
    }

    const result = await pool.query(
      `INSERT INTO wills 
       (name, description, abilities) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, description || null, abilities || []]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка базы данных:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const updateWill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, abilities } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE wills SET 
       name = $1, 
       description = $2, 
       abilities = $3 
       WHERE id = $4 
       RETURNING *`,
      [name, description, abilities, id]
    );
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при обновлении воли' });
  }
};

export const deleteWill = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM wills WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при удалении воли' });
  }
};