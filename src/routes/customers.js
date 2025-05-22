const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM customers ORDER BY date_added DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).send('Customer not found');
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/', async (req, res) => {
    const { name, company, email, phone } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO customers (name, company, email, phone) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, company, email, phone]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.put('/:id', async (req, res) => {
    const { name, company, email, phone } = req.body;
    try {
        await pool.query(
            'UPDATE customers SET name = $1, company = $2, email = $3, phone = $4, last_updated = NOW() WHERE id = $5',
            [name, company, email, phone, req.params.id]
        );
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM leads WHERE customer_id = $1', [req.params.id]);
        await pool.query('DELETE FROM customers WHERE id = $1', [req.params.id]);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;