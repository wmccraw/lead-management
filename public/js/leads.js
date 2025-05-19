let loadLeads;

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
                <td>
                    <button onclick="openLeadModal(${lead.id}, '${lead.name}', '${lead.email}', '${lead.status}', ${lead.quoted_from_vendor})">Edit</button>
                    <button onclick="deleteLead(${lead.id})">Delete</button>
                </td>
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

function openLeadModal(id, name, email, status, quoted) {
    document.getElementById('lead-id').value = id;
    document.getElementById('edit-lead-name').value = name;
    document.getElementById('edit-lead-email').value = email;
    document.getElementById('edit-lead-status').value = status;
    document.getElementById('edit-quoted-vendor').checked = quoted;
    document.getElementById('lead-modal').style.display = 'block';
}

function saveLead() {
    const id = document.getElementById('lead-id').value;
    const lead = {
        id: id,
        name: document.getElementById('edit-lead-name').value,
        email: document.getElementById('edit-lead-email').value,
        status: document.getElementById('edit-lead-status').value,
        quoted_from_vendor: document.getElementById('edit-quoted-vendor').checked
    };
    fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
    }).then(() => {
        document.getElementById('lead-modal').style.display = 'none';
        loadLeads();
    });
}

function deleteLead(id) {
    if (confirm('Are you sure you want to delete this lead?')) {
        fetch(`/api/leads/${id}`, {
            method: 'DELETE'
        }).then(() => loadLeads());
    }
}