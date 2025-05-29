document.addEventListener('DOMContentLoaded', () => {
    // Calendar state
    let calendarData = [];

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

    // Helper to get days in month
    function getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    // Helper to format date as YYYY-MM-DD
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // Load calendar data from API
    async function loadCalendar() {
        const [year, month] = calendarMonth.value.split('-');
        const daysInMonth = getDaysInMonth(Number(year), Number(month) - 1);
        calendarGrid.innerHTML = '';

        // Fetch calendar data
        const res = await fetch('/api/calendar');
        calendarData = await res.json();

        // Build calendar grid
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${month.padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const entry = calendarData.find(e => e.date === dateStr);

            const div = document.createElement('div');
            div.className = 'calendar-day bg-white rounded shadow cursor-pointer relative';
            div.innerHTML = `<div class="font-bold">${day}</div>`;
            if (entry) {
                div.innerHTML += `<div class="text-xs mt-1">${entry.note_type === 'Absence' ? `<span class="text-red-500 font-semibold">Out: ${entry.absentee}</span>` : entry.notes || ''}</div>`;
                div.classList.add('border-green-500');
            }
            div.onclick = () => openDayModal(dateStr, entry);
            calendarGrid.appendChild(div);
        }
    }

    // Open modal for adding/editing a day
    function openDayModal(dateStr, entry) {
        dayModal.classList.remove('hidden');
        dayModalTitle.textContent = entry ? 'Edit Note' : 'Add Note';
        dayStartDate.value = dateStr;
        dayEndDate.value = entry && entry.out_end_date ? entry.out_end_date : '';
        dayNotes.value = entry ? (entry.notes || '') : '';
        absenteeSelect.value = entry && entry.absentee ? entry.absentee : '';
        noteTypeInput.value = entry ? entry.note_type : '';
        fullNotes.innerHTML = entry && entry.notes ? `<div class="expanded">${entry.notes}</div>` : '';
        // Show/hide fields based on note type
        if (entry && entry.note_type === 'Absence') {
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
        typeModal.classList.remove('hidden');
    };
    typeModalClose.onclick = () => {
        typeModal.classList.add('hidden');
    };
    typeGeneralBtn.onclick = () => {
        typeModal.classList.add('hidden');
        noteTypeInput.value = 'General';
        absenteeLabel.classList.add('hidden');
        absenteeSelect.classList.add('hidden');
        dayEndDateLabel.classList.add('hidden');
        dayEndDate.classList.add('hidden');
        openDayModal(formatDate(new Date()), null);
    };
    typeAbsenceBtn.onclick = () => {
        typeModal.classList.add('hidden');
        noteTypeInput.value = 'Absence';
        absenteeLabel.classList.remove('hidden');
        absenteeSelect.classList.remove('hidden');
        dayEndDateLabel.classList.remove('hidden');
        dayEndDate.classList.remove('hidden');
        openDayModal(formatDate(new Date()), null);
    };

    // Month change
    calendarMonth.onchange = loadCalendar;

    // Initial load
    loadCalendar();
});