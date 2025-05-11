import express from 'express';
import {
  getWorldEntries,
  getWorldEntryById,
  createWorldEntry,
  updateWorldEntry,
  deleteWorldEntry,
  searchWorldEntries,
  getWorldEntryImage
} from '../controllers/world.controller.js';
import multer from 'multer';

const upload = multer();
const router = express.Router();

router.get('/', getWorldEntries);
router.get('/search', searchWorldEntries);
router.get('/:id', getWorldEntryById);
router.post('/', upload.single('image'), createWorldEntry);
router.put('/:id', upload.single('image'), updateWorldEntry);
router.delete('/:id', deleteWorldEntry);
router.get('/:id/image', getWorldEntryImage);

export default router;