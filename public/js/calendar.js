document.getElementById('add-day-note-btn').addEventListener('click', () => showDayModal());

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

function renderCalendar(year, month) {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Add day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day font-bold text-center bg-gray-300';
        dayElement.textContent = day;
        grid.appendChild(dayElement);
    });

    // Add empty cells before the first day
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day';
        grid.appendChild(emptyCell);
    }

    // Add days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day).toISOString().split('T')[0];
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day text-center';
        dayElement.dataset.date = date;
        if (year === currentYear && month === currentMonth && day === today.getDate()) {
            dayElement.classList.add('bg-blue-100');
        }
        dayElement.innerHTML = `<div class="day-number">${day}</div><div class="day-notes"></div>`;
        dayElement.addEventListener('click', () => showDayModal(date));
        grid.appendChild(dayElement);
    }

    // Fill remaining cells to complete 6 weeks (42 cells)
    const totalCells = 42;
    while (grid.children.length < totalCells) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day';
        grid.appendChild(emptyCell);
    }
}

async function loadCalendar() {
    const monthInput = document.getElementById('calendar-month');
    if (!monthInput.value) {
        const today = new Date();
        monthInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    }
    const [year, month] = monthInput.value.split('-').map(Number);
    renderCalendar(year, month - 1);
    const response = await fetch('/api/calendar');
    const days = await response.json();

    // Clear previous notes to avoid duplicates
    document.querySelectorAll('.calendar-day .day-notes').forEach(note => (note.textContent = ''));

    days.forEach(day => {
        const noteType = day.note_type || 'General';
        const startDate = new Date(day.out_start_date);
        const endDate = day.out_end_date ? new Date(day.out_end_date) : startDate;
        
        if (noteType === 'General') {
            const dayElement = document.querySelector(`.calendar-day[data-date="${day.date}"]`);
            if (dayElement) {
                const notesDiv = dayElement.querySelector('.day-notes');
                if (day.notes) {
                    notesDiv.textContent = day.notes.substring(0, 10) + (day.notes.length > 10 ? '...' : '');
                }
            }
        } else if (noteType === 'Absence') {
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const rangeDate = d.toISOString().split('T')[0];
                const rangeElement = document.querySelector(`.calendar-day[data-date="${rangeDate}"]`);
                if (rangeElement) {
                    rangeElement.classList.add('out');
                    const notesDiv = rangeElement.querySelector('.day-notes');
                    notesDiv.textContent = day.notes ? day.notes.substring(0, 10) + (day.notes.length > 10 ? '...' : '') : 'Out';
                }
            }
        }
    });
}

function showDayModal(date = null) {
    const modal = document.getElementById('day-modal');
    const title = document.getElementById('day-modal-title');
    const fullNotes = document.getElementById('full-notes');
    modal.dataset.date = date || '';

    if (date) {
        title.textContent = 'Edit Note or Out Status';
        fetch(`/api/calendar/day/${date}`)
            .then(res => res.json())
            .then(day => {
                document.getElementById('day-notes').value = day.notes || '';
                document.getElementById('note-type').value = day.note_type || 'General';
                document.getElementById('day-start-date').value = day.out_start_date || date;
                document.getElementById('day-end-date').value = day.out_end_date || '';
                fullNotes.innerHTML = day.notes ? `<p>${day.notes}</p>` : '';
                fullNotes.classList.toggle('expanded', !!day.notes);
            })
            .catch(() => {
                // If no data exists for this date, set defaults
                document.getElementById('day-notes').value = '';
                document.getElementById('note-type').value = 'General';
                document.getElementById('day-start-date').value = date;
                document.getElementById('day-end-date').value = '';
                fullNotes.innerHTML = '';
                fullNotes.classList.remove('expanded');
            });
    } else {
        title.textContent = 'Add Note or Out Status';
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('day-notes').value = '';
        document.getElementById('note-type').value = 'General';
        document.getElementById('day-start-date').value = today;
        document.getElementById('day-end-date').value = '';
        fullNotes.innerHTML = '';
        fullNotes.classList.remove('expanded');
    }
    modal.classList.remove('hidden');
}

async function saveDay() {
    const modal = document.getElementById('day-modal');
    const startDate = document.getElementById('day-start-date').value;
    const noteType = document.getElementById('note-type').value;

    if (!startDate) {
        alert('Please select a start date.');
        return;
    }

    const data = {
        date: startDate,
        notes: document.getElementById('day-notes').value || null,
        note_type: noteType,
        out_status: noteType === 'Absence',
        out_start_date: startDate,
        out_end_date: document.getElementById('day-end-date').value || null
    };

    if (noteType === 'Absence' && data.out_end_date && new Date(data.out_end_date) < new Date(startDate)) {
        alert('End date cannot be before start date.');
        return;
    }

    try {
        const url = `/api/calendar/day/${startDate}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to save note');
        }

        // If it's an absence, save entries for each day in the range
        if (noteType === 'Absence' && data.out_end_date) {
            const start = new Date(startDate);
            const end = new Date(data.out_end_date);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const rangeDate = d.toISOString().split('T')[0];
                if (rangeDate !== startDate) {
                    await fetch(`/api/calendar/day/${rangeDate}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...data, date: rangeDate })
                    });
                }
            }
        }

        modal.classList.add('hidden');
        loadCalendar();
    } catch (error) {
        alert('Error saving note. Please try again.');
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    document.getElementById('calendar-month').value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    loadCalendar();

    document.getElementById('day-modal').addEventListener('click', (e) => {
        if (e.target.tagName === 'P' && e.target.parentElement.id === 'full-notes') {
            const fullNotes = document.getElementById('full-notes');
            fullNotes.classList.toggle('expanded');
        }
    });
});