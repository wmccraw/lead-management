const express = require('express');
const router = express.Router();
const pool = require('../db'); // Use shared pool

// Get all customers
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM customers ORDER BY date_added DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Get a single customer by ID
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

// Create a new customer
router.post('/', async (req, res) => {
    const { name, company, email, phone } = req.body;
    if (!name || !email) {
        return res.status(400).send('Name and email are required');
    }
    try {
        const result = await pool.query(
            'INSERT INTO customers (name, company, email, phone, date_added, last_updated) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
            [name, company, email, phone]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Update a customer
router.put('/:id', async (req, res) => {
    const { name, company, email, phone } = req.body;
    if (!name || !email) {
        return res.status(400).send('Name and email are required');
    }
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

// Delete a customer and their leads
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