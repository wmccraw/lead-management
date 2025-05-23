document.addEventListener('DOMContentLoaded', () => {
    loadCalendar();

    document.getElementById('add-day-note-btn').addEventListener('click', () => {
        document.getElementById('day-modal').classList.remove('hidden');
        document.getElementById('day-id').value = '';
        document.getElementById('day-notes').value = '';
        document.getElementById('absentee-label').style.display = 'none';
        document.getElementById('absentee').style.display = 'none';
        document.getElementById('day-start-date').value = '';
        document.getElementById('day-end-date').value = '';
        document.getElementById('delete-day-btn').style.display = 'none';
        document.getElementById('day-modal-title').textContent = 'Add Note or Out Status';
    });

    document.getElementById('note-type').addEventListener('change', (e) => {
        const isAbsence = e.target.value === 'Absence';
        document.getElementById('absentee-label').style.display = isAbsence ? 'block' : 'none';
        document.getElementById('absentee').style.display = isAbsence ? 'block' : 'none';
    });
});

async function loadCalendar() {
    const month = document.getElementById('calendar-month').value || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const [year, monthNum] = month.split('-');
    const firstDay = new Date(year, monthNum - 1, 1);
    const lastDay = new Date(year, monthNum, 0);
    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';

    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    const prevMonth = new Date(year, monthNum - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();

    for (let i = 0; i < startDay; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day opacity-50';
        calendarGrid.appendChild(day);
    }

    const response = await fetch('/api/calendar');
    const calendarData = await response.json();

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day relative';
        dayDiv.textContent = day;
        dayDiv.dataset.date = `${year}-${monthNum.padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const dayData = calendarData.find(d => d.date === dayDiv.dataset.date);
        if (dayData) {
            const notesDiv = document.createElement('div');
            notesDiv.className = 'text-xs mt-1';
            if (dayData.absentee) {
                const banner = document.createElement('div');
                banner.className = `absence-banner ${dayData.absentee.toLowerCase()}`;
                banner.textContent = `${dayData.absentee} Out`;
                dayDiv.appendChild(banner);
            }
            notesDiv.className += ' expandable-notes';
            dayDiv.appendChild(notesDiv);

            dayDiv.addEventListener('click', () => {
                document.getElementById('day-modal').classList.remove('hidden');
                document.getElementById('day-id').value = dayData.id;
                document.getElementById('day-notes').value = '';
                document.getElementById('absentee-label').style.display = 'block';
                document.getElementById('absentee').style.display = 'block';
                document.getElementById('absentee').value = dayData.absentee || 'Wilson';
                document.getElementById('day-start-date').value = dayData.date || '';
                document.getElementById('day-end-date').value = '';
                document.getElementById('delete-day-btn').style.display = 'block';
                document.getElementById('day-modal-title').textContent = 'Edit Note or Out Status';
                document.getElementById('full-notes').innerHTML = '';
                document.getElementById('full-notes').classList.remove('expanded');
            });
        } else {
            dayDiv.addEventListener('click', () => {
                document.getElementById('day-modal').classList.remove('hidden');
                document.getElementById('day-id').value = '';
                document.getElementById('day-notes').value = '';
                document.getElementById('absentee-label').style.display = 'none';
                document.getElementById('absentee').style.display = 'none';
                document.getElementById('day-start-date').value = `${year}-${monthNum.padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                document.getElementById('day-end-date').value = '';
                document.getElementById('delete-day-btn').style.display = 'none';
                document.getElementById('day-modal-title').textContent = 'Add Note or Out Status';
                document.getElementById('full-notes').innerHTML = '';
                document.getElementById('full-notes').classList.remove('expanded');
            });
        }
        calendarGrid.appendChild(dayDiv);
    }

    const totalCells = startDay + daysInMonth;
    for (let i = totalCells; i < 42; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day opacity-50';
        calendarGrid.appendChild(day);
    }
}

async function saveDay() {
    const date = document.getElementById('day-start-date').value;

    const response = await fetch('/api/calendar/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date })
    });

    const result = await response.json();
    if (result.error) {
        alert(`Save error: ${result.error}`);
    } else {
        document.getElementById('day-modal').classList.add('hidden');
        loadCalendar();
    }
}

async function deleteDay() {
    const dayId = document.getElementById('day-id').value;
    if (confirm('Are you sure you want to delete this entry?')) {
        const response = await fetch(`/api/calendar/delete/${dayId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.error) {
            alert(`Delete error: ${result.error}`);
        } else {
            document.getElementById('day-modal').classList.add('hidden');
            loadCalendar();
        }
    }
}