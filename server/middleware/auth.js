import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Доступ запрещен' });
    }

    try {
        const decoded = jwt.verify(token, 'your_master_secret');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Неверный токен' });
    }
};

export const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Недостаточно прав' });
        }
        next();
    };
};