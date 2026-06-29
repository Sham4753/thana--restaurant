// صوت تنبيه بسيط للمطبخ
function playBeep(){
    try{
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        osc.type = 'square';
        gain.gain.value = 0.1;
        osc.start();
        setTimeout(function(){ osc.stop(); }, 150);
    }catch(e){}
}
