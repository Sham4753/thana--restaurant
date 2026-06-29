// ============================================
// Thana Restaurant v2.1 - Navigation System
// شريط التنقل الذكي - تصميم ذهبي موحد
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
                { href: 'customers.html', icon: '👤', label: 'العملاء' },
                { href: 'close.html', icon: '🔒', label: 'الإغلاق' },
                { href: 'waste_report.html', icon: '🗑️', label: 'الهدر' },
                { href: 'velocity.html', icon: '⚡', label: 'السرعة' },
                { href: 'procurement.html', icon: '🛒', label: 'المشتريات' },
                { href: 'invoice.html', icon: '🧾', label: 'الفاتورة' },
                { href: 'qr-menu.html?table=1', icon: '📱', label: 'QR' },
                { href: 'voice.html', icon: '🎤', label: 'صوتي' },
                { href: 'ai.html', icon: '🧠', label: 'ذكاء' },
                { href: 'auth.html', icon: '🔐', label: 'أمان' },
                { href: 'print.html', icon: '🖨️', label: 'طباعة' },
                { href: 'theme-settings.html', icon: '🎨', label: 'مظهر' },
                { href: 'setup.html', icon: '🏪', label: 'هوية المطعم' },
                { href: 'setup.html', icon: '🏪', label: 'هوية المطعم' },
                { href: 'settings.html', icon: '⚙️', label: 'الإعدادات' },
                { href: 'pin-settings.html', icon: '🔢', label: 'رموز PIN' },
                { href: 'activate.html', icon: '🔑', label: 'الترخيص' },
                { href: 'backup.html', icon: '💾', label: 'نسخ احتياطي' },
                { href: 'help.html', icon: '📖', label: 'مساعدة' },
                { href: 'docs.html', icon: '📋', label: 'التوثيق' },
            ]
        },
        waiter: {
            name: '📋 النادل',
            items: [
                { href: 'index.html', icon: '🏠', label: 'الرئيسية' },
                { href: 'waiter.html', icon: '📋', label: 'النادل' },
                { href: 'tables.html', icon: '🪑', label: 'الطاولات' },
                { href: 'menu.html', icon: '🍽️', label: 'القائمة' },
                { href: 'qr-menu.html?table=1', icon: '📱', label: 'QR' },
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
                top: 0; left: 0; right: 0;
                z-index: 9999;
                background: rgba(10, 11, 15, 0.96);
                border-bottom: 1px solid rgba(212,168,83,0.15);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                padding: 6px 12px;
                display: flex;
                align-items: center;
                gap: 2px;
                overflow-x: auto;
                white-space: nowrap;
                scrollbar-width: none;
                -ms-overflow-style: none;
            }
            .thana-nav::-webkit-scrollbar { display: none; }

            .thana-nav-brand {
                font-weight: 800;
                font-size: 14px;
                color: #d4a853;
                margin-left: 8px;
                flex-shrink: 0;
                text-decoration: none;
                letter-spacing: 0.5px;
            }
            .thana-nav-role {
                font-size: 10px;
                background: rgba(212,168,83,0.12);
                color: #d4a853;
                padding: 3px 8px;
                border-radius: 20px;
                margin: 0 6px;
                flex-shrink: 0;
                font-weight: 600;
                border: 1px solid rgba(212,168,83,0.2);
            }
            .thana-nav-sep {
                width: 1px;
                height: 18px;
                background: rgba(212,168,83,0.1);
                margin: 0 4px;
                flex-shrink: 0;
            }
            .thana-nav-item {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 6px 10px;
                border-radius: 8px;
                color: #6b6760;
                text-decoration: none;
                font-size: 11px;
                font-weight: 500;
                transition: all 0.2s;
                flex-shrink: 0;
                border: 1px solid transparent;
            }
            .thana-nav-item:hover {
                background: rgba(212,168,83,0.08);
                color: #d4a853;
                border-color: rgba(212,168,83,0.15);
            }
            .thana-nav-item.active {
                background: rgba(212,168,83,0.12);
                color: #d4a853;
                font-weight: 700;
                border-color: rgba(212,168,83,0.25);
            }
            .thana-nav-logout {
                padding: 6px 10px;
                border-radius: 8px;
                color: #c0392b;
                text-decoration: none;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                flex-shrink: 0;
                margin-right: auto;
                transition: all 0.2s;
                border: 1px solid transparent;
            }
            .thana-nav-logout:hover {
                background: rgba(192,57,43,0.12);
                border-color: rgba(192,57,43,0.2);
            }
            body { padding-top: 52px; }
            @media (max-width: 600px) {
                .thana-nav { padding: 4px 8px; gap: 1px; }
                .thana-nav-item { padding: 5px 7px; font-size: 10px; }
                .thana-nav-brand { font-size: 12px; }
                body { padding-top: 46px; }
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
            <a href="login.html" class="thana-nav-logout" onclick="localStorage.removeItem('thana_auth_session');" title="تسجيل خروج">🚪 خروج</a>
        </nav>
    `;

    document.body.insertAdjacentHTML('afterbegin', navHTML);
}

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const noNavPages = ['login.html', 'activate.html', 'qr-menu.html', 'dev-generate.html'];
    if (!noNavPages.includes(currentPage)) {
        createNavBar();
    }
});
