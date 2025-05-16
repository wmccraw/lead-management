document.addEventListener('DOMContentLoaded', () => {
    const calendarTab = document.querySelector('.tab[data-tab="calendar"]');
    if (calendarTab) {
        calendarTab.addEventListener('click', () => loadTab('calendar'));
    }
});

function loadTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(tab).classList.add('active');
}