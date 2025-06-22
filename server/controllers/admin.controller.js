// export const createUser = async (req, res) => {
//     const { username, password, role = 'player', permissions = {} } = req.body;
    
//     const salt = await bcrypt.genSalt(10);
//     const passwordHash = await bcrypt.hash(password, salt);

//     await pool.query(
//         `INSERT INTO users (username, password_hash, role, permissions)
//          VALUES ($1, $2, $3, $4)`,
//         [username, passwordHash, role, permissions]
//     );

//     res.json({ success: true });
// };