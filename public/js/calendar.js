document.getElementById('add-day-note-btn').addEventListener('click', () => showDayModal());

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

function renderCalendar(year, month) {
    const grid = document.getElementById('calendar-grid');
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
    const [year, month] = monthInput.value.split('-');
    renderCalendar(parseInt(year), parseInt(month) - 1); // month is 0-based in JS
    const response = await fetch('/api/calendar');
    const days = await response.json();
    days.forEach(day => {
        const dayElement = document.querySelector(`.calendar-day[data-date="${day.date}"]`);
        if (dayElement) {
            const notesDiv = dayElement.querySelector('.day-notes');
            if (day.notes) notesDiv.textContent = day.notes.substring(0, 20) + (day.notes.length > 20 ? '...' : '');
            if (day.out_status) {
                dayElement.classList.add('out');
                if (day.out_start_date && day.out_end_date) {
                    const start = new Date(day.out_start_date);
                    const end = new Date(day.out_end_date);
                    const current = new Date(day.date);
                    if (current >= start && current <= end) dayElement.classList.add('out');
                }
            }
        }
    });
}

function showDayModal(date = null) {
    const modal = document.getElementById('day-modal');
    const title = document.getElementById('day-modal-title');
    const outRange = document.getElementById('out-range');
    modal.dataset.date = date || '';

    if (date) {
        title.textContent = 'Edit Note or Out Status';
        fetch(`/api/calendar/day/${date}`)
            .then(res => res.json())
            .then(day => {
                document.getElementById('day-date').value = day.date || '';
                document.getElementById('day-notes').value = day.notes || '';
                document.getElementById('day-out-status').checked = day.out_status || false;
                document.getElementById('day-out-start').value = day.out_start_date || '';
                document.getElementById('day-out-end').value = day.out_end_date || '';
                outRange.style.display = day.out_status ? 'block' : 'none';
            });
    } else {
        title.textContent = 'Add Note or Out Status';
        document.getElementById('day-date').value = '';
        document.getElementById('day-notes').value = '';
        document.getElementById('day-out-status').checked = false;
        document.getElementById('day-out-start').value = '';
        document.getElementById('day-out-end').value = '';
        outRange.style.display 'none';
    }
    document.getElementById('day-out-status').addEventListener('change', function() {
        outRange.style.display = this.checked ? 'block' : 'none';
    });
    modal.classList.remove('hidden');
}

async function saveDay() {
    const modal = document.getElementById('day-modal');
    const date = document.getElementById('day-date').value;
    const data = {
        date,
        notes: document.getElementById('day-notes').value,
        out_status: document.getElementById('day-out-status').checked,
        out_start_date: document.getElementById('day-out-start').value || null,
        out_end_date: document.getElementById('day-out-end').value || null
    };

    if (!date) {
        alert('Please select a date.');
        return;
    }

    const url = `/api/calendar/day/${date}`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    modal.classList.add('hidden');
    loadCalendar();
}

document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    document.getElementById('calendar-month').value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    loadCalendar();
});