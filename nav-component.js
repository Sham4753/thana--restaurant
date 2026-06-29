// ============================================
// Thana Restaurant v2.1 - Navigation System
// شريط التنقل الذكي حسب الخريطة
// ============================================

function getUserRole() {
    try {
        const session = JSON.parse(localStorage.getItem('thana_auth_session') || 'null');
        if (session && session.role) return session.role;
    } catch(e) {}
    return 'admin';
}

function getNavConfig() {
    const role = getUserRole();
    
    // كل الأدوار
    const configs = {
        admin: {
            name: '🔑 المدير',
            items: [
                { href: 'index.html', icon: '🏠', label: 'الرئيسية' },
                { href: 'dashboard.html', icon: '📊', label: 'لوحة التحكم' },
                { href: 'waiter.html', icon: '📋', label: 'النادل' },
                { href: 'kitchen.html', icon: '🍳', label: 'المطبخ' },
                { href: 'tables.html', icon: '🪑', label: 'الطاولات' },
                { href: 'staff.html', icon: '👥', label: 'الموظفين' },
                { href: 'menu.html', icon: '🍽️', label: 'القائمة' },
                { href: 'inventory.html', icon: '📦', label: 'المخزون' },
                { href: 'reports.html', icon: '📈', label: 'التقارير' },
                { href: 'settings.html', icon: '⚙️', label: 'الإعدادات' },
                { href: 'close.html', icon: '🔒', label: 'الإغلاق' },
                { href: 'waste_report.html', icon: '🗑️', label: 'الهدر' },
                { href: 'customers.html', icon: '👤', label: 'العملاء' },
                { href: 'velocity.html', icon: '⚡', label: 'السرعة' },
                { href: 'procurement.html', icon: '🛒', label: 'المشتريات' },
                { href: 'invoice.html', icon: '🧾', label: 'الفاتورة' },
                { href: 'qr-menu.html?table=1', icon: '📱', label: 'QR' },
                { href: 'voice.html', icon: '🎤', label: 'صوتي' },
                { href: 'ai.html', icon: '🧠', label: 'ذكاء' },
                { href: 'auth.html', icon: '🔐', label: 'أمان' },
                { href: 'print.html', icon: '🖨️', label: 'طباعة' },
                { href: 'theme-settings.html', icon: '🎨', label: 'مظهر' },
                { href: 'activate.html', icon: '🔑', label: 'الترخيص' },
            ]
        },
        waiter: {
            name: '📋 النادل',
            items: [
                { href: 'index.html', icon: '🏠', label: 'الرئيسية' },
                { href: 'waiter.html', icon: '📋', label: 'النادل' },
                { href: 'tables.html', icon: '🪑', label: 'الطاولات' },
                { href: 'menu.html', icon: '🍽️', label: 'القائمة' },
                { href: 'qr-menu.html?table=1', icon: '📱', label: 'QR Menu' },
                { href: 'voice.html', icon: '🎤', label: 'صوتي' },
            ]
        },
        kitchen: {
            name: '🍳 المطبخ',
            items: [
                { href: 'index.html', icon: '🏠', label: 'الرئيسية' },
                { href: 'kitchen.html', icon: '🍳', label: 'شاشة الطبخ' },
                { href: 'inventory.html', icon: '📦', label: 'المخزون' },
                { href: 'velocity.html', icon: '⚡', label: 'السرعة' },
                { href: 'waste_report.html', icon: '🗑️', label: 'الهدر' },
            ]
        },
        cashier: {
            name: '💰 الكاشير',
            items: [
                { href: 'index.html', icon: '🏠', label: 'الرئيسية' },
                { href: 'waiter.html', icon: '📋', label: 'الطلبات' },
                { href: 'reports.html', icon: '📈', label: 'التقارير' },
                { href: 'invoice.html', icon: '🧾', label: 'الفاتورة' },
                { href: 'print.html', icon: '🖨️', label: 'طباعة' },
                { href: 'customers.html', icon: '👤', label: 'العملاء' },
            ]
        },
        manager: {
            name: '📊 مدير مناوب',
            items: [
                { href: 'index.html', icon: '🏠', label: 'الرئيسية' },
                { href: 'dashboard.html', icon: '📊', label: 'لوحة التحكم' },
                { href: 'staff.html', icon: '👥', label: 'الموظفين' },
                { href: 'menu.html', icon: '🍽️', label: 'القائمة' },
                { href: 'inventory.html', icon: '📦', label: 'المخزون' },
                { href: 'reports.html', icon: '📈', label: 'التقارير' },
                { href: 'ai.html', icon: '🧠', label: 'ذكاء' },
            ]
        }
    };
    
    return configs[role] || configs['admin'];
}

