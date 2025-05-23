document.getElementById('add-day-note-btn').addEventListener('click', () => showDayModal());
document.getElementById('calendar-grid').addEventListener('click', (e) => {
    const target = e.target.classList.contains('calendar-day') ? e.target : e.target.parentElement.classList.contains('calendar-day') ? e.target.parentElement : null;
    if (target) {
        const date = target.dataset.date;
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
        grid.innerHTML += `<div class="calendar-day ${isToday ? 'bg-blue-100' : ''}" data-date="${date}">${day}<div class="day-notes text-sm"></div><div class="absence-banners"></div></div>`;
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
        document.querySelectorAll('.absence-banner').forEach(banner => banner.remove());

        const dayEntries = {};

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
                    if (!dayEntries[day.date]) dayEntries[day.date] = [];
                    dayEntries[day.date].push({ ...day, note_type: 'General' });
                }
            } else if (noteType === 'Absence' && day.absentee) {
                for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                    const rangeDate = d.toISOString().split('T')[0];
                    const rangeElement = document.querySelector(`.calendar-day[data-date="${rangeDate}"]`);
                    if (rangeElement) {
                        const bannersDiv = rangeElement.querySelector('.absence-banners');
                        const existingBanners = Array.from(bannersDiv.getElementsByClassName('absence-banner')).map(banner => ({
                            absentee: banner.classList[1],
                            start: new Date(day.out_start_date),
                            element: banner
                        }));

                        const newBannerElement = document.createElement('div');
                        newBannerElement.classList.add('absence-banner', day.absentee.toLowerCase());
                        newBannerElement.textContent = `${day.absentee} Out`;

                        const newBanner = {
                            absentee: day.absentee.toLowerCase(),
                            start: startDate,
                            element: newBannerElement,
                            id: day.id
                        };

                        existingBanners.push(newBanner);
                        existingBanners.sort((a, b) => a.start - b.start);
                        bannersDiv.innerHTML = '';
                        existingBanners.forEach(b => bannersDiv.appendChild(b.element));

                        const notesDiv = rangeElement.querySelector('.day-notes');
                        if (day.notes && !notesDiv.textContent) {
                            notesDiv.textContent = day.notes.substring(0, 10) + (day.notes.length > 10 ? '...' : '');
                        }

                        if (!dayEntries[rangeDate]) dayEntries[rangeDate] = [];
                        dayEntries[rangeDate].push({ ...day, note_type: 'Absence' });
                    }
                }
            }
        });

        Object.keys(dayEntries).forEach(date => {
            const dayElement = document.querySelector(`.calendar-day[data-date="${date}"]`);
            if (dayElement) {
                dayElement.dataset.entries = JSON.stringify(dayEntries[date]);
            }
        });
    } catch (err) {
        console.error('Load error:', err);
        alert(`Load failed: ${err.message}`);
    }
}

function showDayModal(date = null, entry = null) {
    const modal = document.getElementById('day-modal');
    const noteType = document.getElementById('note-type');
    const endDate = document.getElementById('day-end-date');
    const startDate = document.getElementById('day-start-date');
    const notes = document.getElementById('day-notes');
    const absentee = document.getElementById('absentee');
    const absenteeLabel = document.getElementById('absentee-label');
    const dayId = document.getElementById('day-id');
    const deleteBtn = document.getElementById('delete-day-btn');

    if (entry) {
        dayId.value = entry.id || '';
        notes.value = entry.notes || '';
        noteType.value = entry.note_type || 'General';
        startDate.value = entry.out_start_date || date || new Date().toISOString().split('T')[0];
        endDate.value = entry.out_end_date || '';
        absentee.value = entry.absentee || 'Wilson';
        deleteBtn.style.display = 'block';
    } else {
        dayId.value = '';
        startDate.value = date || new Date().toISOString().split('T')[0];
        notes.value = '';
        noteType.value = 'General';
        endDate.value = '';
        absentee.value = 'Wilson';
        deleteBtn.style.display = 'none';
    }

    const isAbsence = noteType.value === 'Absence';
    endDate.disabled = !isAbsence;
    absentee.style.display = isAbsence ? 'block' : 'none';
    absenteeLabel.style.display = isAbsence ? 'block' : 'none';

    noteType.onchange = () => {
        const isAbsence = noteType.value === 'Absence';
        endDate.disabled = !isAbsence;
        absentee.style.display = isAbsence ? 'block' : 'none';
        absenteeLabel.style.display = isAbsence ? 'block' : 'none';
        if (!isAbsence) endDate.value = '';
    };

    modal.classList.remove('hidden');
}

async function saveDay() {
    const dayId = document.getElementById('day-id').value;
    const noteType = document.getElementById('note-type').value;
    const notes = document.getElementById('day-notes').value.trim();
    const startDate = document.getElementById('day-start-date').value;
    const endDate = document.getElementById('day-end-date').value;
    const absentee = document.getElementById('absentee').value;

    if (!startDate) {
        alert('Start date is required.');
        return;
    }

    if (noteType === 'Absence') {
        if (!endDate) {
            alert('End date is required for Absence.');
            return;
        }
        if (new Date(endDate) < new Date(startDate)) {
            alert('End date cannot be before start date.');
            return;
        }
    }

    const data = {
        id: dayId || undefined,
        note_type: noteType,
        notes,
        start_date: startDate,
        end_date: noteType === 'Absence' ? endDate : null,
        absentee: noteType === 'Absence' ? absentee : null
    };

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

async function deleteDay() {
    const dayId = document.getElementById('day-id').value;
    if (!dayId) {
        alert('No entry to delete.');
        return;
    }

    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
        const res = await fetch(`/api/calendar/delete/${dayId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Delete failed');
        }
        document.getElementById('day-modal').classList.add('hidden');
        loadCalendar();
    } catch (err) {
        console.error('Delete error:', err);
        alert(`Delete failed: ${err.message}. Check console for details.`);
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

    document.getElementById('calendar-grid').addEventListener('click', (e) => {
        if (e.target.classList.contains('absence-banner')) {
            const date = e.target.parentElement.parentElement.dataset.date;
            const entries = JSON.parse(e.target.parentElement.parentElement.dataset.entries || '[]');
            const absentee = e.target.classList[1].charAt(0).toUpperCase() + e.target.classList[1].slice(1);
            const entry = entries.find(e => e.note_type === 'Absence' && e.absentee.toLowerCase() === absentee.toLowerCase());
            if (entry) showDayModal(date, entry);
        } else if (e.target.classList.contains('day-notes') && e.target.textContent) {
            const date = e.target.parentElement.dataset.date;
            const entries = JSON.parse(e.target.parentElement.dataset.entries || '[]');
            const entry = entries.find(e => e.note_type === 'General');
            if (entry) showDayModal(date, entry);
        }
    });
});