// Thana Restaurant – Theme toggle
(() => {
  const theme = localStorage.getItem('thana_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.createElement('button');
  btn.textContent = theme === 'dark' ? '☀️' : theme === 'light' ? '🌙' : '🔆';
  Object.assign(btn.style, {
    position:'fixed',bottom:'16px',right:'16px',width:'36px',height:'36px',
    borderRadius:'50%',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',
    color:'#fff',fontSize:'16px',cursor:'pointer',zIndex:'999'
  });
  btn.onclick = () => {
    const t = localStorage.getItem('thana_theme') || 'dark';
    const next = t === 'dark' ? 'light' : t === 'light' ? 'high-contrast' : 'dark';
    localStorage.setItem('thana_theme', next);
    document.documentElement.setAttribute('data-theme', next);
    btn.textContent = next === 'dark' ? '☀️' : next === 'light' ? '🌙' : '🔆';
  };
  document.body.appendChild(btn);
})();
