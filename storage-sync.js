// ============================================
// Thana Restaurant - Storage Sync
// مزامنة IndexedDB ↔ localStorage تلقائياً
// ============================================

// ترحيل البيانات من localStorage إلى IndexedDB
async function migrateToIndexedDB() {
    const lsKeys = [
        'thana_orders', 'thana_menu', 'thana_inventory',
        'thana_tables', 'thana_staff', 'thana_customers',
        'thana_waste', 'thana_payments', 'thana_archive'
    ];
    
    for (const key of lsKeys) {
        const data = JSON.parse(localStorage.getItem(key) || 'null');
        if (data && Array.isArray(data) && data.length > 0) {
            const storeName = key.replace('thana_', '');
            if (DB_SCHEMA[storeName]) {
                for (const item of data) {
                    try {
                        await dbPut(storeName, item);
                    } catch(e) {
                        // العنصر موجود مسبقاً
                    }
                }
            }
        }
    }
    
    localStorage.setItem('thana_migrated_to_idb', 'true');
    console.log('✅ تم ترحيل البيانات إلى IndexedDB');
}

// فحص وتشغيل الترحيل
if (!localStorage.getItem('thana_migrated_to_idb')) {
    migrateToIndexedDB();
}

// ========== واجهة موحدة للقراءة/كتابة ==========
// تلقائياً يستخدم IndexedDB مع fallback لـ localStorage
const Storage = {
    async get(key) {
        const storeName = key.replace('thana_', '');
        if (DB_SCHEMA[storeName]) {
            try {
                return await dbGetAll(storeName);
            } catch(e) {
                // fallback
                return JSON.parse(localStorage.getItem(key) || '[]');
            }
        }
        return JSON.parse(localStorage.getItem(key) || '[]');
    },
    
    async set(key, data) {
        localStorage.setItem(key, JSON.stringify(data)); // سريع
        // المزامنة مع IndexedDB في الخلفية
        const storeName = key.replace('thana_', '');
        if (DB_SCHEMA[storeName] && Array.isArray(data)) {
            for (const item of data) {
                try { await dbPut(storeName, item); } catch(e) {}
            }
        }
    }
};

console.log('🔄 Storage Sync - جاهز');
