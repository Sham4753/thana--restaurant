// تثبيت PWA
if('serviceWorker' in navigator){
    window.addEventListener('load',function(){
        navigator.serviceWorker.register('/thana--restaurant/sw.js');
    });
}

// عرض دعوة التثبيت تلقائياً
window.addEventListener('beforeinstallprompt',function(e){
    e.preventDefault();
    window.deferredPrompt = e;
    
    // عرض رسالة تثبيت بعد 3 ثواني
    setTimeout(function(){
        if(window.deferredPrompt && !localStorage.getItem('pwa_installed')){
            var banner = document.createElement('div');
            banner.style = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#d4a853;color:#000;padding:14px 24px;border-radius:30px;font-weight:700;z-index:9999;cursor:pointer;font-family:Cairo,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,0.4);animation:slideUp 0.5s ease';
            banner.textContent = '📲 تثبيت التطبيق على الجهاز';
            banner.onclick = function(){
                window.deferredPrompt.prompt();
                window.deferredPrompt.userChoice.then(function(){
                    localStorage.setItem('pwa_installed','true');
                    banner.remove();
                });
            };
            document.body.appendChild(banner);
            
            setTimeout(function(){ if(document.body.contains(banner)) banner.remove(); }, 15000);
        }
    },3000);
});

window.addEventListener('appinstalled',function(){
    localStorage.setItem('pwa_installed','true');
});
