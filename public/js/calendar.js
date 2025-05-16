let loadCalendar; // Declare globally so tabs.js can call it

document.addEventListener('DOMContentLoaded', () => {
    loadCalendar = () => {
        const tbody = document.querySelector('#calendar-events tbody');
        tbody.innerHTML = '<tr><td>No events</td><td>--</td></tr>';
        // Add event loading logic if needed
    };

    document.getElementById('calendar-date').addEventListener('change', (e) => {
        loadCalendar(); // Refresh calendar on date change
    });
});