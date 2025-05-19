function loadTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('border-green-500', 'active-tab'));
    document.querySelectorAll('.content').forEach(c => c.classList.add('hidden'));
    const activeTab = document.querySelector(`.tab[data-tab="${tab}"]`);
    activeTab.classList.add('border-green-500', 'active-tab');
    document.getElementById(tab).classList.remove('hidden');
    if (tab === 'leads') loadLeads();
    if (tab === 'customers') loadCustomers();
    if (tab === 'calendar') loadCalendar();
    if (tab === 'inventory') loadInventory();
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
            close.closest('.modal').classList.add('hidden');
        });
    });
    window.addEventListener('click', (event) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) modal.classList.add('hidden');
        });
    });
});