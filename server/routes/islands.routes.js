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
  removeConnection,
  updateConnection
} from '../controllers/islands.controller.js';

const router = express.Router();

router.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.path}`);
  next();
});

router.get('/connections', getAllConnections);

router.get('/', getIslands);
router.get('/:id', getIsland);
router.get('/:id/connections', getIslandConnections);
router.post('/', createIsland);
router.put('/:id', updateIsland);
router.delete('/:id', deleteIsland);
router.post('/connections', addConnection);
router.delete('/connections/:id', removeConnection);
router.put('/connections/:id', updateConnection);

export default router;