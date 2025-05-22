const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT l.*, c.name AS customer_name, c.company, c.email, c.phone
            FROM leads l
            JOIN customers c ON l.customer_id = c.id
            ORDER BY l.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT l.*, c.name AS customer_name, c.company, c.email, c.phone
            FROM leads l
            JOIN customers c ON l.customer_id = c.id
            WHERE l.id = $1
        `, [req.params.id]);
        if (result.rows.length === 0) return res.status(404).send('Lead not found');
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/', async (req, res) => {
    const { name, company, email, phone, product_category, make, model, notes, status } = req.body;
    try {
        const customerResult = await pool.query(
            'INSERT INTO customers (name, company, email, phone) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET name = $1, company = $2, phone = $4 RETURNING id',
            [name, company, email, phone]
        );
        const customerId = customerResult.rows[0].id;

        const leadResult = await pool.query(
            'INSERT INTO leads (customer_id, product_category, make, model, notes, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
            [customerId, product_category, make, model, notes, status]
        );
        res.status(201).json(leadResult.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.put('/:id', async (req, res) => {
    const { name, company, email, phone, product_category, make, model, notes, status } = req.body;
    try {
        const leadResult = await pool.query('SELECT customer_id FROM leads WHERE id = $1', [req.params.id]);
        if (leadResult.rows.length === 0) return res.status(404).send('Lead not found');
        const customerId = leadResult.rows[0].customer_id;

        await pool.query(
            'UPDATE customers SET name = $1, company = $2, email = $3, phone = $4, last_updated = NOW() WHERE id = $5',
            [name, company, email, phone, customerId]
        );

        await pool.query(
            'UPDATE leads SET product_category = $1, make = $2, model = $3, notes = $4, status = $5 WHERE id = $6',
            [product_category, make, model, notes, status, req.params.id]
        );
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const leadResult = await pool.query('SELECT customer_id FROM leads WHERE id = $1', [req.params.id]);
        if (leadResult.rows.length === 0) return res.status(404).send('Lead not found');
        const customerId = leadResult.rows[0].customer_id;

        await pool.query('DELETE FROM leads WHERE id = $1', [req.params.id]);
        await pool.query('DELETE FROM customers WHERE id = $1', [customerId]);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;