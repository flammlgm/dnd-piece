// spells.controller.js
import pool from '../config/db.js';

export const getSpellsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { rows } = await pool.query('SELECT * FROM spells WHERE class_id = $1 ORDER BY level, name', [classId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении заклинаний' });
  }
};

export const createSpell = async (req, res) => {
  try {
    const { 
      name, 
      school, 
      level, 
      casting_time, 
      distance, 
      duration, 
      verbal, 
      somatic, 
      material, 
      material_description, 
      description, 
      class_id 
    } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO spells (
        name, school, level, casting_time, distance, duration,
        verbal, somatic, material, material_description, description, class_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        name || 'Название заклинания',
        school || 'Школа магии',
        level || '1',
        casting_time || '1 действие',
        distance || 'На себя',
        duration || 'Мгновенно',
        verbal || false,
        somatic || false,
        material || false,
        material_description || 'Не требуется',
        description || 'Описание эффектов заклинания',
        class_id
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при создании заклинания' });
  }
};

export const updateSpell = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      school, 
      level, 
      casting_time, 
      distance, 
      duration, 
      verbal, 
      somatic, 
      material, 
      material_description, 
      description 
    } = req.body;

    const { rows } = await pool.query(
      `UPDATE spells SET
        name = $1,
        school = $2,
        level = $3,
        casting_time = $4,
        distance = $5,
        duration = $6,
        verbal = $7,
        somatic = $8,
        material = $9,
        material_description = $10,
        description = $11
      WHERE id = $12 RETURNING *`,
      [
        name,
        school,
        level,
        casting_time,
        distance,
        duration,
        verbal,
        somatic,
        material,
        material_description,
        description,
        id
      ]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при обновлении заклинания' });
  }
};

export const deleteSpell = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM spells WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при удалении заклинания' });
  }
};