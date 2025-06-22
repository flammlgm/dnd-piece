import express from 'express';
import {
  getWills,
  getWillById,
  createWill,
  updateWill,
  deleteWill
} from '../controllers/wills.controller.js';

const router = express.Router();

router.get('/', getWills);
router.get('/:id', getWillById);
router.post('/', createWill);
router.put('/:id', updateWill);
router.delete('/:id', deleteWill);

export default router;