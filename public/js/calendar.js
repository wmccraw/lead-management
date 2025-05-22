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
    days.forEach(day => {
        const dayElement = document.querySelector(`.calendar-day[data-date="${day.date}"]`);
        if (dayElement) {
            const notesDiv = dayElement.querySelector('.day-notes');
            if (day.notes) {
                notesDiv.textContent = day.notes.substring(0, 10) + (day.notes.length > 10 ? '...' : '');
            }
            if (day.out_status && day.out_end_date) {
                const start = new Date(day.date);
                const end = new Date(day.out_end_date);
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const rangeDate = d.toISOString().split('T')[0];
                    const rangeElement = document.querySelector(`.calendar-day[data-date="${rangeDate}"]`);
                    if (rangeElement) {
                        rangeElement.classList.add('out');
                        rangeElement.querySelector('.day-notes').textContent = day.notes || 'Out';
                    }
                }
            }
        }
    });
}

function showDayModal(date = null) {
    const modal = document.getElementById('day-modal');
    const title = document.getElementById('day-modal-title');
    const outRange = document.getElementById('out-range');
    const fullNotes = document.getElementById('full-notes');
    modal.dataset.date = date || '';

    if (date) {
        title.textContent = 'Edit Note or Out Status';
        fetch(`/api/calendar/day/${date}`)
            .then(res => res.json())
            .then(day => {
                document.getElementById('day-notes').value = day.notes || '';
                document.getElementById('day-out-status').checked = day.out_status || false;
                document.getElementById('day-out-end').value = day.out_end_date || '';
                outRange.style.display = day.out_status ? 'block' : 'none';
                fullNotes.innerHTML = day.notes ? `<p>${day.notes}</p>` : '';
                fullNotes.classList.toggle('expanded', !!day.notes);
            });
    } else {
        title.textContent = 'Add Note or Out Status';
        document.getElementById('day-notes').value = '';
        document.getElementById('day-out-status').checked = false;
        document.getElementById('day-out-end').value = '';
        outRange.style.display = 'none';
        fullNotes.innerHTML = '';
        fullNotes.classList.remove('expanded');
    }
    document.getElementById('day-out-status').addEventListener('change', function() {
        outRange.style.display = this.checked ? 'block' : 'none';
    });
    modal.classList.remove('hidden');
}

async function saveDay() {
    const modal = document.getElementById('day-modal');
    const date = modal.dataset.date;
    if (!date) {
        alert('Please click a day to set a note or out status.');
        return;
    }

    const data = {
        date,
        notes: document.getElementById('day-notes').value || null,
        out_status: document.getElementById('day-out-status').checked,
        out_start_date: date, // Use clicked date as start
        out_end_date: document.getElementById('day-out-end').value || null
    };

    if (data.out_status && !data.out_end_date) {
        alert('Please select an end date for the out status.');
        return;
    }

    const url = `/api/calendar/day/${date}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (response.ok) {
        modal.classList.add('hidden');
        loadCalendar();
    } else {
        alert('Failed to save. Please try again.');
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