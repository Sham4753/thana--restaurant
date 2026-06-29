// ============================================
// Thana Restaurant - Push Notifications
// إشعارات فورية للمطبخ عند وصول طلب جديد
// ============================================

const NOTIFY_VERSION = '1.0';

// طلب إذن الإشعارات
function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('⚠️ المتصفح لا يدعم الإشعارات');
        return;
    }
    
    if (Notification.permission === 'granted') {
        console.log('✅ الإشعارات مفعلة');
        return;
    }
    
    if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(perm => {
            if (perm === 'granted') {
                console.log('✅ تم تفعيل الإشعارات');
                showTestNotification();
            }
        });
    }
}

// إظهار إشعار تجريبي
function showTestNotification() {
    if (Notification.permission !== 'granted') return;
    
    new Notification('🍳 Thana Restaurant', {
        body: '✅ الإشعارات شغالة! حيصلك تنبيه عند كل طلب جديد',
        icon: '/thana--restaurant/icons/icon-192.png',
        badge: '/thana--restaurant/icons/icon-96.png',
        vibrate: [100, 50, 100],
        dir: 'rtl',
        lang: 'ar-SA',
        tag: 'test'
    });
}

// إشعار طلب جديد
function notifyNewOrder(order) {
    if (Notification.permission !== 'granted') return;
    
    const itemsText = (order.items || []).map(i => `${i.name} ×${i.qty || 1}`).join('، ');
    const source = order.source === 'qr' ? '📱 QR' : order.source === 'voice' ? '🎤 صوتي' : '📋 نادل';
    
    const notification = new Notification(`🔔 طلب جديد - طاولة ${order.table}`, {
        body: `${itemsText}\nالمجموع: ${(order.total || 0).toLocaleString()} ل.س\nالمصدر: ${source}`,
        icon: '/thana--restaurant/icons/icon-192.png',
        badge: '/thana--restaurant/icons/icon-96.png',
        vibrate: [200, 100, 200, 100, 200],
        dir: 'rtl',
        lang: 'ar-SA',
        tag: `order-${order.id}`,
        requireInteraction: true,
        actions: [
            { action: 'view', title: '👁️ عرض الطلب' },
            { action: 'dismiss', title: '✕ إغلاق' }
        ]
    });
    
    // النقر على الإشعار يفتح المطبخ
    notification.onclick = function() {
        window.open('/thana--restaurant/kitchen.html', '_blank');
        notification.close();
    };
    
    // إغلاق تلقائي بعد 30 ثانية
    setTimeout(() => notification.close(), 30000);
}

// إشعار نفاد مخزون
function notifyLowStock(item) {
    if (Notification.permission !== 'granted') return;
    
    new Notification(`⚠️ مخزون منخفض - ${item.name}`, {
        body: `الكمية المتبقية: ${item.qty} ${item.unit || 'قطعة'}\nالحد الأدنى: ${item.minQty}`,
        icon: '/thana--restaurant/icons/icon-192.png',
        badge: '/thana--restaurant/icons/icon-96.png',
        vibrate: [100, 50, 100],
        dir: 'rtl',
        lang: 'ar-SA',
        tag: `stock-${item.name}`
    });
}

// إشعار مناداة نادل
function notifyWaiterCall(tableId) {
    if (Notification.permission !== 'granted') return;
    
    new Notification(`🔔 مناداة نادل - طاولة ${tableId}`, {
        body: 'الزبون يطلب النادل',
        icon: '/thana--restaurant/icons/icon-192.png',
        badge: '/thana--restaurant/icons/icon-96.png',
        vibrate: [200, 100, 200, 100, 200],
        dir: 'rtl',
        lang: 'ar-SA',
        requireInteraction: true,
        tag: `waiter-${tableId}`
    });
}

// تشغيل تلقائي في صفحة المطبخ
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || '';
    
    // تفعيل الإشعارات في المطبخ
    if (currentPage === 'kitchen.html') {
        requestNotificationPermission();
    }
    
    // استماع للطلبات الجديدة
    window.addEventListener('storage', function(e) {
        if (e.key === 'thana_new_order_notify' && e.newValue) {
            try {
                const order = JSON.parse(e.newValue);
                if (order && order.id) {
                    notifyNewOrder(order);
                }
            } catch(err) {}
        }
    });
});

console.log('🔔 Thana Notifications v' + NOTIFY_VERSION + ' - جاهز');
