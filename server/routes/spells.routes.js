import express from 'express';
import {
  getSpellsByClass,
  createSpell,
  updateSpell,
  deleteSpell
} from '../controllers/spells.controller.js';

const router = express.Router();

router.get('/class/:classId', getSpellsByClass);
router.post('/', createSpell);
router.put('/:id', updateSpell);
router.delete('/:id', deleteSpell);

export default router;