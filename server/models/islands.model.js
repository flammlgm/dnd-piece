import pool from '../config/db.js'

export const getAllIslands = async () => {
  const { rows } = await pool.query('SELECT * FROM islands ORDER BY id')
  return rows
}

export const getIslandById = async (id) => {
  if (isNaN(parseInt(id))) {
    throw new Error(`Invalid island ID: ${id}`);
  }
  
  const { rows } = await pool.query('SELECT * FROM islands WHERE id = $1', [parseInt(id)]);
  return rows[0];
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

export const getAllConnections = async () => {
  try {
    const { rows } = await pool.query('SELECT * FROM island_connections');
    console.log('Fetched connections:', rows); // Добавьте логирование
    return rows;
  } catch (err) {
    console.error('Database error in getAllConnections:', {
      message: err.message,
      stack: err.stack,
      query: 'SELECT * FROM island_connections'
    });
    throw err;
  }
}

export const getConnectionsForIsland = async (islandId) => {
  const { rows } = await pool.query(
    `SELECT ic.*, i2.name as to_name 
     FROM island_connections ic
     JOIN islands i2 ON ic.to_island = i2.id
     WHERE ic.from_island = $1`,
    [islandId]
  )
  return rows
}

export const createConnection = async (fromIsland, toIsland, distance) => {
  const { rows } = await pool.query(
    `INSERT INTO island_connections (from_island, to_island, distance)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [fromIsland, toIsland, distance]
  )
  return rows[0]
}

export const deleteConnection = async (id) => {
  await pool.query('DELETE FROM island_connections WHERE id = $1', [id])
}

export const updateConnection = async (id, distance) => {
  const { rows } = await pool.query(
    `UPDATE island_connections 
     SET distance = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [distance, id]
  );
  return rows[0];
};