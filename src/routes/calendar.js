const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all calendar entries
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM calendar_days ORDER BY date, id');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching calendar data:', err);
        res.status(500).json({ error: err.message || 'Server error fetching calendar data' });
    }
});

// Save a calendar note or absence
router.post('/save', async (req, res) => {
    const { note_type, notes, start_date, end_date, absentee } = req.body;

    if (!note_type || !start_date) {
        return res.status(400).json({ error: 'note_type and start_date are required' });
    }

    if (note_type === 'Absence' && !absentee) {
        return res.status(400).json({ error: 'absentee is required for Absence type' });
    }

    try {
        if (note_type === 'Absence') {
            await pool.query(
                `INSERT INTO calendar_days (date, notes, note_type, absentee, out_status, out_start_date, out_end_date, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                 ON CONFLICT (note_type, absentee, out_start_date, out_end_date)
                 DO UPDATE SET notes = $2, created_at = NOW()`,
                [start_date, notes || null, note_type, absentee, true, start_date, end_date || start_date]
            );
        } else {
            await pool.query(
                `INSERT INTO calendar_days (date, notes, note_type, created_at)
                 VALUES ($1, $2, $3, NOW())
                 ON CONFLICT (date, note_type)
                 DO UPDATE SET notes = $2, created_at = NOW()`,
                [start_date, notes || null, note_type]
            );
        }
        res.status(201).json({ message: 'Saved successfully' });
    } catch (err) {
        console.error('Error saving to calendar:', err);
        res.status(500).json({ error: err.message || 'Server error saving data' });
    }
});

// Delete a calendar entry by id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'ID is required for deletion' });
    }
    try {
        const result = await pool.query('DELETE FROM calendar_days WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'No entry found for that id' });
        }
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error('Error deleting calendar entry:', err);
        res.status(500).json({ error: err.message || 'Server error deleting data' });
    }
});

module.exports = router;