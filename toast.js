// Thana Toast Notifications
function toast(msg, type='success') {
    var t = document.createElement('div');
    t.textContent = msg;
    var bg = type==='success'?'#10b981':type==='error'?'#ef4444':type==='warn'?'#f59e0b':'#3b82f6';
    t.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:'+bg+';color:#fff;padding:12px 24px;border-radius:30px;font-weight:700;font-family:Cairo,sans-serif;z-index:99999;box-shadow:0 8px 24px rgba(0,0,0,0.4);animation:slideIn 0.4s ease,slideOut 0.4s ease 2.5s forwards';
    document.body.appendChild(t);
    setTimeout(function(){t.remove()},3000);
}
var toastStyle = document.createElement('style');
toastStyle.textContent = '@keyframes slideIn{from{opacity:0;transform:translateX(-50%) translateY(-80px)}}@keyframes slideOut{to{opacity:0;transform:translateX(-50%) translateY(-80px)}}';
document.head.appendChild(toastStyle);
