document.addEventListener('DOMContentLoaded', () => {
    let calendarData = [];
    let pendingCalendarDate = null;
    let pendingEntryId = null;

    const calendarGrid = document.getElementById('calendar-grid');
    const calendarMonth = document.getElementById('calendar-month');
    const addDayNoteBtn = document.getElementById('add-day-note-btn');
    const dayModal = document.getElementById('day-modal');
    const dayModalTitle = document.getElementById('day-modal-title');
    const dayStartDate = document.getElementById('day-start-date');
    const dayEndDate = document.getElementById('day-end-date');
    const dayEndDateLabel = document.getElementById('day-end-date-label');
    const absenteeLabel = document.getElementById('absentee-label');
    const absenteeSelect = document.getElementById('absentee');
    const notesLabel = document.getElementById('notes-label');
    const dayNotes = document.getElementById('day-notes');
    const saveDayBtn = document.getElementById('save-day-btn');
    const deleteDayBtn = document.getElementById('delete-day-btn');
    const closeDayModalBtn = document.getElementById('close-day-modal-btn');
    const typeModal = document.getElementById('type-modal');
    const typeGeneralBtn = document.getElementById('type-general-btn');
    const typeAbsenceBtn = document.getElementById('type-absence-btn');
    const typeModalClose = document.getElementById('type-modal-close');
    const noteTypeInput = document.getElementById('note-type');
    const fullNotes = document.getElementById('full-notes');

    const absenteeColors = {
        Wilson: 'bg-blue-400',
        Carter: 'bg-green-400',
        William: 'bg-yellow-400',
        Julia: 'bg-pink-400'
    };
    const absenteeTextColors = {
        Wilson: 'text-blue-900',
        Carter: 'text-green-900',
        William: 'text-yellow-900',
        Julia: 'text-pink-900'
    };

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    function getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // Ensure the calendarMonth select has a value on load
    function ensureCalendarMonthValue() {
        if (!calendarMonth.value) {
            const today = new Date();
            calendarMonth.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        }
    }

    async function loadCalendar() {
        ensureCalendarMonthValue();
        const [year, month] = calendarMonth.value.split('-');
        const daysInMonth = getDaysInMonth(Number(year), Number(month) - 1);
        calendarGrid.innerHTML = '';

        // Weekday headers
        weekdays.forEach(day => {
            const header = document.createElement('div');
            header.textContent = day;
            header.className = 'font-semibold text-center bg-gray-200 rounded';
            calendarGrid.appendChild(header);
        });

        // Fetch calendar data
        let res, data;
        try {
            res = await fetch('/api/calendar');
            data = await res.json();
            if (!Array.isArray(data)) throw new Error('Calendar data is not an array');
            calendarData = data;
        } catch (err) {
            alert('Failed to load calendar data: ' + (err.message || 'Unknown error'));
            return;
        }

        // Offset for first day
        const firstDay = new Date(Number(year), Number(month) - 1, 1).getDay();
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day bg-transparent cursor-default';
            calendarGrid.appendChild(empty);
        }

        // Render days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${month.padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const absences = calendarData.filter(e =>
                e.note_type === 'Absence' &&
                e.out_start_date &&
                e.out_end_date &&
                new Date(e.out_start_date) <= new Date(dateStr) &&
                new Date(e.out_end_date) >= new Date(dateStr)
            );
            const notes = calendarData.filter(e =>
                e.date === dateStr && e.note_type !== 'Absence'
            );

            const div = document.createElement('div');
            div.className = 'calendar-day bg-white rounded shadow relative flex flex-col justify-between';
            div.style.position = 'relative';
            div.innerHTML = `<div class="font-bold">${day}</div>`;

            absences.forEach(absence => {
                const color = absenteeColors[absence.absentee] || 'bg-gray-400';
                const textColor = absenteeTextColors[absence.absentee] || 'text-gray-900';
                const bar = document.createElement('div');
                bar.className = `mt-1 mb-1 rounded text-xs px-1 py-0.5 ${color} ${textColor} font-semibold whitespace-nowrap overflow-hidden cursor-pointer`;
                bar.textContent = `${absence.absentee} out`;
                bar.onclick = (e) => {
                    e.stopPropagation();
                    openDayModal(absence.date, absence);
                };
                bar.dataset.entryId = absence.id;
                div.appendChild(bar);
            });

            notes.forEach(note => {
                const preview = document.createElement('div');
                preview.className = 'mt-1 text-xs bg-gray-100 rounded px-1 py-0.5 cursor-pointer truncate';
                preview.textContent = note.notes && note.notes.length > 40 ? note.notes.slice(0, 40) + '...' : note.notes;
                preview.onclick = (e) => {
                    e.stopPropagation();
                    openDayModal(note.date, note);
                };
                preview.dataset.entryId = note.id;
                div.appendChild(preview);
            });

            div.onclick = (e) => {
                if (e.target === div || e.target.classList.contains('font-bold')) {
                    pendingCalendarDate = dateStr;
                    pendingEntryId = null;
                    typeModal.classList.remove('hidden');
                }
            };

            calendarGrid.appendChild(div);
        }
    }

    function openDayModal(dateStr, entry) {
        dayModal.classList.remove('hidden');
        dayModalTitle.textContent = entry ? 'Edit Note' : 'Add Note';
        dayStartDate.value = entry && entry.out_start_date ? entry.out_start_date : dateStr;
        dayEndDate.value = entry && entry.out_end_date ? entry.out_end_date : '';
        dayNotes.value = entry ? (entry.notes || '') : '';
        absenteeSelect.value = entry && entry.absentee ? entry.absentee : '';
        noteTypeInput.value = entry ? entry.note_type : noteTypeInput.value || 'General';
        fullNotes.innerHTML = entry && entry.notes
            ? `<div class="expanded">${entry.notes}</div>`
            : '';
        pendingEntryId = entry && entry.id ? entry.id : null;
        if ((entry && entry.note_type === 'Absence') || noteTypeInput.value === 'Absence') {
            absenteeLabel.classList.remove('hidden');
            absenteeSelect.classList.remove('hidden');
            dayEndDateLabel.classList.remove('hidden');
            dayEndDate.classList.remove('hidden');
        } else {
            absenteeLabel.classList.add('hidden');
            absenteeSelect.classList.add('hidden');
            dayEndDateLabel.classList.add('hidden');
            dayEndDate.classList.add('hidden');
        }
        deleteDayBtn.classList.toggle('hidden', !entry);
        saveDayBtn.onclick = async () => {
            const note_type = noteTypeInput.value || 'General';
            const notes = dayNotes.value;
            const start_date = dayStartDate.value;
            const end_date = dayEndDate.value || null;
            const absentee = absenteeSelect.value || null;
            const payload = { note_type, notes, start_date, end_date, absentee };
            const resp = await fetch('/api/calendar/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (resp.ok) {
                dayModal.classList.add('hidden');
                await loadCalendar();
            } else {
                let msg = 'Error saving note';
                try {
                    const data = await resp.json();
                    if (data && data.error) msg += ': ' + data.error;
                } catch {}
                alert(msg);
            }
        };
        deleteDayBtn.onclick = async () => {
            if (!pendingEntryId) {
                alert('No entry id found for deletion.');
                return;
            }
            if (confirm('Delete this calendar entry?')) {
                const resp = await fetch(`/api/calendar/${pendingEntryId}`, { method: 'DELETE' });
                if (resp.ok) {
                    dayModal.classList.add('hidden');
                    await loadCalendar();
                } else {
                    alert('Error deleting entry');
                }
            }
        };
    }

    addDayNoteBtn.onclick = () => {
        pendingCalendarDate = formatDate(new Date());
        pendingEntryId = null;
        typeModal.classList.remove('hidden');
    };
    typeModalClose.onclick = () => {
        typeModal.classList.add('hidden');
        pendingCalendarDate = null;
        pendingEntryId = null;
    };
    typeGeneralBtn.onclick = () => {
        typeModal.classList.add('hidden');
        noteTypeInput.value = 'General';
        absenteeLabel.classList.add('hidden');
        absenteeSelect.classList.add('hidden');
        dayEndDateLabel.classList.add('hidden');
        dayEndDate.classList.add('hidden');
        openDayModal(pendingCalendarDate || formatDate(new Date()), null);
        pendingCalendarDate = null;
        pendingEntryId = null;
    };
    typeAbsenceBtn.onclick = () => {
        typeModal.classList.add('hidden');
        noteTypeInput.value = 'Absence';
        absenteeLabel.classList.remove('hidden');
        absenteeSelect.classList.remove('hidden');
        dayEndDateLabel.classList.remove('hidden');
        dayEndDate.classList.remove('hidden');
        openDayModal(pendingCalendarDate || formatDate(new Date()), null);
        pendingCalendarDate = null;
        pendingEntryId = null;
    };

    // Ensure the calendarMonth select has a value before loading
    ensureCalendarMonthValue();
    calendarMonth.onchange = loadCalendar;
    loadCalendar();
});