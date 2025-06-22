import pool from '../config/db.js';

export const getWorldEntries = async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT 
                id, 
                name, 
                type, 
                description, 
                image_mime_type,
                image_data IS NOT NULL as has_image,
                encode(image_data, 'base64') as image_data
            FROM world_entries 
            ORDER BY name
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error in getWorldEntries:', err);
        res.status(500).json({ error: 'Error fetching world entries' });
    }
};


export const getWorldEntryById = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(`
            SELECT 
                id, 
                name, 
                type, 
                description, 
                image_mime_type,
                image_data IS NOT NULL as has_image,
                encode(image_data, 'base64') as image_data
            FROM world_entries 
            WHERE id = $1
        `, [id]);
        
        if (!rows[0]) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching world entry' });
    }
};

export const createWorldEntry = async (req, res) => {
  try {
    const { name, type, description } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO world_entries (
        name, type, description, image_data, image_mime_type
      ) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, type, description, image_mime_type`,
      [
        name.trim(),
        type,
        description?.trim() || null,
        req.file?.buffer || null,
        req.file?.mimetype || null
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating world entry:', err);
    res.status(500).json({ error: 'Error creating world entry' });
  }
};

export const getWorldEntryImage = async (req, res) => {
    try {
      const { id } = req.params;
      const { rows } = await pool.query(`
        SELECT image_data, image_mime_type 
        FROM world_entries 
        WHERE id = $1 AND image_data IS NOT NULL`, 
        [id]);
      
      if (!rows[0]) {
        return res.status(404).send('Image not found');
      }

      let imageData = rows[0].image_data;
      if (!(imageData instanceof Buffer)) {
        imageData = Buffer.from(imageData);
      }

      res.set('Content-Type', rows[0].image_mime_type);
      res.send(imageData);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching image');
    }
};

export const updateWorldEntry = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, type, description, removeImage } = req.body;
      
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }
      
      if (!type) {
        return res.status(400).json({ error: 'Type is required' });
      }

      const { rows } = await pool.query(
        `UPDATE world_entries SET
          name = $1,
          type = $2,
          description = $3,
          image_data = CASE 
            WHEN $4::boolean THEN NULL 
            WHEN $5::bytea IS NOT NULL THEN $5 
            ELSE image_data 
          END,
          image_mime_type = CASE 
            WHEN $4::boolean THEN NULL 
            WHEN $6::varchar IS NOT NULL THEN $6 
            ELSE image_mime_type 
          END,
          updated_at = now()
        WHERE id = $7 RETURNING id, name, type, description, image_mime_type`,
        [
          name.trim(),
          type,
          description?.trim() || null,
          removeImage === 'true',
          req.file?.buffer || null,
          req.file?.mimetype || null,
          id
        ]
      );

      res.json(rows[0]);
    } catch (err) {
      console.error('Error updating world entry:', err);
      res.status(500).json({ error: 'Error updating world entry' });
    }
};

export const deleteWorldEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM world_entries WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting world entry' });
  }
};

export const searchWorldEntries = async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query || query.trim().length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
      }

      const { rows } = await pool.query(
        `SELECT 
          id, 
          name, 
          type, 
          description, 
          image_mime_type,
          image_data IS NOT NULL as has_image,
          CASE WHEN image_data IS NOT NULL 
            THEN encode(image_data, 'base64') 
            ELSE NULL 
          END as image_data
         FROM world_entries 
         WHERE name ILIKE $1 
         ORDER BY name`,
        [`%${query.trim()}%`]
      );

      res.json(rows);
    } catch (err) {
      console.error('Error searching world entries:', err);
      res.status(500).json({ error: 'Error searching world entries' });
    }
};