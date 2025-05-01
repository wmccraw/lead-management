const express = require('express');
     const sqlite3 = require('sqlite3').verbose();
     const cors = require('cors');
     const jwt = require('jsonwebtoken');
     const bcrypt = require('bcryptjs');
     const path = require('path');

     const app = express();
     app.use(cors());
     app.use(express.json());
     app.use(express.static(path.join(__dirname, '../public')));

     // SQLite database connection
     const db = new sqlite3.Database('./database.sqlite', (err) => {
       if (err) {
         console.error('Database connection error:', err);
       } else {
         console.log('Connected to SQLite database.');
       }
     });

     // Create tables
     db.serialize(() => {
       db.run(`
         CREATE TABLE IF NOT EXISTS leads (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
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
           created_at DATETIME DEFAULT CURRENT_TIMESTAMP
         )
       `);
       db.run(`
         CREATE TABLE IF NOT EXISTS categories (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           name TEXT UNIQUE
         )
       `);
       db.run(`
         CREATE TABLE IF NOT EXISTS makes (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           name TEXT UNIQUE
         )
       `);
       db.run(`
         CREATE TABLE IF NOT EXISTS models (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           name TEXT UNIQUE
         )
       `);
       db.run(`
         CREATE TABLE IF NOT EXISTS users (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           username TEXT UNIQUE,
           password TEXT
         )
       `);
     });

     // Initialize users
     const initializeUsers = async () => {
       const users = [
         { username: 'wilson', password: 'wilson123' },
         { username: 'coworker1', password: 'coworker1pass' },
         { username: 'coworker2', password: 'coworker2pass' },
         { username: 'coworker3', password: 'coworker3pass' }
       ];
       for (const user of users) {
         const hashedPassword = await bcrypt.hash(user.password, 10);
         db.run(
           `INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`,
           [user.username, hashedPassword],
           (err) => {
             if (err) console.error('Error inserting user:', err);
           }
         );
       }
     };
     initializeUsers();

     // JWT authentication middleware
     const authenticate = (req, res, next) => {
       const token = req.headers.authorization?.split(' ')[1];
       if (!token) return res.status(401).json({ error: 'No token provided' });
       try {
         const decoded = jwt.verify(token, 'your-secure-jwt-secret-key-12345');
         req.user = decoded;
         next();
       } catch (err) {
         res.status(401).json({ error: 'Invalid token' });
       }
     };

     // Login endpoint
     app.post('/api/login', (req, res) => {
       const { username, password } = req.body;
       db.get(
         `SELECT * FROM users WHERE username = ?`,
         [username],
         async (err, user) => {
           if (err) return res.status(500).json({ error: 'Database error' });
           if (!user || !(await bcrypt.compare(password, user.password))) {
             return res.status(401).json({ error: 'Invalid credentials' });
           }
           const token = jwt.sign({ userId: user.id }, 'your-secure-jwt-secret-key-12345', { expiresIn: '1h' });
           res.json({ token });
         }
       );
     });

     // Apply authentication to API routes
     app.use('/api/leads', authenticate);
     app.use('/api/categories', authenticate);
     app.use('/api/makes', authenticate);
     app.use('/api/models', authenticate);

     // Lead routes
     app.get('/api/leads', (req, res) => {
       db.all('SELECT * FROM leads', [], (err, rows) => {
         if (err) return res.status(500).json({ error: err.message });
         res.json(rows);
       });
     });

     app.post('/api/leads', (req, res) => {
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

       db.run(
         `INSERT INTO leads (
           categories, make, model, company, customer_name, customer_email,
           customer_phone, customer_street, customer_city, customer_state,
           customer_zip, machines_notes, status
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
         ],
         function (err) {
           if (err) return res.status(500).json({ error: err.message });
           res.json({ message: 'Lead added successfully', id: this.lastID });
         }
       );
     });

     app.put('/api/leads/:id', (req, res) => {
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

       db.run(
         `UPDATE leads SET
           categories = ?,
           make = ?,
           model = ?,
           company = ?,
           customer_name = ?,
           customer_email = ?,
           customer_phone = ?,
           customer_street = ?,
           customer_city = ?,
           customer_state = ?,
           customer_zip = ?,
           machines_notes = ?,
           status = ?
         WHERE id = ?`,
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
           status,
           id
         ],
         (err) => {
           if (err) return res.status(500).json({ error: err.message });
           res.json({ message: 'Lead updated successfully' });
         }
       );
     });

     app.delete('/api/leads/:id', (req, res) => {
       const { id } = req.params;
       db.run('DELETE FROM leads WHERE id = ?', id, (err) => {
         if (err) return res.status(500).json({ error: err.message });
         res.json({ message: 'Lead deleted successfully' });
       });
     });

     // Category routes
     app.get('/api/categories', (req, res) => {
       db.all('SELECT name FROM categories', [], (err, rows) => {
         if (err) return res.status(500).json({ error: err.message });
         res.json(rows.map(row => row.name));
       });
     });

     app.post('/api/categories', (req, res) => {
       const { name } = req.body;
       if (!name) return res.status(400).json({ error: 'Category name is required' });
       db.run('INSERT INTO categories (name) VALUES (?)', [name], (err) => {
         if (err) return res.status(500).json({ error: err.message });
         res.json({ message: 'Category added successfully' });
       });
     });

     app.delete('/api/categories/:name', (req, res) => {
       const { name } = req.params;
       db.get('SELECT * FROM leads WHERE categories LIKE ?', [`%${name}%`], (err, row) => {
         if (err) return res.status(500).json({ error: err.message });
         if (row) return res.status(400).json({ error: 'Cannot delete category used in leads' });
         db.run('DELETE FROM categories WHERE name = ?', [name], (err) => {
           if (err) return res.status(500).json({ error: err.message });
           res.json({ message: 'Category deleted successfully' });
         });
       });
     });

     // Make routes
     app.get('/api/makes', (req, res) => {
       db.all('SELECT name FROM makes', [], (err, rows) => {
         if (err) return res.status(500).json({ error: err.message });
         res.json(rows.map(row => row.name));
       });
     });

     app.post('/api/makes', (req, res) => {
       const { name } = req.body;
       if (!name) return res.status(400).json({ error: 'Make name is required' });
       db.run('INSERT INTO makes (name) VALUES (?)', [name], (err) => {
         if (err) return res.status(500).json({ error: err.message });
         res.json({ message: 'Make added successfully' });
       });
     });

     app.delete('/api/makes/:name', (req, res) => {
       const { name } = req.params;
       db.get('SELECT * FROM leads WHERE make = ?', [name], (err, row) => {
         if (err) return res.status(500).json({ error: err.message });
         if (row) return res.status(400).json({ error: 'Cannot delete make used in leads' });
         db.run('DELETE FROM makes WHERE name = ?', [name], (err) => {
           if (err) return res.status(500).json({ error: err.message });
           res.json({ message: 'Make deleted successfully' });
         });
       });
     });

     // Model routes
     app.get('/api/models', (req, res) => {
       db.all('SELECT name FROM models', [], (err, rows) => {
         if (err) return res.status(500).json({ error: err.message });
         res.json(rows.map(row => row.name));
       });
     });

     app.post('/api/models', (req, res) => {
       const { name } = req.body;
       if (!name) return res.status(400).json({ error: 'Model name is required' });
       db.run('INSERT INTO models (name) VALUES (?)', [name], (err) => {
         if (err) return res.status(500).json({ error: err.message });
         res.json({ message: 'Model added successfully' });
       });
     });

     app.delete('/api/models/:name', (req, res) => {
       const { name } = req.params;
       db.get('SELECT * FROM leads WHERE model = ?', [name], (err, row) => {
         if (err) return res.status(500).json({ error: err.message });
         if (row) return res.status(400).json({ error: 'Cannot delete model used in leads' });
         db.run('DELETE FROM models WHERE name = ?', [name], (err) => {
           if (err) return res.status(500).json({ error: err.message });
           res.json({ message: 'Model deleted successfully' });
         });
       });
     });

     // Start server
     const port = process.env.PORT || 3000;
     app.listen(port, '0.0.0.0', () => {
       console.log(`Server running at http://0.0.0.0:${port}`);
     });