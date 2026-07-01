// Kitchen Live Updates via BroadcastChannel
var kitchenChannel = new BroadcastChannel('thana_orders_ch');

function notifyKitchen(order) {
    kitchenChannel.postMessage({ type: 'NEW_ORDER', order: order });
}

function listenKitchen(callback) {
    kitchenChannel.onmessage = function(e) {
        if (e.data && e.data.type === 'NEW_ORDER') {
            callback(e.data.order);
            if (typeof playBeep === 'function') playBeep();
            toast('🔔 طلب جديد #' + (e.data.order.orderNumber || ''), 'info');
        }
    };
}

// إرسال من أي مكان
window.notifyKitchen = notifyKitchen;
