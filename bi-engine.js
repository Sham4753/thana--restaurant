// ============================================
// Thana Restaurant - BI Engine
// ذكاء أعمال محلي · بدون سيرفر · IndexedDB
// ============================================

const BI_VERSION = '1.0';

// ========== تهيئة ==========
async function getOrdersFromDB() {
    try {
        return await dbGetAll('orders');
    } catch(e) {
        return JSON.parse(localStorage.getItem('thana_orders') || '[]');
    }
}

async function getInventoryFromDB() {
    try {
        return await dbGetAll('inventory');
    } catch(e) {
        return JSON.parse(localStorage.getItem('thana_inventory') || '[]');
    }
}

// ========== 1. أكثر 3 أصناف مبيعاً اليوم ==========
async function getTopSellingToday() {
    const orders = await getOrdersFromDB();
    const today = new Date().toLocaleDateString('ar-SA');
    
    const todayOrders = orders.filter(o => {
        const d = new Date(o.timestamp || Date.now()).toLocaleDateString('ar-SA');
        return d === today;
    });
    
    const itemCount = {};
    todayOrders.forEach(o => {
        (o.items || []).forEach(i => {
            const name = i.name || 'غير معروف';
            itemCount[name] = (itemCount[name] || 0) + (i.qty || 1);
        });
    });
    
    return Object.entries(itemCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, qty]) => ({ name, qty }));
}

// ========== 2. توقع إيراد اليوم ==========
async function predictTodayRevenue() {
    const orders = await getOrdersFromDB();
    const today = new Date().toLocaleDateString('ar-SA');
    const currentHour = new Date().getHours();
    
    // إيراد اليوم حتى الآن
    const todayOrders = orders.filter(o => {
        const d = new Date(o.timestamp || Date.now()).toLocaleDateString('ar-SA');
        return d === today;
    });
    
    const revenueSoFar = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
    
    // متوسط الإيراد اليومي لآخر 7 أيام
    const last7Days = {};
    orders.forEach(o => {
        const d = new Date(o.timestamp || Date.now()).toLocaleDateString('ar-SA');
        last7Days[d] = (last7Days[d] || 0) + (o.total || 0);
    });
    
    const dailyAvg = Object.values(last7Days).reduce((a,b) => a+b, 0) / 
                     Math.max(1, Object.keys(last7Days).length);
    
    // نسبة ما تبقى من اليوم
    const remainingHours = Math.max(0, 22 - currentHour);
    const totalBusinessHours = 14; // 8 صباحاً - 10 مساءً
    const remainingRatio = remainingHours / totalBusinessHours;
    
    const predictedExtra = Math.round(dailyAvg * remainingRatio * 0.4);
    const predictedTotal = revenueSoFar + predictedExtra;
    
    return {
        soFar: revenueSoFar,
        predicted: predictedTotal,
        dailyAvg: Math.round(dailyAvg),
        confidence: Math.round(Math.min(90, (currentHour / 14) * 100))
    };
}

// ========== 3. أكثر ساعة ازدحاماً ==========
async function getPeakHours() {
    const orders = await getOrdersFromDB();
    const hourlyCount = Array(14).fill(0); // 8 صباحاً - 10 مساءً
    
    orders.forEach(o => {
        const h = new Date(o.timestamp || Date.now()).getHours();
        const idx = h - 8;
        if (idx >= 0 && idx < 14) {
            hourlyCount[idx] += 1;
        }
    });
    
    const peakHour = hourlyCount.indexOf(Math.max(...hourlyCount)) + 8;
    const peakCount = Math.max(...hourlyCount);
    
    return {
        peakHour: peakHour,
        peakCount: peakCount,
        hourlyData: hourlyCount.map((count, i) => ({
            hour: i + 8,
            label: `${i+8}:00`,
            count: count
        }))
    };
}

