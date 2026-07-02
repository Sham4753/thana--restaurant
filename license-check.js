// Thana License - Simple Gate
var LICENSE_VALID = (function(){
    try {
        var lic = JSON.parse(localStorage.getItem('thana_license') || 'null');
        return lic && lic.key && lic.key.length > 8;
    } catch(e) { return false; }
})();

if (!LICENSE_VALID && !window.location.pathname.includes('activate')) {
    document.addEventListener('DOMContentLoaded', function() {
        document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Cairo,sans-serif;color:#00f0ff;text-align:center"><div><h1>🔑</h1><p>يرجى تفعيل الترخيص</p><a href="activate.html" style="color:#00f0ff">تفعيل</a></div></div>';
    });
}
