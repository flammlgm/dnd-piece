import pool from '../config/db.js';

export const getDevilFruits = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM devil_fruits ORDER BY type, (abilities->>\'rarity\')');
    res.json(rows);
  } catch (err) {
    console.error('Ошибка в getDevilFruits:', err);
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
    const { name, type } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Имя фрукта обязательно' });
    }
    
    if (!type || !['Paramecia', 'Zoan', 'Logia'].includes(type)) {
      return res.status(400).json({ error: 'Неверный тип фрукта' });
    }

    const fruitData = {
      name: name.trim(),
      type,
      description: req.body.description?.trim() || null,
      abilities: {
        rarity: req.body.abilities?.rarity || 'Uncommon',
        features: Array.isArray(req.body.abilities?.features) 
          ? req.body.abilities.features
          : [],
        awakening: req.body.abilities?.awakening?.trim() || null
      },
      appearance: req.body.appearance?.trim() || null,
      creature: type === 'Zoan' ? (req.body.creature || {
        name: '',
        type: 'beast',
        size: 'Medium',
        ac: 10,
        hp: '1d10',
        speed: '30 ft',
        stats: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10
        },
        skills: '',
        abilities: []
      }) : null,
      water_vulnerability: req.body.water_vulnerability !== false
    };

    const { rows } = await pool.query(
      `INSERT INTO devil_fruits (
        name, type, description, abilities, appearance, creature, water_vulnerability
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        fruitData.name,
        fruitData.type,
        fruitData.description,
        JSON.stringify(fruitData.abilities),
        fruitData.appearance,
        JSON.stringify(fruitData.creature),
        fruitData.water_vulnerability
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Ошибка при создании фрукта:', err);
    res.status(500).json({ error: 'Ошибка при создании дьявольского фрукта' });
  }
};

export const updateDevilFruit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Имя и тип обязательны' });
    }

    const fruitData = {
      ...req.body,
      abilities: req.body.abilities || {},
      creature: type === 'Zoan' ? (req.body.creature || {}) : null
    };

    const { rows } = await pool.query(
      `UPDATE devil_fruits SET
        name = $1,
        type = $2,
        description = $3,
        abilities = $4,
        appearance = $5,
        creature = $6,
        water_vulnerability = $7
      WHERE id = $8 RETURNING *`,
      [
        fruitData.name.trim(),
        fruitData.type,
        fruitData.description?.trim() || null,
        JSON.stringify(fruitData.abilities),
        fruitData.appearance?.trim() || null,
        JSON.stringify(fruitData.creature),
        fruitData.water_vulnerability !== false,
        id
      ]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Фрукт не найден' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при обновлении дьявольского фрукта' });
  }
};

export const deleteDevilFruit = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM devil_fruits WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Фрукт не найден' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при удалении дьявольского фрукта' });
  }
};