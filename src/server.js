const express = require('express');
       const { Pool } = require('pg');
       const cors = require('cors');
       const path = require('path');

       const app = express();
       app.use(cors());
       app.use(express.json());
       app.use(express.static(path.join(__dirname, '../public')));

       // PostgreSQL connection
       const pool = new Pool({
         connectionString: process.env.DATABASE_URL,
         ssl: { rejectUnauthorized: false }
       });

       // Create tables
       const initializeDatabase = async () => {
         try {
           await pool.query(`
             CREATE TABLE IF NOT EXISTS leads (
               id SERIAL PRIMARY KEY,
               categories TEXT,
               make TEXT,
               model TEXT,
               company TEXT,
               customer_name TEXT NOT NULL,
               customer_email TEXT,
               customer_phone TEXT,
               customer_street TEXT,
               customer_city TEXT,
               customer_state TEXT,
               customer_zip TEXT,
               machines_notes TEXT,
               status TEXT,
               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
             )
           `);
           await pool.query(`
             CREATE TABLE IF NOT EXISTS categories (
               id SERIAL PRIMARY KEY,
               name TEXT UNIQUE
             )
           `);
           await pool.query(`
             CREATE TABLE IF NOT EXISTS makes (
               id SERIAL PRIMARY KEY,
               name TEXT UNIQUE
             )
           `);
           await pool.query(`
             CREATE TABLE IF NOT EXISTS models (
               id SERIAL PRIMARY KEY,
               name TEXT UNIQUE
             )
           `);
           console.log('Connected to PostgreSQL database.');
         } catch (err) {
           console.error('Database connection error:', err);
           throw err;
         }
       };

       // Initialize database
       initializeDatabase().catch(err => console.error('Initialization error:', err));

       // Lead routes
       app.get('/api/leads', async (req, res) => {
         try {
           const { rows } = await pool.query('SELECT * FROM leads');
           res.json(rows);
         } catch (err) {
           res.status(500).json({ error: err.message });
         }
       });

       app.post('/api/leads', async (req, res) => {
         const {
           categories,
           make,
           model,
           company,
           customerName,
           customerEmail,
           customerPhone,
           customerStreet,
           customerCity,
           customerState,
           customerZip,
           machinesNotes,
           status
         } = req.body;

         if (!customerName) {
           return res.status(400).json({ error: 'Customer Name is required' });
         }

         try {
           const { rows } = await pool.query(
             `INSERT INTO leads (
               categories, make, model, company, customer_name, customer_email,
               customer_phone, customer_street, customer_city, customer_state,
               customer_zip, machines_notes, status
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
             RETURNING id`,
             [
               Array.isArray(categories) ? categories.join(',') : categories,
               make,
               model,
               company,
               customerName,
               customerEmail,
               customerPhone,
               customerStreet,
               customerCity,
               customerState,
               customerZip,
               machinesNotes,
               status
             ]
           );
           res.json({ message: 'Lead added successfully', id: rows[0].id });
         } catch (err) {
           res.status(500).json({ error: err.message });
         }
       });

       app.put('/api/leads/:id', async (req, res) => {
         const { id } = req.params;
         const {
           categories,
           make,
           model,
           company,
           customerName,
           customerEmail,
           customerPhone,
           customerStreet,
           customerCity,
           customerState,
           customerZip,
           machinesNotes,
           status
         } = req.body;

         if (!customerName) {
           return res.status(400).json({ error: 'Customer Name is required' });
         }

         try {
           const updateQuery = status === 'Quoted' ? 
             `UPDATE leads SET
               categories = $1,
               make = $2,
               model = $3,
               company = $4,
               customer_name = $5,
               customer_email = $6,
               customer_phone = $7,
               customer_street = $8,
               customer_city = $9,
               customer_state = $10,
               customer_zip = $11,
               machines_notes = $12,
               status = $13,
               created_at = CURRENT_TIMESTAMP
             WHERE id = $14` :
             `UPDATE leads SET
               categories = $1,
               make = $2,
               model = $3,
               company = $4,
               customer_name = $5,
               customer_email = $6,
               customer_phone = $7,
               customer_street = $8,
               customer_city = $9,
               customer_state = $10,
               customer_zip = $11,
               machines_notes = $12,
               status = $13
             WHERE id = $14`;

           await pool.query(updateQuery, [
               Array.isArray(categories) ? categories.join(',') : categories,
               make,
               model,
               company,
               customerName,
               customerEmail,
               customerPhone,
               customerStreet,
               customerCity,
               customerState,
               customerZip,
               machinesNotes,
               status,
               id
             ]);
           res.json({ message: 'Lead updated successfully' });
         } catch (err) {
           res.status(500).json({ error: err.message });
         }
       });

       app.delete('/api/leads/:id', async (req, res) => {
         const { id } = req.params;
         try {
           await pool.query('DELETE FROM leads WHERE id = $1', [id]);
           res.json({ message: 'Lead deleted successfully' });
         } catch (err) {
           res.status(500).json({ error: err.message });
         }
       });

       // Category routes
       app.get('/api/categories', async (req, res) => {
         try {
           const { rows } = await pool.query('SELECT name FROM categories');
           res.json(rows.map(row => row.name));
         } catch (err) {
           res.status(500).json({ error: err.message });
         }
       });

       app.post('/api/categories', async (req, res) => {
         const { name } = req.body;
         if (!name) return res.status(400).json({ error: 'Category name is required' });
         try {
           await pool.query('INSERT INTO categories (name) VALUES ($1)', [name]);
           res.json({ message: 'Category added successfully' });
         } catch (err) {
           res.status(500).json({ error: err.message });
         }
       });

       app.delete('/api/categories/:name', async (req, res) => {
         const { name } = req.params;
         try {
           const { rows } = await pool.query('SELECT * FROM leads WHERE categories LIKE $1', [`%${name}%`]);
           if (rows.length > 0) {
             return res.status(400).json({ error: 'Cannot delete category used in leads' });
           }
           await pool.query('DELETE FROM categories WHERE name = $1', [name]);
           res.json({ message: 'Category deleted successfully' });
         } catch (err) {
           res.status(500).json({ error: err.message });
         }
       });

       // Make routes
       app.get('/api/makes', async (req, res) => {
         try {
           const { rows } = await pool.query('SELECT name FROM makes');
           res.json(rows.map(row => row.name));
         } catch (err) {
           res.status(500).json({ error: err.message });
         }
       });

       app.post('/api/makes', async (req, res) => {
         const { name } = req.body;
         if (!name) return res.status(400).json({ error: 'Make name is required' });
         try {
           await pool.query('INSERT INTO makes (name) VALUES ($1)', [name]);
           res.json({ message: 'Make added successfully' });
         } catch (err) {
           res.status(500).json({ error: err.message });
         }
       });

       app.delete('/api/makes/:name', async (req, res) => {
         const { name } = req.params;
         try {
           const { rows } = await pool.query('SELECT * FROM leads WHERE make = $1', [name]);
           if (rows.length > 0) {
             return res.status(400).json({ error: 'Cannot delete make used in leads' });
           }
           await pool.query('DELETE FROM makes WHERE name = $1', [name]);
           res.json({ message: 'Make deleted successfully' });
         } catch (err) {
           res.status(500).json({ error: err.message });
         }
       });

       // Model routes
       app.get('/api/models', async (req, res) => {
         try {
           const { rows } = await pool.query('SELECT name FROM models');
           res.json(rows.map(row => row.name));
         } catch (err) {
           res.status(500).json({ error: err.message });
         }
       });

       app.post('/api/models', async (req, res) => {
         const { name } = req.body;
         if (!name) return res.status(400).json({ error: 'Model name is required' });
         try {
           await pool.query('INSERT INTO models (name) VALUES ($1)', [name]);
           res.json({ message: 'Model added successfully' });
         } catch (err) {
           res.status(500).json({ error: err.message });
         }
       });

       app.delete('/api/models/:name', async (req, res) => {
         const { name } = req.params;
         try {
           const { rows } = await pool.query('SELECT * FROM leads WHERE model = $1', [name]);
           if (rows.length > 0) {
             return res.status(400).json({ error: 'Cannot delete model used in leads' });
           }
           await pool.query('DELETE FROM models WHERE name = $1', [name]);
           res.json({ message: 'Model deleted successfully' });
         } catch (err) {
           res.status(500).json({ error: err.message });
         }
       });

       // Start server
       const port = process.env.PORT || 3000;
       app.listen(port, '0.0.0.0', () => {
         console.log(`Server running at http://0.0.0.0:${port}`);
       });