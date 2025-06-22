import * as IslandModel from '../models/islands.model.js';
import pool from '../config/db.js'

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

