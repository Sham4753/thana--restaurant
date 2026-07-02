// Thana Auto-Backup - تصدير ملف خارجي
function autoBackup() {
    var data = {};
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.startsWith('thana_')) {
            try { data[key] = JSON.parse(localStorage.getItem(key)); }
            catch(e) { data[key] = localStorage.getItem(key); }
        }
    }
    
    // تصدير كملف للتحميل
    var blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'thana-backup-' + new Date().toISOString().slice(0,10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    localStorage.setItem('thana_last_backup', Date.now());
}

// تحميل تلقائي عند الإغلاق اليومي فقط - مش كل 30 دقيقة
console.log('💾 Auto-Backup جاهز - يعمل مع الإغلاق اليومي');
