import express from 'express';
import {
  getIslands,
  getIsland,
  createIsland,
  updateIsland,
  deleteIsland,

} from '../controllers/islands.controller.js';

const router = express.Router();

router.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.path}`);
  next();
});

router.get('/', getIslands);
router.get('/:id', getIsland);
router.post('/', createIsland);
router.put('/:id', updateIsland);
router.delete('/:id', deleteIsland);

export default router;