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

router.post('/', async (req, res) => {
    const { name, company, email, phone } = req.body;
    try {
        let customer = await pool.query('SELECT id FROM customers WHERE email = $1', [email]);
        if (customer.rows.length === 0) {
            customer = await pool.query(
                'INSERT INTO customers (name, company, email, phone) VALUES ($1, $2, $3, $4) RETURNING *',
                [name, company, email, phone]
            );
            res.status(201).json(customer.rows[0]);
        } else {
            res.status(200).json(customer.rows[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;