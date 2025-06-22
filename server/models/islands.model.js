import pool from '../config/db.js'

export const getAllIslands = async () => {
  const { rows } = await pool.query('SELECT * FROM islands ORDER BY id')
  return rows.map(validateIsland)
}

export const getIslandById = async (id) => {
  if (!Number.isInteger(Number(id))) {
    throw new Error('Invalid island ID')
  }
  
  const { rows } = await pool.query('SELECT * FROM islands WHERE id = $1', [id])
  return rows.length ? validateIsland(rows[0]) : null
}

function validateIsland(island) {
  return {
    ...island,
    x: Math.max(0, Math.min(1400, Number(island.x) || 0)),
    y: Math.max(0, Math.min(900, Number(island.y) || 0)),
    monster_chance: Math.max(0, Math.min(100, Number(island.monster_chance) || 0)),
    pirate_chance: Math.max(0, Math.min(100, Number(island.pirate_chance) || 0)),
    patrol_chance: Math.max(0, Math.min(100, Number(island.patrol_chance) || 0)),
    storm_chance: Math.max(0, Math.min(100, Number(island.storm_chance) || 0)),
    has_harbor: Boolean(island.has_harbor)
  }
}

export const createIsland = async (islandData) => {
  const { 
    name, x, y, 
    monster_chance, pirate_chance, 
    patrol_chance, storm_chance, 
    has_harbor 
  } = islandData
  
  const { rows } = await pool.query(
    `INSERT INTO islands 
     (name, x, y, monster_chance, pirate_chance, patrol_chance, storm_chance, has_harbor) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
     RETURNING *`,
    [
      name || `Остров ${Math.floor(Math.random() * 1000)}`,
      x || Math.floor(Math.random() * 1400), // Увеличено до 1400
      y || Math.floor(Math.random() * 900),  // Увеличено до 900
      monster_chance || Math.floor(Math.random() * 100),
      pirate_chance || Math.floor(Math.random() * 100),
      patrol_chance || Math.floor(Math.random() * 100),
      storm_chance || Math.floor(Math.random() * 100),
      has_harbor || false
    ]
  )
  return rows[0]
}

export const updateIsland = async (id, islandData) => {
  if (isNaN(parseInt(id))) {
    throw new Error(`Invalid island ID: ${id}`);
  }
  
  const fields = [];
  const values = [];
  let paramIndex = 1;
  
  for (const [key, value] of Object.entries(islandData)) {
    fields.push(`${key} = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }
  
  fields.push('updated_at = NOW()');
  
  values.push(id);
  
  const queryText = `
    UPDATE islands SET 
    ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;
  
  const { rows } = await pool.query(queryText, values);
  return rows[0];
}

export const deleteIsland = async (id) => {
  await pool.query('DELETE FROM islands WHERE id = $1', [id])
}

