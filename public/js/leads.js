let loadLeads;

document.addEventListener('DOMContentLoaded', () => {
    loadLeads = async () => {
        const response = await fetch('/api/leads');
        const leads = await response.json();
        const tbody = document.querySelector('#leads-table tbody');
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
                <td>${lead.status || 'New'}</td>
                <td>${timeInSystem} days</td>
                <td>${lead.quoted_from_vendor ? 'Yes' : 'No'}</td>
                <td>
                    <button onclick="openLeadModal(${lead.id}, '${lead.name}', '${lead.company || ''}', '${lead.email}', '${lead.phone || ''}', '${lead.product_category || ''}', '${lead.make || ''}', '${lead.model || ''}', '${lead.notes || ''}', '${lead.status || 'New'}', ${lead.quoted_from_vendor})">Edit</button>
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
                company: document.getElementById('lead-company').value,
                email: document.getElementById('lead-email').value,
                phone: document.getElementById('lead-phone').value,
                product_category: document.getElementById('lead-product-category').value,
                make: document.getElementById('lead-make').value,
                model: document.getElementById('lead-model').value,
                notes: document.getElementById('lead-notes').value,
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

function openLeadModal(id, name, company, email, phone, product_category, make, model, notes, status, quoted) {
    document.getElementById('lead-id').value = id;
    document.getElementById('edit-lead-name').value = name;
    document.getElementById('edit-lead-company').value = company;
    document.getElementById('edit-lead-email').value = email;
    document.getElementById('edit-lead-phone').value = phone;
    document.getElementById('edit-lead-product-category').value = product_category;
    document.getElementById('edit-lead-make').value = make;
    document.getElementById('edit-lead-model').value = model;
    document.getElementById('edit-lead-notes').value = notes;
    document.getElementById('edit-lead-status').value = status;
    document.getElementById('edit-quoted-vendor').checked = quoted;
    document.getElementById('lead-modal').style.display = 'block';
}

function saveLead() {
    const id = document.getElementById('lead-id').value;
    const lead = {
        name: document.getElementById('edit-lead-name').value,
        company: document.getElementById('edit-lead-company').value,
        email: document.getElementById('edit-lead-email').value,
        phone: document.getElementById('edit-lead-phone').value,
        product_category: document.getElementById('edit-lead-product-category').value,
        make: document.getElementById('edit-lead-make').value,
        model: document.getElementById('edit-lead-model').value,
        notes: document.getElementById('edit-lead-notes').value,
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