const express = require('express');
const { Pool } = require('pg');
const leadsRouter = require('./routes/leads');
const customersRouter = require('./routes/customers');
const calendarRouter = require('./routes/calendar');
const inventoryRouter = require('./routes/inventory');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Run migrations on startup
(async () => {
    try {
        // Drop tables if they exist
        await pool.query('DROP TABLE IF EXISTS leads CASCADE');
        await pool.query('DROP TABLE IF EXISTS customers CASCADE');
        await pool.query('DROP TABLE IF EXISTS calendar_days CASCADE');
        await pool.query('DROP TABLE IF EXISTS inventory CASCADE');

        // Create customers table
        await pool.query(`
            CREATE TABLE customers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                company VARCHAR(100),
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20),
                date_added TIMESTAMP DEFAULT NOW(),
                last_updated TIMESTAMP DEFAULT NOW()
            )
        `);

        // Create leads table
        await pool.query(`
            CREATE TABLE leads (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER REFERENCES customers(id),
                product_category VARCHAR(50),
                make VARCHAR(50),
                model VARCHAR(50),
                notes TEXT,
                status VARCHAR(50) DEFAULT 'Pending',
                quoted_from_vendor BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Create calendar_days table with note_type
        await pool.query(`
            CREATE TABLE calendar_days (
                id SERIAL PRIMARY KEY,
                date DATE NOT NULL UNIQUE,
                notes TEXT,
                note_type VARCHAR(50) DEFAULT 'General',
                out_status BOOLEAN DEFAULT FALSE,
                out_start_date DATE,
                out_end_date DATE,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Create inventory table
        await pool.query(`
            CREATE TABLE inventory (
                id SERIAL PRIMARY KEY,
                part_number VARCHAR(50) NOT NULL,
                serial_number VARCHAR(50) NOT NULL,
                part_name VARCHAR(100),
                description TEXT,
                category VARCHAR(50) NOT NULL,
                manufacturer VARCHAR(100),
                model_compatibility TEXT,
                quantity_in_stock INTEGER NOT NULL,
                location VARCHAR(100),
                stock_status VARCHAR(50),
                reorder_point INTEGER,
                supplier_name VARCHAR(100) NOT NULL,
                supplier_part_number VARCHAR(50),
                supplier_contact VARCHAR(100),
                supplier_cost DECIMAL(10, 2),
                latest_lead_time_received VARCHAR(50),
                retail_price DECIMAL(10, 2),
                last_sold_date DATE,
                sales_frequency VARCHAR(50),
                condition VARCHAR(50),
                image_url TEXT,
                attachment_files TEXT,
                date_added TIMESTAMP DEFAULT NOW(),
                last_updated TIMESTAMP DEFAULT NOW(),
                usage_rate DECIMAL(10, 2),
                inventory_turnover DECIMAL(10, 2),
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        console.log('Database schema updated successfully');
    } catch (err) {
        console.error('Error running migrations:', err);
    }
})();

// Mount API routes
app.use('/api/leads', leadsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/inventory', inventoryRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});