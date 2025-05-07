const express = require('express');
     const { Pool } = require('pg');
     const cors = require('cors');
     const path = require('path');

     const app = express();
     const port = process.env.PORT || 3000;

     // Middleware
     app.use(cors());
     app.use(express.json());
     app.use(express.static(path.join(__dirname, '../public')));

     // PostgreSQL connection
     const pool = new Pool({
       connectionString: process.env.DATABASE_URL,
       ssl: { rejectUnauthorized: false }
     });

     // Connect to database
     pool.connect()
       .then(() => console.log('Connected to PostgreSQL database.'))
       .catch(err => console.error('Database connection error:', err));

     // Initialize Database Schema
     async function initializeDatabase() {
       try {
         // Create Leads Table
         await pool.query(`
           CREATE TABLE IF NOT EXISTS leads (
             id SERIAL PRIMARY KEY,
             customer_name VARCHAR(255) NOT NULL,
             company VARCHAR(255),
             customer_email VARCHAR(255),
             customer_phone VARCHAR(50),
             customer_street VARCHAR(255),
             customer_city VARCHAR(100),
             customer_state VARCHAR(100),
             customer_zip VARCHAR(20),
             categories VARCHAR(255),
             make VARCHAR(255),
             model VARCHAR(255),
             machines_notes TEXT,
             status VARCHAR(50),
             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
           );
         `);

         // Create Customers Table
         await pool.query(`
           CREATE TABLE IF NOT EXISTS customers (
             id SERIAL PRIMARY KEY,
             customer_name VARCHAR(255) NOT NULL,
             company VARCHAR(255),
             customer_email VARCHAR(255),
             customer_phone VARCHAR(50),
             customer_street VARCHAR(255),
             customer_city VARCHAR(100),
             customer_state VARCHAR(100),
             customer_zip VARCHAR(20),
             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
           );
         `);

         // Remove duplicate customer_name entries (keep latest by id)
         await pool.query(`
           DELETE FROM customers 
           WHERE id NOT IN (
             SELECT MAX(id) 
             FROM customers 
             GROUP BY customer_name
           );
         `);

         // Add unique constraint to customer_name
         await pool.query(`
           DO $$
           BEGIN
             IF NOT EXISTS (
               SELECT 1 
               FROM pg_constraint 
               WHERE conname = 'customers_customer_name_key'
             ) THEN
               ALTER TABLE customers 
               ADD CONSTRAINT customers_customer_name_key UNIQUE (customer_name);
             END IF;
           END
           $$;
         `);

         console.log('Database schema initialized successfully.');
       } catch (err) {
         console.error('Error initializing database:', err.message, err.stack);
       }
     }

     // Run initialization
     initializeDatabase();

     // Get all leads
     app.get('/api/leads', async (req, res) => {
       try {
         const result = await pool.query('SELECT * FROM leads ORDER BY id ASC');
         res.json(result.rows);
       } catch (err) {
         console.error('Error fetching leads:', err.message, err.stack);
         res.status(500).json({ error: 'Internal server error', details: err.message });
       }
     });

     // Create a lead
     app.post('/api/leads', async (req, res) => {
       const {
         customerName, company, customerEmail, customerPhone,
         customerStreet, customerCity, customerState, customerZip,
         categories, make, model, machinesNotes, status
       } = req.body;

       try {
         // Insert or update customer
         const customerResult = await pool.query(`
           INSERT INTO customers (customer_name, company, customer_email, customer_phone, customer_street, customer_city, customer_state, customer_zip)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (customer_name) DO UPDATE
           SET company = EXCLUDED.company,
               customer_email = EXCLUDED.customer_email,
               customer_phone = EXCLUDED.customer_phone,
               customer_street = EXCLUDED.customer_street,
               customer_city = EXCLUDED.customer_city,
               customer_state = EXCLUDED.customer_state,
               customer_zip = EXCLUDED.customer_zip
           RETURNING id
         `, [customerName, company, customerEmail, customerPhone, customerStreet, customerCity, customerState, customerZip]);

         // Insert lead
         const leadResult = await pool.query(`
           INSERT INTO leads (
             customer_name, company, customer_email, customer_phone,
             customer_street, customer_city, customer_state, customer_zip,
             categories, make, model, machines_notes, status
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING *
         `, [
           customerName, company, customerEmail, customerPhone,
           customerStreet, customerCity, customerState, customerZip,
           categories, make, model, machinesNotes, status
         ]);

         res.status(201).json(leadResult.rows[0]);
       } catch (err) {
         console.error('Error creating lead:', err.message, err.stack);
         res.status(500).json({ error: 'Internal server error', details: err.message });
       }
     });

     // Update a lead
     app.put('/api/leads/:id', async (req, res) => {
       const { id } = req.params;
       const {
         customerName, company, customerEmail, customerPhone,
         customerStreet, customerCity, customerState, customerZip,
         categories, make, model, machinesNotes, status
       } = req.body;

       try {
         // Get existing lead to check status and created_at
         const existingLead = await pool.query('SELECT status, created_at FROM leads WHERE id = $1', [id]);
         if (existingLead.rows.length === 0) {
           return res.status(404).json({ error: 'Lead not found' });
         }

         // Determine created_at value
         const createdAtValue = status !== existingLead.rows[0].status ? new Date() : existingLead.rows[0].created_at;

         // Update customer
         await pool.query(`
           INSERT INTO customers (customer_name, company, customer_email, customer_phone, customer_street, customer_city, customer_state, customer_zip)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (customer_name) DO UPDATE
           SET company = EXCLUDED.company,
               customer_email = EXCLUDED.customer_email,
               customer_phone = EXCLUDED.customer_phone,
               customer_street = EXCLUDED.customer_street,
               customer_city = EXCLUDED.customer_city,
               customer_state = EXCLUDED.customer_state,
               customer_zip = EXCLUDED.customer_zip
         `, [customerName, company, customerEmail, customerPhone, customerStreet, customerCity, customerState, customerZip]);

         // Update lead
         const result = await pool.query(`
           UPDATE leads
           SET customer_name = $1,
               company = $2,
               customer_email = $3,
               customer_phone = $4,
               customer_street = $5,
               customer_city = $6,
               customer_state = $7,
               customer_zip = $8,
               categories = $9,
               make = $10,
               model = $11,
               machines_notes = $12,
               status = $13,
               created_at = $14
           WHERE id = $15
           RETURNING *
         `, [
           customerName, company, customerEmail, customerPhone,
           customerStreet, customerCity, customerState, customerZip,
           categories, make, model, machinesNotes, status,
           createdAtValue, id
         ]);

         if (result.rows.length === 0) {
           return res.status(404).json({ error: 'Lead not found' });
         }

         res.json(result.rows[0]);
       } catch (err) {
         console.error('Error updating lead:', err.message, err.stack);
         res.status(500).json({ error: 'Internal server error', details: err.message });
       }
     });

     // Delete a lead
     app.delete('/api/leads/:id', async (req, res) => {
       const { id } = req.params;
       try {
         const result = await pool.query('DELETE FROM leads WHERE id = $1 RETURNING *', [id]);
         if (result.rows.length === 0) {
           return res.status(404).json({ error: 'Lead not found' });
         }
         res.json({ message: 'Lead deleted' });
       } catch (err) {
         console.error('Error deleting lead:', err.message, err.stack);
         res.status(500).json({ error: 'Internal server error', details: err.message });
       }
     });

     // Get all customers
     app.get('/api/customers', async (req, res) => {
       try {
         const result = await pool.query('SELECT * FROM customers ORDER BY id ASC');
         res.json(result.rows);
       } catch (err) {
         console.error('Error fetching customers:', err.message, err.stack);
         res.status(500).json({ error: 'Internal server error', details: err.message });
       }
     });

     // Create a customer
     app.post('/api/customers', async (req, res) => {
       const {
         customerName, company, customerEmail, customerPhone,
         customerStreet, customerCity, customerState, customerZip
       } = req.body;

       try {
         const result = await pool.query(`
           INSERT INTO customers (
             customer_name, company, customer_email, customer_phone,
             customer_street, customer_city, customer_state, customer_zip
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *
         `, [
           customerName, company, customerEmail, customerPhone,
           customerStreet, customerCity, customerState, customerZip
         ]);
         res.status(201).json(result.rows[0]);
       } catch (err) {
         console.error('Error creating customer:', err.message, err.stack);
         res.status(500).json({ error: 'Internal server error', details: err.message });
       }
     });

     // Update a customer
     app.put('/api/customers/:id', async (req, res) => {
       const { id } = req.params;
       const {
         customerName, company, customerEmail, customerPhone,
         customerStreet, customerCity, customerState, customerZip
       } = req.body;

       try {
         const result = await pool.query(`
           UPDATE customers
           SET customer_name = $1,
               company = $2,
               customer_email = $3,
               customer_phone = $4,
               customer_street = $5,
               customer_city = $6,
               customer_state = $7,
               customer_zip = $8
           WHERE id = $9
           RETURNING *
         `, [
           customerName, company, customerEmail, customerPhone,
           customerStreet, customerCity, customerState, customerZip, id
         ]);

         if (result.rows.length === 0) {
           return res.status(404).json({ error: 'Customer not found' });
         }

         res.json(result.rows[0]);
       } catch (err) {
         console.error('Error updating customer:', err.message, err.stack);
         res.status(500).json({ error: 'Internal server error', details: err.message });
       }
     });

     // Delete a customer
     app.delete('/api/customers/:id', async (req, res) => {
       const { id } = req.params;
       try {
         const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);
         if (result.rows.length === 0) {
           return res.status(404).json({ error: 'Customer not found' });
         }
         res.json({ message: 'Customer deleted' });
       } catch (err) {
         console.error('Error deleting customer:', err.message, err.stack);
         res.status(500).json({ error: 'Internal server error', details: err.message });
       }
     });

     // Start server
     app.listen(port, () => {
       console.log(`Server running at http://0.0.0.0:${port}`);
     });