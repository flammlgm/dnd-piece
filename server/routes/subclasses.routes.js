import express from 'express';
import {
  getSubclasses,
  getSubclassById,
  createSubclass,
  updateSubclass,
  deleteSubclass
} from '../controllers/subclasses.controller.js';

const router = express.Router();

router.get('/', getSubclasses);
router.get('/:id', getSubclassById);
router.post('/', createSubclass);
router.put('/:id', updateSubclass);
router.delete('/:id', deleteSubclass);

export default router;