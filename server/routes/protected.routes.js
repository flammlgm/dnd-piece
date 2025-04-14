// import express from 'express';
// import { authenticate, authorize } from '../middleware/auth.js';

// const router = express.Router();

// // Только для мастеров и админов
// router.get('/master-data', 
//     authenticate, 
//     authorize(['master', 'admin']), 
//     (req, res) => {
//         res.json({ data: 'Секретные данные' });
//     }
// );

// // Специфичные права через permissions
// router.get('/custom-access',
//     authenticate,
//     (req, res) => {
//         if (!req.user.permissions?.customAccess) {
//             return res.status(403).json({ error: 'Нет доступа' });
//         }
//         res.json({ data: 'Персональный доступ' });
//     }
// );

// export default router;