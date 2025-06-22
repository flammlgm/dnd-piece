import express from 'express';
import {
  getRaces,
  getRaceById,
  createRace,
  updateRace,
  deleteRace
} from '../controllers/races.controller.js';

const router = express.Router();

router.get('/', getRaces);
router.get('/:id', getRaceById);
router.post('/', createRace);
router.put('/:id', updateRace);
router.delete('/:id', deleteRace);

export default router;