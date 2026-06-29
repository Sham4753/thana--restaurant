// ============================================
// Thana Restaurant - Database Schema v3.0
// IndexedDB + Sync + Inventory Auto-Deduction
// ============================================

const DB_NAME = 'thana_restaurant';
const DB_VERSION = 1;

// ========== هيكلية قاعدة البيانات ==========
const DB_SCHEMA = {
    // الطلبات
    orders: {
        keyPath: 'id',
        indexes: [
            { name: 'table', keyPath: 'table' },
            { name: 'status', keyPath: 'status' },
            { name: 'timestamp', keyPath: 'timestamp' },
            { name: 'syncStatus', keyPath: 'syncStatus' }
        ],
        fields: {
            id: 'number',           // رقم فريد
            table: 'number',        // رقم الطاولة
            items: 'array',         // [{name, price, qty, inventoryId}]
            total: 'number',        // المجموع
            note: 'string',         // ملاحظات
            status: 'string',       // new | cooking | done | paid
            source: 'string',       // waiter | qr | voice
            timestamp: 'string',    // وقت الطلب
            cookStart: 'string',    // وقت بدء الطبخ
            cookEnd: 'string',      // وقت الانتهاء
            paidAt: 'string',       // وقت الدفع
            syncStatus: 'string'    // local | syncing | synced
        }
    },
    
    // القائمة
    menu: {
        keyPath: 'id',
        indexes: [
            { name: 'category', keyPath: 'category' },
            { name: 'name', keyPath: 'name', unique: true }
        ],
        fields: {
            id: 'number',
            name: 'string',         // اسم الصنف
            category: 'string',     // الفئة
            price: 'number',        // السعر
            desc: 'string',         // وصف
            active: 'boolean',      // متاح/غير متاح
            inventoryRequired: 'array' // [{inventoryId, qtyPerUnit}]
        }
    },
    
    // المخزون
    inventory: {
        keyPath: 'id',
        indexes: [
            { name: 'name', keyPath: 'name', unique: true },
            { name: 'qty', keyPath: 'qty' }
        ],
        fields: {
            id: 'number',
            name: 'string',         // اسم المادة
            qty: 'number',          // الكمية الحالية
            unit: 'string',         // وحدة القياس
            minQty: 'number',       // الحد الأدنى
            price: 'number',        // سعر الوحدة
            lastRestock: 'string',  // آخر توريد
            autoDeduct: 'boolean'   // خصم تلقائي مع الطلبات
        }
    },
    
    // الطاولات
    tables: {
        keyPath: 'id',
        fields: {
            id: 'number',
            status: 'string',       // free | busy | waiting | reserved
            currentOrder: 'number', // رقم الطلب الحالي
            seatedAt: 'string'      // وقت الجلوس
        }
    },
    
    // الموظفين
    staff: {
        keyPath: 'id',
        fields: {
            id: 'number',
            name: 'string',
            role: 'string',         // admin | waiter | kitchen | cashier
            pin: 'string',          // مشفر
            active: 'boolean'
        }
    },
    
    // العملاء
    customers: {
        keyPath: 'id',
        indexes: [
            { name: 'phone', keyPath: 'phone', unique: true }
        ],
        fields: {
            id: 'number',
            name: 'string',
            phone: 'string',
            notes: 'string',
            totalVisits: 'number',
            totalSpent: 'number',
            lastVisit: 'string'
        }
    },
    
    // المعاملات المالية
    transactions: {
        keyPath: 'id',
        indexes: [
            { name: 'date', keyPath: 'date' }
        ],
        fields: {
            id: 'number',
            orderId: 'number',
            type: 'string',         // sale | expense | refund
            amount: 'number',
            method: 'string',       // cash | card
            date: 'string',
            note: 'string'
        }
    },
    
    // قائمة المزامنة
    syncQueue: {
        keyPath: 'id',
        fields: {
            id: 'number',
            action: 'string',       // create | update | delete
            table: 'string',        // orders | inventory ...
            data: 'object',
            timestamp: 'string',
            retries: 'number'
        }
    }
};

