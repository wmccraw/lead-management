let loadCustomers;

document.addEventListener('DOMContentLoaded', () => {
    loadCustomers = async () => {
        const response = await fetch('/api/customers');
        const customers = await response.json();
        const tbody = document.querySelector('#customers-table tbody');
        tbody.innerHTML = '';
        customers.forEach(customer => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>
                    <button onclick="openCustomerModal(${customer.id}, '${customer.name}', '${customer.email}')">Edit</button>
                    <button onclick="deleteCustomer(${customer.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    const form = document.getElementById('customer-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const customer = {
                name: document.getElementById('customer-name').value,
                email: document.getElementById('customer-email').value
            };
            await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customer)
            });
            form.reset();
            loadCustomers();
        });
    }

    document.getElementById('export-customers').addEventListener('click', () => {
        window.location.href = '/api/customers/csv';
    });
});

function openCustomerModal(id, name, email) {
    document.getElementById('customer-id').value = id;
    document.getElementById('edit-customer-name').value = name;
    document.getElementById('edit-customer-email').value = email;
    document.getElementById('customer-modal').style.display = 'block';
}

function saveCustomer() {
    const id = document.getElementById('customer-id').value;
    const customer = {
        id: id,
        name: document.getElementById('edit-customer-name').value,
        email: document.getElementById('edit-customer-email').value
    };
    fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
    }).then(() => {
        document.getElementById('customer-modal').style.display = 'none';
        loadCustomers();
    });
}

function deleteCustomer(id) {
    if (confirm('Are you sure you want to delete this customer?')) {
        fetch(`/api/customers/${id}`, {
            method: 'DELETE'
        }).then(() => loadCustomers());
    }
}