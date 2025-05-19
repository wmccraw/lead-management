document.addEventListener('DOMContentLoaded', () => {
    loadLeads();
    loadCustomers();
});
document.getElementById('add-lead-btn').addEventListener('click', () => showLeadModal('add'));
document.querySelector('.close').addEventListener('click', () => document.getElementById('lead-modal').style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('lead-modal')) {
        document.getElementById('lead-modal').style.display = 'none';
    }
});

async function loadLeads() {
    const response = await fetch('/api/leads');
    const leads = await response.json();
    const tbody = document.getElementById('leads-body');
    tbody.innerHTML = '';
    leads.forEach(lead => {
        const timeInSystem = Math.floor((new Date() - new Date(lead.created_at)) / (1000 * 60 * 60 * 24));
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${lead.name}</td>
            <td>${lead.company || ''}</td>
            <td>${lead.email}</td>
            <td>${lead.phone || ''}</td>
            <td>${lead.product_category || ''}</td>
            <td>${lead.make || ''}</td>
            <td>${lead.model || ''}</td>
            <td>${lead.notes || ''}</td>
            <td>${lead.status}</td>
            <td>${timeInSystem} days</td>
            <td><input type="checkbox" ${lead.quoted_from_vendor ? 'checked' : ''} onchange="toggleQuoted(${lead.id}, this.checked)"></td>
            <td>
                <button onclick="showLeadModal('edit', ${lead.id})">Edit</button>
                <button onclick="deleteLead(${lead.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadCustomers() {
    const response = await fetch('/api/leads');
    const leads = await response.json();
    const tbody = document.getElementById('customers-body');
    tbody.innerHTML = '';
    const customers = [];
    const emails = new Set();
    leads.forEach(lead => {
        if (!emails.has(lead.email)) {
            emails.add(lead.email);
            customers.push({
                name: lead.name,
                company: lead.company,
                email: lead.email,
                phone: lead.phone
            });
        }
    });
    customers.forEach(customer => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.company || ''}</td>
            <td>${customer.email}</td>
            <td>${customer.phone || ''}</td>
        `;
        tbody.appendChild(tr);
    });
}

function showLeadModal(mode, id = null) {
    const modal = document.getElementById('lead-modal');
    const title = document.getElementById('modal-title');
    const customerFields = document.getElementById('customer-fields');
    modal.dataset.mode = mode;
    modal.dataset.id = id || '';

    if (mode === 'add') {
        title.textContent = 'Add Lead';
        customerFields.style.display = 'block';
        document.getElementById('name').value = '';
        document.getElementById('company').value = '';
        document.getElementById('email').value = '';
        document.getElementById('phone').value = '';
        document.getElementById('product-category').value = '';
        document.getElementById('make').value = '';
        document.getElementById('model').value = '';
        document.getElementById('notes').value = '';
        document.getElementById('status').value = 'Pending';
    } else if (mode === 'edit') {
        title.textContent = 'Edit Lead';
        customerFields.style.display = 'none';
        fetch(`/api/leads/${id}`)
            .then(res => res.json())
            .then(lead => {
                document.getElementById('product-category').value = lead.product_category || '';
                document.getElementById('make').value = lead.make || '';
                document.getElementById('model').value = lead.model || '';
                document.getElementById('notes').value = lead.notes || '';
                document.getElementById('status').value = lead.status;
            });
    }
    modal.style.display = 'block';
}

async function saveLead() {
    const modal = document.getElementById('lead-modal');
    const mode = modal.dataset.mode;
    const id = modal.dataset.id;
    const data = {};
    if (mode === 'add') {
        data.name = document.getElementById('name').value;
        data.company = document.getElementById('company').value;
        data.email = document.getElementById('email').value;
        data.phone = document.getElementById('phone').value;
    }
    data.product_category = document.getElementById('product-category').value;
    data.make = document.getElementById('make').value;
    data.model = document.getElementById('model').value;
    data.notes = document.getElementById('notes').value;
    data.status = document.getElementById('status').value;

    const url = mode === 'add' ? '/api/leads' : `/api/leads/${id}`;
    const method = mode === 'add' ? 'POST' : 'PUT';
    await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    modal.style.display = 'none';
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