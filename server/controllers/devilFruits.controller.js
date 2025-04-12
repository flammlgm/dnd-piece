import pool from '../config/db.js';

export const getDevilFruits = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM devil_fruits');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении дьявольских фруктов' });
  }
};

export const getDevilFruitById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM devil_fruits WHERE id = $1', [id]);
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении дьявольского фрукта' });
  }
};

export const createDevilFruit = async (req, res) => {
  try {
    const { name, type, description, abilities, appearance, creature, water_vulnerability } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Имя и тип обязательны' });
    }

    const result = await pool.query(
      `INSERT INTO devil_fruits 
       (name, type, description, abilities, appearance, creature, water_vulnerability) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        name,
        type,
        description || null,
        abilities || [],
        appearance || null,
        creature || null,
        water_vulnerability !== false
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка базы данных:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const updateDevilFruit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, description, abilities, appearance, creature, water_vulnerability } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE devil_fruits SET 
       name = $1, 
       type = $2, 
       description = $3, 
       abilities = $4, 
       appearance = $5, 
       creature = $6, 
       water_vulnerability = $7 
       WHERE id = $8 
       RETURNING *`,
      [name, type, description, abilities, appearance, creature, water_vulnerability, id]
    );
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при обновлении дьявольского фрукта' });
  }
};

export const deleteDevilFruit = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM devil_fruits WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при удалении дьявольского фрукта' });
  }
};