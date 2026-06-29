// ============================================
// Thana Restaurant - Export Engine
// تصدير Excel + JSON + CSV بشكل احترافي
// ============================================

function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        console.warn('لا توجد بيانات للتصدير');
        return;
    }
    
    const headers = Object.keys(data[0]);
    let csv = '\uFEFF' + headers.join(',') + '\n';
    
    data.forEach(row => {
        const values = headers.map(h => {
            let val = row[h] !== undefined ? row[h] : '';
            if (typeof val === 'string') val = '"' + val.replace(/"/g, '""') + '"';
            return val;
        });
        csv += values.join(',') + '\n';
    });
    
    downloadFile(csv, filename + '.csv', 'text/csv;charset=utf-8');
}

function exportToJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, filename + '.json', 'application/json');
}

function exportToExcel(data, filename) {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    
    let html = '<html dir="rtl"><head><meta charset="UTF-8"><style>';
    html += 'table { border-collapse: collapse; width: 100%; }';
    html += 'th { background: #722f37; color: #fff; padding: 8px; border: 1px solid #ddd; font-size: 12px; }';
    html += 'td { padding: 6px 8px; border: 1px solid #ddd; font-size: 11px; }';
    html += 'tr:nth-child(even) { background: #f9f9f9; }';
    html += '</style></head><body><table>';
    
    html += '<thead><tr>';
    headers.forEach(h => html += `<th>${h}</th>`);
    html += '</tr></thead><tbody>';
    
    data.forEach(row => {
        html += '<tr>';
        headers.forEach(h => {
            html += `<td>${row[h] !== undefined ? row[h] : ''}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table></body></html>';
    
    downloadFile(html, filename + '.xls', 'application/vnd.ms-excel');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// تصدير كل بيانات المطعم
function exportAllData() {
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
    
    const date = new Date().toISOString().slice(0,10);
    exportToJSON({ 
        version: '2.1', 
        exportedAt: new Date().toISOString(),
        data: allData 
    }, `thana-full-backup-${date}`);
}

// تصدير الطلبات لـ Excel
function exportOrdersToExcel() {
    const orders = JSON.parse(localStorage.getItem('thana_orders') || '[]');
    const flatOrders = orders.map(o => ({
        'رقم الطلب': o.id,
        'الطاولة': o.table,
        'الأصناف': (o.items || []).map(i => `${i.name}×${i.qty}`).join(' | '),
        'المجموع': o.total,
        'الحالة': o.status,
        'المصدر': o.source,
        'التاريخ': new Date(o.timestamp).toLocaleDateString('ar-SA'),
        'الوقت': new Date(o.timestamp).toLocaleTimeString('ar-SA')
    }));
    exportToExcel(flatOrders, `orders-${new Date().toISOString().slice(0,10)}`);
}

// تصدير المخزون لـ Excel
function exportInventoryToExcel() {
    const inventory = JSON.parse(localStorage.getItem('thana_inventory') || '[]');
    exportToExcel(inventory, `inventory-${new Date().toISOString().slice(0,10)}`);
}

console.log('📤 Export Engine - جاهز');
