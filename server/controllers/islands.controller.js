import * as IslandModel from '../models/islands.model.js';

export const getIslands = async (req, res) => {
  try {
    const islands = await IslandModel.getAllIslands();
    res.json(islands);
  } catch (err) {
    console.error('Error getting islands:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getIsland = async (req, res) => {
  try {
    const { id } = req.params;
    const island = await IslandModel.getIslandById(id);
    if (!island) {
      return res.status(404).json({ error: 'Island not found' });
    }
    res.json(island);
  } catch (err) {
    console.error('Error getting island:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createIsland = async (req, res) => {
  try {
    const newIsland = await IslandModel.createIsland(req.body);
    res.status(201).json(newIsland);
  } catch (err) {
    console.error('Error creating island:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateIsland = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Добавим логирование для отладки
    console.log('Updating island:', id, 'with data:', updateData);
    
    // Проверяем, что переданы только допустимые поля
    const allowedFields = ['name', 'x', 'y', 'monster_chance', 'pirate_chance', 
                         'patrol_chance', 'storm_chance', 'has_harbor'];
    const filteredData = {};
    
    for (const key in updateData) {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    }
    
    const updatedIsland = await IslandModel.updateIsland(id, filteredData);
    
    if (!updatedIsland) {
      return res.status(404).json({ error: 'Island not found' });
    }
    
    res.json(updatedIsland);
  } catch (err) {
    console.error('Error updating island:', {
      message: err.message,
      stack: err.stack,
      body: req.body,
      params: req.params
    });
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const deleteIsland = async (req, res) => {
  try {
    const { id } = req.params;
    await IslandModel.deleteIsland(id);
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting island:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getIslandConnections = async (req, res) => {
  try {
    const { id } = req.params;
    const connections = await IslandModel.getConnectionsForIsland(id);
    res.json(connections);
  } catch (err) {
    console.error('Error getting island connections:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllConnections = async (req, res) => {
  try {
    const connections = await IslandModel.getAllConnections();
    res.json(connections);
  } catch (err) {
    console.error('Error in getAllConnections:', {
      message: err.message,
      stack: err.stack,
      ...(err.query && { query: err.query }),
      ...(err.parameters && { parameters: err.parameters })
    });
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

export const addConnection = async (req, res) => {
  try {
    const { from_island, to_island, distance } = req.body;
    const connection = await IslandModel.createConnection(from_island, to_island, distance);
    res.status(201).json(connection);
  } catch (err) {
    console.error('Error creating connection:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeConnection = async (req, res) => {
  try {
    const { id } = req.params;
    await IslandModel.deleteConnection(id);
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting connection:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateConnection = async (req, res) => {
  try {
    const { id } = req.params;
    const { distance } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE island_connections 
       SET distance = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [distance, id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating connection:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};