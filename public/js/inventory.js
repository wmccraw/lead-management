document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-inventory-btn')?.addEventListener('click', () => showInventoryModal());
    loadInventory();
});

async function loadInventory() {
    try {
        const response = await fetch('/api/inventory');
        const items = await response.json();
        const tbody = document.getElementById('inventory-body');
        tbody.innerHTML = '';
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-3 px-6 border-b">${item.part_number}</td>
                <td class="py-3 px-6 border-b">${item.serial_number}</td>
                <td class="py-3 px-6 border-b">${item.part_name || ''}</td>
                <td class="py-3 px-6 border-b">${item.description || ''}</td>
                <td class="py-3 px-6 border-b">${item.category}</td>
                <td class="py-3 px-6 border-b">${item.manufacturer || ''}</td>
                <td class="py-3 px-6 border-b">${item.model_compatibility || ''}</td>
                <td class="py-3 px-6 border-b">${item.quantity_in_stock}</td>
                <td class="py-3 px-6 border-b">${item.location || ''}</td>
                <td class="py-3 px-6 border-b">${item.stock_status || ''}</td>
                <td class="py-3 px-6 border-b">${item.reorder_point || ''}</td>
                <td class="py-3 px-6 border-b">${item.supplier_name}</td>
                <td class="py-3 px-6 border-b">${item.supplier_part_number || ''}</td>
                <td class="py-3 px-6 border-b">${item.supplier_contact || ''}</td>
                <td class="py-3 px-6 border-b">${item.supplier_cost || ''}</td>
                <td class="py-3 px-6 border-b">${item.latest_lead_time_received || ''}</td>
                <td class="py-3 px-6 border-b">${item.retail_price || ''}</td>
                <td class="py-3 px-6 border-b">${item.last_sold_date ? new Date(item.last_sold_date).toLocaleDateString() : ''}</td>
                <td class="py-3 px-6 border-b">${item.sales_frequency || ''}</td>
                <td class="py-3 px-6 border-b">${item.condition || ''}</td>
                <td class="py-3 px-6 border-b">${item.image_url || ''}</td>
                <td class="py-3 px-6 border-b">${item.attachment_files || ''}</td>
                <td class="py-3 px-6 border-b">${new Date(item.date_added).toLocaleDateString()}</td>
                <td class="py-3 px-6 border-b">${new Date(item.last_updated).toLocaleDateString()}</td>
                <td class="py-3 px-6 border-b">${item.usage_rate || ''}</td>
                <td class="py-3 px-6 border-b">${item.inventory_turnover || ''}</td>
                <td class="py-3 px-6 border-b">
                    <button onclick="editInventory(${item.id})" class="text-blue-500 hover:underline mr-2">Edit</button>
                    <button onclick="deleteInventory(${item.id})" class="text-red-500 hover:underline">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error('Error loading inventory:', err);
    }
}

function showInventoryModal(id = null) {
    const modal = document.getElementById('inventory-modal');
    const title = document.getElementById('inventory-modal-title');
    modal.dataset.id = id || '';

    if (id) {
        title.textContent = 'Edit Item';
        fetch(`/api/inventory/${id}`)
            .then(res => res.json())
            .then(item => {
                document.getElementById('inventory-part-number').value = item.part_number;
                document.getElementById('inventory-serial-number').value = item.serial_number;
                document.getElementById('inventory-part-name').value = item.part_name || '';
                document.getElementById('inventory-description').value = item.description || '';
                document.getElementById('inventory-category').value = item.category;
                document.getElementById('inventory-manufacturer').value = item.manufacturer || '';
                document.getElementById('inventory-model-compatibility').value = item.model_compatibility || '';
                document.getElementById('inventory-quantity-in-stock').value = item.quantity_in_stock;
                document.getElementById('inventory-location').value = item.location || '';
                document.getElementById('inventory-stock-status').value = item.stock_status || '';
                document.getElementById('inventory-reorder-point').value = item.reorder_point || '';
                document.getElementById('inventory-supplier-name').value = item.supplier_name;
                document.getElementById('inventory-supplier-part-number').value = item.supplier_part_number || '';
                document.getElementById('inventory-supplier-contact').value = item.supplier_contact || '';
                document.getElementById('inventory-supplier-cost').value = item.supplier_cost || '';
                document.getElementById('inventory-latest-lead-time').value = item.latest_lead_time_received || '';
                document.getElementById('inventory-retail-price').value = item.retail_price || '';
                document.getElementById('inventory-last-sold-date').value = item.last_sold_date ? new Date(item.last_sold_date).toISOString().split('T')[0] : '';
                document.getElementById('inventory-sales-frequency').value = item.sales_frequency || '';
                document.getElementById('inventory-condition').value = item.condition || '';
                document.getElementById('inventory-image-url').value = item.image_url || '';
                document.getElementById('inventory-attachment-files').value = item.attachment_files || '';
                document.getElementById('inventory-usage-rate').value = item.usage_rate || '';
                document.getElementById('inventory-inventory-turnover').value = item.inventory_turnover || '';
            });
    } else {
        title.textContent = 'Add Item';
        document.getElementById('inventory-form').reset();
    }
    modal.classList.remove('hidden');
}

