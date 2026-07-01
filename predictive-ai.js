// Thana Predictive Inventory AI
function predictInventory() {
    var orders = JSON.parse(localStorage.getItem('thana_orders') || '[]');
    var inventory = JSON.parse(localStorage.getItem('thana_inventory') || '[]');
    var archive = JSON.parse(localStorage.getItem('thana_archive') || '[]');
    
    if (orders.length < 10) return { message: 'تحتاج 10 طلبات على الأقل للتنبؤ' };
    
    // تحليل آخر 7 أيام
    var dailyUsage = {};
    var today = new Date();
    
    orders.forEach(function(o) {
        var day = new Date(o.timestamp).getDay(); // 0=أحد ... 6=سبت
        if (!dailyUsage[day]) dailyUsage[day] = {};
        
        (o.items || []).forEach(function(item) {
            dailyUsage[day][item.name] = (dailyUsage[day][item.name] || 0) + (item.qty || 1);
        });
    });
    
    var predictions = [];
    var dayNames = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    
    inventory.forEach(function(inv) {
        var itemName = inv.name;
        var totalUsage = 0;
        var days = 0;
        
        for (var day in dailyUsage) {
            if (dailyUsage[day][itemName]) {
                totalUsage += dailyUsage[day][itemName];
                days++;
            }
        }
        
        var avgDaily = days > 0 ? Math.round(totalUsage / days) : 0;
        var daysUntilEmpty = avgDaily > 0 ? Math.floor(inv.qty / avgDaily) : 999;
        
        predictions.push({
            name: itemName,
            currentQty: inv.qty,
            avgDaily: avgDaily,
            daysLeft: daysUntilEmpty,
            willRunOut: daysUntilEmpty <= 3,
            shouldRestock: daysUntilEmpty <= 7
        });
    });
    
    // ترتيب حسب الأكثر خطورة
    predictions.sort(function(a, b) { return a.daysLeft - b.daysLeft; });
    
    return {
        predictions: predictions,
        urgent: predictions.filter(function(p) { return p.willRunOut; }),
        warning: predictions.filter(function(p) { return p.shouldRestock && !p.willRunOut; }),
        generatedAt: new Date().toISOString()
    };
}

function showAIAlerts() {
    var result = predictInventory();
    
    if (result.message) {
        console.log(result.message);
        return;
    }
    
    if (result.urgent.length > 0) {
        var names = result.urgent.map(function(p) { return p.name + ' (' + p.daysLeft + ' أيام)'; }).join('، ');
        toast('🚨 سينفد قريباً: ' + names, 'error');
    }
    
    if (result.warning.length > 0) {
        var names = result.warning.map(function(p) { return p.name; }).join('، ');
        toast('⚠️ يحتاج إعادة طلب: ' + names, 'warn');
    }
}

// تشغيل تلقائي للتنبيهات
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(showAIAlerts, 1000);
});

console.log('🤖 Predictive AI جاهز');
