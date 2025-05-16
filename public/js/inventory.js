document.addEventListener('DOMContentLoaded', () => {
    const inventoryTab = document.querySelector('.tab[data-tab="inventory"]');
    if (inventoryTab) {
        inventoryTab.addEventListener('click', () => loadTab('inventory'));
        if (document.getElementById('inventory').classList.contains('active')) {
            loadInventory();
        }
    }

    async function loadInventory() {
        const response = await fetch('/api/inventory');
        const parts = await response.json();
        const tbody = document.querySelector('#inventory-table tbody');
        tbody.innerHTML = '';
        parts.forEach(part => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${part.part_number}</td>
                <td>${part.serial_number || ''}</td>
                <td>${part.part_name}</td>
                <td>${part.category}</td>
                <td>${part.supplier_name}</td>
                <td>${part.quantity}</td>
                <td>${part.stock_status || ''}</td>
                <td>${part.retail_price ? part.retail_price.toFixed(2) : ''}</td>
                <td>${part.condition || ''}</td>
                <td>${part.image_url ? `<img src="${part.image_url}" class="thumbnail">` : ''}</td>
                <td><button onclick="editPart(${part.id})">Edit</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    const form = document.getElementById('inventory-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const part = {
                part_number: document.getElementById('part-number').value,
                serial_number: document.getElementById('serial-number').value,
                part_name: document.getElementById('part-name').value,
                description: document.getElementById('description').value,
                category: document.getElementById('category').value,
                manufacturer: document.getElementById('manufacturer').value,
                model_compatibility: document.getElementById('model-compatibility').value,
                quantity: parseInt(document.getElementById('quantity').value) || 0,
                location: document.getElementById('location').value,
                stock_status: document.getElementById('stock-status').value,
                reorder_point: parseInt(document.getElementById('reorder-point').value),
                supplier_name: document.getElementById('supplier-name').value,
                supplier_part_number: document.getElementById('supplier-part-number').value,
                supplier_contact: document.getElementById('supplier-contact').value,
                supplier_cost: parseFloat(document.getElementById('supplier-cost').value),
                latest_lead_time_received: document.getElementById('latest-lead-time').value,
                retail_price: parseFloat(document.getElementById('retail-price').value),
                last_sold_date: document.getElementById('last-sold-date').value,
                sales_frequency: document.getElementById('sales-frequency').value,
                condition: document.getElementById('condition').value,
                image_url: document.getElementById('image-url').value,
                attachment_files: document.getElementById('attachment-files').value,
                date_added: new Date().toISOString().split('T')[0],
                last_updated: new Date().toISOString().split('T')[0],
                usage_rate: document.getElementById('usage-rate').value,
                inventory_turnover: document.getElementById('inventory-turnover').value,
                tags: document.getElementById('tags').value,
                custom_attributes: document.getElementById('custom-attributes').value ? JSON.parse(document.getElementById('custom-attributes').value) : {}
            };
            await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(part)
            });
            form.reset();
            loadInventory();
        });
    }

    document.getElementById('download-csv').addEventListener('click', () => {
        window.location.href = '/api/inventory/csv';
    });

    document.getElementById('upload-files').addEventListener('click', async () => {
        const mainCsv = document.getElementById('upload-main-csv').files[0];
        const retailCsv = document.getElementById('upload-retail-csv').files[0];
        const imageZip = document.getElementById('upload-image-zip').files[0];
        const formData = new FormData();
        if (mainCsv) formData.append('mainCsv', mainCsv);
        if (retailCsv) formData.append('retailCsv', retailCsv);
        if (imageZip) formData.append('imageZip', imageZip);
        const response = await fetch('/api/inventory/upload', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        alert(result.message || 'Upload complete');
        loadInventory();
    });
});

function loadTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(tab).classList.add('active');
}

function editPart(id) {
    alert('Edit part functionality to be implemented');
}