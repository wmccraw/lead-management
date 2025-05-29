document.addEventListener('DOMContentLoaded', () => {
    loadCustomers();

    document.getElementById('add-customer-btn').onclick = () => showCustomerModal();
    document.getElementById('close-customer-modal-btn').onclick = () => {
        document.getElementById('customer-modal').classList.add('hidden');
    };
    document.getElementById('save-customer-btn').onclick = saveCustomer;
});

async function loadCustomers() {
    try {
        const response = await fetch('/api/customers');
        const customers = await response.json();
        const tbody = document.getElementById('customers-table');
        tbody.innerHTML = '';
        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="border p-3">${customer.name || ''}</td>
                <td class="border p-3">${customer.company || ''}</td>
                <td class="border p-3">${customer.email || ''}</td>
                <td class="border p-3">${customer.phone || ''}</td>
                <td class="border p-3">${customer.date_added ? new Date(customer.date_added).toLocaleDateString() : ''}</td>
                <td class="border p-3">${customer.last_updated ? new Date(customer.last_updated).toLocaleDateString() : ''}</td>
                <td class="border p-3">
                    <button class="text-blue-500 hover:underline mr-2" onclick="editCustomer(${customer.id})">Edit</button>
                    <button class="text-red-500 hover:underline" onclick="deleteCustomer(${customer.id})">Delete</button>
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
    const title = document.getElementById('customer-modal-title');
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-company').value = '';
    document.getElementById('customer-email').value = '';
    document.getElementById('customer-phone').value = '';
    modal.dataset.id = id || '';

    if (id) {
        title.textContent = 'Edit Customer';
        fetch(`/api/customers/${id}`)
            .then(res => res.json())
            .then(customer => {
                document.getElementById('customer-name').value = customer.name || '';
                document.getElementById('customer-company').value = customer.company || '';
                document.getElementById('customer-email').value = customer.email || '';
                document.getElementById('customer-phone').value = customer.phone || '';
            });
    } else {
        title.textContent = 'Add Customer';
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

window.editCustomer = function(id) {
    showCustomerModal(id);
};

window.deleteCustomer = async function(id) {
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
};