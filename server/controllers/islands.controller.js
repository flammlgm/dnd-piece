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
    const updatedIsland = await IslandModel.updateIsland(id, req.body);
    if (!updatedIsland) {
      return res.status(404).json({ error: 'Island not found' });
    }
    res.json(updatedIsland);
  } catch (err) {
    console.error('Error updating island:', err);
    res.status(500).json({ error: 'Internal server error' });
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
      console.log('Fetching all connections...');
      const connections = await IslandModel.getAllConnections();
      console.log(`Found ${connections.length} connections`);
      res.json(connections);
    } catch (err) {
      console.error('Error in getAllConnections:', {
        message: err.message,
        stack: err.stack,
        query: err.query,
        parameters: err.parameters
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