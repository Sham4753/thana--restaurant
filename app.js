if(!localStorage.getItem("thana_inventory")){localStorage.setItem("thana_inventory",JSON.stringify([{id:1,name:"دجاج",icon:"🍗",unit:"كغ",qty:25,min:5},{id:2,name:"لحم",icon:"🥩",unit:"كغ",qty:15,min:3},{id:3,name:"بطاطا",icon:"🥔",unit:"كغ",qty:30,min:5},{id:4,name:"خبز",icon:"🫓",unit:"رغيف",qty:100,min:20},{id:5,name:"بيبسي",icon:"🥤",unit:"علبة",qty:50,min:10},{id:6,name:"ثوم",icon:"🧄",unit:"كغ",qty:5,min:1},{id:7,name:"زيت",icon:"🫗",unit:"لتر",qty:20,min:5},{id:8,name:"حمص",icon:"🫘",unit:"كغ",qty:8,min:2}]))}if(!localStorage.getItem("thana_tables")){let t=[];for(let i=1;i<=15;i++)t.push({id:i,status:"free",time:null,orderCount:0});t[0].status="occupied";t[0].time=Date.now();t[2].status="occupied";t[2].time=Date.now();localStorage.setItem("thana_tables",JSON.stringify(t))}
function activateAI(){const a=getAlerts();document.getElementById('aiMessage').textContent=a[0]||'✅ كل شيء تمام'}
function startVoice(){if('webkitSpeechRecognition' in window||'SpeechRecognition' in window){const S=window.SpeechRecognition||window.webkitSpeechRecognition;const r=new S();r.lang='ar-SA';r.onresult=(e)=>{document.getElementById('aiMessage').textContent='🎤 '+e.results[0][0].transcript};r.start();document.getElementById('aiMessage').textContent='🎤 جاري الاستماع...'}}
function getAlerts(){const a=[];const inv=JSON.parse(localStorage.getItem('thana_inventory')||'[]');inv.forEach(i=>{if(i.qty<=i.min)a.push('⚠️ '+i.name+' شبه نافذ')});const orders=JSON.parse(localStorage.getItem('thana_kitchen_orders')||'[]');const late=orders.filter(o=>(!o.status||o.status==='new')&&(Date.now()-o.time)>900000);if(late.length>0)a.push('⏰ '+late.length+' طلبات متأخرة');const tables=JSON.parse(localStorage.getItem('thana_tables')||'[]');const waiting=tables.filter(t=>t.status==='waiting');if(waiting.length>3)a.push('🟡 '+waiting.length+' طاولات حساب');if(a.length===0)a.push('✅ كل شيء تمام');return a}
function renderAlerts(){const a=getAlerts();const c=document.getElementById('alertsContainer');if(c)c.innerHTML=a.map(x=>'<div class="alert-item">'+x+'</div>').join('')}
function updateStats(){
    const tables=JSON.parse(localStorage.getItem('thana_tables')||'[]');document.getElementById('freeTables').textContent=tables.filter(t=>t.status==='free').length;
    const orders=JSON.parse(localStorage.getItem('thana_kitchen_orders')||'[]');
    document.getElementById('activeOrders').textContent=orders.filter(o=>!o.status||o.status==='new'||o.status==='cooking').length;
    const cooking=orders.filter(o=>o.status==='cooking').length;
    document.getElementById('predictedBusy').textContent=cooking>0?'⏰ '+cooking+' قيد التحضير':'⏰ لا توجد ذروة';
    const menu=[{name:'شاورما دجاج',price:3},{name:'شاورما لحم',price:4},{name:'بطاطا مقلية',price:2},{name:'بيبسي',price:1}];let rev=0;orders.filter(o=>o.status==='ready'||o.deducted).forEach(o=>o.items.forEach(i=>{const m=menu.find(m=>m.name===i.name);if(m)rev+=m.price*i.qty}));document.getElementById('todayRevenue').textContent=rev||'0';
    const inv=JSON.parse(localStorage.getItem('thana_inventory')||'[]');const low=inv.filter(i=>i.qty<=i.min).length;
    const ma=document.getElementById('menuActiveOrders');if(ma)ma.textContent=orders.filter(o=>!o.status||o.status==='new').length+' نشطة';
    const mc=document.getElementById('menuCookingOrders');if(mc)mc.textContent=cooking+' قيد التحضير';
    const ml=document.getElementById('menuLowStock');if(ml)ml.textContent=low+' أصناف ناقصة';
}
setInterval(updateStats,5000);setInterval(renderAlerts,5000);updateStats();renderAlerts();activateAI();
