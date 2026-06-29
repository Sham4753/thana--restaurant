// ============================================
// Thana Restaurant - Bridge System
// جسر اتصال بين جميع الصفحات
// ============================================

const BRIDGE_VERSION = '1.0';

// إرسال طلب مع إشعار فوري لجميع الصفحات
function bridgeSendOrder(order) {
    // 1. حفظ في localStorage
    const orders = JSON.parse(localStorage.getItem('thana_orders') || '[]');
    orders.push(order);
    localStorage.setItem('thana_orders', JSON.stringify(orders));
    
    // 2. إشعار فوري
    localStorage.setItem('thana_new_order_notify', JSON.stringify(order));
    
    // 3. إزالة الإشعار بعد لحظة (عشان يشتغل event listener كل مرة)
    setTimeout(() => {
        localStorage.removeItem('thana_new_order_notify');
    }, 100);
    
    // 4. تحديث الطاولة
    updateTableStatus(order.table);
    
    // 5. هزة تأكيد
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    
    console.log('📤 طلب جديد:', order.id, 'طاولة', order.table);
    return order;
}

function updateTableStatus(tableId) {
    let tables = JSON.parse(localStorage.getItem('thana_tables') || '[]');
    const table = tables.find(t => t.id == tableId);
    if (table) {
        table.status = 'busy';
        localStorage.setItem('thana_tables', JSON.stringify(tables));
    }
}

// استماع للطلبات الجديدة (لصفحة المطبخ والنادل)
function bridgeListenForOrders(callback) {
    window.addEventListener('storage', function(e) {
        if (e.key === 'thana_new_order_notify' && e.newValue) {
            try {
                const order = JSON.parse(e.newValue);
                if (order && order.id) {
                    console.log('🔔 طلب جديد:', order.id);
                    if (callback) callback(order);
                    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                }
            } catch(err) {}
        }
        
        if (e.key === 'thana_orders') {
            console.log('🔄 تحديث الطلبات');
            if (callback) callback(null);
        }
    });
}

console.log('🌉 Thana Bridge v' + BRIDGE_VERSION + ' - جاهز');
