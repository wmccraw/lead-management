document.addEventListener('DOMContentLoaded', () => {
    loadInventory();

    document.getElementById('add-inventory-btn').onclick = () => showInventoryModal();
    document.getElementById('close-inventory-modal-btn').onclick = () => {
        document.getElementById('inventory-modal').classList.add('hidden');
    };
    document.getElementById('save-inventory-btn').onclick = saveInventory;
});

async function loadInventory() {
    try {
        const response = await fetch('/api/inventory');
        const items = await response.json();
        const tbody = document.getElementById('inventory-table');
        tbody.innerHTML = '';
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="border p-3">${item.part_number || ''}</td>
                <td class="border p-3">${item.serial_number || ''}</td>
                <td class="border p-3">${item.part_name || ''}</td>
                <td class="border p-3">${item.description || ''}</td>
                <td class="border p-3">${item.category || ''}</td>
                <td class="border p-3">${item.manufacturer || ''}</td>
                <td class="border p-3">${item.model_compatibility || ''}</td>
                <td class="border p-3">${item.quantity_in_stock ?? ''}</td>
                <td class="border p-3">${item.location || ''}</td>
                <td class="border p-3">${item.stock_status || ''}</td>
                <td class="border p-3">${item.reorder_point ?? ''}</td>
                <td class="border p-3">${item.supplier_name || ''}</td>
                <td class="border p-3">${item.supplier_part_number || ''}</td>
                <td class="border p-3">${item.supplier_contact || ''}</td>
                <td class="border p-3">${item.supplier_cost ?? ''}</td>
                <td class="border p-3">${item.latest_lead_time_received ?? ''}</td>
                <td class="border p-3">${item.retail_price ?? ''}</td>
                <td class="border p-3">${item.last_sold_date ? new Date(item.last_sold_date).toLocaleDateString() : ''}</td>
                <td class="border p-3">${item.sales_frequency ?? ''}</td>
                <td class="border p-3">${item.condition || ''}</td>
                <td class="border p-3">${item.image_url || ''}</td>
                <td class="border p-3">${item.attachment_files || ''}</td>
                <td class="border p-3">${item.date_added ? new Date(item.date_added).toLocaleDateString() : ''}</td>
                <td class="border p-3">${item.last_updated ? new Date(item.last_updated).toLocaleDateString() : ''}</td>
                <td class="border p-3">${item.usage_rate ?? ''}</td>
                <td class="border p-3">${item.inventory_turnover ?? ''}</td>
                <td class="border p-3">
                    <button class="text-blue-500 hover:underline mr-2" onclick="editInventory(${item.id})">Edit</button>
                    <button class="text-red-500 hover:underline" onclick="deleteInventory(${item.id})">Delete</button>
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
    document.getElementById('inventory-id').value = id || '';
    if (id) {
        title.textContent = 'Edit Inventory Item';
        fetch(`/api/inventory/${id}`)
            .then(res => res.json())
            .then(item => {
                document.getElementById('inventory-part-number').value = item.part_number || '';
                document.getElementById('inventory-serial-number').value = item.serial_number || '';
                document.getElementById('inventory-part-name').value = item.part_name || '';
                document.getElementById('inventory-description').value = item.description || '';
                document.getElementById('inventory-category').value = item.category || '';
                document.getElementById('inventory-manufacturer').value = item.manufacturer || '';
                document.getElementById('inventory-model-compatibility').value = item.model_compatibility || '';
                document.getElementById('inventory-quantity-in-stock').value = item.quantity_in_stock ?? '';
                document.getElementById('inventory-location').value = item.location || '';
                document.getElementById('inventory-stock-status').value = item.stock_status || '';
                document.getElementById('inventory-reorder-point').value = item.reorder_point ?? '';
                document.getElementById('inventory-supplier-name').value = item.supplier_name || '';
                document.getElementById('inventory-supplier-part-number').value = item.supplier_part_number || '';
                document.getElementById('inventory-supplier-contact').value = item.supplier_contact || '';
                document.getElementById('inventory-supplier-cost').value = item.supplier_cost ?? '';
                document.getElementById('inventory-latest-lead-time').value = item.latest_lead_time_received ?? '';
                document.getElementById('inventory-retail-price').value = item.retail_price ?? '';
                document.getElementById('inventory-last-sold-date').value = item.last_sold_date ? new Date(item.last_sold_date).toISOString().split('T')[0] : '';
                document.getElementById('inventory-sales-frequency').value = item.sales_frequency ?? '';
                document.getElementById('inventory-condition').value = item.condition || '';
                document.getElementById('inventory-image-url').value = item.image_url || '';
                document.getElementById('inventory-attachment-files').value = item.attachment_files || '';
                document.getElementById('inventory-usage-rate').value = item.usage_rate ?? '';
                document.getElementById('inventory-inventory-turnover').value = item.inventory_turnover ?? '';
            });
    } else {
        title.textContent = 'Add Inventory Item';
        document.getElementById('inventory-id').value = '';
        document.getElementById('inventory-part-number').value = '';
        document.getElementById('inventory-serial-number').value = '';
        document.getElementById('inventory-part-name').value = '';
        document.getElementById('inventory-description').value = '';
        document.getElementById('inventory-category').value = '';
        document.getElementById('inventory-manufacturer').value = '';
        document.getElementById('inventory-model-compatibility').value = '';
        document.getElementById('inventory-quantity-in-stock').value = '';
        document.getElementById('inventory-location').value = '';
        document.getElementById('inventory-stock-status').value = '';
        document.getElementById('inventory-reorder-point').value = '';
        document.getElementById('inventory-supplier-name').value = '';
        document.getElementById('inventory-supplier-part-number').value = '';
        document.getElementById('inventory-supplier-contact').value = '';
        document.getElementById('inventory-supplier-cost').value = '';
        document.getElementById('inventory-latest-lead-time').value = '';
        document.getElementById('inventory-retail-price').value = '';
        document.getElementById('inventory-last-sold-date').value = '';
        document.getElementById('inventory-sales-frequency').value = '';
        document.getElementById('inventory-condition').value = '';
        document.getElementById('inventory-image-url').value = '';
        document.getElementById('inventory-attachment-files').value = '';
        document.getElementById('inventory-usage-rate').value = '';
        document.getElementById('inventory-inventory-turnover').value = '';
    }
    modal.classList.remove('hidden');
}

async function saveInventory() {
    const id = document.getElementById('inventory-id').value;
    const data = {
        part_number: document.getElementById('inventory-part-number').value,
        serial_number: document.getElementById('inventory-serial-number').value,
        part_name: document.getElementById('inventory-part-name').value || null,
        description: document.getElementById('inventory-description').value || null,
        category: document.getElementById('inventory-category').value,
        manufacturer: document.getElementById('inventory-manufacturer').value || null,
        model_compatibility: document.getElementById('inventory-model-compatibility').value || null,
        quantity_in_stock: parseInt(document.getElementById('inventory-quantity-in-stock').value) || 0,
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

window.editInventory = function(id) {
    showInventoryModal(id);
};

window.deleteInventory = async function(id) {
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
};