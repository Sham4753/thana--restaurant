// Thana Secure License System v2.3
var LICENSE_VALID = false;

// قائمة الـ hashes المرخصة - يتم تحديثها مع كل عملية بيع
var VALID_LICENSES = {
    '4a7d1ed414474e4033ac29ccb8653d9b': {name:'مطور',expiry:'2099-12-31'},
    // أضف hashes جديدة مع كل عملية بيع
};

function checkLicense() {
    var lic = JSON.parse(localStorage.getItem('thana_license') || 'null');
    if (!lic || !lic.key || !lic.signature) return false;
    
    var key = lic.key;
    var sig = lic.signature;
    var expectedSig = simpleHash(key + 'ThanaSecret2026');
    
    // التحقق من التوقيع
    if (sig !== expectedSig) {
        localStorage.removeItem('thana_license');
        return false;
    }
    
    // فحص إذا المفتاح في القائمة
    if (VALID_LICENSES[key]) {
        var exp = new Date(VALID_LICENSES[key].expiry);
        if (exp < new Date()) {
            toast('⚠️ انتهت صلاحية الترخيص - اتصل بالدعم', 'error');
            LICENSE_VALID = false;
            return false;
        }
        LICENSE_VALID = true;
        return true;
    }
    
    return false;
}

function activateLicense(key) {
    if (!key || key.length < 8) {
        toast('❌ كود غير صالح', 'error');
        return false;
    }
    
    key = key.toUpperCase().trim();
    var signature = simpleHash(key + 'ThanaSecret2026');
    
    // محاولة التحقق - هل المفتاح + التوقيع صحيح؟
    if (!VALID_LICENSES[key]) {
        // المفتاح مش في القائمة
        toast('❌ كود ترخيص غير صالح', 'error');
        return false;
    }
    
    var lic = {
        key: key,
        signature: signature,
        activatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('thana_license', JSON.stringify(lic));
    LICENSE_VALID = true;
    toast('✅ تم تفعيل الترخيص - ' + VALID_LICENSES[key].name, 'success');
    return true;
}

function simpleHash(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

document.addEventListener('DOMContentLoaded', function() {
    if (!checkLicense() && !window.location.pathname.includes('activate')) {
        if (typeof navigate === 'function') navigate('activate');
    }
});

console.log('🔑 Secure License v2.3');
