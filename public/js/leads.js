let loadLeads; // Declare globally so tabs.js can call it

document.addEventListener('DOMContentLoaded', () => {
    loadLeads = async () => {
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
    };

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

    document.getElementById('export-leads').addEventListener('click', () => {
        window.location.href = '/api/leads/csv';
    });
});

function editLead(id) {
    alert('Edit lead functionality to be implemented');
}