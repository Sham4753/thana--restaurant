// Auto-Deduct Inventory with State Manager
function autoDeduct(orderItems) {
    State.update('inventory', function(inv) {
        if (!inv || inv.length === 0) return inv;
        
        orderItems.forEach(function(item) {
            var found = inv.find(function(i) {
                return i.name && item.name && (i.name.includes(item.name) || item.name.includes(i.name));
            });
            
            if (found) {
                var deduct = 0;
                if (item.name.includes('شاورما') || item.name.includes('برجر') || item.name.includes('مشاوي')) deduct = 0.15 * (item.qty || 1);
                else if (item.name.includes('فلافل') || item.name.includes('بطاطا')) deduct = 0.1 * (item.qty || 1);
                else if (item.name.includes('كولا') || item.name.includes('عصير') || item.name.includes('ماء')) deduct = 1 * (item.qty || 1);
                else deduct = 0.05 * (item.qty || 1);
                
                found.qty = Math.max(0, (found.qty || 0) - deduct);
                
                if (found.qty <= found.minQty) {
                    toast('⚠️ مخزون منخفض: ' + found.name, 'warn');
                }
            }
        });
        
        return inv;
    });
    
    console.log('📦 خصم تلقائي:', orderItems.length, 'صنف');
}
