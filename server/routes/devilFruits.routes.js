import express from 'express';
import {
  getDevilFruits,
  getDevilFruitById,
  createDevilFruit,
  updateDevilFruit,
  deleteDevilFruit
} from '../controllers/devilFruits.controller.js';

const router = express.Router();

router.get('/', getDevilFruits);
router.get('/:id', getDevilFruitById);
router.post('/', createDevilFruit);
router.put('/:id', updateDevilFruit);
router.delete('/:id', deleteDevilFruit);

export default router;