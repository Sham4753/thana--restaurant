// ============================================
// Thana Restaurant - License Key System
// نظام الترخيص والتفعيل الاحترافي
// ============================================

const LICENSE_VERSION = '1.0';

// ========== توليد الأكواد (عندك أنت فقط) ==========
// هذه الدالة تستخدمها أنت لتوليد أكواد للعملاء
// لا تشاركها مع أحد

function generateLicenseKey(restaurantName, months, secretSalt) {
    // secretSalt = كلمة سر خاصة فيك فقط
    const data = restaurantName + '-' + months + '-' + secretSalt;
    const hash = simpleHash(data);
    const prefix = 'THANA';
    const block1 = hash.substring(0, 4).toUpperCase();
    const block2 = hash.substring(4, 8).toUpperCase();
    const block3 = hash.substring(8, 12).toUpperCase();
    return `${prefix}-${block1}-${block2}-${block3}`;
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    // تحويل لـ hex مع padding
    return Math.abs(hash).toString(16).padStart(12, '0').toUpperCase();
}

// ========== قائمة الأكواد الصالحة (تحدثها أنت) ==========
// هذه القائمة ترفع مع كل تحديث
// كل كود مربوط بمطعم وتاريخ انتهاء

const VALID_LICENSES = {
    // شكل الكود: { name: 'اسم المطعم', expiry: 'YYYY-MM-DD', active: true }
    
    // مثال - كود تجريبي للمطور
    'THANA-DEV0-0000-0000': { name: 'المطور - نسخة تجريبية', expiry: '2099-12-31', active: true, type: 'dev' },
        'DEV-LOCAL-TEST-0001': { name: 'تطوير محلي', expiry: '2099-12-31', active: true, type: 'dev' },
        'THANA-DEV0-0000-0000': {
        name: 'المطور - نسخة تجريبية',
        expiry: '2099-12-31',
        active: true,
        type: 'dev'
    },
    
    // أكواد العملاء - أضفهم هنا
    // 'THANA-XXXX-YYYY-ZZZZ': {
    //     name: 'مطعم أبا عمر',
    //     expiry: '2027-01-01',
    //     active: true,
    //     type: 'customer'
    // },
};

// ========== فحص الترخيص ==========
function getStoredLicense() {
    try {
        return JSON.parse(localStorage.getItem('thana_license') || 'null');
    } catch(e) {
        return null;
    }
}

function saveLicense(licenseKey, licenseData) {
    const license = {
        key: licenseKey,
        name: licenseData.name,
        expiry: licenseData.expiry,
        type: licenseData.type,
        activatedAt: new Date().toISOString(),
        version: LICENSE_VERSION
    };
    localStorage.setItem('thana_license', JSON.stringify(license));
    return license;
}

function clearLicense() {
    localStorage.removeItem('thana_license');
}

function validateLicense() {
    const stored = getStoredLicense();
    
    // إذا ما فيه ترخيص مخزن
    if (!stored || !stored.key) {
        return { valid: false, reason: 'no_license', message: 'لا يوجد ترخيص' };
    }
    
    // فحص إذا الكود موجود في القائمة
    const licenseData = VALID_LICENSES[stored.key];
    if (!licenseData) {
        return { valid: false, reason: 'invalid_key', message: 'كود الترخيص غير صالح' };
    }
    
    // فحص إذا الكود مفعل
    if (!licenseData.active) {
        return { valid: false, reason: 'inactive', message: 'تم تعطيل هذا الترخيص' };
    }
    
    // فحص تاريخ الانتهاء
    const expiryDate = new Date(licenseData.expiry);
    const today = new Date();
    const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
        return { 
            valid: false, 
            reason: 'expired', 
            message: 'انتهت صلاحية الترخيص',
            daysLeft: daysLeft
        };
    }
    
    // تحذير إذا قرب الانتهاء
    let warning = null;
    if (daysLeft <= 30) {
        warning = `تنبيه: الترخيص سينتهي خلال ${daysLeft} يوم`;
    }
    if (daysLeft <= 7) {
        warning = `⚠️ تنبيه عاجل: الترخيص سينتهي خلال ${daysLeft} يوم - جدد الآن`;
    }
    
    return {
        valid: true,
        name: licenseData.name,
        expiry: licenseData.expiry,
        daysLeft: daysLeft,
        warning: warning,
        type: licenseData.type
    };
}

