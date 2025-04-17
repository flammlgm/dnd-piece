import express from 'express';
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassSubclasses 
} from '../controllers/classes.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';


const router = express.Router();

router.get('/', getClasses);
router.get('/:id', getClassById);
router.post('/', authMiddleware, roleMiddleware(['master']), createClass);
router.put('/:id', authMiddleware, updateClass);
router.delete('/:id', authMiddleware, deleteClass);

export default router;