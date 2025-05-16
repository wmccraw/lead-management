document.addEventListener('DOMContentLoaded', () => {
    const inventoryTab = document.querySelector('.tab[data-tab="inventory"]');
    if (inventoryTab) {
        inventoryTab.addEventListener('click', () => loadTab('inventory'));
    }
    if (document.getElementById('inventory').classList.contains('active')) {
        loadInventory();
    }

    async function loadInventory() {
        const response = await fetch('/api/inventory');
        const inventory = await response.json();
        const tbody = document.querySelector('#inventory-table tbody');
        tbody.innerHTML = '';
        inventory.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.part_number}</td>
                <td>${item.serial_number || ''}</td>
                <td>${item.part_name}</td>
                <td>${item.category}</td>
                <td>${item.supplier_name}</td>
                <td>${item.quantity}</td>
                <td>${item.stock_status}</td>
                <td>${item.retail_price || 0}</td>
                <td>${item.condition}</td>
                <td><img src="${item.image_url || ''}" class="thumbnail"></td>
                <td><button onclick="editInventory(${item.id})">Edit</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    const form = document.getElementById('inventory-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inventory = {
                part_number: document.getElementById('part-number').value,
                serial_number: document.getElementById('serial-number').value,
                part_name: document.getElementById('part-name').value,
                description: document.getElementById('description').value,
                category: document.getElementById('category').value,
                manufacturer: document.getElementById('manufacturer').value,
                model_compatibility: document.getElementById('model-compatibility').value,
                quantity: document.getElementById('quantity').value,
                location: document.getElementById('location').value,
                stock_status: document.getElementById('stock-status').value,
                reorder_point: document.getElementById('reorder-point').value,
                supplier_name: document.getElementById('supplier-name').value,
                supplier_part_number: document.getElementById('supplier-part-number').value,
                supplier_contact: document.getElementById('supplier-contact').value,
                supplier_cost: document.getElementById('supplier-cost').value,
                latest_lead_time: document.getElementById('latest-lead-time').value,
                retail_price: document.getElementById('retail-price').value,
                last_sold_date: document.getElementById('last-sold-date').value,
                sales_frequency: document.getElementById('sales-frequency').value,
                condition: document.getElementById('condition').value,
                image_url: document.getElementById('image-url').value,
                attachment_files: document.getElementById('attachment-files').value,
                tags: document.getElementById('tags').value,
                custom_attributes: document.getElementById('custom-attributes').value
            };
            await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inventory)
            });
            form.reset();
            loadInventory();
        });
    }

    document.getElementById('download-csv').addEventListener('click', () => {
        window.location.href = '/api/inventory/csv';
    });

    document.getElementById('upload-files').addEventListener('click', () => {
        alert('Upload functionality to be implemented');
    });
});

function editInventory(id) {
    alert('Edit inventory functionality to be implemented');
}

function loadTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.content').forEach(c => c.style.display = 'none');
    document.querySelector(`.tab[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(tab).style.display = 'block';
}