// ============================================
// Thana Restaurant - Sync Engine v3.0
// مزامنة ذكية · Atomicity · Conflict Resolution
// ============================================

const SYNC_VERSION = '3.0';

// ========== حالات الطلب ==========
const ORDER_STATUS = {
    DRAFT: 'draft',           // مسودة - لم يكتمل
    PENDING: 'pending',       // قيد الانتظار
    CONFIRMED: 'confirmed',   // مؤكد - دخل المطبخ
    COOKING: 'cooking',       // جاري الطبخ
    READY: 'ready',           // جاهز للتقديم
    SERVED: 'served',         // تم التقديم
    PAID: 'paid',             // تم الدفع
    CANCELLED: 'cancelled',   // ملغي
    SYNCED: 'synced'          // تمت مزامنته
};

// ========== الكشف عن الاتصال ==========
let isOnline = navigator.onLine;
let syncInterval = null;

window.addEventListener('online', () => {
    isOnline = true;
    console.log('🌐 اتصال مستعاد - بدء المزامنة...');
    if (typeof showToast === 'function') {
        showToast('🌐 تم استعادة الاتصال - جاري مزامنة البيانات...');
    }
    processSyncQueue();
});

window.addEventListener('offline', () => {
    isOnline = false;
    console.log('📴 وضع الأوفلاين مفعل');
    if (typeof showToast === 'function') {
        showToast('📴 وضع الأوفلاين - البيانات تحفظ محلياً');
    }
});

// ========== إضافة للمزامنة مع Atomicity ==========
async function addToSyncQueueWithAtomicity(storeName, data, action = 'create') {
    const db = await openDB();
    
    // استخدام Transaction واحدة للكل
    const tx = db.transaction([storeName, 'syncQueue'], 'readwrite');
    const mainStore = tx.objectStore(storeName);
    const syncStore = tx.objectStore('syncQueue');
    
    return new Promise((resolve, reject) => {
        try {
            // 1. حفظ البيانات في المخزن الرئيسي
            const mainRequest = mainStore.put(data);
            
            // 2. إضافة للمزامنة
            const syncItem = {
                id: Date.now(),
                action: action,
                table: storeName,
                data: data,
                timestamp: new Date().toISOString(),
                retries: 0,
                status: 'pending'
            };
            const syncRequest = syncStore.add(syncItem);
            
            // 3. الانتظار حتى تنجح العمليتان
            let mainDone = false, syncDone = false;
            
            mainRequest.onsuccess = () => {
                mainDone = true;
                if (syncDone) resolve(data);
            };
            mainRequest.onerror = () => {
                tx.abort();
                reject(new Error('فشل حفظ البيانات'));
            };
            
            syncRequest.onsuccess = () => {
                syncDone = true;
                if (mainDone) resolve(data);
            };
            syncRequest.onerror = () => {
                tx.abort();
                reject(new Error('فشل إضافة للمزامنة'));
            };
            
        } catch(e) {
            tx.abort();
            reject(e);
        }
    });
}

// ========== خصم مخزون Atomic ==========
async function atomicInventoryDeduct(orderItems) {
    const db = await openDB();
    const tx = db.transaction(['inventory', 'menu', 'orders'], 'readwrite');
    const invStore = tx.objectStore('inventory');
    const menuStore = tx.objectStore('menu');
    
    const deductions = []; // تتبع الخصومات للتراجع إذا لزم
    
    try {
        for (const item of orderItems) {
            // جلب الصنف من القائمة
            const menuItem = await new Promise((resolve, reject) => {
                const req = menuStore.index('name').get(item.name);
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });
            
            if (menuItem && menuItem.inventoryRequired) {
                for (const invReq of menuItem.inventoryRequired) {
                    const invItem = await new Promise((resolve, reject) => {
                        const req = invStore.get(invReq.inventoryId);
                        req.onsuccess = () => resolve(req.result);
                        req.onerror = () => reject(req.error);
                    });
                    
                    if (!invItem) {
                        throw new Error(`المادة ${invReq.inventoryId} غير موجودة في المخزون`);
                    }
                    
                    const deduction = invReq.qtyPerUnit * (item.qty || 1);
                    
                    if (invItem.qty < deduction && invItem.autoDeduct) {
                        throw new Error(`⚠️ المخزون غير كافٍ: ${invItem.name} (مطلوب ${deduction}، متوفر ${invItem.qty})`);
                    }
                    
                    if (invItem.autoDeduct) {
                        // تسجيل الخصم
                        deductions.push({
                            id: invItem.id,
                            name: invItem.name,
                            before: invItem.qty,
                            deduction: deduction,
                            after: Math.max(0, invItem.qty - deduction)
                        });
                        
                        invItem.qty = Math.max(0, invItem.qty - deduction);
                        invStore.put(invItem);
                    }
                }
            }
        }
        
        // كل شيء نجح
        return new Promise((resolve) => {
            tx.oncomplete = () => resolve({
                success: true,
                deductions: deductions
            });
            tx.onerror = () => {
                throw new Error('فشلت عملية الخصم - تم التراجع');
            };
        });
        
    } catch(e) {
        tx.abort();
        throw e;
    }
}

