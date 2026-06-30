// Thana Restaurant – BroadcastChannel messaging
const THANA_CH = new BroadcastChannel('thana_ch');
export function notify(type, payload = {}) {
  THANA_CH.postMessage({ type, ...payload });
}
// kitchen.html listener (replace setInterval):
// THANA_CH.onmessage = (e) => { if (e.data.type === 'order-update') loadOrders(); };
