const defaults=[{id:1,name:'دجاج',icon:'🍗',unit:'كغ',qty:25,min:5},{id:2,name:'لحم',icon:'🥩',unit:'كغ',qty:15,min:3},{id:3,name:'بطاطا',icon:'🥔',unit:'كغ',qty:30,min:5},{id:4,name:'خبز',icon:'🫓',unit:'رغيف',qty:100,min:20},{id:5,name:'بيبسي',icon:'🥤',unit:'علبة',qty:50,min:10},{id:6,name:'ثوم',icon:'🧄',unit:'كغ',qty:5,min:1},{id:7,name:'زيت',icon:'🫗',unit:'لتر',qty:20,min:5},{id:8,name:'حمص',icon:'🫘',unit:'كغ',qty:8,min:2}];
let inventory=JSON.parse(localStorage.getItem('thana_inventory')||'null');
if(!inventory||inventory.length===0){inventory=defaults;save()}
function save(){localStorage.setItem('thana_inventory',JSON.stringify(inventory))}
function render(){
    const alerts=inventory.filter(i=>i.qty<=i.min);
    const badge=document.getElementById('alertCount');if(badge)badge.textContent=alerts.length;
    const grid=document.getElementById('inventoryGrid');
    if(!grid)return;
    grid.innerHTML=inventory.map(i=>{
        const pct=Math.min(100,(i.qty/(i.min*3))*100);
        const isLow=i.qty<=i.min;
        const barColor=isLow?'var(--accent)':'var(--accent2)';
        return`<div class="inv-card ${isLow?'low':''}"><div class="inv-icon">${i.icon}</div><div class="inv-info"><div class="inv-name">${i.name}</div><div class="inv-detail">الحد الأدنى: ${i.min} ${i.unit}</div><div class="inv-bar"><div class="inv-bar-fill" style="width:${pct}%;background:${barColor}"></div></div></div><div class="inv-qty ${isLow?'low':''}">${i.qty}<br><small>${i.unit}</small></div></div>`
    }).join('');
    const sel=document.getElementById('itemSelect');if(sel)sel.innerHTML=inventory.map(i=>`<option value="${i.id}">${i.name}</option>`).join('');
}
function toggleForm(){const f=document.getElementById('addForm');if(f)f.style.display=f.style.display==='none'?'flex':'none'}
function addStock(){const id=parseInt(document.getElementById('itemSelect').value);const qty=parseInt(document.getElementById('addQty').value);const inv=inventory.find(i=>i.id===id);if(inv&&qty>0){inv.qty+=qty;save();render()}document.getElementById('addQty').value=1}
render();
