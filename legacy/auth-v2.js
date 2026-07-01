// ============================================
// Thana Restaurant v2.1 - Role-Based Access Control
// هرم الصلاحيات - نظام تسجيل الدخول الذكي
// ============================================

const AUTH_VERSION = '2.1';

// قاعدة بيانات المستخدمين والأدوار
const DEFAULT_USERS = {
    // المدير - يرى كل شيء
    'admin': {
        pin: '2026',
        name: 'المدير',
        role: 'admin',
        icon: '🔑',
        permissions: ['all'],
        pages: [
            'index.html', 'dashboard.html', 'waiter.html', 'kitchen.html',
            'tables.html', 'staff.html', 'menu.html', 'inventory.html',
            'reports.html', 'settings.html', 'close.html', 'waste_report.html',
            'admin.html', 'customers.html', 'velocity.html', 'procurement.html',
            'invoice.html', 'qr-menu.html', 'voice.html', 'ai.html',
            'auth.html', 'print.html', 'theme-settings.html'
        ]
    },
    // النادل - طلبات فقط
    'waiter1': {
        pin: '1111',
        name: 'النادل',
        role: 'waiter',
        icon: '📋',
        permissions: ['orders', 'tables', 'menu_view'],
        pages: [
            'index.html', 'waiter.html', 'tables.html', 'qr-menu.html',
            'voice.html', 'menu.html'
        ]
    },
    // شيف المطبخ - KDS فقط
    'chef1': {
        pin: '2222',
        name: 'شيف المطبخ',
        role: 'kitchen',
        icon: '🍳',
        permissions: ['kitchen', 'inventory_view'],
        pages: [
            'index.html', 'kitchen.html', 'inventory.html', 'velocity.html'
        ]
    },
    // الكاشير - فواتير ومبيعات
    'cashier1': {
        pin: '3333',
        name: 'الكاشير',
        role: 'cashier',
        icon: '💰',
        permissions: ['orders', 'invoices', 'reports_view'],
        pages: [
            'index.html', 'waiter.html', 'invoice.html', 'reports.html',
            'print.html', 'customers.html'
        ]
    },
    // مدير ثانوي - يشوف التقارير بس
    'manager1': {
        pin: '4444',
        name: 'مدير مناوب',
        role: 'manager',
        icon: '📊',
        permissions: ['reports', 'dashboard', 'staff_view', 'menu_edit'],
        pages: [
            'index.html', 'dashboard.html', 'reports.html', 'staff.html',
            'menu.html', 'ai.html', 'inventory.html'
        ]
    },
    // زبون QR - عرض القائمة فقط
    'guest': {
        pin: '',
        name: 'ضيف',
        role: 'guest',
        icon: '👤',
        permissions: ['qr_menu_only'],
        pages: [
            'qr-menu.html'
        ]
    }
};

// ========== إدارة الجلسة ==========
function getSession() {
    try {
        return JSON.parse(localStorage.getItem('thana_auth_session') || 'null');
    } catch(e) {
        return null;
    }
}

function saveSession(userId, role) {
    const session = {
        userId: userId,
        role: role,
        loginTime: new Date().toISOString(),
        version: AUTH_VERSION
    };
    localStorage.setItem('thana_auth_session', JSON.stringify(session));
    return session;
}

function clearSession() {
    localStorage.removeItem('thana_auth_session');
}

function isLoggedIn() {
    const session = getSession();
    return session && session.userId && session.role;
}

function getCurrentUser() {
    const session = getSession();
    if (!session) return null;
    
    // البحث عن المستخدم
    for (const [id, user] of Object.entries(getAllUsers())) {
        if (id === session.userId || user.role === session.role) {
            return { id, ...user };
        }
    }
    return null;
}

function getCurrentRole() {
    const session = getSession();
    return session ? session.role : 'guest';
}

// ========== إدارة المستخدمين ==========
function getAllUsers() {
    const customUsers = JSON.parse(localStorage.getItem('thana_custom_users') || '{}');
    return { ...DEFAULT_USERS, ...customUsers };
}

function addCustomUser(id, userData) {
    const customUsers = JSON.parse(localStorage.getItem('thana_custom_users') || '{}');
    customUsers[id] = userData;
    localStorage.setItem('thana_custom_users', JSON.stringify(customUsers));
}

function removeCustomUser(id) {
    const customUsers = JSON.parse(localStorage.getItem('thana_custom_users') || '{}');
    delete customUsers[id];
    localStorage.setItem('thana_custom_users', JSON.stringify(customUsers));
}

function resetToDefaultUsers() {
    localStorage.removeItem('thana_custom_users');
}

// ========== تسجيل الدخول ==========
function login(pin) {
    if (!pin || pin.trim() === '') return { success: false, message: 'أدخل رمز PIN' };
    
    const users = getAllUsers();
    
    for (const [id, user] of Object.entries(users)) {
        if (user.pin === pin.trim()) {
            saveSession(id, user.role);
            return { 
                success: true, 
                user: { id, ...user },
                message: `✅ مرحباً ${user.name}!`
            };
        }
    }
    
    return { success: false, message: '❌ رمز PIN غير صحيح' };
}

function logout() {
    clearSession();
    // العودة لصفحة تسجيل الدخول
    window.location.href = 'login.html';
}

// ========== التحقق من الصلاحيات ==========
function canAccess(pageName) {
    const session = getSession();
    if (!session) return false;
    
    // المدير يصل لكل شيء
    if (session.role === 'admin') return true;
    
    const users = getAllUsers();
    let user = null;
    
    for (const [id, u] of Object.entries(users)) {
        if (id === session.userId || u.role === session.role) {
            user = u;
            break;
        }
    }
    
    if (!user) return false;
    
    return user.pages.includes(pageName);
}

