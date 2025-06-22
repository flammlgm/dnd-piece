import express from 'express';
import {
  getVisibilitySettings,
  updateVisibility
} from '../controllers/visibility.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';

const router = express.Router();

router.get('/:contentId', authMiddleware, getVisibilitySettings);
router.put('/:contentId', authMiddleware, roleMiddleware(['master']), updateVisibility);

export default router;