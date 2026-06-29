function getUserRole(){
    try{var s=JSON.parse(localStorage.getItem('thana_auth_session')||'null');if(s&&s.role)return s.role}catch(e){}
    return 'admin';
}

function getNavConfig(){
    var role=getUserRole();
    var configs={
        admin:{
            name:'🔑 المدير',
            items:[
                {href:'index.html',icon:'🏠',label:'الرئيسية'},
                {href:'dashboard.html',icon:'📊',label:'لوحة التحكم'},
                {href:'orders.html',icon:'📊',label:'الطلبات'},
                {href:'waiter.html',icon:'📋',label:'النادل'},
                {href:'kitchen.html',icon:'🍳',label:'المطبخ'},
                {href:'tables.html',icon:'🪑',label:'الطاولات'},
                {href:'staff.html',icon:'👥',label:'الموظفين'},
                {href:'menu.html',icon:'🍽️',label:'القائمة'},
                {href:'inventory.html',icon:'📦',label:'المخزون'},
                {href:'reports.html',icon:'📈',label:'التقارير'},
                {href:'close.html',icon:'🔒',label:'الإغلاق'},
                {href:'customers.html',icon:'👤',label:'العملاء'},
                {href:'qr-menu.html?table=1',icon:'📱',label:'QR'},
                {href:'voice.html',icon:'🎤',label:'صوتي'},
                {href:'ai.html',icon:'🧠',label:'ذكاء'},
                {href:'auth.html',icon:'🔐',label:'أمان'},
                {href:'print.html',icon:'🖨️',label:'طباعة'},
                {href:'setup.html',icon:'🏪',label:'الهوية'},
                {href:'settings.html',icon:'⚙️',label:'الإعدادات'},
                {href:'pin-settings.html',icon:'🔢',label:'PIN'},
                {href:'activate.html',icon:'🔑',label:'الترخيص'},
                {href:'backup.html',icon:'💾',label:'نسخ'},
                {href:'help.html',icon:'📖',label:'مساعدة'}
            ]
        },
        waiter:{
            name:'📋 النادل',
            items:[
                {href:'index.html',icon:'🏠',label:'الرئيسية'},
                {href:'waiter.html',icon:'📋',label:'النادل'},
                {href:'tables.html',icon:'🪑',label:'الطاولات'},
                {href:'menu.html',icon:'🍽️',label:'القائمة'},
                {href:'qr-menu.html?table=1',icon:'📱',label:'QR'},
                {href:'voice.html',icon:'🎤',label:'صوتي'}
            ]
        },
        kitchen:{
            name:'🍳 المطبخ',
            items:[
                {href:'index.html',icon:'🏠',label:'الرئيسية'},
                {href:'kitchen.html',icon:'🍳',label:'المطبخ'},
                {href:'inventory.html',icon:'📦',label:'المخزون'},
                {href:'velocity.html',icon:'⚡',label:'السرعة'},
                {href:'waste_report.html',icon:'🗑️',label:'الهدر'}
            ]
        },
        cashier:{
            name:'💰 الكاشير',
            items:[
                {href:'index.html',icon:'🏠',label:'الرئيسية'},
                {href:'orders.html',icon:'📊',label:'الطلبات'},
                {href:'reports.html',icon:'📈',label:'التقارير'},
                {href:'print.html',icon:'🖨️',label:'طباعة'},
                {href:'close.html',icon:'🔒',label:'الإغلاق'},
                {href:'customers.html',icon:'👤',label:'العملاء'}
            ]
        },
        manager:{
            name:'📊 مناوب',
            items:[
                {href:'index.html',icon:'🏠',label:'الرئيسية'},
                {href:'dashboard.html',icon:'📊',label:'لوحة التحكم'},
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

function createNavBar(){
    var currentPage=window.location.pathname.split('/').pop()||'index.html';
    var config=getNavConfig();
    var navHTML='<style>.thana-nav{position:fixed;top:0;left:0;right:0;z-index:9999;background:rgba(10,11,15,0.95);border-bottom:1px solid rgba(255,255,255,0.06);backdrop-filter:blur(20px);padding:6px 10px;display:flex;align-items:center;gap:3px;overflow-x:auto;white-space:nowrap;scrollbar-width:none}.thana-nav::-webkit-scrollbar{display:none}.thana-nav a,.thana-nav span{display:inline-flex;align-items:center;gap:4px;padding:7px 11px;border-radius:10px;color:#a8a49e;text-decoration:none;font-size:12px;font-weight:500;transition:all 0.2s;flex-shrink:0}.thana-nav a:hover{background:rgba(255,255,255,0.06);color:#e8e4dd}.thana-nav a.active{background:rgba(212,168,83,0.12);color:#d4a853;font-weight:600}.thana-nav .brand{font-weight:700;font-size:13px;color:#d4a853;margin-left:8px}.thana-nav .role-badge{font-size:10px;background:rgba(129,140,248,0.15);color:#818cf8;padding:3px 8px;border-radius:20px;margin:0 4px}.thana-nav .sep{width:1px;height:16px;background:rgba(255,255,255,0.06);margin:0 3px}.thana-nav .logout{color:#ef4444!important;font-weight:600}body{padding-top:50px}@media(max-width:600px){.thana-nav{padding:4px 6px}.thana-nav a,.thana-nav span{padding:5px 8px;font-size:10px}body{padding-top:42px}}</style><nav class="thana-nav"><a href="index.html" class="brand">🍽️</a><span class="role-badge">'+config.name+'</span><span class="sep"></span>';
    
    config.items.forEach(function(item){
        var isActive=currentPage===item.href.split('?')[0];
        navHTML+='<a href="'+item.href+'" class="'+(isActive?'active':'')+'">'+item.icon+' '+item.label+'</a>';
    });
    
    navHTML+='<span class="sep"></span><a href="login.html" class="logout" onclick="localStorage.removeItem(\'thana_auth_session\')">🚪</a></nav>';
    document.body.insertAdjacentHTML('afterbegin',navHTML);
}

document.addEventListener('DOMContentLoaded',function(){
    var currentPage=window.location.pathname.split('/').pop()||'index.html';
    var noNav=['login.html','activate.html','qr-menu.html','dev-generate.html','404.html','onboarding.html'];
    if(noNav.indexOf(currentPage)===-1)createNavBar();
});
