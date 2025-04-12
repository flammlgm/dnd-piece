import pool from '../config/db.js';

export const getRoles = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM roles');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении ролей' });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении роли' });
  }
};

export const createRole = async (req, res) => {
  try {
    const { name, description, features } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Имя роли обязательно' });
    }

    const result = await pool.query(
      `INSERT INTO roles 
       (name, description, features) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, description || null, features || []]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка базы данных:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, features } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE roles SET 
       name = $1, 
       description = $2, 
       features = $3 
       WHERE id = $4 
       RETURNING *`,
      [name, description, features, id]
    );
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при обновлении роли' });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM roles WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при удалении роли' });
  }
};