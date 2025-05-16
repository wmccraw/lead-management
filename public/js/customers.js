document.addEventListener('DOMContentLoaded', () => {
    const customersTab = document.querySelector('.tab[data-tab="customers"]');
    if (customersTab) {
        customersTab.addEventListener('click', () => loadTab('customers'));
    }
});

function loadTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(tab).classList.add('active');
}