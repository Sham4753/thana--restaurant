// ============================================
// Thana Restaurant - Navigation Component
// شريط تنقل موحد لجميع الصفحات
// ============================================

function createNavBar() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    const navHTML = `
        <style>
            .thana-topbar {
                background: var(--glass-bg);
                border-bottom: 1px solid var(--glass-border);
                padding: 8px 12px;
                display: flex;
                align-items: center;
                gap: 6px;
                backdrop-filter: var(--glass-blur);
                -webkit-backdrop-filter: var(--glass-blur);
                position: sticky;
                top: 0;
                z-index: 1000;
                flex-wrap: wrap;
                justify-content: center;
            }
            .thana-topbar a {
                padding: 8px 14px;
                border-radius: var(--radius-md);
                color: var(--text-secondary);
                text-decoration: none;
                font-size: 13px;
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
                font-size: 15px;
                color: var(--accent-primary);
                margin-left: 12px;
            }
            .thana-topbar .sep {
                width: 1px;
                height: 20px;
                background: var(--border-light);
                margin: 0 4px;
            }
            .thana-topbar .logout-btn {
                background: rgba(248,113,113,0.12);
                color: var(--danger);
                cursor: pointer;
            }
            .thana-topbar .logout-btn:hover {
                background: rgba(248,113,113,0.25);
            }
            @media (max-width: 600px) {
                .thana-topbar { gap: 3px; padding: 6px 8px; }
                .thana-topbar a { padding: 6px 10px; font-size: 11px; }
            }
        </style>
        <div class="thana-topbar" id="thanaNavBar">
            <span class="brand">🍽️ Thana</span>
            <span class="sep"></span>
            <a href="index.html" class="${currentPage === 'index.html' ? 'active' : ''}">🏠 الرئيسية</a>
            <a href="dashboard.html" class="${currentPage === 'dashboard.html' ? 'active' : ''}">📊 لوحة التحكم</a>
            <a href="waiter.html" class="${currentPage === 'waiter.html' ? 'active' : ''}">📋 النادل</a>
            <a href="kitchen.html" class="${currentPage === 'kitchen.html' ? 'active' : ''}">🍳 المطبخ</a>
            <a href="tables.html" class="${currentPage === 'tables.html' ? 'active' : ''}">🪑 الطاولات</a>
            <a href="menu.html" class="${currentPage === 'menu.html' ? 'active' : ''}">🍽️ القائمة</a>
            <a href="inventory.html" class="${currentPage === 'inventory.html' ? 'active' : ''}">📦 المخزون</a>
            <a href="staff.html" class="${currentPage === 'staff.html' ? 'active' : ''}">👥 الموظفين</a>
            <a href="reports.html" class="${currentPage === 'reports.html' ? 'active' : ''}">📊 التقارير</a>
            <a href="qr-menu.html?table=1" class="${currentPage === 'qr-menu.html' ? 'active' : ''}">📱 QR</a>
            <a href="voice.html" class="${currentPage === 'voice.html' ? 'active' : ''}">🎤 صوتي</a>
            <a href="ai.html" class="${currentPage === 'ai.html' ? 'active' : ''}">🧠 ذكاء</a>
            <a href="auth.html" class="${currentPage === 'auth.html' ? 'active' : ''}">🔐 أمان</a>
            <a href="print.html" class="${currentPage === 'print.html' ? 'active' : ''}">🖨️ طباعة</a>
            <a href="settings.html" class="${currentPage === 'settings.html' ? 'active' : ''}">⚙️ إعدادات</a>
            <span class="sep"></span>
            <a href="login.html" class="logout-btn" onclick="localStorage.clear();">🚪 خروج</a>
        </div>
    `;
    
    // إضافة الشريط في بداية body
    document.body.insertAdjacentHTML('afterbegin', navHTML);
}

// تشغيل تلقائي
document.addEventListener('DOMContentLoaded', function() {
    // ما نضيف الشريط في صفحة تسجيل الدخول والتفعيل و QR
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const noNavPages = ['login.html', 'activate.html', 'qr-menu.html', 'dev-generate.html'];
    
    if (!noNavPages.includes(currentPage)) {
        createNavBar();
    }
});
