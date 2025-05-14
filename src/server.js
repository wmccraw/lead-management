const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        company TEXT,
        customer_email TEXT,
        customer_phone TEXT,
        customer_street TEXT,
        customer_city TEXT,
        customer_state TEXT,
        customer_zip TEXT
      );

      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        company TEXT,
        customer_email TEXT,
        customer_phone TEXT,
        customer_street TEXT,
        customer_city TEXT,
        customer_state TEXT,
        customer_zip TEXT,
        categories TEXT,
        make TEXT,
        model TEXT,
        machines_notes TEXT,
        status TEXT DEFAULT 'Quoted',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        quoted_from_vendor BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS calendar_notes (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        notes TEXT,
        UNIQUE(date)
      );

      -- Migration to add quoted_from_vendor column if it doesn't exist
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'leads' AND column_name = 'quoted_from_vendor'
        ) THEN
          ALTER TABLE leads ADD COLUMN quoted_from_vendor BOOLEAN DEFAULT FALSE;
          RAISE NOTICE 'Added quoted_from_vendor column to leads table.';
        END IF;
      END $$;
    `);
    console.log('Database schema initialized successfully.');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

initializeDatabase();

// Leads Endpoints
app.get('/api/leads', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/leads', async (req, res) => {
  const {
    customerName, company, customerEmail, customerPhone,
    customerStreet, customerCity, customerState, customerZip,
    categories, make, model, machinesNotes, status
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO leads (
        customer_name, company, customer_email, customer_phone,
        customer_street, customer_city, customer_state, customer_zip,
        categories, make, model, machines_notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        customerName, company || null, customerEmail || null, customerPhone || null,
        customerStreet || null, customerCity || null, customerState || null, customerZip || null,
        categories || null, make || null, model || null, machinesNotes || null, status || 'Quoted'
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating lead:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/leads/:id', async (req, res) => {
  const { id } = req.params;
  const {
    customerName, company, customerEmail, customerPhone,
    customerStreet, customerCity, customerState, customerZip,
    categories, make, model, machinesNotes, status
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE leads SET
        customer_name = $1, company = $2, customer_email = $3, customer_phone = $4,
        customer_street = $5, customer_city = $6, customer_state = $7, customer_zip = $8,
        categories = $9, make = $10, model = $11, machines_notes = $12, status = $13
      WHERE id = $14 RETURNING *`,
      [
        customerName, company || null, customerEmail || null, customerPhone || null,
        customerStreet || null, customerCity || null, customerState || null, customerZip || null,
        categories || null, make || null, model || null, machinesNotes || null, status || 'Quoted',
        id
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating lead:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/leads/:id/quoted-from-vendor', async (req, res) => {
  const { id } = req.params;
  const { quoted_from_vendor } = req.body;
  try {
    const result = await pool.query(
      'UPDATE leads SET quoted_from_vendor = $1 WHERE id = $2 RETURNING *',
      [quoted_from_vendor, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating quoted_from_vendor:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/leads/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM leads WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    console.error('Error deleting lead:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Customers Endpoints
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/customers', async (req, res) => {
  const {
    customerName, company, customerEmail, customerPhone,
    customerStreet, customerCity, customerState, customerZip
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO customers (
        customer_name, company, customer_email, customer_phone,
        customer_street, customer_city, customer_state, customer_zip
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        customerName, company || null, customerEmail || null, customerPhone || null,
        customerStreet || null, customerCity || null, customerState || null, customerZip || null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  const {
    customerName, company, customerEmail, customerPhone,
    customerStreet, customerCity, customerState, customerZip
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE customers SET
        customer_name = $1, company = $2, customer_email = $3, customer_phone = $4,
        customer_street = $5, customer_city = $6, customer_state = $7, customer_zip = $8
      WHERE id = $9 RETURNING *`,
      [
        customerName, company || null, customerEmail || null, customerPhone || null,
        customerStreet || null, customerCity || null, customerState || null, customerZip || null,
        id
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('Error deleting customer:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Calendar Notes Endpoints
app.get('/api/calendar_notes', async (req, res) => {
  const { date } = req.query;
  try {
    const result = await pool.query('SELECT * FROM calendar_notes WHERE date = $1', [date]);
    if (result.rows.length === 0) {
      return res.json({ notes: '' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching calendar notes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/calendar_notes', async (req, res) => {
  const { date, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO calendar_notes (date, notes)
       VALUES ($1, $2)
       ON CONFLICT (date) DO UPDATE SET notes = $2
       RETURNING *`,
      [date, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error saving calendar notes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/calendar_notes', async (req, res) => {
  const { date } = req.body;
  try {
    const result = await pool.query('DELETE FROM calendar_notes WHERE date = $1 RETURNING *', [date]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error('Error deleting calendar note:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});