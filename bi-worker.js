// ============================================
// Thana Restaurant - BI Web Worker
// معالجة التقارير في خيط منفصل - لا تجميد للواجهة
// ============================================

self.addEventListener('message', async function(e) {
    const { type, data } = e.data;
    
    switch(type) {
        case 'ANALYZE_ORDERS':
            const result = analyzeOrders(data.orders);
            self.postMessage({ type: 'ANALYZE_RESULT', result });
            break;
            
        case 'PREDICT_REVENUE':
            const prediction = predictRevenue(data.orders, data.currentHour);
            self.postMessage({ type: 'PREDICT_RESULT', prediction });
            break;
            
        case 'CALCULATE_PEAK_HOURS':
            const peaks = calculatePeakHours(data.orders);
            self.postMessage({ type: 'PEAK_RESULT', peaks });
            break;
            
        case 'GENERATE_REPORT':
            const report = generateFullReport(data);
            self.postMessage({ type: 'REPORT_RESULT', report });
            break;
    }
});

function analyzeOrders(orders) {
    const today = new Date().toLocaleDateString('ar-SA');
    const todayOrders = orders.filter(o => {
        const d = new Date(o.timestamp || Date.now()).toLocaleDateString('ar-SA');
        return d === today;
    });
    
    const itemCount = {};
    const hourlyRevenue = Array(14).fill(0);
    let totalRevenue = 0;
    let totalItems = 0;
    
    todayOrders.forEach(o => {
        totalRevenue += (o.total || 0);
        totalItems += (o.items || []).reduce((s, i) => s + (i.qty || 1), 0);
        
        (o.items || []).forEach(i => {
            itemCount[i.name] = (itemCount[i.name] || 0) + (i.qty || 1);
        });
        
        const h = new Date(o.timestamp || Date.now()).getHours();
        const idx = h - 8;
        if (idx >= 0 && idx < 14) {
            hourlyRevenue[idx] += (o.total || 0);
        }
    });
    
    const topItems = Object.entries(itemCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, qty]) => ({ name, qty }));
    
    const peakHour = hourlyRevenue.indexOf(Math.max(...hourlyRevenue)) + 8;
    
    return {
        orderCount: todayOrders.length,
        totalRevenue,
        totalItems,
        topItems,
        peakHour,
        hourlyRevenue,
        avgOrderValue: todayOrders.length > 0 ? Math.round(totalRevenue / todayOrders.length) : 0
    };
}

function predictRevenue(orders, currentHour) {
    const today = new Date().toLocaleDateString('ar-SA');
    const todayRevenue = orders
        .filter(o => new Date(o.timestamp || Date.now()).toLocaleDateString('ar-SA') === today)
        .reduce((s, o) => s + (o.total || 0), 0);
    
    const dailyTotals = {};
    orders.forEach(o => {
        const d = new Date(o.timestamp || Date.now()).toLocaleDateString('ar-SA');
        dailyTotals[d] = (dailyTotals[d] || 0) + (o.total || 0);
    });
    
    const values = Object.values(dailyTotals);
    const avg = values.length > 0 ? values.reduce((a,b) => a+b, 0) / values.length : 0;
    
    const remainingHours = Math.max(0, 22 - currentHour);
    const ratio = remainingHours / 14;
    const predicted = Math.round(todayRevenue + (avg * ratio * 0.4));
    
    return {
        soFar: todayRevenue,
        predicted,
        dailyAvg: Math.round(avg),
        confidence: Math.min(95, Math.round((currentHour / 14) * 100))
    };
}

function calculatePeakHours(orders) {
    const hourly = Array(14).fill(0);
    const hourlyRevenue = Array(14).fill(0);
    
    orders.forEach(o => {
        const h = new Date(o.timestamp || Date.now()).getHours();
        const idx = h - 8;
        if (idx >= 0 && idx < 14) {
            hourly[idx] += 1;
            hourlyRevenue[idx] += (o.total || 0);
        }
    });
    
    return hourly.map((count, i) => ({
        hour: i + 8,
        label: `${i+8}:00`,
        orders: count,
        revenue: hourlyRevenue[i]
    }));
}

function generateFullReport(data) {
    const analysis = analyzeOrders(data.orders || []);
    const prediction = predictRevenue(data.orders || [], new Date().getHours());
    const peaks = calculatePeakHours(data.orders || []);
    
    return {
        timestamp: new Date().toISOString(),
        analysis,
        prediction,
        peaks,
        inventory: data.inventory || [],
        staff: data.staff || []
    };
}
