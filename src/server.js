const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs').promises;
const leadsRoutes = require('./routes/leads');
const customersRoutes = require('./routes/customers');
const calendarRoutes = require('./routes/calendar');
const inventoryRoutes = require('./routes/inventory');

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Run migration on startup
(async () => {
    try {
        const sql = await fs.readFile('init.sql', 'utf8');
        await pool.query(sql);
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Database initialization failed:', err);
    }
})();

app.use('/api/leads', leadsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/inventory', inventoryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));