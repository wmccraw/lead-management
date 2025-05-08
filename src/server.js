const express = require('express');
     const { Pool } = require('pg');
     const path = require('path');
     const app = express();
     const port = 3000;

     app.use(express.json());
     app.use(express.static(path.join(__dirname, '../public')));

     const pool = new Pool({
       connectionString: process.env.DATABASE_URL,
       ssl: { rejectUnauthorized: false }
     });

     // Default route to serve index.html
     app.get('/', (req, res) => {
       res.sendFile(path.join(__dirname, '../public/index.html'));
     });

     // Initialize database schema
     pool.query(`
       CREATE TABLE IF NOT EXISTS leads (
         id SERIAL PRIMARY KEY,
         customer_name VARCHAR(255) NOT NULL,
         company VARCHAR(255),
         customer_email VARCHAR(255),
         customer_phone VARCHAR(20),
         customer_street VARCHAR(255),
         customer_city VARCHAR(100),
         customer_state VARCHAR(100),
         customer_zip VARCHAR(20),
         categories VARCHAR(255),
         make VARCHAR(100),
         model VARCHAR(100),
         machines_notes TEXT,
         status VARCHAR(50),
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
       );
       CREATE TABLE IF NOT EXISTS customers (
         id SERIAL PRIMARY KEY,
         customer_name VARCHAR(255) NOT NULL,
         company VARCHAR(255),
         customer_email VARCHAR(255),
         customer_phone VARCHAR(20),
         customer_street VARCHAR(255),
         customer_city VARCHAR(100),
         customer_state VARCHAR(100),
         customer_zip VARCHAR(20),
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
       );
       CREATE TABLE IF NOT EXISTS calendar_notes (
         date DATE PRIMARY KEY,
         notes TEXT
       );
     `).then(() => console.log('Database schema initialized successfully.'))
       .catch(err => console.error('Error initializing database:', err));

     // Leads API
     app.get('/api/leads', async (req, res) => {
       try {
         const result = await pool.query('SELECT * FROM leads ORDER BY id');
         res.json(result.rows);
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     app.post('/api/leads', async (req, res) => {
       const { customerName, company, customerEmail, customerPhone, customerStreet, customerCity, customerState, customerZip, categories, make, model, machinesNotes, status } = req.body;
       try {
         const result = await pool.query(
           'INSERT INTO leads (customer_name, company, customer_email, customer_phone, customer_street, customer_city, customer_state, customer_zip, categories, make, model, machines_notes, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
           [customerName, company, customerEmail, customerPhone, customerStreet, customerCity, customerState, customerZip, categories, make, model, machinesNotes, status]
         );
         res.status(201).json(result.rows[0]);
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     app.put('/api/leads/:id', async (req, res) => {
       const { id } = req.params;
       const { customerName, company, customerEmail, customerPhone, customerStreet, customerCity, customerState, customerZip, categories, make, model, machinesNotes, status } = req.body;
       try {
         const result = await pool.query(
           'UPDATE leads SET customer_name = $1, company = $2, customer_email = $3, customer_phone = $4, customer_street = $5, customer_city = $6, customer_state = $7, customer_zip = $8, categories = $9, make = $10, model = $11, machines_notes = $12, status = $13, created_at = CURRENT_TIMESTAMP WHERE id = $14 RETURNING *',
           [customerName, company, customerEmail, customerPhone, customerStreet, customerCity, customerState, customerZip, categories, make, model, machinesNotes, status, id]
         );
         res.json(result.rows[0]);
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     app.delete('/api/leads/:id', async (req, res) => {
       const { id } = req.params;
       try {
         await pool.query('DELETE FROM leads WHERE id = $1', [id]);
         res.status(204).send();
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     // Customers API
     app.get('/api/customers', async (req, res) => {
       try {
         const result = await pool.query('SELECT * FROM customers ORDER BY id');
         res.json(result.rows);
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     app.post('/api/customers', async (req, res) => {
       const { customerName, company, customerEmail, customerPhone, customerStreet, customerCity, customerState, customerZip } = req.body;
       try {
         const result = await pool.query(
           'INSERT INTO customers (customer_name, company, customer_email, customer_phone, customer_street, customer_city, customer_state, customer_zip) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
           [customerName, company, customerEmail, customerPhone, customerStreet, customerCity, customerState, customerZip]
         );
         res.status(201).json(result.rows[0]);
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     app.put('/api/customers/:id', async (req, res) => {
       const { id } = req.params;
       const { customerName, company, customerEmail, customerPhone, customerStreet, customerCity, customerState, customerZip } = req.body;
       try {
         const result = await pool.query(
           'UPDATE customers SET customer_name = $1, company = $2, customer_email = $3, customer_phone = $4, customer_street = $5, customer_city = $6, customer_state = $7, customer_zip = $8 WHERE id = $9 RETURNING *',
           [customerName, company, customerEmail, customerPhone, customerStreet, customerCity, customerState, customerZip, id]
         );
         res.json(result.rows[0]);
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     app.delete('/api/customers/:id', async (req, res) => {
       const { id } = req.params;
       try {
         await pool.query('DELETE FROM customers WHERE id = $1', [id]);
         res.status(204).send();
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     // Calendar Notes API
     app.get('/api/calendar_notes', async (req, res) => {
       const { date } = req.query;
       try {
         const result = await pool.query('SELECT * FROM calendar_notes WHERE date = $1', [date]);
         res.json(result.rows[0] || { notes: '' });
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     app.post('/api/calendar_notes', async (req, res) => {
       const { date, notes } = req.body;
       try {
         const result = await pool.query(
           'INSERT INTO calendar_notes (date, notes) VALUES ($1, $2) ON CONFLICT (date) DO UPDATE SET notes = $2 RETURNING *',
           [date, notes]
         );
         res.status(201).json(result.rows[0]);
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     app.delete('/api/calendar_notes', async (req, res) => {
       const { date } = req.body;
       try {
         await pool.query('DELETE FROM calendar_notes WHERE date = $1', [date]);
         res.status(204).send();
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     app.listen(port, '0.0.0.0', () => {
       console.log(`Server running at http://0.0.0.0:${port}`);
     });

     process.on('SIGTERM', () => {
       pool.end(() => process.exit(0));
     });