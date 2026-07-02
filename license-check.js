// Thana License - Simple Gate
var LICENSE_VALID = true; // مفعل افتراضياً للتطوير

(function(){
    try {
        var lic = JSON.parse(localStorage.getItem('thana_license') || 'null');
        if (!lic || !lic.key || lic.key.length < 8) {
            LICENSE_VALID = false;
        }
    } catch(e) { LICENSE_VALID = false; }
})();

// ما نمنع أي صفحة - بس نحذر
if (!LICENSE_VALID) {
    console.warn('⚠️ ترخيص غير مفعل');
}
