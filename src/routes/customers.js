const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM customers');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.get('/csv', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM customers');
        const headers = ['id', 'name', 'email'];
        let csv = headers.join(',') + '\n';
        result.rows.forEach(row => {
            const values = headers.map(h => {
                const val = row[h];
                return val ? `"${val.toString().replace(/"/g, '""')}"` : '';
            });
            csv += values.join(',') + '\n';
        });
        res.header('Content-Type', 'text/csv');
        res.attachment('customers.csv');
        res.send(csv);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;