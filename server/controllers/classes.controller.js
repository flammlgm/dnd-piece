import pool from '../config/db.js';

export const getClasses = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM classes');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении классов' });
  }
};

export const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM classes WHERE id = $1', [id]);
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении класса' });
  }
};

export const createClass = async (req, res) => {
  try {
    const { name, hit_dice, description, base_stats, proficiencies, features } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Имя класса обязательно' });
    }

    const result = await pool.query(
      `INSERT INTO classes 
       (name, hit_dice, description, base_stats, proficiencies, features, image_path, image_position) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        name,
        hit_dice || 'd8',
        description || null,
        base_stats || { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        proficiencies || [],
        features || [],
        image_path || null,
        image_position || null,
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка базы данных:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, hit_dice, description, base_stats, proficiencies, features, image_path, image_position } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE classes SET 
       name = $1, 
       hit_dice = $2, 
       description = $3, 
       base_stats = $4, 
       proficiencies = $5, 
       features = $6 
       WHERE id = $7 
       RETURNING *`,
      [name, hit_dice, description, base_stats, proficiencies, features, id]
    );
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при обновлении класса' });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM classes WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при удалении класса' });
  }
};

export const getClassSubclasses = async (req, res) => {
  const { classId } = req.params;
  console.log(`Fetching subclasses for class ID: ${classId}`); // Логируем
  
  try {
    const queryText = 'SELECT * FROM subclasses WHERE class_id = $1 ORDER BY id';
    const queryValues = [classId];
    console.log('Executing query:', queryText, 'with values:', queryValues);
    const { rows } = await pool.query(queryText, queryValues);
    console.log('Query result:', rows); 
    if (rows.length === 0) {
      console.warn(`No subclasses found for class ID: ${classId}`);
    }
    
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
};