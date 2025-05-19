document.getElementById('add-event-btn').addEventListener('click', () => showEventModal('add'));

async function loadCalendar() {
    const response = await fetch('/api/calendar');
    const events = await response.json();
    const tbody = document.getElementById('calendar-body');
    tbody.innerHTML = '';
    events.forEach(event => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-200 hover:bg-gray-100';
        tr.innerHTML = `
            <td class="py-3 px-6">${event.title}</td>
            <td class="py-3 px-6">${event.event_date}</td>
            <td class="py-3 px-6">${event.description || ''}</td>
            <td class="py-3 px-6">${event.organizer || ''}</td>
            <td class="py-3 px-6">${event.location || ''}</td>
            <td class="py-3 px-6">${event.priority || ''}</td>
            <td class="py-3 px-6">${event.status || ''}</td>
            <td class="py-3 px-6">
                <button onclick="showEventModal('edit', ${event.id})" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2">Edit</button>
                <button onclick="deleteEvent(${event.id})" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showEventModal(mode, id = null) {
    const modal = document.getElementById('event-modal');
    const title = document.getElementById('event-modal-title');
    modal.dataset.mode = mode;
    modal.dataset.id = id || '';

    if (mode === 'add') {
        title.textContent = 'Add Event';
        document.getElementById('event-title').value = '';
        document.getElementById('event-date').value = '';
        document.getElementById('event-description').value = '';
        document.getElementById('event-organizer').value = '';
        document.getElementById('event-location').value = '';
        document.getElementById('event-priority').value = '';
        document.getElementById('event-status').value = '';
    } else if (mode === 'edit') {
        title.textContent = 'Edit Event';
        fetch(`/api/calendar/${id}`)
            .then(res => res.json())
            .then(event => {
                document.getElementById('event-title').value = event.title;
                document.getElementById('event-date').value = event.event_date;
                document.getElementById('event-description').value = event.description || '';
                document.getElementById('event-organizer').value = event.organizer || '';
                document.getElementById('event-location').value = event.location || '';
                document.getElementById('event-priority').value = event.priority || '';
                document.getElementById('event-status').value = event.status || '';
            });
    }
    modal.classList.remove('hidden');
}

async function saveEvent() {
    const modal = document.getElementById('event-modal');
    const mode = modal.dataset.mode;
    const id = modal.dataset.id;
    const data = {
        title: document.getElementById('event-title').value,
        event_date: document.getElementById('event-date').value,
        description: document.getElementById('event-description').value,
        organizer: document.getElementById('event-organizer').value,
        location: document.getElementById('event-location').value,
        priority: document.getElementById('event-priority').value,
        status: document.getElementById('event-status').value
    };

    const url = mode === 'add' ? '/api/calendar' : `/api/calendar/${id}`;
    const method = mode === 'add' ? 'POST' : 'PUT';
    await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    modal.classList.add('hidden');
    loadCalendar();
}

async function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
        await fetch(`/api/calendar/${id}`, { method: 'DELETE' });
        loadCalendar();
    }
}