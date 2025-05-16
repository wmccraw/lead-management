const express = require('express');
const { Pool } = require('pg');
const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM leads');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/', async (req, res) => {
    const { name, email, status, quoted_from_vendor } = req.body;
    try {
        await pool.query(
            'INSERT INTO leads (name, email, status, quoted_from_vendor, created_at, time_in_system) VALUES ($1, $2, $3, $4, NOW(), 0) ON CONFLICT (email) DO UPDATE SET status = $3, quoted_from_vendor = $4',
            [name, email, status, quoted_from_vendor]
        );
        res.status(201).send('Lead added');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;