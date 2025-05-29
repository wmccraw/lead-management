document.addEventListener('DOMContentLoaded', () => {
    loadLeads();

    // Modal open/close logic
    document.getElementById('add-lead-btn').onclick = () => showLeadModal();
    document.getElementById('close-lead-modal-btn').onclick = () => {
        document.getElementById('lead-modal').classList.add('hidden');
    };
    document.getElementById('save-lead-btn').onclick = saveLead;
});

async function loadLeads() {
    try {
        const response = await fetch('/api/leads');
        const leads = await response.json();
        const tbody = document.getElementById('leads-table');
        tbody.innerHTML = '';
        leads.forEach(lead => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="border p-3">${lead.name || lead.customer_name || ''}</td>
                <td class="border p-3">${lead.company || ''}</td>
                <td class="border p-3">${lead.email || ''}</td>
                <td class="border p-3">${lead.phone || ''}</td>
                <td class="border p-3">${lead.product_category || ''}</td>
                <td class="border p-3">${lead.make || ''}</td>
                <td class="border p-3">${lead.model || ''}</td>
                <td class="border p-3">${lead.notes || ''}</td>
                <td class="border p-3">${lead.status || ''}</td>
                <td class="border p-3">${lead.quoted_from_vendor ? 'Yes' : 'No'}</td>
                <td class="border p-3">${lead.created_at ? timeInSystem(lead.created_at) : ''}</td>
                <td class="border p-3">
                    <button class="text-blue-500 hover:underline mr-2" onclick="editLead(${lead.id})">Edit</button>
                    <button class="text-red-500 hover:underline" onclick="deleteLead(${lead.id})">Delete</button>
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
    document.getElementById('lead-id').value = id || '';
    if (id) {
        title.textContent = 'Edit Lead';
        fetch(`/api/leads/${id}`)
            .then(res => res.json())
            .then(lead => {
                document.getElementById('lead-name').value = lead.name || lead.customer_name || '';
                document.getElementById('lead-company').value = lead.company || '';
                document.getElementById('lead-email').value = lead.email || '';
                document.getElementById('lead-phone').value = lead.phone || '';
                document.getElementById('lead-product-category').value = lead.product_category || '';
                document.getElementById('lead-make').value = lead.make || '';
                document.getElementById('lead-model').value = lead.model || '';
                document.getElementById('lead-notes').value = lead.notes || '';
                document.getElementById('lead-status').value = lead.status || 'New';
                document.getElementById('lead-quoted-from-vendor').checked = !!lead.quoted_from_vendor;
            });
    } else {
        title.textContent = 'Add Lead';
        document.getElementById('lead-id').value = '';
        document.getElementById('lead-name').value = '';
        document.getElementById('lead-company').value = '';
        document.getElementById('lead-email').value = '';
        document.getElementById('lead-phone').value = '';
        document.getElementById('lead-product-category').value = '';
        document.getElementById('lead-make').value = '';
        document.getElementById('lead-model').value = '';
        document.getElementById('lead-notes').value = '';
        document.getElementById('lead-status').value = 'New';
        document.getElementById('lead-quoted-from-vendor').checked = false;
    }
    modal.classList.remove('hidden');
}

async function saveLead() {
    const id = document.getElementById('lead-id').value;
    const data = {
        name: document.getElementById('lead-name').value,
        company: document.getElementById('lead-company').value || null,
        email: document.getElementById('lead-email').value,
        phone: document.getElementById('lead-phone').value || null,
        product_category: document.getElementById('lead-product-category').value || null,
        make: document.getElementById('lead-make').value || null,
        model: document.getElementById('lead-model').value || null,
        notes: document.getElementById('lead-notes').value || null,
        status: document.getElementById('lead-status').value,
        quoted_from_vendor: document.getElementById('lead-quoted-from-vendor').checked
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
            alert('Failed to save lead. Please check your input.');
        }
    } catch (err) {
        console.error('Error saving lead:', err);
        alert('Error saving lead. Check console for details.');
    }
}

window.editLead = function(id) {
    showLeadModal(id);
};

window.deleteLead = async function(id) {
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
};

// Helper to show time in system (days)
function timeInSystem(createdAt) {
    const created = new Date(createdAt);
    const now = new Date();
    const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return diff === 0 ? 'Today' : `${diff} day${diff === 1 ? '' : 's'}`;
}