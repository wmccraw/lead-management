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
    const { name, company, email, phone, product_category, make, model, notes, status, quoted_from_vendor } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO leads (name, company, email, phone, product_category, make, model, notes, status, quoted_from_vendor, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING *',
            [name, company, email, phone, product_category, make, model, notes, status, quoted_from_vendor]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, company, email, phone, product_category, make, model, notes, status, quoted_from_vendor } = req.body;
    try {
        await pool.query(
            'UPDATE leads SET name = $1, company = $2, email = $3, phone = $4, product_category = $5, make = $6, model = $7, notes = $8, status = $9, quoted_from_vendor = $10 WHERE id = $11',
            [name, company, email, phone, product_category, make, model, notes, status, quoted_from_vendor, id]
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

module.exports = router;