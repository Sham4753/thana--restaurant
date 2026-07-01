// Thana Loyalty Points System
function getCustomer(phone) {
    var customers = JSON.parse(localStorage.getItem('thana_customers') || '[]');
    return customers.find(function(c) { return c.phone === phone; });
}

function updateCustomer(phone, data) {
    var customers = JSON.parse(localStorage.getItem('thana_customers') || '[]');
    var idx = customers.findIndex(function(c) { return c.phone === phone; });
    if (idx >= 0) {
        Object.assign(customers[idx], data);
    } else {
        customers.push(Object.assign({ phone: phone, points: 0, orders: 0, totalSpent: 0, joinedAt: new Date().toISOString() }, data));
    }
    localStorage.setItem('thana_customers', JSON.stringify(customers));
    return customers;
}

function addLoyaltyPoints(phone, orderTotal) {
    var c = getCustomer(phone) || { phone: phone, points: 0, orders: 0, totalSpent: 0 };
    c.orders = (c.orders || 0) + 1;
    c.totalSpent = (c.totalSpent || 0) + orderTotal;
    
    // كل 10,000 ل.س = نقطة
    var pointsEarned = Math.floor(orderTotal / 10000);
    c.points = (c.points || 0) + pointsEarned;
    
    updateCustomer(phone, c);
    
    // كل 10 طلبات = وجبة مجانية
    if (c.orders % 10 === 0) {
        toast('🎉 مبروك! العميل ' + phone + ' كسب وجبة مجانية! (10 طلبات)', 'success');
    }
    
    return c;
}

function checkLoyaltyReward(phone) {
    var c = getCustomer(phone);
    if (!c) return null;
    
    return {
        points: c.points || 0,
        orders: c.orders || 0,
        totalSpent: c.totalSpent || 0,
        freeMeals: Math.floor((c.orders || 0) / 10),
        nextFreeAt: 10 - ((c.orders || 0) % 10)
    };
}

console.log('⭐ Loyalty System جاهز');
