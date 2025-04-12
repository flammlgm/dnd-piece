import pool from '../config/db.js';

export const getRaces = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM races');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении рас' });
  }
};

export const getRaceById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM races WHERE id = $1', [id]);
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении расы' });
  }
};

export const createRace = async (req, res) => {
  try {
    const { name, base_stats, proficiencies, features, underwater_breathing, water_resistance, speed, water_speed } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Имя расы обязательно' });
    }

    const result = await pool.query(
      `INSERT INTO races 
       (name, base_stats, proficiencies, features, underwater_breathing, water_resistance, speed, water_speed) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        name,
        base_stats || { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        proficiencies || [],
        features || [],
        underwater_breathing || false,
        water_resistance || false,
        speed || 30,
        water_speed || 0
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка базы данных:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const updateRace = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, base_stats, proficiencies, features, underwater_breathing, water_resistance, speed, water_speed } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE races SET 
       name = $1, 
       base_stats = $2, 
       proficiencies = $3, 
       features = $4, 
       underwater_breathing = $5, 
       water_resistance = $6, 
       speed = $7, 
       water_speed = $8 
       WHERE id = $9 
       RETURNING *`,
      [name, base_stats, proficiencies, features, underwater_breathing, water_resistance, speed, water_speed, id]
    );
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при обновлении расы' });
  }
};

export const deleteRace = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM races WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при удалении расы' });
  }
};