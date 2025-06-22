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
      },
      armor_class = 10
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

    // Преобразуем в JSON
    const statsJson = JSON.stringify(stats);
    const savingThrowsJson = JSON.stringify(saving_throws);
    const skillsJson = JSON.stringify(skills);
    const equipmentJson = JSON.stringify(equipment);
    const abilitiesJson = JSON.stringify(abilities);
    const spellsJson = JSON.stringify(spells);
    const attacksJson = JSON.stringify(attacks);
    const featuresJson = JSON.stringify(features);
    const traitsJson = JSON.stringify(traits);

    const result = await pool.query(
      `INSERT INTO characters 
       (user_id, name, class_name, race_name, level, alignment, background,
        stats, saving_throws, skills, equipment, abilities, spells,
        attacks, features, traits, max_hp, current_hp, hit_dice, armor_class) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb, $12::jsonb, $13::jsonb, $14::jsonb, $15::jsonb, $16::jsonb, $17, $18, $19, $20) 
       RETURNING *`,
      [
        user_id,
        name,
        class_name,
        race_name,
        level,
        alignment,
        background,
        statsJson,
        savingThrowsJson,
        skillsJson,
        equipmentJson,
        abilitiesJson,
        spellsJson,
        attacksJson,
        featuresJson,
        traitsJson,
        max_hp,
        max_hp,
        `1d${class_name === 'Артист' ? 8 : 6}`,
        armor_class || 10
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка базы данных:', err);
    res.status(500).json({ error: 'Ошибка сервера', details: err.message });
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
      hit_dice,
      armor_class
    } = req.body;
    
    // Преобразуем массивы/объекты в JSON строки для полей jsonb
    const statsJson = stats ? JSON.stringify(stats) : '{}';
    const savingThrowsJson = saving_throws ? JSON.stringify(saving_throws) : '[]';
    const skillsJson = skills ? JSON.stringify(skills) : '[]';
    const equipmentJson = equipment ? JSON.stringify(equipment) : '[]';
    const attacksJson = attacks ? JSON.stringify(attacks) : '[]';
    const featuresJson = features ? JSON.stringify(features) : '[]';
    const traitsJson = traits ? JSON.stringify(traits) : '{}';

    const { rows } = await pool.query(
      `UPDATE characters SET 
       name = $1,
       class_name = $2,
       race_name = $3,
       level = $4,
       alignment = $5,
       background = $6,
       stats = $7::jsonb,
       saving_throws = $8::jsonb,
       skills = $9::jsonb,
       equipment = $10::jsonb,
       attacks = $11::jsonb,
       features = $12::jsonb,
       traits = $13::jsonb,
       current_hp = $14,
       max_hp = $15,
       temp_hp = $16,
       hit_dice = $17,
       armor_class = $18
       WHERE id = $19
       RETURNING *`,
      [
        name,
        class_name,
        race_name,
        level,
        alignment,
        background,
        statsJson,
        savingThrowsJson,
        skillsJson,
        equipmentJson,
        attacksJson,
        featuresJson,
        traitsJson,
        current_hp,
        max_hp,
        temp_hp,
        hit_dice,
        armor_class,
        id
      ]
    );
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при обновлении персонажа', details: err.message });
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