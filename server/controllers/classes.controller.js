import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';

const deleteImageFile = (imagePath) => {
  if (imagePath) {
    try {
      const fullPath = path.join(process.cwd(), 'public', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.error('Error deleting image file:', err);
    }
  }
};

export const getClasses = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM classes');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching classes' });
  }
};

export const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM classes WHERE id = $1', [id]);
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching class' });
  }
};

export const createClass = async (req, res) => {
  try {
    const { 
      name, 
      hit_dice, 
      description, 
      base_stats, 
      proficiencies, 
      features,
      image_position = 'center'
    } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Class name is required' });
    }

    const imagePath = req.file ? `/images/classes/${req.file.filename}` : null;

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
        imagePath, 
        image_position 
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      hit_dice, 
      description, 
      base_stats, 
      proficiencies, 
      features,
      image_position
    } = req.body;

    let imagePath;
    if (req.file) {
      const { rows: [currentClass] } = await pool.query(
        'SELECT image_path FROM classes WHERE id = $1', 
        [id]
      );
      
      deleteImageFile(currentClass?.image_path);
      
      imagePath = `/images/classes/${req.file.filename}`;
    }

    const { rows } = await pool.query(
      `UPDATE classes SET 
       name = $1, 
       hit_dice = $2, 
       description = $3, 
       base_stats = $4, 
       proficiencies = $5, 
       features = $6,
       ${imagePath ? 'image_path = $7,' : ''}
       image_position = ${imagePath ? '$8' : '$7'}
       WHERE id = ${imagePath ? '$9' : '$8'} 
       RETURNING *`,
      [
        name, 
        hit_dice, 
        description, 
        base_stats, 
        proficiencies, 
        features,
        ...(imagePath ? [imagePath] : []),
        image_position || 'center',
        id
      ].filter(Boolean) 
    );
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating class' });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { rows: [classToDelete] } = await pool.query(
      'SELECT image_path FROM classes WHERE id = $1', 
      [id]
    );
    
    deleteImageFile(classToDelete?.image_path);
    
    await pool.query('DELETE FROM classes WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting class' });
  }
};