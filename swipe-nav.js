// التنقل بالسحب بين الصفحات
var touchStartX = 0;
var touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
}, {passive: true});

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, {passive: true});

function handleSwipe() {
    var diff = touchStartX - touchEndX;
    
    // تجاهل السحب الخفيف
    if (Math.abs(diff) < 80) return;
    
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // قائمة الصفحات حسب شريط المدير
    var pages = [
        'index.html',
        'dashboard.html',
        'orders.html',
        'waiter.html',
        'kitchen.html',
        'tables.html',
        'staff.html',
        'menu.html',
        'inventory.html',
        'reports.html',
        'close.html',
        'customers.html',
        'qr-menu.html?table=1',
        'voice.html',
        'ai.html',
        'auth.html',
        'print.html',
        'setup.html',
        'settings.html',
        'pin-settings.html',
        'activate.html',
        'backup.html',
        'help.html'
    ];
    
    var currentIndex = pages.indexOf(currentPage);
    if (currentIndex === -1) currentIndex = 0;
    
    if (diff > 80) {
        // سحب لليسار = الصفحة التالية
        var next = (currentIndex + 1) % pages.length;
        window.location.href = pages[next];
    } else if (diff < -80) {
        // سحب لليمين = الصفحة السابقة
        var prev = (currentIndex - 1 + pages.length) % pages.length;
        window.location.href = pages[prev];
    }
}
