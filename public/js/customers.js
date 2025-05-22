document.getElementById('add-customer-btn').addEventListener('click', () => showCustomerModal());

async function loadCustomers() {
    try {
        const response = await fetch('/api/customers');
        const customers = await response.json();
        const tbody = document.getElementById('customers-body');
        tbody.innerHTML = '';
        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-3 px-6 border-b">${customer.name}</td>
                <td class="py-3 px-6 border-b">${customer.company || ''}</td>
                <td class="py-3 px-6 border-b">${customer.email}</td>
                <td class="py-3 px-6 border-b">${customer.phone || ''}</td>
                <td class="py-3 px-6 border-b">${new Date(customer.date_added).toLocaleDateString()}</td>
                <td class="py-3 px-6 border-b">${new Date(customer.last_updated).toLocaleDateString()}</td>
                <td class="py-3 px-6 border-b">
                    <button onclick="editCustomer(${customer.id})" class="text-blue-500 hover:underline mr-2">Edit</button>
                    <button onclick="deleteCustomer(${customer.id})" class="text-red-500 hover:underline">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error('Error loading customers:', err);
    }
}

function showCustomerModal(id = null) {
    const modal = document.getElementById('customer-modal');
    modal.dataset.id = id || '';

    if (id) {
        fetch(`/api/customers/${id}`)
            .then(res => res.json())
            .then(customer => {
                document.getElementById('customer-name').value = customer.name;
                document.getElementById('customer-company').value = customer.company || '';
                document.getElementById('customer-email').value = customer.email;
                document.getElementById('customer-phone').value = customer.phone || '';
            });
    } else {
        document.getElementById('customer-form').reset();
    }
    modal.classList.remove('hidden');
}

async function saveCustomer() {
    const id = document.getElementById('customer-modal').dataset.id;
    const data = {
        name: document.getElementById('customer-name').value,
        company: document.getElementById('customer-company').value || null,
        email: document.getElementById('customer-email').value,
        phone: document.getElementById('customer-phone').value || null
    };

    try {
        const url = id ? `/api/customers/${id}` : '/api/customers';
        const method = id ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            document.getElementById('customer-modal').classList.add('hidden');
            loadCustomers();
        } else {
            alert('Failed to save customer. Please try again.');
        }
    } catch (err) {
        console.error('Error saving customer:', err);
        alert('Error saving customer. Check console for details.');
    }
}

async function editCustomer(id) {
    showCustomerModal(id);
}

async function deleteCustomer(id) {
    if (confirm('Are you sure you want to delete this customer?')) {
        try {
            const response = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
            if (response.ok) {
                loadCustomers();
            } else {
                alert('Failed to delete customer. Please try again.');
            }
        } catch (err) {
            console.error('Error deleting customer:', err);
            alert('Error deleting customer. Check console for details.');
        }
    }
}

document.addEventListener('DOMContentLoaded', loadCustomers);