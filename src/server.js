const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const app = express();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Initialize database with calendar table
async function initializeDatabase() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS calendar (
            id SERIAL PRIMARY KEY,
            date DATE NOT NULL,
            absentee VARCHAR(50)
        );
    `;
    try {
        await pool.query(createTableQuery);
        console.log('Calendar table is ready.');
    } catch (err) {
        console.error('Error creating calendar table:', err.stack);
    }
}

initializeDatabase();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/leads', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM leads');
        res.json(result.rows);
    } catch (err) {
        console.error('Leads fetch error:', err.stack);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/leads/save', async (req, res) => {
    const { id, name, company, email, phone, product_category, make, model, notes, status } = req.body;
    try {
        if (id) {
            await pool.query(
                'UPDATE leads SET name=$1, company=$2, email=$3, phone=$4, product_category=$5, make=$6, model=$7, notes=$8, status=$9, updated_at=NOW() WHERE id=$10',
                [name, company, email, phone, product_category, make, model, notes, status, id]
            );
        } else {
            await pool.query(
                'INSERT INTO leads (name, company, email, phone, product_category, make, model, notes, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
                [name, company, email, phone, product_category, make, model, notes, status]
            );
        }
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Leads save error:', err.stack);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/customers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM customers');
        res.json(result.rows);
    } catch (err) {
        console.error('Customers fetch error:', err.stack);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/customers/save', async (req, res) => {
    const { name, company, email, phone } = req.body;
    try {
        await pool.query(
            'INSERT INTO customers (name, company, email, phone) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, company, email, phone]
        );
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Customers save error:', err.stack);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/calendar', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM calendar');
        res.json(result.rows);
    } catch (err) {
        console.error('Calendar fetch error:', err.stack);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/calendar/save', async (req, res) => {
    const { date, absentee } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO calendar (date, absentee) VALUES ($1, $2) RETURNING *',
            [date || null, absentee || null]
        );
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Calendar save error:', err.stack);
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

app.delete('/api/calendar/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM calendar WHERE id=$1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Calendar delete error:', err.stack);
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

app.get('/api/inventory', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventory');
        res.json(result.rows);
    } catch (err) {
        console.error('Inventory fetch error:', err.stack);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/inventory/save', async (req, res) => {
    const {
        id, part_number, serial_number, part_name, description, category, manufacturer,
        model_compatibility, quantity_in_stock, location, stock_status, reorder_point,
        supplier_name, supplier_part_number, supplier_contact, supplier_cost,
        latest_lead_time, retail_price, last_sold_date, sales_frequency, condition,
        image_url, attachment_files, usage_rate, inventory_turnover
    } = req.body;
    try {
        if (id) {
            await pool.query(
                'UPDATE inventory SET part_number=$1, serial_number=$2, part_name=$3, description=$4, category=$5, manufacturer=$6, model_compatibility=$7, quantity_in_stock=$8, location=$9, stock_status=$10, reorder_point=$11, supplier_name=$12, supplier_part_number=$13, supplier_contact=$14, supplier_cost=$15, latest_lead_time=$16, retail_price=$17, last_sold_date=$18, sales_frequency=$19, condition=$20, image_url=$21, attachment_files=$22, usage_rate=$23, inventory_turnover=$24, updated_at=NOW() WHERE id=$25',
                [part_number, serial_number, part_name, description, category, manufacturer, model_compatibility, quantity_in_stock, location, stock_status, reorder_point, supplier_name, supplier_part_number, supplier_contact, supplier_cost, latest_lead_time, retail_price, last_sold_date, sales_frequency, condition, image_url, attachment_files, usage_rate, inventory_turnover, id]
            );
        } else {
            await pool.query(
                'INSERT INTO inventory (part_number, serial_number, part_name, description, category, manufacturer, model_compatibility, quantity_in_stock, location, stock_status, reorder_point, supplier_name, supplier_part_number, supplier_contact, supplier_cost, latest_lead_time, retail_price, last_sold_date, sales_frequency, condition, image_url, attachment_files, usage_rate, inventory_turnover) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24) RETURNING *',
                [part_number, serial_number, part_name, description, category, manufacturer, model_compatibility, quantity_in_stock, location, stock_status, reorder_point, supplier_name, supplier_part_number, supplier_contact, supplier_cost, latest_lead_time, retail_price, last_sold_date, sales_frequency, condition, image_url, attachment_files, usage_rate, inventory_turnover]
            );
        }
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Inventory save error:', err.stack);
        res.status(500).json({ error: 'Database error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});