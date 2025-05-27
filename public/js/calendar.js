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
        document.getElementById('day-modal-title').textContent = 'Add Event';
        document.getElementById('note-type').value = 'General'; // Default to General
        toggleNoteType();
    });

    document.getElementById('note-type').addEventListener('change', toggleNoteType);

    function toggleNoteType() {
        const isAbsence = document.getElementById('note-type').value === 'Absence';
        document.getElementById('absentee-label').style.display = isAbsence ? 'block' : 'none';
        document.getElementById('absentee').style.display = isAbsence ? 'block' : 'none';
        document.getElementById('day-notes').style.display = isAbsence ? 'none' : 'block';
    }
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

    for (let i = 0; i < startDay; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day opacity-50';
        calendarGrid.appendChild(day);
    }

    let calendarData = [];
    try {
        const response = await fetch('/api/calendar');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        calendarData = await response.json();
    } catch (err) {
        console.error('Failed to load calendar data:', err);
        alert('Failed to load calendar data. Please try again.');
        return;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const formattedDay = `${year}-${monthNum.padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day relative';
        dayDiv.textContent = day;
        dayDiv.dataset.date = formattedDay;

        const dayData = calendarData.find(d => d.date === formattedDay);
        if (dayData) {
            if (dayData.name !== 'Default') {
                const marker = document.createElement('div');
                marker.className = 'text-xs mt-1';
                const colors = {
                    'Wilson': 'bg-blue-500',
                    'Carter': 'bg-red-500',
                    'William': 'bg-green-500',
                    'Julia': 'bg-purple-500'
                };
                const color = colors[dayData.name] || 'bg-gray-500';
                marker.className += ` ${color} text-white px-1 rounded`;
                marker.textContent = `${dayData.name} Out`;
                dayDiv.appendChild(marker);

                marker.addEventListener('click', () => {
                    document.getElementById('day-modal').classList.remove('hidden');
                    document.getElementById('day-id').value = dayData.id;
                    document.getElementById('day-notes').value = '';
                    document.getElementById('absentee-label').style.display = 'block';
                    document.getElementById('absentee').style.display = 'block';
                    document.getElementById('absentee').value = dayData.name;
                    document.getElementById('day-start-date').value = dayData.date || '';
                    document.getElementById('day-end-date').value = '';
                    document.getElementById('delete-day-btn').style.display = 'block';
                    document.getElementById('day-modal-title').textContent = 'Edit Absence';
                    document.getElementById('note-type').value = 'Absence';
                    toggleNoteType();
                    document.getElementById('full-notes').innerHTML = '';
                    document.getElementById('full-notes').classList.remove('expanded');
                });
            } else {
                const preview = document.createElement('div');
                preview.className = 'text-xs mt-1 bg-yellow-500 text-white px-1 rounded cursor-pointer';
                preview.textContent = dayData.name === 'Default' && dayData.time ? dayData.time.substring(0, 5) : 'Note';
                dayDiv.appendChild(preview);

                preview.addEventListener('click', () => {
                    document.getElementById('day-modal').classList.remove('hidden');
                    document.getElementById('day-id').value = dayData.id;
                    document.getElementById('day-notes').value = dayData.time || ''; // Using time as a placeholder for note preview
                    document.getElementById('absentee-label').style.display = 'none';
                    document.getElementById('absentee').style.display = 'none';
                    document.getElementById('day-start-date').value = dayData.date || '';
                    document.getElementById('day-end-date').value = '';
                    document.getElementById('delete-day-btn').style.display = 'block';
                    document.getElementById('day-modal-title').textContent = 'Edit Note';
                    document.getElementById('note-type').value = 'General';
                    toggleNoteType();
                    document.getElementById('full-notes').innerHTML = `<p>${dayData.time || ''}</p>`;
                    document.getElementById('full-notes').classList.add('expanded');
                });
            }
        } else {
            dayDiv.addEventListener('click', () => {
                document.getElementById('day-modal').classList.remove('hidden');
                document.getElementById('day-id').value = '';
                document.getElementById('day-notes').value = '';
                document.getElementById('absentee-label').style.display = 'none';
                document.getElementById('absentee').style.display = 'none';
                document.getElementById('day-start-date').value = formattedDay;
                document.getElementById('day-end-date').value = '';
                document.getElementById('delete-day-btn').style.display = 'none';
                document.getElementById('day-modal-title').textContent = 'Add Event';
                document.getElementById('note-type').value = 'General';
                toggleNoteType();
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
    const noteType = document.getElementById('note-type').value;
    const name = noteType === 'Absence' ? document.getElementById('absentee').value : 'Default';
    const notes = noteType === 'General' ? document.getElementById('day-notes').value : '';

    try {
        const response = await fetch('/api/calendar/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, name, time: notes || new Date().toLocaleTimeString('en-US', { hour12: false }) })
        });
        const result = await response.json();
        if (result.error) {
            alert(`Save error: ${result.error}`);
        } else {
            document.getElementById('day-modal').classList.add('hidden');
            loadCalendar();
        }
    } catch (err) {
        console.error('Failed to save calendar entry:', err);
        alert('Failed to save calendar entry. Please try again.');
    }
}

async function deleteDay() {
    const dayId = document.getElementById('day-id').value;
    if (confirm('Are you sure you want to delete this entry?')) {
        try {
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
        } catch (err) {
            console.error('Failed to delete calendar entry:', err);
            alert('Failed to delete calendar entry. Please try again.');
        }
    }
}