// ========== معالجة طابور المزامنة ==========
async function processSyncQueue() {
    if (!isOnline) return;
    
    const db = await openDB();
    const tx = db.transaction(['syncQueue', 'inventory'], 'readwrite');
    const syncStore = tx.objectStore('syncQueue');
    
    const pendingItems = await new Promise(resolve => {
        syncStore.getAll().onsuccess = e => resolve(e.target.result);
    });
    
    // ترتيب حسب الطابع الزمني
    pendingItems.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    const results = {
        synced: 0,
        failed: 0,
        conflicts: 0
    };
    
    for (const item of pendingItems) {
        try {
            // محاكاة إرسال للسيرفر (في الواقع: حفظ محلي + تنبيه)
            console.log(`🔄 مزامنة: ${item.table} #${item.id} - ${item.action}`);
            
            // التحقق من التعارضات
            const conflict = await checkConflict(item);
            if (conflict) {
                results.conflicts++;
                await resolveConflict(item, conflict);
            }
            
            // نجحت المزامنة - حذف من الطابور
            syncStore.delete(item.id);
            results.synced++;
            
        } catch(e) {
            results.failed++;
            item.retries = (item.retries || 0) + 1;
            item.lastError = e.message;
            
            if (item.retries < 5) {
                syncStore.put(item); // إعادة المحاولة لاحقاً
            } else {
                syncStore.delete(item); // فشل نهائي - تنبيه للمدير
                console.error('❌ فشل نهائي في المزامنة:', item);
            }
        }
    }
    
    console.log(`✅ مزامنة: ${results.synced} نجح | ${results.failed} فشل | ${results.conflicts} تعارض`);
    
    // تحديث آخر مزامنة
    localStorage.setItem('thana_last_sync', new Date().toISOString());
    
    return results;
}

// ========== كشف التعارضات ==========
async function checkConflict(syncItem) {
    const db = await openDB();
    const store = db.transaction(syncItem.table, 'readonly').objectStore(syncItem.table);
    
    const localItem = await new Promise(resolve => {
        store.get(syncItem.data.id).onsuccess = e => resolve(e.target.result);
    });
    
    if (!localItem) return null;
    
    // إذا تم تعديل العنصر محلياً بعد آخر مزامنة
    if (localItem.updatedAt && syncItem.timestamp && 
        new Date(localItem.updatedAt) > new Date(syncItem.timestamp)) {
        return {
            type: 'local_newer',
            localItem: localItem,
            syncItem: syncItem
        };
    }
    
    return null;
}

// ========== حل التعارضات ==========
async function resolveConflict(syncItem, conflict) {
    // استراتيجية: آخر تحديث يفوز (Last Write Wins)
    if (conflict.type === 'local_newer') {
        // الاحتفاظ بالنسخة المحلية الأحدث
        console.log('⚡ تعارض: النسخة المحلية أحدث - تم الاحتفاظ بها');
        return conflict.localItem;
    }
    
    return syncItem.data;
}

// ========== تشغيل دوري للمزامنة ==========
function startSyncEngine() {
    // مزامنة أولية
    if (isOnline) {
        processSyncQueue();
    }
    
    // مزامنة كل 30 ثانية إذا متصل
    syncInterval = setInterval(() => {
        if (isOnline) {
            processSyncQueue();
        }
    }, 30000);
}

// ========== حالة النظام ==========
function getSystemStatus() {
    return {
        online: isOnline,
        lastSync: localStorage.getItem('thana_last_sync'),
        pendingSync: 0, // سيتم تحديثه
        storageMode: isOnline ? 'online' : 'offline',
        version: SYNC_VERSION
    };
}

// بدء التشغيل
startSyncEngine();

console.log('🔄 Thana Sync Engine v' + SYNC_VERSION + ' - جاهز');
