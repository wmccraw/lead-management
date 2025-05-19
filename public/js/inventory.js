let loadInventory;

document.addEventListener('DOMContentLoaded', () => {
    loadInventory = async () => {
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
                <td>
                    <button onclick="openInventoryModal(${item.id}, '${JSON.stringify(item)}')">Edit</button>
                    <button onclick="deleteInventory(${item.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

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
        alert('Upload functionality to be implemented'); // Placeholder
    });
});

function openInventoryModal(id, item) {
    const data = JSON.parse(item);
    document.getElementById('inventory-id').value = id;
    document.getElementById('edit-part-number').value = data.part_number;
    document.getElementById('edit-serial-number').value = data.serial_number || '';
    document.getElementById('edit-part-name').value = data.part_name;
    document.getElementById('edit-description').value = data.description || '';
    document.getElementById('edit-category').value = data.category;
    document.getElementById('edit-manufacturer').value = data.manufacturer || '';
    document.getElementById('edit-model-compatibility').value = data.model_compatibility || '';
    document.getElementById('edit-quantity').value = data.quantity || 0;
    document.getElementById('edit-location').value = data.location || '';
    document.getElementById('edit-stock-status').value = data.stock_status || 'In Stock';
    document.getElementById('edit-reorder-point').value = data.reorder_point || 0;
    document.getElementById('edit-supplier-name').value = data.supplier_name;
    document.getElementById('edit-supplier-part-number').value = data.supplier_part_number || '';
    document.getElementById('edit-supplier-contact').value = data.supplier_contact || '';
    document.getElementById('edit-supplier-cost').value = data.supplier_cost || 0;
    document.getElementById('edit-latest-lead-time').value = data.latest_lead_time || '';
    document.getElementById('edit-retail-price').value = data.retail_price || 0;
    document.getElementById('edit-last-sold-date').value = data.last_sold_date || '';
    document.getElementById('edit-sales-frequency').value = data.sales_frequency || '';
    document.getElementById('edit-condition').value = data.condition || 'New';
    document.getElementById('edit-image-url').value = data.image_url || '';
    document.getElementById('edit-attachment-files').value = data.attachment_files || '';
    document.getElementById('edit-tags').value = data.tags || '';
    document.getElementById('edit-custom-attributes').value = data.custom_attributes || '';
    document.getElementById('inventory-modal').style.display = 'block';
}

function saveInventory() {
    const id = document.getElementById('inventory-id').value;
    const inventory = {
        id: id,
        part_number: document.getElementById('edit-part-number').value,
        serial_number: document.getElementById('edit-serial-number').value,
        part_name: document.getElementById('edit-part-name').value,
        description: document.getElementById('edit-description').value,
        category: document.getElementById('edit-category').value,
        manufacturer: document.getElementById('edit-manufacturer').value,
        model_compatibility: document.getElementById('edit-model-compatibility').value,
        quantity: document.getElementById('edit-quantity').value,
        location: document.getElementById('edit-location').value,
        stock_status: document.getElementById('edit-stock-status').value,
        reorder_point: document.getElementById('edit-reorder-point').value,
        supplier_name: document.getElementById('edit-supplier-name').value,
        supplier_part_number: document.getElementById('edit-supplier-part-number').value,
        supplier_contact: document.getElementById('edit-supplier-contact').value,
        supplier_cost: document.getElementById('edit-supplier-cost').value,
        latest_lead_time: document.getElementById('edit-latest-lead-time').value,
        retail_price: document.getElementById('edit-retail-price').value,
        last_sold_date: document.getElementById('edit-last-sold-date').value,
        sales_frequency: document.getElementById('edit-sales-frequency').value,
        condition: document.getElementById('edit-condition').value,
        image_url: document.getElementById('edit-image-url').value,
        attachment_files: document.getElementById('edit-attachment-files').value,
        tags: document.getElementById('edit-tags').value,
        custom_attributes: document.getElementById('edit-custom-attributes').value
    };
    fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inventory)
    }).then(() => {
        document.getElementById('inventory-modal').style.display = 'none';
        loadInventory();
    });
}

function deleteInventory(id) {
    if (confirm('Are you sure you want to delete this inventory item?')) {
        fetch(`/api/inventory/${id}`, {
            method: 'DELETE'
        }).then(() => loadInventory());
    }
}