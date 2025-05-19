document.getElementById('add-lead-btn').addEventListener('click', () => showLeadModal('add'));

async function loadLeads() {
    const response = await fetch('/api/leads');
    const leads = await response.json();
    const tbody = document.getElementById('leads-body');
    tbody.innerHTML = '';
    leads.forEach(lead => {
        const timeInSystem = Math.floor((new Date() - new Date(lead.created_at)) / (1000 * 60 * 60 * 24));
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-200 hover:bg-gray-100';
        tr.innerHTML = `
            <td class="py-3 px-6">${lead.name}</td>
            <td class="py-3 px-6">${lead.company || ''}</td>
            <td class="py-3 px-6">${lead.email}</td>
            <td class="py-3 px-6">${lead.phone || ''}</td>
            <td class="py-3 px-6">${lead.product_category || ''}</td>
            <td class="py-3 px-6">${lead.make || ''}</td>
            <td class="py-3 px-6">${lead.model || ''}</td>
            <td class="py-3 px-6">${lead.notes || ''}</td>
            <td class="py-3 px-6">${lead.status}</td>
            <td class="py-3 px-6">${timeInSystem} days</td>
            <td class="py-3 px-6">
                <input type="checkbox" ${lead.quoted_from_vendor ? 'checked' : ''} onchange="toggleQuoted(${lead.id}, this.checked)">
            </td>
            <td class="py-3 px-6">
                <button onclick="showLeadModal('edit', ${lead.id})" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2">Edit</button>
                <button onclick="deleteLead(${lead.id})" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showLeadModal(mode, id = null) {
    const modal = document.getElementById('lead-modal');
    const title = document.getElementById('lead-modal-title');
    const customerFields = document.getElementById('lead-customer-fields');
    modal.dataset.mode = mode;
    modal.dataset.id = id || '';

    if (mode === 'add') {
        title.textContent = 'Add Lead';
        customerFields.style.display = 'block';
        document.getElementById('lead-name').value = '';
        document.getElementById('lead-company').value = '';
        document.getElementById('lead-email').value = '';
        document.getElementById('lead-phone').value = '';
        document.getElementById('lead-product-category').value = '';
        document.getElementById('lead-make').value = '';
        document.getElementById('lead-model').value = '';
        document.getElementById('lead-notes').value = '';
        document.getElementById('lead-status').value = 'Pending';
    } else if (mode === 'edit') {
        title.textContent = 'Edit Lead';
        customerFields.style.display = 'none';
        fetch(`/api/leads/${id}`)
            .then(res => res.json())
            .then(lead => {
                document.getElementById('lead-product-category').value = lead.product_category || '';
                document.getElementById('lead-make').value = lead.make || '';
                document.getElementById('lead-model').value = lead.model || '';
                document.getElementById('lead-notes').value = lead.notes || '';
                document.getElementById('lead-status').value = lead.status;
            });
    }
    modal.classList.remove('hidden');
}

async function saveLead() {
    const modal = document.getElementById('lead-modal');
    const mode = modal.dataset.mode;
    const id = modal.dataset.id;
    const data = {};
    if (mode === 'add') {
        data.name = document.getElementById('lead-name').value;
        data.company = document.getElementById('lead-company').value;
        data.email = document.getElementById('lead-email').value;
        data.phone = document.getElementById('lead-phone').value;
    }
    data.product_category = document.getElementById('lead-product-category').value;
    data.make = document.getElementById('lead-make').value;
    data.model = document.getElementById('lead-model').value;
    data.notes = document.getElementById('lead-notes').value;
    data.status = document.getElementById('lead-status').value;

    const url = mode === 'add' ? '/api/leads' : `/api/leads/${id}`;
    const method = mode === 'add' ? 'POST' : 'PUT';
    await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    modal.classList.add('hidden');
    loadLeads();
    loadCustomers();
}

async function toggleQuoted(id, checked) {
    await fetch(`/api/leads/${id}/quoted`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoted_from_vendor: checked })
    });
}

async function deleteLead(id) {
    if (confirm('Are you sure you want to delete this lead?')) {
        await fetch(`/api/leads/${id}`, { method: 'DELETE' });
        loadLeads();
        loadCustomers();
    }
}