// ========== 4. متوسط وقت الطبخ ==========
async function getAverageCookingTime() {
    const orders = await getOrdersFromDB();
    
    const completedOrders = orders.filter(o => o.cookStart && o.cookEnd);
    
    if (completedOrders.length === 0) return { avg: 0, count: 0 };
    
    const times = completedOrders.map(o => {
        return (new Date(o.cookEnd) - new Date(o.cookStart)) / 60000; // دقائق
    });
    
    const avg = Math.round(times.reduce((a,b) => a+b, 0) / times.length);
    const max = Math.round(Math.max(...times));
    const min = Math.round(Math.min(...times));
    
    return {
        avg: avg,
        max: max,
        min: min,
        count: completedOrders.length
    };
}

// ========== 5. كفاءة الموظفين ==========
async function getStaffPerformance() {
    const orders = await getOrdersFromDB();
    const today = new Date().toLocaleDateString('ar-SA');
    
    const todayOrders = orders.filter(o => {
        const d = new Date(o.timestamp || Date.now()).toLocaleDateString('ar-SA');
        return d === today;
    });
    
    const staffStats = {};
    todayOrders.forEach(o => {
        if (o.source) {
            staffStats[o.source] = (staffStats[o.source] || 0) + 1;
        }
    });
    
    return Object.entries(staffStats).map(([source, count]) => ({
        source: source === 'waiter' ? '📋 نادل' : source === 'qr' ? '📱 QR' : source === 'voice' ? '🎤 صوتي' : source,
        count: count
    }));
}

// ========== 6. تنبيهات المخزون ==========
async function getInventoryAlerts() {
    const inventory = await getInventoryFromDB();
    
    const alerts = [];
    const warnings = [];
    
    inventory.forEach(item => {
        if (item.qty <= 0) {
            alerts.push({ ...item, severity: 'danger', message: `نفد ${item.name}` });
        } else if (item.qty <= item.minQty) {
            warnings.push({ ...item, severity: 'warning', message: `${item.name} منخفض (${item.qty} ${item.unit})` });
        }
    });
    
    return { alerts, warnings };
}

// ========== 7. تقرير يومي كامل ==========
async function generateDailyReport() {
    const [topSelling, revenue, peakHours, cookingTime, staffPerf, inventoryAlerts] = 
        await Promise.all([
            getTopSellingToday(),
            predictTodayRevenue(),
            getPeakHours(),
            getAverageCookingTime(),
            getStaffPerformance(),
            getInventoryAlerts()
        ]);
    
    return {
        date: new Date().toLocaleDateString('ar-SA'),
        time: new Date().toLocaleTimeString('ar-SA'),
        topSelling,
        revenue,
        peakHours,
        cookingTime,
        staffPerformance: staffPerf,
        inventoryAlerts,
        totalOrders: (await getOrdersFromDB()).filter(o => {
            const d = new Date(o.timestamp || Date.now()).toLocaleDateString('ar-SA');
            return d === new Date().toLocaleDateString('ar-SA');
        }).length
    };
}

// ========== عرض في لوحة التحكم ==========
async function renderBIWidgets() {
    try {
        const report = await generateDailyReport();
        
        // تحديث DOM إذا وجدت العناصر
        const updates = {
            'biTop1': report.topSelling[0] ? `${report.topSelling[0].name} (${report.topSelling[0].qty})` : '--',
            'biTop2': report.topSelling[1] ? `${report.topSelling[1].name} (${report.topSelling[1].qty})` : '--',
            'biTop3': report.topSelling[2] ? `${report.topSelling[2].name} (${report.topSelling[2].qty})` : '--',
            'biRevenue': report.revenue.soFar.toLocaleString() + ' ل.س',
            'biPredicted': report.revenue.predicted.toLocaleString() + ' ل.س',
            'biPeakHour': report.peakHours.peakHour + ':00',
            'biAvgCooking': report.cookingTime.avg + ' دقيقة',
            'biTotalOrders': report.totalOrders,
            'biAlerts': report.inventoryAlerts.alerts.length + report.inventoryAlerts.warnings.length
        };
        
        for (const [id, value] of Object.entries(updates)) {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        }
        
        return report;
    } catch(e) {
        console.error('BI Engine error:', e);
        return null;
    }
}

// تصدير التقرير
async function exportBIReport() {
    const report = await generateDailyReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_${report.date.replace('/', '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

console.log('📊 Thana BI Engine v' + BI_VERSION + ' - جاهز');
