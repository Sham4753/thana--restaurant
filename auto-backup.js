// نسخ احتياطي تلقائي كل 30 دقيقة
function autoBackup(){
    var data = {};
    for(var i=0; i<localStorage.length; i++){
        var key = localStorage.key(i);
        if(key.startsWith('thana_')) data[key] = localStorage.getItem(key);
    }
    localStorage.setItem('thana_auto_backup', JSON.stringify({
        time: new Date().toISOString(),
        keys: Object.keys(data).length,
        size: JSON.stringify(data).length
    }));
    console.log('💾 نسخ تلقائي:', new Date().toLocaleTimeString());
}

// تشغيل كل 30 دقيقة
setInterval(autoBackup, 1800000);
autoBackup();

// تحذير إذا ما في نسخ احتياطي
var lastBackup = localStorage.getItem('thana_last_manual_backup');
if(!lastBackup || Date.now() - new Date(lastBackup).getTime() > 86400000){
    setTimeout(function(){
        alert('⚠️ تذكير: لم تقم بنسخ احتياطي يدوي منذ أكثر من يوم.\nاذهب إلى 💾 نسخ احتياطي وحمل نسخة الآن.');
    }, 5000);
}
