const express = require('express');
const router = express.Router();
const pool = require('../db'); // Use shared pool

// Get all inventory items
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventory ORDER BY date_added DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Get a single inventory item by ID
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventory WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).send('Item not found');
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Create a new inventory item
router.post('/', async (req, res) => {
    const {
        part_number, serial_number, part_name, description, category, manufacturer, model_compatibility,
        quantity_in_stock, location, stock_status, reorder_point, supplier_name, supplier_part_number,
        supplier_contact, supplier_cost, latest_lead_time_received, retail_price, last_sold_date,
        sales_frequency, condition, image_url, attachment_files, usage_rate, inventory_turnover
    } = req.body;
    // Basic validation
    if (!part_number || !part_name) {
        return res.status(400).send('Part number and part name are required');
    }
    try {
        const result = await pool.query(
            `INSERT INTO inventory (
                part_number, serial_number, part_name, description, category, manufacturer, model_compatibility,
                quantity_in_stock, location, stock_status, reorder_point, supplier_name, supplier_part_number,
                supplier_contact, supplier_cost, latest_lead_time_received, retail_price, last_sold_date,
                sales_frequency, condition, image_url, attachment_files, usage_rate, inventory_turnover, date_added, last_updated
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW(), NOW())
            RETURNING *`,
            [
                part_number, serial_number, part_name, description, category, manufacturer, model_compatibility,
                quantity_in_stock, location, stock_status, reorder_point, supplier_name, supplier_part_number,
                supplier_contact, supplier_cost, latest_lead_time_received, retail_price, last_sold_date,
                sales_frequency, condition, image_url, attachment_files, usage_rate, inventory_turnover
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Update an inventory item
router.put('/:id', async (req, res) => {
    const {
        part_number, serial_number, part_name, description, category, manufacturer, model_compatibility,
        quantity_in_stock, location, stock_status, reorder_point, supplier_name, supplier_part_number,
        supplier_contact, supplier_cost, latest_lead_time_received, retail_price, last_sold_date,
        sales_frequency, condition, image_url, attachment_files, usage_rate, inventory_turnover
    } = req.body;
    if (!part_number || !part_name) {
        return res.status(400).send('Part number and part name are required');
    }
    try {
        await pool.query(
            `UPDATE inventory SET
                part_number = $1, serial_number = $2, part_name = $3, description = $4, category = $5,
                manufacturer = $6, model_compatibility = $7, quantity_in_stock = $8, location = $9,
                stock_status = $10, reorder_point = $11, supplier_name = $12, supplier_part_number = $13,
                supplier_contact = $14, supplier_cost = $15, latest_lead_time_received = $16, retail_price = $17,
                last_sold_date = $18, sales_frequency = $19, condition = $20, image_url = $21,
                attachment_files = $22, usage_rate = $23, inventory_turnover = $24, last_updated = NOW()
            WHERE id = $25`,
            [
                part_number, serial_number, part_name, description, category, manufacturer, model_compatibility,
                quantity_in_stock, location, stock_status, reorder_point, supplier_name, supplier_part_number,
                supplier_contact, supplier_cost, latest_lead_time_received, retail_price, last_sold_date,
                sales_frequency, condition, image_url, attachment_files, usage_rate, inventory_turnover,
                req.params.id
            ]
        );
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Delete an inventory item
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