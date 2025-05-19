const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

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
        const result = await pool.query(
            'INSERT INTO leads (name, email, status, quoted_from_vendor, created_at, time_in_system) VALUES ($1, $2, $3, $4, NOW(), 0) RETURNING id',
            [name, email, status, quoted_from_vendor]
        );
        res.status(201).json({ id: result.rows[0].id, ...req.body });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, status, quoted_from_vendor } = req.body;
    try {
        await pool.query(
            'UPDATE leads SET name = $1, email = $2, status = $3, quoted_from_vendor = $4 WHERE id = $5',
            [name, email, status, quoted_from_vendor, id]
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
        await pool.query('DELETE FROM leads WHERE id = $1', [id]);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.get('/csv', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM leads');
        const headers = ['id', 'name', 'email', 'status', 'quoted_from_vendor', 'created_at', 'time_in_system'];
        let csv = headers.join(',') + '\n';
        result.rows.forEach(row => {
            const values = headers.map(h => {
                const val = row[h];
                return val !== null && val !== undefined ? `"${val.toString().replace(/"/g, '""')}"` : '';
            });
            csv += values.join(',') + '\n';
        });
        res.header('Content-Type', 'text/csv');
        res.attachment('leads.csv');
        res.send(csv);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;