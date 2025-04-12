import express from 'express';
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
} from '../controllers/classes.controller.js';
import { upload } from '../app.js'; 

const router = express.Router();

router.get('/', getClasses);
router.get('/:id', getClassById);

router.post('/', upload.single('image'), createClass);
router.put('/:id', upload.single('image'), updateClass);

router.delete('/:id', deleteClass);

export default router;