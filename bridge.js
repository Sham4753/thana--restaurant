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

// ========== رقم تسلسلي ==========
function getNextOrderNumber(){
    var last = parseInt(localStorage.getItem('thana_last_order_number')||'0');
    last++;
    localStorage.setItem('thana_last_order_number', last);
    return last;
}

// إرسال طلب مع رقم تسلسلي
function sendOrderWithNumber(order){
    order.orderNumber = getNextOrderNumber();
    order.createdAt = new Date().toISOString();
    return sendOrder(order);
}

// المطبخ: تعليم الطلب جاهز
function markOrderReady(id){
    var orders = JSON.parse(localStorage.getItem('thana_orders')||'[]');
    var order = orders.find(function(o){return o.id===id});
    if(order){
        order.status = 'ready';
        order.readyAt = new Date().toISOString();
        localStorage.setItem('thana_orders', JSON.stringify(orders));
        
        // إشعار للكاشير
        localStorage.setItem('thana_order_ready', JSON.stringify(order));
        setTimeout(function(){ localStorage.removeItem('thana_order_ready'); }, 500);
        
        // إزالة من شاشة المطبخ (يحذف بعد ثانية)
        setTimeout(function(){
            var orders2 = JSON.parse(localStorage.getItem('thana_orders')||'[]');
            var idx = orders2.findIndex(function(o){return o.id===id});
            if(idx>=0){
                orders2[idx].hideFromKitchen = true;
                localStorage.setItem('thana_orders', JSON.stringify(orders2));
            }
        }, 1000);
    }
    return order;
}

// ========== رقم تسلسلي ==========
function getNextOrderNumber(){
    var last = parseInt(localStorage.getItem('thana_last_order_number')||'0');
    last++;
    localStorage.setItem('thana_last_order_number', last);
    return last;
}

// إرسال طلب مع رقم تسلسلي
function sendOrderWithNumber(order){
    order.orderNumber = getNextOrderNumber();
    order.createdAt = new Date().toISOString();
    return sendOrder(order);
}

// المطبخ: تعليم الطلب جاهز
function markOrderReady(id){
    var orders = JSON.parse(localStorage.getItem('thana_orders')||'[]');
    var order = orders.find(function(o){return o.id===id});
    if(order){
        order.status = 'ready';
        order.readyAt = new Date().toISOString();
        localStorage.setItem('thana_orders', JSON.stringify(orders));
        
        // إشعار للكاشير
        localStorage.setItem('thana_order_ready', JSON.stringify(order));
        setTimeout(function(){ localStorage.removeItem('thana_order_ready'); }, 500);
        
        // إزالة من شاشة المطبخ (يحذف بعد ثانية)
        setTimeout(function(){
            var orders2 = JSON.parse(localStorage.getItem('thana_orders')||'[]');
            var idx = orders2.findIndex(function(o){return o.id===id});
            if(idx>=0){
                orders2[idx].hideFromKitchen = true;
                localStorage.setItem('thana_orders', JSON.stringify(orders2));
            }
        }, 1000);
    }
    return order;
}
