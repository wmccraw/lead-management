document.addEventListener('DOMContentLoaded', () => {
    loadCalendar();

    document.getElementById('add-day-note-btn').addEventListener('click', () => {
        const modal = document.getElementById('day-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.getElementById('day-id').value = '';
            const notesInput = document.getElementById('day-notes');
            const absenteeLabel = document.getElementById('absentee-label');
            const absentee = document.getElementById('absentee');
            const startDate = document.getElementById('day-start-date');
            const endDate = document.getElementById('day-end-date');
            const deleteBtn = document.getElementById('delete-day-btn');
            const modalTitle = document.getElementById('day-modal-title');
            const noteType = document.getElementById('note-type');

            if (notesInput && absenteeLabel && absentee && startDate && endDate && deleteBtn && modalTitle && noteType) {
                notesInput.value = '';
                absenteeLabel.style.display = 'none';
                absentee.style.display = 'none';
                startDate.value = '';
                endDate.value = '';
                deleteBtn.style.display = 'none';
                modalTitle.textContent = 'Add Event';
                noteType.value = 'General';
                toggleNoteType();
            }
        }
    });

    const noteTypeSelect = document.getElementById('note-type');
    if (noteTypeSelect) {
        noteTypeSelect.addEventListener('change', toggleNoteType);
    }

    function toggleNoteType() {
        const noteType = document.getElementById('note-type')?.value || 'General';
        const isAbsence = noteType === 'Absence';
        const absenteeLabel = document.getElementById('absentee-label');
        const absentee = document.getElementById('absentee');
        const dayNotes = document.getElementById('day-notes');
        const dayEndDate = document.getElementById('day-end-date');
        const dayEndDateLabel = document.getElementById('day-end-date-label');

        if (absenteeLabel && absentee && dayNotes && dayEndDate && dayEndDateLabel) {
            absenteeLabel.style.display = isAbsence ? 'block' : 'none';
            absentee.style.display = isAbsence ? 'block' : 'none';
            dayNotes.style.display = isAbsence ? 'none' : 'block';
            dayEndDate.style.display = isAbsence ? 'block' : 'none';
            dayEndDateLabel.style.display = isAbsence ? 'block' : 'none';
        }
    }
});

