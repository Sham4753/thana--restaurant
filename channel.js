// ============================================
// Thana Restaurant - BroadcastChannel
// تواصل فوري بين التبويبات بدون Polling
// ============================================

var channel = new BroadcastChannel('thana_channel');

// إرسال إشعار
function broadcastOrder(order) {
    channel.postMessage({ type: 'NEW_ORDER', order: order });
}

function broadcastStatus(id, status) {
    channel.postMessage({ type: 'STATUS_CHANGE', id: id, status: status });
}

// استقبال
channel.onmessage = function(e) {
    var data = e.data;
    
    if (data.type === 'NEW_ORDER') {
        console.log('🔔 طلب جديد:', data.order.orderNumber);
        if (typeof loadOrders === 'function') loadOrders();
        if (typeof renderAll === 'function') renderAll();
        if (typeof playBeep === 'function') playBeep();
    }
    
    if (data.type === 'STATUS_CHANGE') {
        console.log('🔄 تغيير حالة:', data.id, data.status);
        if (typeof loadOrders === 'function') loadOrders();
        if (typeof renderAll === 'function') renderAll();
    }
};

console.log('📡 BroadcastChannel جاهز');
