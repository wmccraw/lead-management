document.addEventListener('DOMContentLoaded', () => {
    // Calendar state
    let calendarData = [];
    let pendingCalendarDate = null;

    // Elements
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

    // Absentee color map
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

    // Helper to get days in month
    function getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    // Helper to format date as YYYY-MM-DD
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // Helper to get all dates between two dates (inclusive)
    function getDateRange(start, end) {
        const dates = [];
        let current = new Date(start);
        const last = new Date(end);
        while (current <= last) {
            dates.push(formatDate(current));
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }

    // Load calendar data from API
    async function loadCalendar() {
        const [year, month] = calendarMonth.value.split('-');
        const daysInMonth = getDaysInMonth(Number(year), Number(month) - 1);
        calendarGrid.innerHTML = '';

        // Add weekday headers
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        weekdays.forEach(day => {
            const header = document.createElement('div');
            header.textContent = day;
            header.className = 'font-semibold text-center bg-gray-200 rounded';
            calendarGrid.appendChild(header);
        });

        // Fetch calendar data
        const res = await fetch('/api/calendar');
        calendarData = await res.json();

        // Find the weekday of the 1st of the month (0=Sunday)
        const firstDay = new Date(Number(year), Number(month) - 1, 1).getDay();

        // Add empty cells for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day bg-transparent cursor-default';
            calendarGrid.appendChild(empty);
        }

        // Prepare a map for absences spanning multiple days
        const absenceMap = {};
        calendarData.forEach(entry => {
            if (entry.note_type === 'Absence' && entry.out_start_date && entry.out_end_date) {
                const range = getDateRange(entry.out_start_date, entry.out_end_date);
                range.forEach(date => {
                    absenceMap[date] = absenceMap[date] || [];
                    absenceMap[date].push(entry);
                });
            }
        });

        // Build calendar grid
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${month.padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const entry = calendarData.find(e => e.date === dateStr && e.note_type !== 'Absence');
            const absences = absenceMap[dateStr] || [];

            const div = document.createElement('div');
            div.className = 'calendar-day bg-white rounded shadow cursor-pointer relative flex flex-col justify-between';

            // Day number
            div.innerHTML = `<div class="font-bold">${day}</div>`;

            // Absence bars (can be multiple)
            absences.forEach(absence => {
                const color = absenteeColors[absence.absentee] || 'bg-gray-400';
                const textColor = absenteeTextColors[absence.absentee] || 'text-gray-900';
                const bar = document.createElement('div');
                bar.className = `mt-1 mb-1 rounded text-xs px-1 py-0.5 ${color} ${textColor} font-semibold whitespace-nowrap overflow-hidden`;
                bar.style.cursor = 'pointer';
                bar.textContent = `${absence.absentee} out`;
                bar.onclick = (e) => {
                    e.stopPropagation();
                    openDayModal(absence.date, absence);
                };
                div.appendChild(bar);
            });

            // General note preview
            if (entry && entry.notes) {
                const preview = document.createElement('div');
                preview.className = 'mt-1 text-xs bg-gray-100 rounded px-1 py-0.5 cursor-pointer truncate';
                preview.textContent = entry.notes.length > 40 ? entry.notes.slice(0, 40) + '...' : entry.notes;
                preview.onclick = (e) => {
                    e.stopPropagation();
                    openDayModal(dateStr, entry);
                };
                div.appendChild(preview);
            }

            // Click on empty space opens modal/type selector
            div.onclick = () => {
                if (entry) {
                    openDayModal(dateStr, entry);
                } else if (absences.length === 1) {
                    // If only one absence, open that
                    openDayModal(absences[0].date, absences[0]);
                } else if (absences.length > 1) {
                    // If multiple absences, show the first (or you could make a selector)
                    openDayModal(absences[0].date, absences[0]);
                } else {
                    pendingCalendarDate = dateStr;
                    typeModal.classList.remove('hidden');
                }
            };
            calendarGrid.appendChild(div);
        }
    }

    // Open modal for adding/editing a day
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
        // Show/hide fields based on note type
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
        // Show delete button if entry exists
        deleteDayBtn.classList.toggle('hidden', !entry);
        // Save handler
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
                alert('Error saving note');
            }
        };
        // Delete handler
        deleteDayBtn.onclick = async () => {
            if (confirm('Delete this calendar entry?')) {
                const resp = await fetch(`/api/calendar/${dateStr}`, { method: 'DELETE' });
                if (resp.ok) {
                    dayModal.classList.add('hidden');
                    await loadCalendar();
                } else {
                    alert('Error deleting entry');
                }
            }
        };
    }

    // Add Note/Out button logic
    addDayNoteBtn.onclick = () => {
        pendingCalendarDate = formatDate(new Date());
        typeModal.classList.remove('hidden');
    };
    typeModalClose.onclick = () => {
        typeModal.classList.add('hidden');
        pendingCalendarDate = null;
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
    };

    // Month change
    calendarMonth.onchange = loadCalendar;

    // Initial load
    loadCalendar();
});