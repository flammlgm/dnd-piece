import express from 'express';
import {
  getIslands,
  getIsland,
  createIsland,
  updateIsland,
  deleteIsland,
  getIslandConnections,
  getAllConnections,
  addConnection,
  removeConnection
} from '../controllers/islands.controller.js';

const router = express.Router();

router.get('/', getIslands);
router.get('/:id', getIsland);
router.post('/', createIsland);
router.put('/:id', updateIsland);
router.delete('/:id', deleteIsland);

router.get('/connections', getAllConnections);
router.get('/:id/connections', getIslandConnections);
router.post('/connections', addConnection);
router.delete('/connections/:id', removeConnection);

export default router;