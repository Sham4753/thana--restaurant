// ============================================
// Thana Restaurant - Navigation Component v2
// شريط تنقل ذكي - يظهر حسب صلاحية المستخدم
// ============================================

function getUserRole() {
    try {
        const session = JSON.parse(localStorage.getItem('thana_auth_session') || 'null');
        if (session && session.role) {
            return session.role;
        }
    } catch(e) {}
    
    // إذا ما فيه جلسة = مدير (للتوافق مع النظام بدون تسجيل دخول)
    return 'admin';
}

function getNavItems() {
    const role = getUserRole();
    
    // كل الأدوار تشوف الرئيسية
    const items = [
        { href: 'index.html', icon: '🏠', label: 'الرئيسية', roles: ['admin','waiter','kitchen','cashier','manager'] },
    ];
    
    // admin = كل شيء
    if (role === 'admin') {
        items.push(
            { href: 'dashboard.html', icon: '📊', label: 'لوحة التحكم', roles: ['admin'] },
            { href: 'waiter.html', icon: '📋', label: 'النادل', roles: ['admin'] },
            { href: 'kitchen.html', icon: '🍳', label: 'المطبخ', roles: ['admin'] },
            { href: 'tables.html', icon: '🪑', label: 'الطاولات', roles: ['admin'] },
            { href: 'menu.html', icon: '🍽️', label: 'القائمة', roles: ['admin'] },
            { href: 'inventory.html', icon: '📦', label: 'المخزون', roles: ['admin'] },
            { href: 'staff.html', icon: '👥', label: 'الموظفين', roles: ['admin'] },
            { href: 'reports.html', icon: '📈', label: 'التقارير', roles: ['admin'] },
            { href: 'qr-menu.html?table=1', icon: '📱', label: 'QR', roles: ['admin'] },
            { href: 'voice.html', icon: '🎤', label: 'صوتي', roles: ['admin'] },
            { href: 'ai.html', icon: '🧠', label: 'ذكاء', roles: ['admin'] },
            { href: 'auth.html', icon: '🔐', label: 'أمان', roles: ['admin'] },
            { href: 'print.html', icon: '🖨️', label: 'طباعة', roles: ['admin'] },
            { href: 'settings.html', icon: '⚙️', label: 'إعدادات', roles: ['admin'] },
        );
    }
    
    // نادل
    if (role === 'waiter') {
        items.push(
            { href: 'waiter.html', icon: '📋', label: 'النادل', roles: ['waiter'] },
            { href: 'tables.html', icon: '🪑', label: 'الطاولات', roles: ['waiter'] },
            { href: 'menu.html', icon: '🍽️', label: 'القائمة', roles: ['waiter'] },
            { href: 'qr-menu.html?table=1', icon: '📱', label: 'QR', roles: ['waiter'] },
            { href: 'voice.html', icon: '🎤', label: 'صوتي', roles: ['waiter'] },
        );
    }
    
    // مطبخ
    if (role === 'kitchen') {
        items.push(
            { href: 'kitchen.html', icon: '🍳', label: 'المطبخ', roles: ['kitchen'] },
            { href: 'inventory.html', icon: '📦', label: 'المخزون', roles: ['kitchen'] },
            { href: 'velocity.html', icon: '⚡', label: 'السرعة', roles: ['kitchen'] },
        );
    }
    
    // كاشير
    if (role === 'cashier') {
        items.push(
            { href: 'waiter.html', icon: '📋', label: 'الطلبات', roles: ['cashier'] },
            { href: 'invoice.html', icon: '🧾', label: 'فاتورة', roles: ['cashier'] },
            { href: 'reports.html', icon: '📈', label: 'التقارير', roles: ['cashier'] },
            { href: 'print.html', icon: '🖨️', label: 'طباعة', roles: ['cashier'] },
            { href: 'customers.html', icon: '👤', label: 'عملاء', roles: ['cashier'] },
        );
    }
    
    // مدير مناوب
    if (role === 'manager') {
        items.push(
            { href: 'dashboard.html', icon: '📊', label: 'لوحة التحكم', roles: ['manager'] },
            { href: 'reports.html', icon: '📈', label: 'التقارير', roles: ['manager'] },
            { href: 'staff.html', icon: '👥', label: 'الموظفين', roles: ['manager'] },
            { href: 'menu.html', icon: '🍽️', label: 'القائمة', roles: ['manager'] },
            { href: 'inventory.html', icon: '📦', label: 'المخزون', roles: ['manager'] },
            { href: 'ai.html', icon: '🧠', label: 'ذكاء', roles: ['manager'] },
        );
    }
    
    return items;
}

function createNavBar() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const role = getUserRole();
    const navItems = getNavItems();
    
    // اسم الدور للعرض
    const roleNames = {
        'admin': '🔑 المدير',
        'waiter': '📋 نادل',
        'kitchen': '🍳 مطبخ',
        'cashier': '💰 كاشير',
        'manager': '📊 مدير',
    };
    
    const navHTML = `
        <style>
            .thana-topbar {
                background: var(--glass-bg);
                border-bottom: 1px solid var(--glass-border);
                padding: 8px 12px;
                display: flex;
                align-items: center;
                gap: 4px;
                backdrop-filter: var(--glass-blur);
                -webkit-backdrop-filter: var(--glass-blur);
                position: sticky;
                top: 0;
                z-index: 1000;
                flex-wrap: wrap;
                justify-content: center;
                box-shadow: var(--shadow-md);
            }
            .thana-topbar a {
                padding: 7px 12px;
                border-radius: var(--radius-md);
                color: var(--text-secondary);
                text-decoration: none;
                font-size: 12px;
                font-weight: 500;
                white-space: nowrap;
                transition: all var(--transition-fast);
                background: transparent;
            }
            .thana-topbar a:hover {
                background: var(--bg-input);
                color: var(--text-primary);
            }
            .thana-topbar a.active {
                background: rgba(56,189,248,0.15);
                color: var(--accent-primary);
                font-weight: 600;
            }
            .thana-topbar .brand {
                font-weight: 700;
                font-size: 14px;
                color: var(--accent-primary);
                margin-left: 8px;
                text-decoration: none;
            }
            .thana-topbar .role-badge {
                font-size: 10px;
                background: rgba(129,140,248,0.2);
                color: var(--accent-secondary);
                padding: 3px 8px;
                border-radius: var(--radius-full);
                margin: 0 4px;
            }
            .thana-topbar .sep {
                width: 1px;
                height: 18px;
                background: var(--border-light);
                margin: 0 3px;
            }
            .thana-topbar .logout-btn {
                background: rgba(248,113,113,0.12);
                color: var(--danger);
                cursor: pointer;
                font-weight: 600;
            }
            .thana-topbar .logout-btn:hover {
                background: rgba(248,113,113,0.25);
            }
            @media (max-width: 600px) {
                .thana-topbar { gap: 2px; padding: 5px 6px; }
                .thana-topbar a { padding: 5px 8px; font-size: 10px; }
                .thana-topbar .brand { font-size: 12px; }
            }
        </style>
        <div class="thana-topbar" id="thanaNavBar">
            <a href="index.html" class="brand">🍽️ Thana</a>
            <span class="role-badge">${roleNames[role] || '👤 ' + role}</span>
            <span class="sep"></span>
            ${navItems.map(item => 
                `<a href="${item.href}" class="${currentPage === item.href.split('?')[0] ? 'active' : ''}">${item.icon} ${item.label}</a>`
            ).join('')}
            <span class="sep"></span>
            <a href="login.html" class="logout-btn" onclick="localStorage.removeItem('thana_auth_session');">🚪</a>
        </div>
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