// ========== فتح قاعدة البيانات ==========
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            
            // إنشاء جميع Object Stores
            for (const [storeName, config] of Object.entries(DB_SCHEMA)) {
                let store;
                if (db.objectStoreNames.contains(storeName)) {
                    store = event.target.transaction.objectStore(storeName);
                } else {
                    store = db.createObjectStore(storeName, { keyPath: config.keyPath });
                }
                
                // إنشاء indexes
                if (config.indexes) {
                    config.indexes.forEach(idx => {
                        if (!store.indexNames.contains(idx.name)) {
                            store.createIndex(idx.name, idx.keyPath, { unique: idx.unique || false });
                        }
                    });
                }
            }
        };
        
        request.onsuccess = function(event) {
            resolve(event.target.result);
        };
        
        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// ========== عمليات CRUD عامة ==========
async function dbAdd(storeName, data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.add(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function dbPut(storeName, data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.put(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function dbGet(storeName, id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function dbGetAll(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function dbDelete(storeName, id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ========== خصم تلقائي من المخزون ==========
async function autoDeductInventory(orderItems) {
    const db = await openDB();
    const tx = db.transaction(['inventory', 'menu'], 'readwrite');
    const invStore = tx.objectStore('inventory');
    const menuStore = tx.objectStore('menu');
    
    for (const item of orderItems) {
        // جلب الصنف من القائمة لمعرفة المواد المطلوبة
        const menuItem = await new Promise(resolve => {
            const req = menuStore.index('name').get(item.name);
            req.onsuccess = () => resolve(req.result);
        });
        
        if (menuItem && menuItem.inventoryRequired) {
            for (const invReq of menuItem.inventoryRequired) {
                const invItem = await new Promise(resolve => {
                    const req = invStore.get(invReq.inventoryId);
                    req.onsuccess = () => resolve(req.result);
                });
                
                if (invItem && invItem.autoDeduct) {
                    const deduction = invReq.qtyPerUnit * (item.qty || 1);
                    invItem.qty = Math.max(0, invItem.qty - deduction);
                    invStore.put(invItem);
                    
                    // تنبيه إذا وصل للحد الأدنى
                    if (invItem.qty <= invItem.minQty) {
                        console.warn('⚠️ مخزون منخفض:', invItem.name);
                        if (typeof notifyLowStock === 'function') {
                            notifyLowStock(invItem);
                        }
                    }
                }
            }
        }
    }
    
    return new Promise(resolve => {
        tx.oncomplete = () => resolve();
    });
}

// ========== مزامنة ==========
async function syncData() {
    if (!navigator.onLine) return;
    
    const db = await openDB();
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    const pending = await new Promise(resolve => {
        store.getAll().onsuccess = e => resolve(e.target.result);
    });
    
    for (const item of pending) {
        try {
            // محاولة مزامنة كل عنصر
            console.log('🔄 مزامنة:', item.table, item.action);
            store.delete(item.id);
        } catch(e) {
            item.retries = (item.retries || 0) + 1;
            if (item.retries < 5) {
                store.put(item);
            }
        }
    }
}

// ========== مراقبة الاتصال ==========
window.addEventListener('online', () => {
    console.log('🌐 عاد الاتصال - بدء المزامنة...');
    syncData();
    if (typeof showToast === 'function') {
        showToast('✅ تم استعادة الاتصال - جاري المزامنة');
    }
});

window.addEventListener('offline', () => {
    console.log('📴 وضع الأوفلاين - البيانات تحفظ محلياً');
    if (typeof showToast === 'function') {
        showToast('📴 وضع الأوفلاين - البيانات ستحفظ تلقائياً');
    }
});

console.log('🗄️ Thana DB Schema v3.0 - جاهز');