function createNavBar() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const config = getNavConfig();
    
    const navHTML = `
        <style>
            .thana-nav {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 9999;
                background: rgba(10,15,30,0.95);
                border-bottom: 1px solid rgba(255,255,255,0.06);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                padding: 6px 10px;
                display: flex;
                align-items: center;
                gap: 3px;
                overflow-x: auto;
                white-space: nowrap;
                scrollbar-width: none;
                -ms-overflow-style: none;
                flex-wrap: nowrap;
            }
            .thana-nav::-webkit-scrollbar { display: none; }
            
            .thana-nav-item {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                padding: 7px 11px;
                border-radius: 10px;
                color: #94a3b8;
                text-decoration: none;
                font-size: 12px;
                font-weight: 500;
                transition: all 0.2s;
                flex-shrink: 0;
            }
            .thana-nav-item:hover {
                background: rgba(255,255,255,0.06);
                color: #e2e8f0;
            }
            .thana-nav-item.active {
                background: rgba(56,189,248,0.15);
                color: #38bdf8;
                font-weight: 600;
            }
            
            .thana-nav-brand {
                font-weight: 700;
                font-size: 13px;
                color: #38bdf8;
                margin-left: 8px;
                flex-shrink: 0;
                text-decoration: none;
            }
            .thana-nav-role {
                font-size: 10px;
                background: rgba(129,140,248,0.2);
                color: #818cf8;
                padding: 3px 8px;
                border-radius: 20px;
                margin: 0 6px;
                flex-shrink: 0;
            }
            .thana-nav-sep {
                width: 1px;
                height: 18px;
                background: rgba(255,255,255,0.08);
                margin: 0 4px;
                flex-shrink: 0;
            }
            .thana-nav-logout {
                padding: 7px 11px;
                border-radius: 10px;
                color: #f87171;
                text-decoration: none;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                flex-shrink: 0;
                margin-right: auto;
            }
            .thana-nav-logout:hover {
                background: rgba(248,113,113,0.15);
            }
            
            body { padding-top: 55px; }
            
            @media (max-width: 600px) {
                .thana-nav { padding: 4px 6px; }
                .thana-nav-item { padding: 5px 8px; font-size: 10px; }
                .thana-nav-brand { font-size: 11px; }
                body { padding-top: 48px; }
            }
        </style>
        
        <nav class="thana-nav" id="thanaNavBar">
            <a href="index.html" class="thana-nav-brand">🍽️ Thana</a>
            <span class="thana-nav-role">${config.name}</span>
            <span class="thana-nav-sep"></span>
            ${config.items.map(item => 
                `<a href="${item.href}" class="thana-nav-item${currentPage === item.href.split('?')[0] ? ' active' : ''}">${item.icon} ${item.label}</a>`
            ).join('')}
            <span class="thana-nav-sep"></span>
            <a href="login.html" class="thana-nav-logout" onclick="localStorage.removeItem('thana_auth_session');" title="تسجيل خروج">🚪</a>
        </nav>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', navHTML);
}

// تشغيل تلقائي
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const noNavPages = ['login.html', 'activate.html', 'qr-menu.html', 'dev-generate.html'];
    
    if (!noNavPages.includes(currentPage)) {
        createNavBar();
    }
});
