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
    const {
        part_number, serial_number, part_name, description, category, manufacturer,
        model_compatibility, quantity, location, stock_status, reorder_point,
        supplier_name, supplier_part_number, supplier_contact, supplier_cost,
        latest_lead_time, retail_price, last_sold_date, sales_frequency, condition,
        image_url, attachment_files, tags, custom_attributes
    } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO inventory (part_number, serial_number, part_name, description, category, manufacturer, model_compatibility, quantity, location, stock_status, reorder_point, supplier_name, supplier_part_number, supplier_contact, supplier_cost, latest_lead_time_received, retail_price, last_sold_date, sales_frequency, condition, image_url, attachment_files, tags, custom_attributes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24) RETURNING id',
            [part_number, serial_number, part_name, description, category, manufacturer, model_compatibility, quantity, location, stock_status, reorder_point, supplier_name, supplier_part_number, supplier_contact, supplier_cost, latest_lead_time, retail_price, last_sold_date, sales_frequency, condition, image_url, attachment_files, tags, custom_attributes]
        );
        res.status(201).json({ id: result.rows[0].id, ...req.body });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const {
        part_number, serial_number, part_name, description, category, manufacturer,
        model_compatibility, quantity, location, stock_status, reorder_point,
        supplier_name, supplier_part_number, supplier_contact, supplier_cost,
        latest_lead_time, retail_price, last_sold_date, sales_frequency, condition,
        image_url, attachment_files, tags, custom_attributes
    } = req.body;
    try {
        await pool.query(
            'UPDATE inventory SET part_number = $1, serial_number = $2, part_name = $3, description = $4, category = $5, manufacturer = $6, model_compatibility = $7, quantity = $8, location = $9, stock_status = $10, reorder_point = $11, supplier_name = $12, supplier_part_number = $13, supplier_contact = $14, supplier_cost = $15, latest_lead_time_received = $16, retail_price = $17, last_sold_date = $18, sales_frequency = $19, condition = $20, image_url = $21, attachment_files = $22, tags = $23, custom_attributes = $24 WHERE id = $25',
            [part_number, serial_number, part_name, description, category, manufacturer, model_compatibility, quantity, location, stock_status, reorder_point, supplier_name, supplier_part_number, supplier_contact, supplier_cost, latest_lead_time, retail_price, last_sold_date, sales_frequency, condition, image_url, attachment_files, tags, custom_attributes, id]
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
        await pool.query('DELETE FROM inventory WHERE id = $1', [id]);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.get('/csv', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventory');
        const headers = ['id', 'part_number', 'serial_number', 'part_name', 'description', 'category', 'manufacturer', 'model_compatibility', 'quantity', 'location', 'stock_status', 'reorder_point', 'supplier_name', 'supplier_part_number', 'supplier_contact', 'supplier_cost', 'latest_lead_time_received', 'retail_price', 'last_sold_date', 'sales_frequency', 'condition', 'image_url', 'attachment_files', 'date_added', 'last_updated', 'usage_rate', 'inventory_turnover', 'tags', 'custom_attributes'];
        let csv = headers.join(',') + '\n';
        result.rows.forEach(row => {
            const values = headers.map(h => {
                const val = row[h];
                return val !== null && val !== undefined ? `"${val.toString().replace(/"/g, '""')}"` : '';
            });
            csv += values.join(',') + '\n';
        });
        res.header('Content-Type', 'text/csv');
        res.attachment('inventory.csv');
        res.send(csv);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;