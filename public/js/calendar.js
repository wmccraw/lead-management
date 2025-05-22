document.getElementById('add-day-note-btn').addEventListener('click', () => showDayModal());
document.getElementById('calendar-grid').addEventListener('click', (e) => {
    if (e.target.classList.contains('calendar-day') || e.target.parentElement.classList.contains('calendar-day')) {
        const date = e.target.dataset.date || e.target.parentElement.dataset.date;
        showDayModal(date);
    }
});

function renderCalendar(year, month) {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        grid.innerHTML += `<div class="calendar-day font-bold text-center bg-gray-300">${day}</div>`;
    });

    for (let i = 0; i < firstDay; i++) grid.innerHTML += '<div class="calendar-day"></div>';

    for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = year === currentYear && month === currentMonth && day === today.getDate();
        grid.innerHTML += `<div class="calendar-day ${isToday ? 'bg-blue-100' : ''}" data-date="${date}">${day}<div class="day-notes text-sm"></div></div>`;
    }

    while (grid.children.length < 42) grid.innerHTML += '<div class="calendar-day"></div>';
}

async function loadCalendar() {
    const monthInput = document.getElementById('calendar-month');
    if (!monthInput.value) {
        const today = new Date();
        monthInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    }
    const [year, month] = monthInput.value.split('-').map(Number);
    renderCalendar(year, month - 1);
    try {
        const res = await fetch('/api/calendar');
        if (!res.ok) throw new Error('Failed to fetch calendar data');
        const days = await res.json();
        document.querySelectorAll('.calendar-day .day-notes').forEach(note => note.textContent = '');
        document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('out'));

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
    } catch (err) {
        console.error('Load error:', err);
        alert(`Load failed: ${err.message}`);
    }
}

function showDayModal(date = null) {
    const modal = document.getElementById('day-modal');
    const noteType = document.getElementById('note-type');
    const endDate = document.getElementById('day-end-date');
    const startDate = document.getElementById('day-start-date');
    const notes = document.getElementById('day-notes');

    startDate.value = date || new Date().toISOString().split('T')[0];
    notes.value = '';
    noteType.value = 'General';
    endDate.value = '';
    endDate.disabled = true;

    noteType.onchange = () => {
        endDate.disabled = noteType.value === 'General';
        if (noteType.value === 'General') endDate.value = '';
    };

    modal.classList.remove('hidden');
}

async function saveDay() {
    const noteType = document.getElementById('note-type').value;
    const notes = document.getElementById('day-notes').value.trim();
    const startDate = document.getElementById('day-start-date').value;
    const endDate = noteType === 'Absence' ? document.getElementById('day-end-date').value : null;

    if (!startDate) {
        alert('Start date is required.');
        return;
    }

    if (noteType === 'Absence' && endDate && new Date(endDate) < new Date(startDate)) {
        alert('End date cannot be before start date.');
        return;
    }

    const data = { note_type: noteType, notes, start_date: startDate, end_date: endDate };

    try {
        const res = await fetch('/api/calendar/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Save failed');
        }
        document.getElementById('day-modal').classList.add('hidden');
        loadCalendar();
    } catch (err) {
        console.error('Save error:', err);
        alert(`Save failed: ${err.message}. Check console for details.`);
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