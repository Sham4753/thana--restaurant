function activateAI() {
    const alerts = getAlerts();
    document.getElementById('aiMessage').textContent = alerts[0] || 'كل شيء تمام';
}

function startVoice() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA';
        recognition.onresult = (e) => {
            const cmd = e.results[0][0].transcript;
            document.getElementById('aiMessage').textContent = '🎤 ' + cmd;
            if (cmd.includes('تقرير')) window.location.href = 'reports.html';
            if (cmd.includes('مطبخ')) window.location.href = 'kitchen.html';
        };
        recognition.start();
        document.getElementById('aiMessage').textContent = '🎤 جاري الاستماع...';
    }
}

function getAlerts() {
    const alerts = [];
    
    // 1. مخزون ناقص
    const inventory = JSON.parse(localStorage.getItem('thana_inventory') || '[]');
    inventory.forEach(i => {
        if (i.qty <= i.min) alerts.push('⚠️ ' + i.name + ' شبه نافذ (تبقى ' + i.qty + ' ' + i.unit + ')');
    });
    
    // 2. طلبات متأخرة
    const orders = JSON.parse(localStorage.getItem('thana_kitchen_orders') || '[]');
    const late = orders.filter(o => (!o.status || o.status === 'new') && (Date.now() - o.time) > 900000);
    if (late.length > 0) alerts.push('⏰ ' + late.length + ' طلبات متأخرة عن 15 دقيقة');
    
    // 3. طاولات بانتظار الحساب
    const tables = JSON.parse(localStorage.getItem('thana_tables') || '[]');
    const waiting = tables.filter(t => t.status === 'waiting');
    if (waiting.length > 3) alerts.push('🟡 ' + waiting.length + ' طاولات بانتظار الحساب');
    
    // 4. الإغلاق اليومي
    const archive = JSON.parse(localStorage.getItem('thana_archive') || '[]');
    const today = new Date().toLocaleDateString('ar-SA');
    if (!archive.find(a => a.date === today)) alerts.push('📆 لم يتم إغلاق اليوم بعد');
    
    // 5. توقع النفاذ
    const totalOrders = orders.length;
    inventory.forEach(i => {
        if (i.qty > 0 && i.qty <= i.min * 2 && totalOrders > 5) {
            alerts.push('📉 ' + i.name + ' قد ينفذ خلال 3 ساعات');
        }
    });
    
    if (alerts.length === 0) alerts.push('✅ كل شيء تمام');
    return alerts;
}

function renderAlerts() {
    const alerts = getAlerts();
    const container = document.getElementById('alertsContainer');
    if (container) {
        container.innerHTML = alerts.map(a => '<div class="alert-item">' + a + '</div>').join('');
    }
}

function navigate(page) {
    const pages = { 'orders': 'waiter.html', 'kitchen': 'kitchen.html', 'inventory': 'inventory.html', 'staff': 'inventory.html', 'qr': 'waiter.html', 'reports': 'reports.html' };
    if (pages[page]) window.location.href = pages[page];
}

setInterval(() => {
    document.getElementById('activeOrders').textContent = Math.floor(Math.random() * 5) + 1;
    renderAlerts();
}, 5000);

renderAlerts();
activateAI();
