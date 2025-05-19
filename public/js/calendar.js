let loadCalendar;

document.addEventListener('DOMContentLoaded', () => {
    loadCalendar = async () => {
        const date = document.getElementById('calendar-date').value || new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/calendar?date=${date}`);
        const events = await response.json();
        const tbody = document.querySelector('#calendar-events tbody');
        tbody.innerHTML = '';
        events.forEach(event => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${event.name}</td>
                <td>${event.time}</td>
                <td>
                    <button onclick="openEventModal(${event.id}, '${event.name}', '${event.time}')">Edit</button>
                    <button onclick="deleteEvent(${event.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    const form = document.getElementById('event-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const event = {
                name: document.getElementById('event-name').value,
                time: document.getElementById('event-time').value,
                date: document.getElementById('calendar-date').value
            };
            await fetch('/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
            });
            form.reset();
            loadCalendar();
        });
    }

    document.getElementById('calendar-date').addEventListener('change', loadCalendar);
});

function openEventModal(id, name, time) {
    document.getElementById('event-id').value = id;
    document.getElementById('edit-event-name').value = name;
    document.getElementById('edit-event-time').value = time;
    document.getElementById('event-modal').style.display = 'block';
}

function saveEvent() {
    const id = document.getElementById('event-id').value;
    const event = {
        id: id,
        name: document.getElementById('edit-event-name').value,
        time: document.getElementById('edit-event-time').value,
        date: document.getElementById('calendar-date').value
    };
    fetch(`/api/calendar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
    }).then(() => {
        document.getElementById('event-modal').style.display = 'none';
        loadCalendar();
    });
}

function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
        fetch(`/api/calendar/${id}`, {
            method: 'DELETE'
        }).then(() => loadCalendar());
    }
}