async function loadCalendar() {
    const month = document.getElementById('calendar-month')?.value || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const [year, monthNum] = month.split('-');
    const firstDay = new Date(year, monthNum - 1, 1);
    const lastDay = new Date(year, monthNum, 0);
    const calendarGrid = document.getElementById('calendar-grid');
    if (calendarGrid) calendarGrid.innerHTML = '';

    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    for (let i = 0; i < startDay; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day opacity-50';
        if (calendarGrid) calendarGrid.appendChild(day);
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

        const dayEntries = calendarData.filter(d => {
            const entryDate = new Date(d.date).toISOString().split('T')[0];
            return entryDate === formattedDay;
        });

        dayEntries.forEach(dayData => {
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
                marker.className += ` ${color} text-white px-1 rounded cursor-pointer`;
                marker.textContent = `${dayData.name} Out`;
                dayDiv.appendChild(marker);

                marker.addEventListener('click', () => {
                    const modal = document.getElementById('day-modal');
                    if (modal) {
                        modal.classList.remove('hidden');
                        document.getElementById('day-id').value = dayData.id;
                        document.getElementById('day-notes').value = '';
                        const absenteeLabel = document.getElementById('absentee-label');
                        const absentee = document.getElementById('absentee');
                        const startDate = document.getElementById('day-start-date');
                        const endDate = document.getElementById('day-end-date');
                        const deleteBtn = document.getElementById('delete-day-btn');
                        const modalTitle = document.getElementById('day-modal-title');
                        const noteType = document.getElementById('note-type');

                        if (absenteeLabel && absentee && startDate && endDate && deleteBtn && modalTitle && noteType) {
                            absenteeLabel.style.display = 'block';
                            absentee.style.display = 'block';
                            absentee.value = dayData.name;
                            startDate.value = dayData.date || '';
                            endDate.value = '';
                            deleteBtn.style.display = 'block';
                            modalTitle.textContent = 'Edit Absence';
                            noteType.value = 'Absence';
                            toggleNoteType();
                            document.getElementById('full-notes').innerHTML = '';
                            document.getElementById('full-notes').classList.remove('expanded');
                        }
                    }
                });
            } else {
                const preview = document.createElement('div');
                preview.className = 'text-xs mt-1 bg-yellow-500 text-white px-1 rounded cursor-pointer';
                preview.textContent = dayData.time ? dayData.time.substring(0, 5) : 'Note';
                dayDiv.appendChild(preview);

                preview.addEventListener('click', () => {
                    const modal = document.getElementById('day-modal');
                    if (modal) {
                        modal.classList.remove('hidden');
                        document.getElementById('day-id').value = dayData.id;
                        const dayNotes = document.getElementById('day-notes');
                        const absenteeLabel = document.getElementById('absentee-label');
                        const absentee = document.getElementById('absentee');
                        const startDate = document.getElementById('day-start-date');
                        const endDate = document.getElementById('day-end-date');
                        const deleteBtn = document.getElementById('delete-day-btn');
                        const modalTitle = document.getElementById('day-modal-title');
                        const noteType = document.getElementById('note-type');
                        const fullNotes = document.getElementById('full-notes');

                        if (dayNotes && absenteeLabel && absentee && startDate && endDate && deleteBtn && modalTitle && noteType && fullNotes) {
                            dayNotes.value = dayData.time || '';
                            absenteeLabel.style.display = 'none';
                            absentee.style.display = 'none';
                            startDate.value = dayData.date || '';
                            endDate.value = '';
                            deleteBtn.style.display = 'block';
                            modalTitle.textContent = 'Edit Note';
                            noteType.value = 'General';
                            toggleNoteType();
                            fullNotes.innerHTML = `<p>${dayData.time || ''}</p>`;
                            fullNotes.classList.add('expanded');
                        }
                    }
                });
            }
        });

        if (dayEntries.length === 0) {
            dayDiv.addEventListener('click', () => {
                const modal = document.getElementById('day-modal');
                if (modal) {
                    modal.classList.remove('hidden');
                    document.getElementById('day-id').value = '';
                    const dayNotes = document.getElementById('day-notes');
                    const absenteeLabel = document.getElementById('absentee-label');
                    const absentee = document.getElementById('absentee');
                    const startDate = document.getElementById('day-start-date');
                    const endDate = document.getElementById('day-end-date');
                    const deleteBtn = document.getElementById('delete-day-btn');
                    const modalTitle = document.getElementById('day-modal-title');
                    const noteType = document.getElementById('note-type');

                    if (dayNotes && absenteeLabel && absentee && startDate && endDate && deleteBtn && modalTitle && noteType) {
                        dayNotes.value = '';
                        absenteeLabel.style.display = 'none';
                        absentee.style.display = 'none';
                        startDate.value = formattedDay;
                        endDate.value = '';
                        deleteBtn.style.display = 'none';
                        modalTitle.textContent = 'Add Event';
                        noteType.value = 'General';
                        toggleNoteType();
                        document.getElementById('full-notes').innerHTML = '';
                        document.getElementById('full-notes').classList.remove('expanded');
                    }
                }
            });
        }
        if (calendarGrid) calendarGrid.appendChild(dayDiv);
    }

    const totalCells = startDay + daysInMonth;
    for (let i = totalCells; i < 42; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day opacity-50';
        if (calendarGrid) calendarGrid.appendChild(day);
    }
}

async function saveDay() {
    const startDate = document.getElementById('day-start-date')?.value;
    const endDate = document.getElementById('day-end-date')?.value;
    const noteType = document.getElementById('note-type')?.value || 'General';
    const name = noteType === 'Absence' ? document.getElementById('absentee')?.value : 'Default';
    const notes = noteType === 'General' ? document.getElementById('day-notes')?.value : '';

    if (!startDate) {
        alert('Please select a start date.');
        return;
    }

    try {
        if (noteType === 'Absence' && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                const response = await fetch('/api/calendar/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: dateStr,
                        name,
                        time: notes || new Date().toLocaleTimeString('en-US', { hour12: false })
                    })
                });
                const result = await response.json();
                if (result.error) {
                    alert(`Save error for ${dateStr}: ${result.error}`);
                    return;
                }
            }
        } else {
            const response = await fetch('/api/calendar/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: startDate,
                    name,
                    time: notes || new Date().toLocaleTimeString('en-US', { hour12: false })
                })
            });
            const result = await response.json();
            if (result.error) {
                alert(`Save error: ${result.error}`);
                return;
            }
        }
        const modal = document.getElementById('day-modal');
        if (modal) modal.classList.add('hidden');
        loadCalendar();
    } catch (err) {
        console.error('Failed to save calendar entry:', err);
        alert('Failed to save calendar entry. Please try again.');
    }
}

async function deleteDay() {
    const dayId = document.getElementById('day-id')?.value;
    if (dayId && confirm('Are you sure you want to delete this entry?')) {
        try {
            const response = await fetch(`/api/calendar/delete/${dayId}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            if (result.error) {
                alert(`Delete error: ${result.error}`);
            } else {
                const modal = document.getElementById('day-modal');
                if (modal) modal.classList.add('hidden');
                loadCalendar();
            }
        } catch (err) {
            console.error('Failed to delete calendar entry:', err);
            alert('Failed to delete calendar entry. Please try again.');
        }
    }
}