function activateLicense(licenseKey) {
    // تنظيف الكود
    const cleanKey = licenseKey.trim().toUpperCase();
    
    // فحص إذا الكود في القائمة
    const licenseData = VALID_LICENSES[cleanKey];
    if (!licenseData) {
        return { success: false, message: '❌ كود الترخيص غير صحيح' };
    }
    
    if (!licenseData.active) {
        return { success: false, message: '❌ هذا الترخيص معطل' };
    }
    
    // فحص تاريخ الانتهاء
    const expiryDate = new Date(licenseData.expiry);
    const today = new Date();
    if (expiryDate < today) {
        return { success: false, message: '❌ انتهت صلاحية هذا الكود' };
    }
    
    // حفظ الترخيص
    saveLicense(cleanKey, licenseData);
    
    const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    return {
        success: true,
        message: `✅ تم التفعيل بنجاح! مرحباً ${licenseData.name}`,
        name: licenseData.name,
        daysLeft: daysLeft
    };
}

function getLicenseInfo() {
    const validation = validateLicense();
    const stored = getStoredLicense();
    
    return {
        ...validation,
        activatedAt: stored ? stored.activatedAt : null,
        restaurantName: stored ? stored.name : null
    };
}

function daysUntilExpiry() {
    const validation = validateLicense();
    return validation.daysLeft || 0;
}

function isLicenseValid() {
    return validateLicense().valid;
}

// ========== أدوات المطور (عندك أنت فقط) ==========
function developerGenerateKey(restaurantName, months, secretKey) {
    // secretKey = كلمة سر خاصة فيك
    if (secretKey !== 'ThanaMaster2026') {
        return '⛔ غير مصرح';
    }
    
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + months);
    const expiry = expiryDate.toISOString().split('T')[0];
    
    const key = generateLicenseKey(restaurantName + expiry, months, secretKey);
    
    return {
        key: key,
        restaurant: restaurantName,
        months: months,
        expiry: expiry,
        // اللي تضيفه في VALID_LICENSES:
        code: `'${key}': { name: '${restaurantName}', expiry: '${expiry}', active: true, type: 'customer' },`
    };
}

// ========== حماية الصفحات ==========
function protectWithLicense() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // صفحات مسموحة بدون ترخيص
    const publicPages = ['login.html', 'activate.html'];
    if (publicPages.includes(currentPage)) {
        return true;
    }
    
    // صفحة QR للضيوف
    if (currentPage === 'qr-menu.html') {
        return true;
    }
    
    // فحص الترخيص
    const validation = validateLicense();
    
    if (!validation.valid) {
        // توجيه لصفحة التفعيل
        window.location.href = 'activate.html?reason=' + validation.reason;
        return false;
    }
    
    // إذا قرب الانتهاء، نظهر تنبيه
    if (validation.warning) {
        // نخزن التنبيه لعرضه
        localStorage.setItem('thana_license_warning', validation.warning);
    }
    
    return true;
}

// ========== تشغيل تلقائي ==========
document.addEventListener('DOMContentLoaded', function() {
    protectWithLicense();
    
    // عرض تنبيه الترخيص إذا وجد
    const warning = localStorage.getItem('thana_license_warning');
    if (warning) {
        const warningEl = document.getElementById('licenseWarning');
        if (warningEl) {
            warningEl.textContent = warning;
            warningEl.style.display = 'block';
        }
        // نمسحه بعد ما نعرضه
        localStorage.removeItem('thana_license_warning');
    }
});

console.log('🔐 Thana License System v' + LICENSE_VERSION + ' - جاهز');
