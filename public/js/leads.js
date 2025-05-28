document.getElementById('add-lead-btn').addEventListener('click', () => showLeadModal());

async function loadLeads() {
    try {
        const response = await fetch('/api/leads');
        const leads = await response.json();
        const tbody = document.getElementById('leads-body');
        tbody.innerHTML = '';
        leads.forEach(lead => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-3 px-6 border-b">${lead.customer_name}</td>
                <td class="py-3 px-6 border-b">${lead.company || ''}</td>
                <td class="py-3 px-6 border-b">${lead.email}</td>
                <td class="py-3 px-6 border-b">${lead.phone || ''}</td>
                <td class="py-3 px-6 border-b">${lead.product_category || ''}</td>
                <td class="py-3 px-6 border-b">${lead.make || ''}</td>
                <td class="py-3 px-6 border-b">${lead.model || ''}</td>
                <td class="py-3 px-6 border-b">${lead.notes || ''}</td>
                <td class="py-3 px-6 border-b">${lead.status}</td>
                <td class="py-3 px-6 border-b">${new Date(lead.created_at).toLocaleDateString()}</td>
                <td class="py-3 px-6 border-b">${lead.quoted_from_vendor ? 'Yes' : 'No'}</td>
                <td class="py-3 px-6 border-b">
                    <button onclick="editLead(${lead.id})" class="text-blue-500 hover:underline mr-2">Edit</button>
                    <button onclick="deleteLead(${lead.id})" class="text-red-500 hover:underline">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error('Error loading leads:', err);
    }
}

function showLeadModal(id = null) {
    const modal = document.getElementById('lead-modal');
    const title = document.getElementById('lead-modal-title');
    modal.dataset.id = id || '';

    if (id) {
        title.textContent = 'Edit Lead';
        fetch(`/api/leads/${id}`)
            .then(res => res.json())
            .then(lead => {
                document.getElementById('lead-name').value = lead.customer_name;
                document.getElementById('lead-company').value = lead.company || '';
                document.getElementById('lead-email').value = lead.email;
                document.getElementById('lead-phone').value = lead.phone || '';
                document.getElementById('lead-product-category').value = lead.product_category || '';
                document.getElementById('lead-make').value = lead.make || '';
                document.getElementById('lead-model').value = lead.model || '';
                document.getElementById('lead-notes').value = lead.notes || '';
                document.getElementById('lead-status').value = lead.status;
            });
    } else {
        title.textContent = 'Add Lead';
        document.getElementById('lead-form').reset();
    }
    modal.classList.remove('hidden');
}

async function saveLead() {
    const id = document.getElementById('lead-modal').dataset.id;
    const data = {
        name: document.getElementById('lead-name').value,
        company: document.getElementById('lead-company').value || null,
        email: document.getElementById('lead-email').value,
        phone: document.getElementById('lead-phone').value || null,
        product_category: document.getElementById('lead-product-category').value || null,
        make: document.getElementById('lead-make').value || null,
        model: document.getElementById('lead-model').value || null,
        notes: document.getElementById('lead-notes').value || null,
        status: document.getElementById('lead-status').value
    };

    try {
        const url = id ? `/api/leads/${id}` : '/api/leads';
        const method = id ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            document.getElementById('lead-modal').classList.add('hidden');
            loadLeads();
        } else {
            alert('Failed to save lead. Please try again.');
        }
    } catch (err) {
        console.error('Error saving lead:', err);
        alert('Error saving lead. Check console for details.');
    }
}

async function editLead(id) {
    showLeadModal(id);
}

async function deleteLead(id) {
    if (confirm('Are you sure you want to delete this lead?')) {
        try {
            const response = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
            if (response.ok) {
                loadLeads();
            } else {
                alert('Failed to delete lead. Please try again.');
            }
        } catch (err) {
            console.error('Error deleting lead:', err);
            alert('Error deleting lead. Check console for details.');
        }
    }
}

document.addEventListener('DOMContentLoaded', loadLeads);