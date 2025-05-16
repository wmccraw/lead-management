document.addEventListener('DOMContentLoaded', () => {
    const customersTab = document.querySelector('.tab[data-tab="customers"]');
    if (customersTab) {
        customersTab.addEventListener('click', () => loadTab('customers'));
    }
    if (document.getElementById('customers').classList.contains('active')) {
        loadCustomers();
    }

    async function loadCustomers() {
        const response = await fetch('/api/customers');
        const customers = await response.json();
        const tbody = document.querySelector('#customers-table tbody');
        tbody.innerHTML = '';
        customers.forEach(customer => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td><button onclick="editCustomer(${customer.id})">Edit</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById('export-customers').addEventListener('click', () => {
        window.location.href = '/api/customers/csv';
    });
});

function editCustomer(id) {
    alert('Edit customer functionality to be implemented');
}

function loadTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.content').forEach(c => c.style.display = 'none');
    document.querySelector(`.tab[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(tab).style.display = 'block';
}