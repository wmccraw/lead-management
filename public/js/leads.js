document.addEventListener('DOMContentLoaded', () => {
    const leadsTab = document.querySelector('.tab[data-tab="leads"]');
    if (leadsTab) {
        leadsTab.addEventListener('click', () => loadTab('leads'));
    }
    if (document.getElementById('leads').classList.contains('active')) {
        loadLeads();
    }

    async function loadLeads() {
        const response = await fetch('/api/leads');
        const leads = await response.json();
        const tbody = document.querySelector('#leads-table tbody');
        tbody.innerHTML = '';
        leads.forEach(lead => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${lead.name}</td>
                <td>${lead.email}</td>
                <td>${lead.status}</td>
                <td>${lead.time_in_system}</td>
                <td>${lead.quoted_from_vendor ? 'Yes' : 'No'}</td>
                <td><button onclick="editLead(${lead.id})">Edit</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    const form = document.getElementById('lead-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const lead = {
                name: document.getElementById('lead-name').value,
                email: document.getElementById('lead-email').value,
                status: document.getElementById('lead-status').value,
                quoted_from_vendor: document.getElementById('quoted-vendor').checked
            };
            await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lead)
            });
            form.reset();
            loadLeads();
        });
    }
});

function editLead(id) {
    alert('Edit lead functionality to be implemented');
}

function loadTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(tab).classList.add('active');
}