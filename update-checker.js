// Thana Restaurant – Update checker (PWA)
(async () => {
  try {
    const res = await fetch('/thana--restaurant/version.json?t=' + Date.now());
    const remote = await res.json();
    const localVer = localStorage.getItem('thana_version');
    if (localVer && remote.version !== localVer) {
      const b = document.createElement('div');
      b.className = 'update-banner';
      b.textContent = '🔄 تحديث جديد متوفر – اضغط للتحديث';
      b.onclick = () => { localStorage.setItem('thana_version', remote.version); location.reload(); };
      Object.assign(b.style, {
        position:'fixed',top:0,left:0,right:0,background:'#d4a853',color:'#000',
        padding:'10px',textAlign:'center',fontWeight:'bold',zIndex:99999,cursor:'pointer'
      });
      document.body.prepend(b);
    }
    if (!localVer) localStorage.setItem('thana_version', remote.version);
  } catch (e) { /* offline */ }
})();
