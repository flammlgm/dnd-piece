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
    const { 
      name, 
      description, 
      features,
      image_path,
      image_position
    } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Имя роли обязательно' });
    }

    const result = await pool.query(
      `INSERT INTO roles 
       (name, description, features, image_path, image_position) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        name,
        description || '',
        features || [],
        image_path || '',
        image_position || ''
      ]
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
    const { 
      name,
      description,
      features = [],
      image_path = '',
      image_position = ''
    } = req.body;

    const cleanFeatures = features.map(f => ({
      id: String(f.id || Math.random().toString(36).substr(2, 9)),
      name: String(f.name || 'Новая особенность'),
      description: String(f.description || ''),
      order: Number.isInteger(f.order) ? f.order : 0
    }));

    const { rows } = await pool.query(
      `UPDATE roles SET 
       name = $1,
       description = $2,
       features = $3::jsonb,
       image_path = $4,
       image_position = $5
       WHERE id = $6
       RETURNING *`,
      [
        String(name),
        String(description || ''),
        JSON.stringify(cleanFeatures),
        String(image_path || ''),
        String(image_position || ''),
        id
      ]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error('Ошибка обновления:', {
      error: err.message,
      stack: err.stack,
      body: req.body
    });
    res.status(500).json({ 
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? err.message : null
    });
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