document.getElementById('add-inventory-btn').addEventListener('click', () => showInventoryModal('add'));

async function loadInventory() {
    const response = await fetch('/api/inventory');
    const items = await response.json();
    const tbody = document.getElementById('inventory-body');
    tbody.innerHTML = '';
    items.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-200 hover:bg-gray-100';
        tr.innerHTML = `
            <td class="py-3 px-6">${item.part_number}</td>
            <td class="py-3 px-6">${item.serial_number}</td>
            <td class="py-3 px-6">${item.part_name || ''}</td>
            <td class="py-3 px-6">${item.description || ''}</td>
            <td class="py-3 px-6">${item.category}</td>
            <td class="py-3 px-6">${item.manufacturer || ''}</td>
            <td class="py-3 px-6">${item.model_compatibility || ''}</td>
            <td class="py-3 px-6">${item.quantity_in_stock}</td>
            <td class="py-3 px-6">${item.location || ''}</td>
            <td class="py-3 px-6">${item.stock_status || ''}</td>
            <td class="py-3 px-6">${item.reorder_point || ''}</td>
            <td class="py-3 px-6">${item.supplier_name}</td>
            <td class="py-3 px-6">${item.supplier_part_number || ''}</td>
            <td class="py-3 px-6">${item.supplier_contact || ''}</td>
            <td class="py-3 px-6">${item.supplier_cost ? '$' + item.supplier_cost.toFixed(2) : ''}</td>
            <td class="py-3 px-6">${item.latest_lead_time_received || ''}</td>
            <td class="py-3 px-6">${item.retail_price ? '$' + item.retail_price.toFixed(2) : ''}</td>
            <td class="py-3 px-6">${item.last_sold_date || ''}</td>
            <td class="py-3 px-6">${item.sales_frequency || ''}</td>
            <td class="py-3 px-6">${item.condition || ''}</td>
            <td class="py-3 px-6">${item.image_url || ''}</td>
            <td class="py-3 px-6">${item.attachment_files || ''}</td>
            <td class="py-3 px-6">${new Date(item.date_added).toLocaleDateString()}</td>
            <td class="py-3 px-6">${new Date(item.last_updated).toLocaleDateString()}</td>
            <td class="py-3 px-6">${item.usage_rate ? item.usage_rate.toFixed(2) : ''}</td>
            <td class="py-3 px-6">${item.inventory_turnover ? item.inventory_turnover.toFixed(2) : ''}</td>
            <td class="py-3 px-6">
                <button onclick="showInventoryModal('edit', ${item.id})" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2">Edit</button>
                <button onclick="deleteInventory(${item.id})" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showInventoryModal(mode, id = null) {
    const modal = document.getElementById('inventory-modal');
    const title = document.getElementById('inventory-modal-title');
    modal.dataset.mode = mode;
    modal.dataset.id = id || '';

    if (mode === 'add') {
        title.textContent = 'Add Item';
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
    } else if (mode === 'edit') {
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
                document.getElementById('inventory-last-sold-date').value = item.last_sold_date || '';
                document.getElementById('inventory-sales-frequency').value = item.sales_frequency || '';
                document.getElementById('inventory-condition').value = item.condition || '';
                document.getElementById('inventory-image-url').value = item.image_url || '';
                document.getElementById('inventory-attachment-files').value = item.attachment_files || '';
                document.getElementById('inventory-usage-rate').value = item.usage_rate || '';
                document.getElementById('inventory-inventory-turnover').value = item.inventory_turnover || '';
            });
    }
    modal.classList.remove('hidden');
}

async function saveInventory() {
    const modal = document.getElementById('inventory-modal');
    const mode = modal.dataset.mode;
    const id = modal.dataset.id;
    const data = {
        part_number: document.getElementById('inventory-part-number').value,
        serial_number: document.getElementById('inventory-serial-number').value,
        part_name: document.getElementById('inventory-part-name').value,
        description: document.getElementById('inventory-description').value,
        category: document.getElementById('inventory-category').value,
        manufacturer: document.getElementById('inventory-manufacturer').value,
        model_compatibility: document.getElementById('inventory-model-compatibility').value,
        quantity_in_stock: parseInt(document.getElementById('inventory-quantity-in-stock').value) || 0,
        location: document.getElementById('inventory-location').value,
        stock_status: document.getElementById('inventory-stock-status').value,
        reorder_point: parseInt(document.getElementById('inventory-reorder-point').value) || null,
        supplier_name: document.getElementById('inventory-supplier-name').value,
        supplier_part_number: document.getElementById('inventory-supplier-part-number').value,
        supplier_contact: document.getElementById('inventory-supplier-contact').value,
        supplier_cost: parseFloat(document.getElementById('inventory-supplier-cost').value) || null,
        latest_lead_time_received: document.getElementById('inventory-latest-lead-time').value,
        retail_price: parseFloat(document.getElementById('inventory-retail-price').value) || null,
        last_sold_date: document.getElementById('inventory-last-sold-date').value || null,
        sales_frequency: document.getElementById('inventory-sales-frequency').value,
        condition: document.getElementById('inventory-condition').value,
        image_url: document.getElementById('inventory-image-url').value,
        attachment_files: document.getElementById('inventory-attachment-files').value,
        usage_rate: parseFloat(document.getElementById('inventory-usage-rate').value) || null,
        inventory_turnover: parseFloat(document.getElementById('inventory-inventory-turnover').value) || null
    };

    const url = mode === 'add' ? '/api/inventory' : `/api/inventory/${id}`;
    const method = mode === 'add' ? 'POST' : 'PUT';
    await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    modal.classList.add('hidden');
    loadInventory();
}

async function deleteInventory(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
        loadInventory();
    }
}