function hasPermission(permission) {
    const session = getSession();
    if (!session) return false;
    if (session.role === 'admin') return true;
    
    const users = getAllUsers();
    let user = null;
    
    for (const [id, u] of Object.entries(users)) {
        if (id === session.userId || u.role === session.role) {
            user = u;
            break;
        }
    }
    
    if (!user) return false;
    
    return user.permissions.includes(permission) || user.permissions.includes('all');
}

// ========== حماية الصفحات ==========
function protectPage() {
    // إذا كانت صفحة qr-menu، نسمح للضيوف
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (currentPage === 'qr-menu.html') {
        // QR Menu متاح للكل
        return true;
    }
    
    if (currentPage === 'login.html') {
        // صفحة تسجيل الدخول متاحة للكل
        return true;
    }
    
    if (!isLoggedIn()) {
        // توجيه لصفحة تسجيل الدخول
        window.location.href = 'login.html?redirect=' + encodeURIComponent(currentPage);
        return false;
    }
    
    if (!canAccess(currentPage)) {
        // غير مصرح
        alert('⛔ غير مصرح لك بالدخول لهذه الصفحة');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// ========== واجهة المستخدم ==========
function renderUserBadge() {
    const user = getCurrentUser();
    if (!user) return '';
    
    return `
        <div style="display:flex;align-items:center;gap:8px;padding:4px 12px;background:var(--glass-bg);border-radius:var(--radius-full);font-size:13px;border:1px solid var(--glass-border);">
            <span>${user.icon}</span>
            <span>${user.name}</span>
            <span style="color:var(--text-muted);">| ${user.role}</span>
            <span onclick="logout()" style="cursor:pointer;color:var(--danger);margin-right:4px;" title="تسجيل خروج">🚪</span>
        </div>
    `;
}

function renderNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const user = getCurrentUser();
    if (!user) return '';
    
    const navItems = [
        { page: 'index.html', icon: '🏠', label: 'الرئيسية', roles: ['admin','waiter','kitchen','cashier','manager'] },
        { page: 'dashboard.html', icon: '📊', label: 'لوحة التحكم', roles: ['admin','manager'] },
        { page: 'waiter.html', icon: '📋', label: 'النادل', roles: ['admin','waiter','cashier'] },
        { page: 'kitchen.html', icon: '🍳', label: 'المطبخ', roles: ['admin','kitchen'] },
        { page: 'tables.html', icon: '🪑', label: 'الطاولات', roles: ['admin','waiter'] },
        { page: 'staff.html', icon: '👥', label: 'الموظفين', roles: ['admin','manager'] },
        { page: 'menu.html', icon: '🍽️', label: 'القائمة', roles: ['admin','manager','waiter'] },
        { page: 'inventory.html', icon: '📦', label: 'المخزون', roles: ['admin','kitchen','manager'] },
        { page: 'reports.html', icon: '📊', label: 'التقارير', roles: ['admin','cashier','manager'] },
        { page: 'voice.html', icon: '🎤', label: 'صوتي', roles: ['admin','waiter'] },
        { page: 'ai.html', icon: '🧠', label: 'ذكاء', roles: ['admin','manager'] },
        { page: 'print.html', icon: '🖨️', label: 'طباعة', roles: ['admin','cashier'] },
        { page: 'auth.html', icon: '🔐', label: 'أمان', roles: ['admin'] },
    ];
    
    const filtered = navItems.filter(item => 
        item.roles.includes(user.role) || user.role === 'admin'
    );
    
    return `
        <div class="nav-bar">
            ${filtered.map(item => `
                <a href="${item.page}" class="nav-link ${currentPage === item.page ? 'active' : ''}">
                    ${item.icon} ${item.label}
                </a>
            `).join('')}
        </div>
    `;
}

function renderRoleBasedUI() {
    const user = getCurrentUser();
    if (!user) return;
    
    // إخفاء العناصر حسب الصلاحية
    document.querySelectorAll('[data-role]').forEach(el => {
        const allowedRoles = el.getAttribute('data-role').split(',');
        if (!allowedRoles.includes(user.role) && user.role !== 'admin') {
            el.style.display = 'none';
        }
    });
    
    // إخفاء العناصر حسب الصلاحية المحددة
    document.querySelectorAll('[data-permission]').forEach(el => {
        const perm = el.getAttribute('data-permission');
        if (!hasPermission(perm)) {
            el.style.display = 'none';
        }
    });
}

// ========== بدء التشغيل التلقائي ==========
document.addEventListener('DOMContentLoaded', function() {
    // حماية الصفحة
    protectPage();
    
    // إضافة شريط المستخدم إذا وجد عنصر مخصص
    const userBadgeContainer = document.getElementById('userBadge');
    if (userBadgeContainer && isLoggedIn()) {
        userBadgeContainer.innerHTML = renderUserBadge();
    }
    
    // إضافة شريط التنقل إذا وجد عنصر مخصص
    const navContainer = document.getElementById('navBar');
    if (navContainer && isLoggedIn()) {
        navContainer.innerHTML = renderNavigation();
    }
    
    // تطبيق واجهة الأدوار
    if (isLoggedIn()) {
        renderRoleBasedUI();
    }
});

console.log('🔐 Thana RBAC v' + AUTH_VERSION + ' - نظام الصلاحيات جاهز');
