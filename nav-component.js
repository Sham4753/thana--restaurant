function getUserRole(){
    try{var s=JSON.parse(localStorage.getItem('thana_auth_session')||'null');if(s&&s.role)return s.role}catch(e){}
    return 'admin';
}

function getNavConfig(){
    var role=getUserRole();
    var configs={
        admin:{
            items:[
                {href:'index.html',icon:'🏠',label:'الرئيسية'},
                {href:'dashboard.html',icon:'📊',label:'التحكم'},
                {href:'orders.html',icon:'📊',label:'الطلبات'},
                {href:'waiter.html',icon:'📋',label:'النادل'},
                {href:'kitchen.html',icon:'🍳',label:'المطبخ'},
                {href:'tables.html',icon:'🪑',label:'الطاولات'},
                {href:'staff.html',icon:'👥',label:'الموظفين'},
                {href:'menu.html',icon:'🍽️',label:'القائمة'},
                {href:'inventory.html',icon:'📦',label:'المخزون'},
                {href:'reports.html',icon:'📈',label:'التقارير'},
                {href:'customers.html',icon:'👤',label:'العملاء'},
                {href:'qr-menu.html?table=1',icon:'📱',label:'QR'},
                {href:'voice.html',icon:'🎤',label:'صوتي'},
                {href:'ai.html',icon:'🧠',label:'ذكاء'},
                {href:'setup.html',icon:'🏪',label:'الهوية'},
                {href:'settings.html',icon:'⚙️',label:'إعدادات'},
                {href:'pin-settings.html',icon:'🔢',label:'PIN'},
                {href:'backup.html',icon:'💾',label:'نسخ'},
                {href:'help.html',icon:'📖',label:'مساعدة'}
            ]
        },
        waiter:{
            items:[
                {href:'waiter.html',icon:'📋',label:'النادل'},
                {href:'tables.html',icon:'🪑',label:'الطاولات'},
                {href:'menu.html',icon:'🍽️',label:'القائمة'},
                {href:'qr-menu.html?table=1',icon:'📱',label:'QR'},
                {href:'voice.html',icon:'🎤',label:'صوتي'}
            ]
        },
        kitchen:{
            items:[
                {href:'kitchen.html',icon:'🍳',label:'المطبخ'},
                {href:'inventory.html',icon:'📦',label:'المخزون'},
                {href:'velocity.html',icon:'⚡',label:'السرعة'},
                {href:'waste_report.html',icon:'🗑️',label:'الهدر'}
            ]
        },
        cashier:{
            items:[
                {href:'orders.html',icon:'📊',label:'الطلبات'},
                {href:'reports.html',icon:'📈',label:'التقارير'},
                {href:'print.html',icon:'🖨️',label:'طباعة'},
                {href:'customers.html',icon:'👤',label:'العملاء'}
            ]
        },
        manager:{
            items:[
                {href:'index.html',icon:'🏠',label:'الرئيسية'},
                {href:'dashboard.html',icon:'📊',label:'التحكم'},
                {href:'reports.html',icon:'📈',label:'التقارير'},
                {href:'staff.html',icon:'👥',label:'الموظفين'},
                {href:'menu.html',icon:'🍽️',label:'القائمة'},
                {href:'inventory.html',icon:'📦',label:'المخزون'},
                {href:'ai.html',icon:'🧠',label:'ذكاء'}
            ]
        }
    };
    return configs[role]||configs['admin'];
}

function goTo(url){window.location.href=url}

function createNavBar(){
    var currentPage=window.location.pathname.split('/').pop()||'index.html';
    var config=getNavConfig();
    var navHTML='<style>.thana-nav{position:fixed;top:0;left:0;right:0;z-index:9999;background:rgba(10,11,15,0.97);border-bottom:1px solid rgba(255,255,255,0.06);padding:6px 10px;display:flex;align-items:center;gap:3px;overflow-x:auto;white-space:nowrap;scrollbar-width:none}.thana-nav::-webkit-scrollbar{display:none}.thana-nav span.nav-item{display:inline-flex;align-items:center;gap:4px;padding:7px 11px;border-radius:10px;color:#a8a49e;font-size:12px;font-weight:500;cursor:pointer;flex-shrink:0;transition:all 0.2s}.thana-nav span.nav-item:hover{background:rgba(255,255,255,0.06);color:#e8e4dd}.thana-nav span.nav-item.active{background:rgba(212,168,83,0.12);color:#d4a853;font-weight:600}.thana-nav .brand{font-weight:700;font-size:13px;color:#d4a853;margin-left:8px}.thana-nav .sep{width:1px;height:16px;background:rgba(255,255,255,0.06);margin:0 3px}.thana-nav .logout{color:#ef4444;font-weight:600;cursor:pointer}body{padding-top:50px}@media(max-width:600px){.thana-nav{padding:4px 6px}.thana-nav span.nav-item{padding:5px 8px;font-size:10px}body{padding-top:42px}}</style><nav class="thana-nav"><span class="brand nav-item" onclick="goTo(\"'+ (config.items[0].href) +'\")">🍽️</span><span class="sep"></span>';
    
    config.items.forEach(function(item){
        var isActive=currentPage===item.href.split('?')[0];
        navHTML+='<span class="nav-item'+(isActive?' active':'')+'" onclick="goTo(\''+item.href+'\')">'+item.icon+' '+item.label+'</span>';
    });
    
    navHTML+='<span class="sep"></span><span class="nav-item logout" onclick="localStorage.clear();location.href=onclick="localStorage.clear();window.location.href=\"login.html\""quot;login.htmlonclick="localStorage.clear();window.location.href=\"login.html\""quot;">🚪</span></nav>';
    document.body.insertAdjacentHTML('afterbegin',navHTML);
}

document.addEventListener('DOMContentLoaded',function(){
    var currentPage=window.location.pathname.split('/').pop()||'index.html';
    var noNav=['login.html','activate.html','qr-menu.html','dev-generate.html','404.html','onboarding.html'];
    if(noNav.indexOf(currentPage)===-1)createNavBar();
});
