const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM calendar_days ORDER BY date');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/day', async (req, res) => {
    const { date, notes, out_status, out_start_date, out_end_date } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO calendar_days (date, notes, out_status, out_start_date, out_end_date, created_at) ' +
            'VALUES ($1, $2, $3, $4, $5, NOW()) ON CONFLICT (date) DO UPDATE SET notes = $2, out_status = $3, out_start_date = $4, out_end_date = $5, created_at = NOW() RETURNING *',
            [date, notes || null, out_status || false, out_start_date || null, out_end_date || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.put('/day/:date', async (req, res) => {
    const { notes, out_status, out_start_date, out_end_date } = req.body;
    try {
        await pool.query(
            'UPDATE calendar_days SET notes = $1, out_status = $2, out_start_date = $3, out_end_date = $4, created_at = NOW() WHERE date = $5',
            [notes || null, out_status || false, out_start_date || null, out_end_date || null, req.params.date]
        );
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.delete('/day/:date', async (req, res) => {
    try {
        await pool.query('DELETE FROM calendar_days WHERE date = $1', [req.params.date]);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;