// ============================================
// Thana Restaurant - Checksum Verification
// التحقق من سلامة ملفات النسخ الاحتياطي
// ============================================

// توليد checksum بسيط (SHA-256 متصفح)
async function generateChecksum(data) {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    const encoder = new TextEncoder();
    const encoded = encoder.encode(str);
    
    try {
        // استخدام SubtleCrypto إذا متاح
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch(e) {
        // Fallback: djb2 hash
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }
}

// تصدير مع checksum
async function exportWithChecksum() {
    const allData = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('thana_')) {
            try {
                allData[key] = JSON.parse(localStorage.getItem(key));
            } catch(e) {
                allData[key] = localStorage.getItem(key);
            }
        }
    }
    
    const backup = {
        version: '2.1',
        exportedAt: new Date().toISOString(),
        restaurant: localStorage.getItem('thana_restaurant_name') || 'Thana Restaurant',
        totalKeys: Object.keys(allData).length,
        data: allData
    };
    
    // إضافة checksum
    backup.checksum = await generateChecksum(allData);
    
    return backup;
}

// استيراد مع فحص checksum
async function importWithChecksum(fileContent) {
    try {
        const imported = typeof fileContent === 'string' ? 
            JSON.parse(fileContent) : fileContent;
        
        // فحص وجود checksum
        if (!imported.checksum) {
            return { 
                valid: false, 
                error: '⚠️ الملف لا يحتوي على checksum - قد يكون تالفاً' 
            };
        }
        
        // فحص checksum
        const calculatedChecksum = await generateChecksum(imported.data);
        if (calculatedChecksum !== imported.checksum) {
            return { 
                valid: false, 
                error: '❌ فشل التحقق - الملف تالف أو تم تعديله' 
            };
        }
        
        return { 
            valid: true, 
            data: imported,
            checksum: calculatedChecksum
        };
        
    } catch(e) {
        return { 
            valid: false, 
            error: '❌ الملف غير صالح - ' + e.message 
        };
    }
}

// فحص دوري لسلامة البيانات
async function verifyDataIntegrity() {
    const results = {};
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key.startsWith('thana_')) continue;
        
        try {
            const value = localStorage.getItem(key);
            JSON.parse(value); // فحص إذا JSON صالح
            results[key] = '✅';
        } catch(e) {
            results[key] = '❌ تالف';
        }
    }
    
    return results;
}

// تصدير للـ backup.html
if (typeof window !== 'undefined') {
    window.ThanaChecksum = {
        generate: generateChecksum,
        export: exportWithChecksum,
        import: importWithChecksum,
        verify: verifyDataIntegrity
    };
}

console.log('🔐 Checksum System - جاهز');
