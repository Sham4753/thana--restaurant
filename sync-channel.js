// Thana Sync Channel - BroadcastChannel
var channel = new BroadcastChannel('thana_orders_ch');

function broadcastOrder(order) {
    channel.postMessage({ type: 'NEW_ORDER', order: order });
}

function broadcastUpdate(id, status) {
    channel.postMessage({ type: 'STATUS_UPDATE', id: id, status: status });
}

function initOrderListener(callback) {
    channel.onmessage = function(e) {
        if (e.data && e.data.type === 'NEW_ORDER') {
            callback(e.data.order);
        }
        if (e.data && e.data.type === 'STATUS_UPDATE') {
            callback(e.data);
        }
    };
}

console.log('📡 Sync Channel جاهز');
