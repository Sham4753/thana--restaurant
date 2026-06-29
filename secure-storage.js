// ============================================
// Thana Restaurant - Secure Storage
// تشفير البيانات الحساسة في localStorage
// ============================================

const SECURE_VERSION = '1.0';
const ENCRYPTION_KEY = 'thana-secure-key-2026';

// تشفير بسيط (XOR + Base64)
function encrypt(data) {
    if (typeof data !== 'string') data = JSON.stringify(data);
    let result = '';
    for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    return btoa(result);
}

function decrypt(encrypted) {
    try {
        let data = atob(encrypted);
        let result = '';
        for (let i = 0; i < data.length; i++) {
            result += String.fromCharCode(data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
        }
        return result;
    } catch(e) {
        return null;
    }
}

// حفظ آمن
function secureSetItem(key, value) {
    const encrypted = encrypt(JSON.stringify(value));
    localStorage.setItem(key + '_secure', encrypted);
}

// قراءة آمنة
function secureGetItem(key) {
    const encrypted = localStorage.getItem(key + '_secure');
    if (!encrypted) return null;
    const decrypted = decrypt(encrypted);
    return decrypted ? JSON.parse(decrypted) : null;
}

// حماية الجلسة
function protectSession() {
    const session = JSON.parse(localStorage.getItem('thana_auth_session') || 'null');
    if (session) {
        secureSetItem('thana_auth_session', session);
        localStorage.removeItem('thana_auth_session'); // حذف النسخة المكشوفة
    }
}

// استعادة الجلسة
function restoreSession() {
    const secureSession = secureGetItem('thana_auth_session');
    if (secureSession) {
        localStorage.setItem('thana_auth_session', JSON.stringify(secureSession));
    }
}

// تشغيل تلقائي
if (localStorage.getItem('thana_auth_session')) {
    protectSession();
} else {
    restoreSession();
}

console.log('🔒 Secure Storage v' + SECURE_VERSION + ' - جاهز');
