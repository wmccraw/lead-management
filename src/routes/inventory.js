const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventory');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/', async (req, res) => {
    const { name, category, quantity, price } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO inventory (name, category, quantity, price, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
            [name, category, quantity, price]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.put('/:id', async (req, res) => {
    const { name, category, quantity, price } = req.body;
    try {
        await pool.query(
            'UPDATE inventory SET name = $1, category = $2, quantity = $3, price = $4 WHERE id = $5',
            [name, category, quantity, price, req.params.id]
        );
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM inventory WHERE id = $1', [req.params.id]);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;