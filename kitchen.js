let orders = JSON.parse(localStorage.getItem('thana_kitchen_orders') || '[]');

function save() { localStorage.setItem('thana_kitchen_orders', JSON.stringify(orders)); }

function render() {
    const pending = orders.filter(o => !o.status || o.status === 'new');
    const cooking = orders.filter(o => o.status === 'cooking');
    const ready = orders.filter(o => o.status === 'ready');

    document.getElementById('pendingCount').textContent = pending.length;
    document.getElementById('cookingCount').textContent = cooking.length;
    document.getElementById('readyCount').textContent = ready.length;
    document.getElementById('orderCount').textContent = orders.length;

    const list = document.getElementById('orderList');
    if (orders.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-icon">🍽️</div><h3>لا توجد طلبات</h3></div>';
        return;
    }

    const sorted = [...orders].sort((a, b) => {
        const order = { 'new': 0, 'cooking': 1, 'ready': 2 };
        return (order[a.status || 'new'] || 0) - (order[b.status || 'new'] || 0);
    });

    list.innerHTML = sorted.map(o => {
        const mins = Math.floor((Date.now() - o.time) / 60000);
        const urgent = mins > 10 && (!o.status || o.status === 'new');
        const late = mins > 20;
        return `
        <div class="order-card ${urgent ? 'urgent' : ''}">
            <div class="order-header">
                <span class="order-table">🪑 ${o.table}</span>
                <span class="order-timer ${late ? 'late' : ''}">⏱ ${mins}د</span>
            </div>
            <div class="order-items">
                ${o.items.map(i => `<div class="order-item">${i.name} <span class="item-qty">x${i.qty}</span>${i.notes ? `<div class="item-notes">📝 ${i.notes}</div>` : ''}</div>`).join('')}
            </div>
            <div class="order-actions">
                ${!o.status || o.status === 'new' ? `<button class="btn btn-start" onclick="start(${o.id})">🔥 بدأ التحضير</button>` : ''}
                ${o.status === 'cooking' ? `<button class="btn btn-ready" onclick="ready(${o.id})">✅ جاهز</button>` : ''}
                ${o.status === 'ready' ? `<button class="btn btn-deliver" onclick="deliver(${o.id})">📦 تم التسليم</button>` : ''}
            </div>
        </div>`;
    }).join('');
}

function start(id) { const o = orders.find(o => o.id === id); if (o) { o.status = 'cooking'; save(); render(); } }
function ready(id) { const o = orders.find(o => o.id === id); if (o) { o.status = 'ready'; save(); render(); } }
function deliver(id) { orders = orders.filter(o => o.id !== id); save(); render(); }

function addTestOrder() {
    orders.unshift({
        id: Date.now(),
        table: `طاولة ${Math.floor(Math.random() * 12) + 1}`,
        time: Date.now(),
        items: [
            { name: 'شاورما دجاج', qty: 2, notes: 'بدون ثوم' },
            { name: 'بيبسي', qty: 1, notes: '' }
        ]
    });
    save(); render();
    document.getElementById('alertTable').textContent = `🪑 طاولة ${orders[0].table}`;
    document.getElementById('alertOverlay').style.display = 'flex';
}

function dismissAlert() { document.getElementById('alertOverlay').style.display = 'none'; }

render();

window.addEventListener("storage", (e) => {
    if (e.key === "thana_kitchen_orders") {
        orders = JSON.parse(localStorage.getItem("thana_kitchen_orders") || "[]");
        render();
    }
});


// Waste functions
function wasteItem() {
    const inv = JSON.parse(localStorage.getItem('thana_inventory') || '[]');
    const select = document.getElementById('wasteItem');
    select.innerHTML = inv.map(i => `<option value="${i.id}">${i.name}</option>`).join('');
    document.getElementById('wasteModal').style.display = 'flex';
}

function submitWaste() {
    const id = parseInt(document.getElementById('wasteItem').value);
    const qty = parseFloat(document.getElementById('wasteQty').value);
    const reason = document.getElementById('wasteReason').value;
    
    if (!id || !qty || !reason) { alert('املأ كل الحقول'); return; }
    
    // خصم من المخزون
    const inv = JSON.parse(localStorage.getItem('thana_inventory') || '[]');
    const item = inv.find(i => i.id === id);
    if (item) { item.qty = Math.max(0, item.qty - qty); }
    localStorage.setItem('thana_inventory', JSON.stringify(inv));
    
    // تسجيل الهدر
    const waste = JSON.parse(localStorage.getItem('thana_waste') || '[]');
    waste.push({
        id: Date.now(),
        itemId: id,
        itemName: item ? item.name : 'غير معروف',
        qty,
        reason,
        time: new Date().toLocaleTimeString('ar-SA'),
        date: new Date().toLocaleDateString('ar-SA')
    });
    localStorage.setItem('thana_waste', JSON.stringify(waste));
    
    document.getElementById('wasteModal').style.display = 'none';
    alert('✅ تم تسجيل الهدر');
}
