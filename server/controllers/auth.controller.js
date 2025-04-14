// import pool from '../config/db.js';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';

// const JWT_SECRET = 'your_master_secret'; // Замените на надежный ключ

// export const login = async (req, res) => {
//     const { username, password } = req.body;

//     const { rows } = await pool.query(
//         'SELECT * FROM users WHERE username = $1', 
//         [username]
//     );

//     if (!rows.length) {
//         return res.status(401).json({ error: 'Неверные данные' });
//     }

//     const user = rows[0];
//     const validPass = await bcrypt.compare(password, user.password_hash);

//     if (!validPass) {
//         return res.status(401).json({ error: 'Неверные данные' });
//     }

//     const token = jwt.sign(
//         { 
//             id: user.id, 
//             role: user.role,
//             permissions: user.permissions || {}
//         }, 
//         JWT_SECRET,
//         { expiresIn: '30d' }
//     );

//     res.json({ token, role: user.role });
// };