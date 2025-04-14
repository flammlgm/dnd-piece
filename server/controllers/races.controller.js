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
    const { 
      name, 
      description, 
      base_stats, 
      proficiencies, 
      features,
      underwater_breathing,
      water_resistance,
      speed,
      water_speed
    } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Имя расы обязательно' });
    }

    const result = await pool.query(
      `INSERT INTO races 
       (name, description, base_stats, proficiencies, features, 
        underwater_breathing, water_resistance, speed, water_speed) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        name,
        description || '',
        base_stats || { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 },
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
    const { 
      name,
      description,
      base_stats = {},
      proficiencies = {},
      features = [],
      underwater_breathing = false,
      water_resistance = false,
      speed = 30,
      water_speed = 0,
      image_path = '',
      image_position = ''
    } = req.body;

    // Глубокая валидация и очистка features
    const cleanFeatures = features.map(f => ({
      id: String(f.id || Math.random().toString(36).substr(2, 9)),
      name: String(f.name || 'Новая особенность'),
      description: String(f.description || ''),
      order: Number.isInteger(f.order) ? f.order : 0
    }));

    // Глубокая очистка всех JSON-полей
    const cleanData = {
      name: String(name),
      description: String(description || ''),
      base_stats: {
        bio: {
          age: String(base_stats.bio?.age || ''),
          height: String(base_stats.bio?.height || ''),
          weight: String(base_stats.bio?.weight || '')
        },
        stats: String(base_stats.stats || '')
      },
      proficiencies: {
        weapon: String(proficiencies.weapon || '')
      },
      features: cleanFeatures,
      underwater_breathing: Boolean(underwater_breathing),
      water_resistance: Boolean(water_resistance),
      speed: Number(speed) || 30,
      water_speed: Number(water_speed) || 0,
      image_path: String(image_path || ''),
      image_position: String(image_position || '')
    };

    const { rows } = await pool.query(
      `UPDATE races SET 
       name = $1,
       description = $2,
       base_stats = $3::jsonb,
       proficiencies = $4::jsonb,
       features = $5::jsonb,
       underwater_breathing = $6,
       water_resistance = $7,
       speed = $8,
       water_speed = $9,
       image_path = $10,
       image_position = $11
       WHERE id = $12
       RETURNING *`,
      [
        cleanData.name,
        cleanData.description,
        JSON.stringify(cleanData.base_stats),
        JSON.stringify(cleanData.proficiencies),
        JSON.stringify(cleanData.features),
        cleanData.underwater_breathing,
        cleanData.water_resistance,
        cleanData.speed,
        cleanData.water_speed,
        cleanData.image_path,
        cleanData.image_position,
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