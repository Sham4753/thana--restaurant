const menu = [
    { id: 1, name: 'شاورما دجاج', price: 3 },
    { id: 2, name: 'شاورما لحم', price: 4 },
    { id: 3, name: 'بطاطا مقلية', price: 2 },
    { id: 4, name: 'بيبسي', price: 1 },
    { id: 5, name: 'فلافل', price: 2 },
    { id: 6, name: 'حمص', price: 2 },
    { id: 7, name: 'مشاوي', price: 5 },
    { id: 8, name: 'سلطة', price: 2 },
];

function getOrders() {
    return JSON.parse(localStorage.getItem('thana_kitchen_orders') || '[]');
}

function filterOrders(orders, period) {
    const now = Date.now();
    const periods = { today: 86400000, week: 604800000, month: 2592000000 };
    const cutoff = now - (periods[period] || 86400000);
    return orders.filter(o => o.time > cutoff);
}

function getStats() {
    const period = document.getElementById('periodFilter').value;
    const orders = filterOrders(getOrders(), period);
    const completed = orders.filter(o => o.status === 'ready' || o.deducted);

    const totalRevenue = completed.reduce((sum, o) => {
        return sum + o.items.reduce((s, i) => {
            const m = menu.find(m => m.name === i.name);
            return s + (m ? m.price * i.qty : 0);
        }, 0);
    }, 0);

    const avgTime = completed.length > 0 
        ? Math.round(completed.reduce((s, o) => s + (o.deducted ? 5 : 10), 0) / completed.length)
        : 0;

    // Top item
    const itemCounts = {};
    completed.forEach(o => o.items.forEach(i => {
        itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty;
    }));
    const topItem = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0];

    return {
        totalRevenue,
        totalOrders: completed.length,
        avgTime,
        topItem: topItem ? topItem[0] : '-',
        itemCounts,
    };
}

let salesChart, itemsChart;

function renderAll() {
    const stats = getStats();
    document.getElementById('totalRevenue').textContent = '$' + stats.totalRevenue;
    document.getElementById('totalOrders').textContent = stats.totalOrders;
    document.getElementById('avgTime').textContent = stats.avgTime + 'د';
    document.getElementById('topItem').textContent = stats.topItem;

    // Sales Chart
    const ctx1 = document.getElementById('salesChart').getContext('2d');
    if (salesChart) salesChart.destroy();
    salesChart = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: ['المبيعات'],
            datasets: [{
                label: '$',
                data: [stats.totalRevenue],
                backgroundColor: ['rgba(0,168,132,0.6)'],
                borderColor: ['#00a884'],
                borderWidth: 2,
                borderRadius: 10,
            }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#fff' } }, x: { ticks: { color: '#fff' } } } }
    });

    // Items Chart
    const ctx2 = document.getElementById('itemsChart').getContext('2d');
    if (itemsChart) itemsChart.destroy();
    const labels = Object.keys(stats.itemCounts).slice(0, 5);
    const data = labels.map(l => stats.itemCounts[l]);
    itemsChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: ['#e94560','#00a884','#f5a623','#7b2cbf','#3a86ff'],
                borderColor: '#0a0a0a',
                borderWidth: 2,
            }]
        },
        options: { plugins: { legend: { labels: { color: '#fff' } } } }
    });
}

function exportCSV() {
    const orders = getOrders();
    let csv = 'ID,الطاولة,الأصناف,الحالة,الوقت\n';
    orders.forEach(o => {
        csv += `${o.id},${o.table},"${o.items.map(i => i.name+' x'+i.qty).join('; ')}",${o.status||'جديد'},${new Date(o.time).toLocaleTimeString('ar-SA')}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'thana_report.csv';
    a.click();
}

renderAll();
