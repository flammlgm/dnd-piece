import pool from '../config/db.js';

export const getSubclasses = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM subclasses');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении подклассов' });
  }
};

export const getSubclassById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM subclasses WHERE id = $1', [id]);
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении подкласса' });
  }
};

export const createSubclass = async (req, res) => {
  try {
    const { class_id, name, description, features } = req.body;
    
    if (!name || !class_id) {
      return res.status(400).json({ error: 'Имя и ID класса обязательны' });
    }

    const result = await pool.query(
      `INSERT INTO subclasses 
       (class_id, name, description, features) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [class_id, name, description || null, features || []]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка базы данных:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const updateSubclass = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_id, name, description, features } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE subclasses SET 
       class_id = $1, 
       name = $2, 
       description = $3, 
       features = $4 
       WHERE id = $5 
       RETURNING *`,
      [class_id, name, description, features, id]
    );
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при обновлении подкласса' });
  }
};

export const deleteSubclass = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM subclasses WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при удалении подкласса' });
  }
};