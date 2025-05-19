function loadTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.content').forEach(c => c.style.display = 'none');
    document.querySelector(`.tab[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(tab).style.display = 'block';
    if (tab === 'leads') {
        loadLeads();
    } else if (tab === 'customers') {
        loadCustomers();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            loadTab(tabName);
        });
    });
    loadTab('leads');

    document.querySelectorAll('.modal .close').forEach(close => {
        close.addEventListener('click', () => {
            close.closest('.modal').style.display = 'none';
        });
    });
    window.addEventListener('click', (event) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) modal.style.display = 'none';
        });
    });
});