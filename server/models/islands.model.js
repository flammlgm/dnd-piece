import pool from '../config/db.js'

export const getAllIslands = async () => {
  const { rows } = await pool.query('SELECT * FROM islands ORDER BY id')
  return rows
}

export const getIslandById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM islands WHERE id = $1', [id])
  return rows[0]
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
      x || Math.floor(Math.random() * 800),
      y || Math.floor(Math.random() * 500),
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
  const { 
    name, x, y, 
    monster_chance, pirate_chance, 
    patrol_chance, storm_chance, 
    has_harbor 
  } = islandData
  
  const { rows } = await pool.query(
    `UPDATE islands SET 
     name = $1, x = $2, y = $3, 
     monster_chance = $4, pirate_chance = $5, 
     patrol_chance = $6, storm_chance = $7,
     has_harbor = $8,
     updated_at = NOW()
     WHERE id = $9
     RETURNING *`,
    [
      name,
      x, y,
      monster_chance,
      pirate_chance,
      patrol_chance,
      storm_chance,
      has_harbor,
      id
    ]
  )
  return rows[0]
}

export const deleteIsland = async (id) => {
  await pool.query('DELETE FROM islands WHERE id = $1', [id])
}

export const getAllConnections = async () => {
    const { rows } = await pool.query(`
      SELECT ic.id, ic.from_island, ic.to_island, ic.distance, ic.created_at
      FROM island_connections ic
      WHERE EXISTS (SELECT 1 FROM islands WHERE id = ic.from_island)
      AND EXISTS (SELECT 1 FROM islands WHERE id = ic.to_island)
      ORDER BY ic.id
    `);
    return rows;
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