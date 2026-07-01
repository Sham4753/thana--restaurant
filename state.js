// Thana State Manager - Single Source of Truth
var State = {
    data: {},
    
    init: function() {
        var keys = ['orders','menu','inventory','tables','staff','customers','archive','cash','suppliers'];
        var self = this;
        keys.forEach(function(k) {
            var key = 'thana_' + k;
            try {
                self.data[k] = JSON.parse(localStorage.getItem(key) || '[]');
            } catch(e) {
                self.data[k] = [];
            }
        });
    },
    
    get: function(key) {
        return this.data[key] || [];
    },
    
    set: function(key, value) {
        this.data[key] = value;
        try {
            localStorage.setItem('thana_' + key, JSON.stringify(value));
        } catch(e) {}
        this.notify(key, value);
    },
    
    update: function(key, updater) {
        var current = this.get(key);
        var updated = updater(current);
        this.set(key, updated);
    },
    
    listeners: {},
    on: function(key, callback) {
        if (!this.listeners[key]) this.listeners[key] = [];
        this.listeners[key].push(callback);
    },
    
    notify: function(key, value) {
        (this.listeners[key] || []).forEach(function(cb) { cb(value); });
    }
};

State.init();
console.log('📦 State Manager جاهز');
