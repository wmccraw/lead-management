// Centralized tab-switching logic
function loadTab(tab) {
    // Remove active class from all tabs and hide all content
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.content').forEach(c => c.style.display = 'none');

    // Add active class to the clicked tab and show its content
    document.querySelector(`.tab[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(tab).style.display = 'block';

    // Trigger the specific tab's load function
    if (tab === 'leads') loadLeads();
    if (tab === 'customers') loadCustomers();
    if (tab === 'calendar') loadCalendar();
    if (tab === 'inventory') loadInventory();
}

// Attach click event listeners to all tabs
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            loadTab(tabName);
        });
    });

    // Load the default tab (Leads) on page load
    loadTab('leads');
});