// ============================================
// Thana Restaurant - Dark/Light Mode
// ============================================

function applyTheme(theme) {
    if (theme === 'light') {
        document.documentElement.style.setProperty('--bg', '#f8fafc');
        document.documentElement.style.setProperty('--bg-card', '#ffffff');
        document.documentElement.style.setProperty('--text', '#0f172a');
        document.documentElement.style.setProperty('--text-secondary', '#475569');
    } else if (theme === 'high-contrast') {
        document.documentElement.style.setProperty('--bg', '#000000');
        document.documentElement.style.setProperty('--bg-card', '#111111');
        document.documentElement.style.setProperty('--text', '#ffffff');
        document.documentElement.style.setProperty('--text-secondary', '#cccccc');
        document.documentElement.style.setProperty('--gold', '#ffd700');
    } else {
        // Dark mode افتراضي
        document.documentElement.style.setProperty('--bg', '#0a0b0f');
        document.documentElement.style.setProperty('--bg-card', '#161820');
        document.documentElement.style.setProperty('--text', '#e8e4dd');
        document.documentElement.style.setProperty('--text-secondary', '#a8a49e');
        document.documentElement.style.setProperty('--gold', '#d4a853');
    }
    localStorage.setItem('thana_theme', theme);
}

// زر تغيير الوضع في الصفحات
document.addEventListener('DOMContentLoaded', function() {
    var theme = localStorage.getItem('thana_theme') || 'dark';
    applyTheme(theme);
    
    // إضافة زر صغير لتغيير الوضع
    var btn = document.createElement('button');
    btn.style = 'position:fixed;bottom:16px;right:16px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;font-size:16px;cursor:pointer;z-index:999;backdrop-filter:blur(10px)';
    btn.textContent = theme === 'dark' ? '☀️' : theme === 'light' ? '🌙' : '🔆';
    btn.title = 'تغيير الوضع';
    btn.onclick = function() {
        var current = localStorage.getItem('thana_theme') || 'dark';
        var next = current === 'dark' ? 'light' : current === 'light' ? 'high-contrast' : 'dark';
        applyTheme(next);
        btn.textContent = next === 'dark' ? '☀️' : next === 'light' ? '🌙' : '🔆';
    };
    document.body.appendChild(btn);
});
