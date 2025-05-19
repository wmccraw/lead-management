document.getElementById('add-customer-btn').addEventListener('click', () => showCustomerModal());

async function loadCustomers() {
    const response = await fetch('/api/customers');
    const customers = await response.json();
    const tbody = document.getElementById('customers-body');
    tbody.innerHTML = '';
    customers.forEach(customer => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-200 hover:bg-gray-100';
        tr.innerHTML = `
            <td class="py-3 px-6">${customer.name}</td>
            <td class="py-3 px-6">${customer.company || ''}</td>
            <td class="py-3 px-6">${customer.email}</td>
            <td class="py-3 px-6">${customer.phone || ''}</td>
        `;
        tbody.appendChild(tr);
    });
}

function showCustomerModal() {
    const modal = document.getElementById('customer-modal');
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-company').value = '';
    document.getElementById('customer-email').value = '';
    document.getElementById('customer-phone').value = '';
    modal.classList.remove('hidden');
}

async function saveCustomer() {
    const modal = document.getElementById('customer-modal');
    const data = {
        name: document.getElementById('customer-name').value,
        company: document.getElementById('customer-company').value,
        email: document.getElementById('customer-email').value,
        phone: document.getElementById('customer-phone').value
    };

    await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    modal.classList.add('hidden');
    loadCustomers();
}