async function saveInventory() {
    const id = document.getElementById('inventory-modal').dataset.id;
    const data = {
        part_number: document.getElementById('inventory-part-number').value,
        serial_number: document.getElementById('inventory-serial-number').value,
        part_name: document.getElementById('inventory-part-name').value || null,
        description: document.getElementById('inventory-description').value || null,
        category: document.getElementById('inventory-category').value,
        manufacturer: document.getElementById('inventory-manufacturer').value || null,
        model_compatibility: document.getElementById('inventory-model-compatibility').value || null,
        quantity_in_stock: parseInt(document.getElementById('inventory-quantity-in-stock').value),
        location: document.getElementById('inventory-location').value || null,
        stock_status: document.getElementById('inventory-stock-status').value || null,
        reorder_point: document.getElementById('inventory-reorder-point').value ? parseInt(document.getElementById('inventory-reorder-point').value) : null,
        supplier_name: document.getElementById('inventory-supplier-name').value,
        supplier_part_number: document.getElementById('inventory-supplier-part-number').value || null,
        supplier_contact: document.getElementById('inventory-supplier-contact').value || null,
        supplier_cost: document.getElementById('inventory-supplier-cost').value ? parseFloat(document.getElementById('inventory-supplier-cost').value) : null,
        latest_lead_time_received: document.getElementById('inventory-latest-lead-time').value || null,
        retail_price: document.getElementById('inventory-retail-price').value ? parseFloat(document.getElementById('inventory-retail-price').value) : null,
        last_sold_date: document.getElementById('inventory-last-sold-date').value || null,
        sales_frequency: document.getElementById('inventory-sales-frequency').value || null,
        condition: document.getElementById('inventory-condition').value || null,
        image_url: document.getElementById('inventory-image-url').value || null,
        attachment_files: document.getElementById('inventory-attachment-files').value || null,
        usage_rate: document.getElementById('inventory-usage-rate').value ? parseFloat(document.getElementById('inventory-usage-rate').value) : null,
        inventory_turnover: document.getElementById('inventory-inventory-turnover').value ? parseFloat(document.getElementById('inventory-inventory-turnover').value) : null
    };

    try {
        const url = id ? `/api/inventory/${id}` : '/api/inventory';
        const method = id ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            document.getElementById('inventory-modal').classList.add('hidden');
            loadInventory();
        } else {
            alert('Failed to save item. Please try again.');
        }
    } catch (err) {
        console.error('Error saving item:', err);
        alert('Error saving item. Check console for details.');
    }
}

async function editInventory(id) {
    showInventoryModal(id);
}

async function deleteInventory(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        try {
            const response = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
            if (response.ok) {
                loadInventory();
            } else {
                alert('Failed to delete item. Please try again.');
            }
        } catch (err) {
            console.error('Error deleting item:', err);
            alert('Error deleting item. Check console for details.');
        }
    }
}