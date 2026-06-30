if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', function(e) {
        if (e.data && e.data.type === 'UPDATE_AVAILABLE') {
            var banner = document.createElement('div');
            banner.style = 'position:fixed;top:0;left:0;right:0;background:#d4a853;color:#000;padding:12px;text-align:center;font-weight:700;z-index:99999;cursor:pointer;font-family:Cairo,sans-serif';
            banner.textContent = '🔄 تحديث جديد متوفر - اضغط للتحديث';
            banner.onclick = function() {
                navigator.serviceWorker.getRegistration().then(function(reg) {
                    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                });
                location.reload();
            };
            document.body.prepend(banner);
        }
    });
}
