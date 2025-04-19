import pool from '../config/db.js';

export const getVisibilitySettings = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM content_visibility WHERE content_id = $1',
      [contentId]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get visibility settings' });
  }
};

export const updateVisibility = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { hiddenForUsers, contentType } = req.body;
    
    // Проверяем, есть ли уже запись для этого контента
    const existing = await pool.query(
      'SELECT * FROM content_visibility WHERE content_id = $1',
      [contentId]
    );

    if (existing.rows.length > 0) {
      // Обновляем существующую запись
      const { rows } = await pool.query(
        `UPDATE content_visibility 
         SET hidden_for_users = $1, updated_at = CURRENT_TIMESTAMP
         WHERE content_id = $2
         RETURNING *`,
        [hiddenForUsers, contentId]
      );
      res.json(rows[0]);
    } else {
      // Создаем новую запись
      const { rows } = await pool.query(
        `INSERT INTO content_visibility 
         (content_id, content_type, hidden_for_users)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [contentId, contentType, hiddenForUsers || []]
      );
      res.status(201).json(rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update visibility settings' });
  }
};