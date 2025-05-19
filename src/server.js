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
        await pool.query('DROP TABLE IF EXISTS calendar_events CASCADE');
        await pool.query('DROP TABLE IF EXISTS inventory CASCADE');

        // Create customers table
        await pool.query(`
            CREATE TABLE customers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                company VARCHAR(100),
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20)
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

        // Create calendar_events table
        await pool.query(`
            CREATE TABLE calendar_events (
                id SERIAL PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                event_date DATE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Create inventory table
        await pool.query(`
            CREATE TABLE inventory (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                category VARCHAR(50),
                quantity INTEGER NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
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