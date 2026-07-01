// Interactive Onboarding
var onboardingDone = localStorage.getItem('thana_onboarding_v2');

function showOnboarding() {
    if (onboardingDone) return;
    
    var steps = [
        { title: '🍽️ أهلاً بك في Thana', text: 'نظام إدارة المطعم الذكي', icon: '🍽️' },
        { title: '📋 النادل', text: 'سجل الطلبات بسهولة من أي جهاز', icon: '📋' },
        { title: '🍳 المطبخ', text: 'الطلبات تصل لحظياً مع إشعارات', icon: '🍳' },
        { title: '📊 التقارير', text: 'راقب أداء مطعمك بالرسوم البيانية', icon: '📊' }
    ];
    
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column';
    
    var step = 0;
    function showStep() {
        if (step >= steps.length) {
            overlay.remove();
            localStorage.setItem('thana_onboarding_v2', 'true');
            return;
        }
        var s = steps[step];
        overlay.innerHTML = '<div style="text-align:center;color:#fff;max-width:350px"><div style="font-size:64px">'+s.icon+'</div><h2 style="color:#00f0ff;margin:16px 0">'+s.title+'</h2><p style="color:#a8a49e;margin-bottom:24px">'+s.text+'</p><button style="padding:12px 32px;border-radius:20px;background:#00f0ff;color:#000;border:none;font-weight:700;font-size:16px;cursor:pointer;font-family:Cairo,sans-serif" onclick="this.parentElement.parentElement.onclick()">'+ (step === steps.length-1 ? '🚀 ابدأ' : 'التالي ▶') +'</button><div style="margin-top:20px;color:#6b6760">'+ (step+1) +' / '+ steps.length +'</div></div>';
        overlay.onclick = function() { step++; showStep(); };
        step++;
    }
    
    document.body.appendChild(overlay);
    showStep();
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(showOnboarding, 500);
});
