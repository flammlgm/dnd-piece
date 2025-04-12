import pool from '../config/db.js';

export const getCharacters = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM characters');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении персонажей' });
  }
};

export const getCharacterById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM characters WHERE id = $1', [id]);
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении персонажа' });
  }
};

export const createCharacter = async (req, res) => {
  try {
    const { 
      user_id, 
      name, 
      class_id, 
      race_id, 
      role_id, 
      devil_fruit_id, 
      will_id, 
      description, 
      stats, 
      proficiencies, 
      saving_throws, 
      skills, 
      equipment, 
      abilities, 
      spells 
    } = req.body;
    
    if (!name || !user_id) {
      return res.status(400).json({ error: 'Имя и ID пользователя обязательны' });
    }

    const result = await pool.query(
      `INSERT INTO characters 
       (user_id, name, class_id, race_id, role_id, devil_fruit_id, will_id, description, 
        stats, proficiencies, saving_throws, skills, equipment, abilities, spells) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
       RETURNING *`,
      [
        user_id,
        name,
        class_id || null,
        race_id || null,
        role_id || null,
        devil_fruit_id || null,
        will_id || null,
        description || null,
        stats || {},
        proficiencies || [],
        saving_throws || [],
        skills || [],
        equipment || [],
        abilities || [],
        spells || []
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка базы данных:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const updateCharacter = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      user_id, 
      name, 
      class_id, 
      race_id, 
      role_id, 
      devil_fruit_id, 
      will_id, 
      description, 
      stats, 
      proficiencies, 
      saving_throws, 
      skills, 
      equipment, 
      abilities, 
      spells 
    } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE characters SET 
       user_id = $1, 
       name = $2, 
       class_id = $3, 
       race_id = $4, 
       role_id = $5, 
       devil_fruit_id = $6, 
       will_id = $7, 
       description = $8, 
       stats = $9, 
       proficiencies = $10, 
       saving_throws = $11, 
       skills = $12, 
       equipment = $13, 
       abilities = $14, 
       spells = $15 
       WHERE id = $16 
       RETURNING *`,
      [
        user_id,
        name,
        class_id,
        race_id,
        role_id,
        devil_fruit_id,
        will_id,
        description,
        stats,
        proficiencies,
        saving_throws,
        skills,
        equipment,
        abilities,
        spells,
        id
      ]
    );
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при обновлении персонажа' });
  }
};

export const deleteCharacter = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM characters WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при удалении персонажа' });
  }
};