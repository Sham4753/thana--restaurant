// ============================================
// Thana Bridge v3.0 - نظام متكامل
// QR ← مطبخ ← كاشير ← أرشيف - تلقائي
// ============================================

// إرسال طلب من أي مكان (QR, نادل, صوت)
function sendOrder(order){
    var orders = JSON.parse(localStorage.getItem('thana_orders')||'[]');
    orders.push(order);
    localStorage.setItem('thana_orders', JSON.stringify(orders));
    
    // إشعار فوري
    localStorage.setItem('thana_new_order', JSON.stringify(order));
    setTimeout(function(){ localStorage.removeItem('thana_new_order'); }, 500);
    
    // تحديث الطاولة
    if(order.table && order.table !== 'safari'){
        var tables = JSON.parse(localStorage.getItem('thana_tables')||'[]');
        var t = tables.find(function(x){return x.id==order.table});
        if(t){t.status='busy';localStorage.setItem('thana_tables',JSON.stringify(tables));}
    }
    
    console.log('📤 طلب:', order.id, 'طاولة:', order.table);
    return order;
}

// تحديث حالة الطلب (من المطبخ)
function updateOrderStatus(id, status, extra){
    var orders = JSON.parse(localStorage.getItem('thana_orders')||'[]');
    var order = orders.find(function(o){return o.id===id});
    if(order){
        order.status = status;
        if(extra) Object.assign(order, extra);
        localStorage.setItem('thana_orders', JSON.stringify(orders));
        
        // إذا جاهز ← إشعار للكاشير
        if(status === 'done'){
            localStorage.setItem('thana_order_done', JSON.stringify(order));
            setTimeout(function(){ localStorage.removeItem('thana_order_done'); }, 500);
        }
        
        // إذا مدفوع ← تفريغ الطاولة
        if(status === 'paid'){
            if(order.table && order.table !== 'safari'){
                var tables = JSON.parse(localStorage.getItem('thana_tables')||'[]');
                var t = tables.find(function(x){return x.id==order.table});
                if(t){t.status='free';localStorage.setItem('thana_tables',JSON.stringify(tables));}
            }
            // إضافة للكاش
            var cash = JSON.parse(localStorage.getItem('thana_cash')||'[]');
            cash.push({id:order.id, table:order.table, total:order.total, time:new Date().toISOString()});
            localStorage.setItem('thana_cash', JSON.stringify(cash));
        }
    }
    return order;
}

console.log('🌉 Thana Bridge v3.0 - جاهز');
