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
            <td class="py-3 px-6">${item.name}</td>
            <td class="py-3 px-6">${item.category || ''}</td>
            <td class="py-3 px-6">${item.quantity}</td>
            <td class="py-3 px-6">$${item.price.toFixed(2)}</td>
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
        document.getElementById('inventory-name').value = '';
        document.getElementById('inventory-category').value = '';
        document.getElementById('inventory-quantity').value = '';
        document.getElementById('inventory-price').value = '';
    } else if (mode === 'edit') {
        title.textContent = 'Edit Item';
        fetch(`/api/inventory/${id}`)
            .then(res => res.json())
            .then(item => {
                document.getElementById('inventory-name').value = item.name;
                document.getElementById('inventory-category').value = item.category || '';
                document.getElementById('inventory-quantity').value = item.quantity;
                document.getElementById('inventory-price').value = item.price;
            });
    }
    modal.classList.remove('hidden');
}

async function saveInventory() {
    const modal = document.getElementById('inventory-modal');
    const mode = modal.dataset.mode;
    const id = modal.dataset.id;
    const data = {
        name: document.getElementById('inventory-name').value,
        category: document.getElementById('inventory-category').value,
        quantity: parseInt(document.getElementById('inventory-quantity').value),
        price: parseFloat(document.getElementById('inventory-price').value)
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