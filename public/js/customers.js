let loadCustomers; // Declare globally so tabs.js can call it

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
                <td><button onclick="editCustomer(${customer.id})">Edit</button></td>
            `;
            tbody.appendChild(tr);
        });
    };

    document.getElementById('export-customers').addEventListener('click', () => {
        window.location.href = '/api/customers/csv';
    });
});

function editCustomer(id) {
    alert('Edit customer functionality to be implemented');
}