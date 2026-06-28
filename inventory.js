// Default inventory
const defaults = [
    { id: 1, name: 'دجاج', icon: '🍗', unit: 'كغ', qty: 25, min: 5 },
    { id: 2, name: 'لحم', icon: '🥩', unit: 'كغ', qty: 15, min: 3 },
    { id: 3, name: 'بطاطا', icon: '🥔', unit: 'كغ', qty: 30, min: 5 },
    { id: 4, name: 'خبز', icon: '🫓', unit: 'رغيف', qty: 100, min: 20 },
    { id: 5, name: 'بيبسي', icon: '🥤', unit: 'علبة', qty: 50, min: 10 },
    { id: 6, name: 'ثوم', icon: '🧄', unit: 'كغ', qty: 5, min: 1 },
    { id: 7, name: 'زيت', icon: '🫗', unit: 'لتر', qty: 20, min: 5 },
    { id: 8, name: 'حمص', icon: '🫘', unit: 'كغ', qty: 8, min: 2 },
];

// Load or init
let inventory = JSON.parse(localStorage.getItem('thana_inventory') || 'null');
if (!inventory) { inventory = defaults; save(); }

function save() { localStorage.setItem('thana_inventory', JSON.stringify(inventory)); }

// Auto-deduct logic: maps menu items to inventory items
const recipeMap = {
    'شاورما دجاج': [{ id: 1, qty: 0.15 }, { id: 4, qty: 1 }, { id: 6, qty: 0.02 }, { id: 7, qty: 0.05 }],
    'شاورما لحم':  [{ id: 2, qty: 0.15 }, { id: 4, qty: 1 }, { id: 6, qty: 0.02 }, { id: 7, qty: 0.05 }],
    'بطاطا مقلية': [{ id: 3, qty: 0.2 }, { id: 7, qty: 0.1 }],
    'بيبسي':       [{ id: 5, qty: 1 }],
    'فلافل':      [{ id: 8, qty: 0.1 }, { id: 7, qty: 0.05 }],
    'حمص':        [{ id: 8, qty: 0.15 }, { id: 7, qty: 0.02 }],
};

// Auto-deduct when kitchen marks ready
window.addEventListener('storage', (e) => {
    if (e.key === 'thana_kitchen_orders') {
        const orders = JSON.parse(localStorage.getItem('thana_kitchen_orders') || '[]');
        orders.forEach(o => {
            if (o.status === 'ready' && !o.deducted) {
                o.items.forEach(item => {
                    const recipe = recipeMap[item.name];
                    if (recipe) {
                        recipe.forEach(r => {
                            const inv = inventory.find(i => i.id === r.id);
                            if (inv) { inv.qty = Math.max(0, inv.qty - r.qty * item.qty); }
                        });
                    }
                });
                o.deducted = true;
            }
        });
        localStorage.setItem('thana_kitchen_orders', JSON.stringify(orders));
        save();
        render();
    }
});

function render() {
    const alerts = inventory.filter(i => i.qty <= i.min);
    document.getElementById('alertCount').textContent = alerts.length;

    document.getElementById('inventoryGrid').innerHTML = inventory.map(i => {
        const pct = Math.min(100, (i.qty / (i.min * 3)) * 100);
        const isLow = i.qty <= i.min;
        const barColor = isLow ? 'var(--accent)' : 'var(--accent2)';
        return `
        <div class="inv-card ${isLow ? 'low' : ''}">
            <div class="inv-icon">${i.icon}</div>
            <div class="inv-info">
                <div class="inv-name">${i.name}</div>
                <div class="inv-detail">الحد الأدنى: ${i.min} ${i.unit}</div>
                <div class="inv-bar"><div class="inv-bar-fill" style="width:${pct}%;background:${barColor}"></div></div>
            </div>
            <div class="inv-qty ${isLow ? 'low' : ''}">${i.qty}<br><small>${i.unit}</small></div>
        </div>`;
    }).join('');

    // Populate add form
    document.getElementById('itemSelect').innerHTML = inventory.map(i => 
        `<option value="${i.id}">${i.name}</option>`
    ).join('');
}

function toggleForm() {
    const f = document.getElementById('addForm');
    f.style.display = f.style.display === 'none' ? 'flex' : 'none';
}

function addStock() {
    const id = parseInt(document.getElementById('itemSelect').value);
    const qty = parseInt(document.getElementById('addQty').value);
    const inv = inventory.find(i => i.id === id);
    if (inv && qty > 0) { inv.qty += qty; save(); render(); }
    document.getElementById('addQty').value = 1;
}

render();
