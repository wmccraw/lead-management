const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

router.get('/', async (req, res) => {
    const { date } = req.query;
    try {
        const result = await pool.query(
            'SELECT * FROM calendar WHERE date = $1',
            [date || new Date().toISOString().split('T')[0]]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/', async (req, res) => {
    const { name, time, date } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO calendar (name, time, date) VALUES ($1, $2, $3) RETURNING id',
            [name, time, date]
        );
        res.status(201).json({ id: result.rows[0].id, ...req.body });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, time, date } = req.body;
    try {
        await pool.query(
            'UPDATE calendar SET name = $1, time = $2, date = $3 WHERE id = $4',
            [name, time, date, id]
        );
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM calendar WHERE id = $1', [id]);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;