const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM calendar_days ORDER BY date');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching calendar data:', err);
        res.status(500).json({ error: 'Server error fetching calendar data' });
    }
});

router.post('/save', async (req, res) => {
    const { note_type, notes, start_date, end_date, absentee } = req.body;

    if (!note_type || !start_date) {
        return res.status(400).json({ error: 'note_type and start_date are required' });
    }

    if (note_type === 'Absence' && !absentee) {
        return res.status(400).json({ error: 'absentee is required for Absence type' });
    }

    try {
        const out_status = note_type === 'Absence';
        const dates = (note_type === 'Absence' && end_date && new Date(end_date) >= new Date(start_date)) 
            ? getDateRange(start_date, end_date) 
            : [start_date];

        for (const date of dates) {
            await pool.query(
                `INSERT INTO calendar_days (date, notes, note_type, absentee, out_status, out_start_date, out_end_date, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                 ON CONFLICT (date) DO UPDATE SET
                 notes = $2, note_type = $3, absentee = $4, out_status = $5, out_start_date = $6, out_end_date = $7, created_at = NOW()`,
                [date, notes || null, note_type, note_type === 'Absence' ? absentee : null, out_status, start_date, end_date || null]
            );
        }
        res.status(201).json({ message: 'Saved successfully' });
    } catch (err) {
        console.error('Error saving to calendar:', err);
        res.status(500).json({ error: 'Server error saving data' });
    }
});

function getDateRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    const finalDate = new Date(endDate);
    while (currentDate <= finalDate) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}

module.exports = router;