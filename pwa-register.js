if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/thana--restaurant/sw.js')
      .then(reg => console.log('✅ SW مسجل:', reg.scope))
      .catch(err => console.log('❌ فشل التسجيل:', err));
  });
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById('installBtn');
  if (installBtn) {
    installBtn.style.display = 'block';
    installBtn.addEventListener('click', async () => {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('📱 المستخدم:', outcome);
      deferredPrompt = null;
    });
  }
});

window.addEventListener('appinstalled', () => {
  console.log('🎉 تم تثبيت التطبيق!');
  localStorage.setItem('pwa_installed', 'true');
});
