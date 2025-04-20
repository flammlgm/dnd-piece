import pool from '../config/db.js';

export const getCharacters = async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id обязателен' });
    }

    const { rows } = await pool.query(
      `SELECT * FROM characters WHERE user_id = $1`,
      [user_id]
    );
    
    // Добавляем расчетные поля для каждого персонажа
    const characters = rows.map(character => {
      if (!character.max_hp) {
        const conMod = Math.floor((character.stats.constitution - 10) / 2);
        character.max_hp = character.level * (6 + conMod) > 0 ? character.level * (6 + conMod) : 1;
      }
      if (!character.current_hp) {
        character.current_hp = character.max_hp;
      }
      if (!character.hit_dice) {
        character.hit_dice = `${character.level}d${character.class_name === 'Бард' ? 8 : 6}`;
      }
      return character;
    });

    res.json({ data: characters });
  } catch (err) {
    console.error('Ошибка при получении персонажей:', err);
    res.status(500).json({ 
      error: 'Не удалось загрузить персонажей',
      details: err.message 
    });
  }
};

export const createCharacter = async (req, res) => {
  try {
    const { 
      user_id, 
      name,
      class_name = '',
      race_name = '',
      level = 1,
      alignment = '',
      background = '',
      stats = {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      saving_throws = [],
      skills = [],
      equipment = [],
      abilities = [],
      spells = [],
      attacks = [],
      features = [],
      traits = {
        personality: '',
        ideals: '',
        bonds: '',
        flaws: ''
      }
    } = req.body;
    
    if (!name || !user_id) {
      return res.status(400).json({ 
        error: 'Имя и ID пользователя обязательны',
        fields: { name: !name, user_id: !user_id }
      });
    }

    // Рассчитываем максимальные HP по умолчанию
    const conMod = Math.floor((stats.constitution - 10) / 2);
    const max_hp = level * (6 + conMod) > 0 ? level * (6 + conMod) : 1;

    const result = await pool.query(
      `INSERT INTO characters 
       (user_id, name, class_name, race_name, level, alignment, background,
        stats, saving_throws, skills, equipment, abilities, spells,
        attacks, features, traits, max_hp, current_hp, hit_dice) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) 
       RETURNING *`,
      [
        user_id,
        name,
        class_name,
        race_name,
        level,
        alignment,
        background,
        stats,
        saving_throws,
        skills,
        equipment,
        abilities,
        spells,
        attacks,
        features,
        traits,
        max_hp,
        max_hp, // current_hp = max_hp при создании
        `1d${class_name === 'Бард' ? 8 : 6}` // Пример расчета костей хитов
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка базы данных:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const getCharacterById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(`
      SELECT 
        c.*,
        u.username as user_name
      FROM characters c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `, [id]);
    
    if (!rows[0]) {
      return res.status(404).json({ error: 'Персонаж не найден' });
    }
    
    const character = rows[0];
    if (!character.max_hp) {
      const conMod = Math.floor((character.stats.constitution - 10) / 2);
      character.max_hp = character.level * (6 + conMod) > 0 ? character.level * (6 + conMod) : 1;
    }
    if (!character.current_hp) {
      character.current_hp = character.max_hp;
    }
    if (!character.hit_dice) {
      character.hit_dice = `${character.level}d${character.class_name === 'Бард' ? 8 : 6}`;
    }
    
    res.json(character);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении персонажа' });
  }
};

export const updateCharacter = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name,
      class_name,
      race_name,
      level,
      alignment,
      background,
      stats,
      saving_throws,
      skills,
      equipment,
      attacks,
      features,
      traits,
      current_hp,
      max_hp,
      temp_hp,
      hit_dice
    } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE characters SET 
       name = $1,
       class_name = $2,
       race_name = $3,
       level = $4,
       alignment = $5,
       background = $6,
       stats = $7,
       saving_throws = $8,
       skills = $9,
       equipment = $10,
       attacks = $11,
       features = $12,
       traits = $13,
       current_hp = $14,
       max_hp = $15,
       temp_hp = $16,
       hit_dice = $17
       WHERE id = $18
       RETURNING *`,
      [
        name,
        class_name,
        race_name,
        level,
        alignment,
        background,
        stats || {},
        saving_throws || [],
        skills || [],
        equipment || [],
        attacks || [],
        features || [],
        traits || {},
        current_hp,
        max_hp,
        temp_hp,
        hit_dice,
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