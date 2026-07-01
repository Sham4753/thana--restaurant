// Dynamic License System
var LICENSE_VALID = false;

function checkLicense() {
    var lic = JSON.parse(localStorage.getItem('thana_license') || 'null');
    if (!lic || !lic.key) return false;
    
    // قائمة الأكواد الصالحة
    var validKeys = ['THANA-DEV0-0000-0000'];
    
    if (validKeys.indexOf(lic.key) >= 0) {
        // فحص تاريخ الانتهاء
        if (lic.expiry) {
            var exp = new Date(lic.expiry);
            if (exp < new Date()) {
                toast('⚠️ انتهت صلاحية الترخيص', 'error');
                return false;
            }
        }
        LICENSE_VALID = true;
        return true;
    }
    return false;
}

function activateLicense(key) {
    if (!key || key.length < 10) {
        toast('❌ كود غير صالح', 'error');
        return false;
    }
    
    var lic = {
        key: key.toUpperCase(),
        activatedAt: new Date().toISOString(),
        expiry: new Date(Date.now() + 365*24*60*60*1000).toISOString()
    };
    
    localStorage.setItem('thana_license', JSON.stringify(lic));
    LICENSE_VALID = true;
    toast('✅ تم تفعيل الترخيص', 'success');
    return true;
}

// حماية عند بدء التشغيل
document.addEventListener('DOMContentLoaded', function() {
    if (!checkLicense() && !window.location.pathname.includes('activate')) {
        // توجيه لصفحة التفعيل
        if (typeof navigate === 'function') {
            navigate('activate');
        }
    }
});

console.log('🔑 License System جاهز');
