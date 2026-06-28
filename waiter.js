// Menu
const menu = [
    { id: 1, name: 'شاورما دجاج', price: 3, icon: '🌯' },
    { id: 2, name: 'شاورما لحم', price: 4, icon: '🥙' },
    { id: 3, name: 'بطاطا مقلية', price: 2, icon: '🍟' },
    { id: 4, name: 'بيبسي', price: 1, icon: '🥤' },
    { id: 5, name: 'فلافل', price: 2, icon: '🧆' },
    { id: 6, name: 'حمص', price: 2, icon: '🫘' },
    { id: 7, name: 'مشاوي', price: 5, icon: '🍖' },
    { id: 8, name: 'سلطة', price: 2, icon: '🥗' },
];

// Tables 1-15
const tableSelect = document.getElementById('tableNumber');
for (let i = 1; i <= 15; i++) {
    tableSelect.innerHTML += `<option value="طاولة ${i}">طاولة ${i}</option>`;
}

// Cart
let cart = [];

// Render Menu
document.getElementById('menuGrid').innerHTML = menu.map(item => `
    <div class="menu-item">
        <div class="menu-icon">${item.icon}</div>
        <div class="menu-name">${item.name}</div>
        <div class="menu-price">$${item.price}</div>
        <input class="menu-notes" placeholder="ملاحظات..." id="notes_${item.id}">
        <button class="menu-add" onclick="addToCart(${item.id})">➕ أضف</button>
    </div>
`).join('');

function addToCart(id) {
    const item = menu.find(i => i.id === id);
    const notes = document.getElementById(`notes_${id}`).value;
    const existing = cart.find(c => c.id === id && c.notes === notes);
    if (existing) { existing.qty++; }
    else { cart.push({ ...item, qty: 1, notes }); }
    renderCart();
}

function removeFromCart(index) { cart.splice(index, 1); renderCart(); }

function renderCart() {
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    document.getElementById('cartCount').textContent = cart.length;
    document.getElementById('cartTotal').textContent = '$' + total;
    document.getElementById('cartSummary').style.display = cart.length ? 'block' : 'none';
    document.getElementById('cartItems').innerHTML = cart.map((i, idx) => `
        <div class="cart-item">
            <span class="cart-item-name">${i.name} ${i.notes ? '📝' : ''}</span>
            <span class="cart-item-qty">x${i.qty}</span>
            <span class="cart-item-del" onclick="removeFromCart(${idx})">✕</span>
        </div>
    `).join('');
}

function sendOrder() {
    const table = document.getElementById('tableNumber').value;
    if (!table) { alert('اختر الطاولة أولاً'); return; }
    if (cart.length === 0) { alert('السلة فارغة'); return; }

    const orders = JSON.parse(localStorage.getItem('thana_kitchen_orders') || '[]');
    orders.unshift({
        id: Date.now(),
        table,
        time: Date.now(),
        items: cart.map(i => ({ name: i.name, qty: i.qty, notes: i.notes }))
    });
    localStorage.setItem('thana_kitchen_orders', JSON.stringify(orders));

    cart = [];
    renderCart();
    document.getElementById('tableNumber').value = '';
    alert('✅ تم إرسال الطلب للمطبخ!');
}

renderCart();
