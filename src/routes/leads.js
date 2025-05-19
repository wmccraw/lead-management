const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT leads.id, customers.name, customers.company, customers.email, customers.phone, ' +
            'leads.product_category, leads.make, leads.model, leads.notes, leads.status, ' +
            'leads.quoted_from_vendor, leads.created_at ' +
            'FROM leads JOIN customers ON leads.customer_id = customers.id'
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/', async (req, res) => {
    const { name, company, email, phone, product_category, make, model, notes, status } = req.body;
    try {
        let customer = await pool.query('SELECT id FROM customers WHERE email = $1', [email]);
        if (customer.rows.length === 0) {
            customer = await pool.query(
                'INSERT INTO customers (name, company, email, phone) VALUES ($1, $2, $3, $4) RETURNING id',
                [name, company, email, phone]
            );
        }
        const customer_id = customer.rows[0].id;
        const lead = await pool.query(
            'INSERT INTO leads (customer_id, product_category, make, model, notes, status, quoted_from_vendor, created_at) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, FALSE, NOW()) RETURNING *',
            [customer_id, product_category, make, model, notes, status]
        );
        res.status(201).json(lead.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.put('/:id', async (req, res) => {
    const { product_category, make, model, notes, status } = req.body;
    try {
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

router.patch('/:id/quoted', async (req, res) => {
    const { quoted_from_vendor } = req.body;
    try {
        await pool.query('UPDATE leads SET quoted_from_vendor = $1 WHERE id = $2', [quoted_from_vendor, req.params.id]);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM leads WHERE id = $1', [req.params.id]);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;