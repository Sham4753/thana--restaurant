#!/bin/bash
# ============================================
# Thana Restaurant v2.1 - فحص جاهزية ميدانية
# ============================================

clear
echo "╔══════════════════════════════════════════╗"
echo "║   Thana Restaurant - فحص جاهزية ميدانية ║"
echo "╚══════════════════════════════════════════╝"
echo ""

REPORT="field_report_$(date +%Y%m%d_%H%M%S).txt"
exec > >(tee -a "$REPORT") 2>&1

PASS=0
FAIL=0

check_pass() { echo "   ✅ $1"; PASS=$((PASS+1)); }
check_fail() { echo "   ❌ $1"; FAIL=$((FAIL+1)); }

# ========== 1. الملفات الأساسية ==========
echo "===== 1. الملفات الأساسية ====="
CRITICAL="login.html index.html kitchen.html waiter.html qr-menu.html orders.html close.html dashboard.html bridge.js nav-component.js auth-v2.js sw.js manifest.json theme-v2.css"
for f in $CRITICAL; do
    if [ -f "$f" ]; then check_pass "$f"; else check_fail "$f مفقود"; fi
done

# ========== 2. صحة JSON ==========
echo ""
echo "===== 2. صحة ملفات JSON ====="
if python3 -c "import json; json.load(open('manifest.json'))" 2>/dev/null; then
    check_pass "manifest.json سليم"
else
    check_fail "manifest.json فيه خطأ"
fi

# ========== 3. روابط CSS/JS ==========
echo ""
echo "===== 3. روابط CSS/JS المكسورة ====="
for page in login.html index.html kitchen.html waiter.html qr-menu.html orders.html; do
    [ ! -f "$page" ] && continue
    # فحص CSS
    grep -oP 'href="[^"]*\.css[^"]*"' "$page" | while read css; do
        cssfile=$(echo "$css" | grep -oP '[a-zA-Z0-9_\-\.]+\.css')
        if [ -f "$cssfile" ]; then check_pass "$page ← $cssfile"; else check_fail "$page ← $cssfile مفقود"; fi
    done
    # فحص JS
    grep -oP 'src="[^"]*\.js[^"]*"' "$page" | while read js; do
        jsfile=$(echo "$js" | grep -oP '[a-zA-Z0-9_\-\.]+\.js')
        [ "$jsfile" = "chart.js" ] && continue
        [ "$jsfile" = "qrcode.min.js" ] && continue
        [ "$jsfile" = "chart.umd.min.js" ] && continue
        if [ -f "$jsfile" ]; then check_pass "$page ← $jsfile"; else check_fail "$page ← $jsfile مفقود"; fi
    done
done

# ========== 4. مفاتيح localStorage ==========
echo ""
echo "===== 4. مفاتيح localStorage ====="
KEYS="thana_orders thana_menu thana_inventory thana_tables thana_staff thana_auth_session thana_license thana_pins thana_archive thana_cash thana_suppliers thana_shop_settings"
for k in $KEYS; do
    if grep -qr "$k" *.html *.js 2>/dev/null; then
        check_pass "$k"
    else
        check_fail "$k غير مستخدم"
    fi
done

# ========== 5. PIN ==========
echo ""
echo "===== 5. رموز PIN ====="
for pin in 2026 1111 2222 3333 4444; do
    if grep -q "$pin" login.html auth-v2.js 2>/dev/null; then
        check_pass "PIN $pin موجود"
    else
        check_fail "PIN $pin مفقود"
    fi
done

# ========== 6. PWA ==========
echo ""
echo "===== 6. Service Worker + PWA ====="
grep -q "CACHE_NAME\|addEventListener.*install\|addEventListener.*fetch" sw.js && check_pass "sw.js كامل" || check_fail "sw.js ناقص"
grep -q '"name".*"Thana' manifest.json && check_pass "manifest.json صحيح" || check_fail "manifest.json ناقص"

# ========== 7. تدفق الطلب ==========
echo ""
echo "===== 7. محاكاة تدفق الطلب ====="
grep -q "localStorage.setItem.*thana_orders" qr-menu.html waiter.html && check_pass "QR والنادل يحفظوا في thana_orders" || check_fail "الحفظ مفقود"
grep -q "localStorage.getItem.*thana_orders" kitchen.html && check_pass "المطبخ يقرأ من thana_orders" || check_fail "المطبخ لا يقرأ"
grep -q "setInterval.*loadOrders\|setInterval.*500" kitchen.html && check_pass "المطبخ تحديث تلقائي" || check_fail "المطبخ بدون تحديث"
grep -q "markPaid\|markDebt\|paymentStatus" orders.html && check_pass "نظام دفع وديون" || check_fail "نظام الدفع ناقص"
grep -q "archive\|closeDay\|أرشفة" close.html && check_pass "الإغلاق اليومي" || check_fail "الإغلاق ناقص"

# ========== 8. الترقيم التسلسلي ==========
echo ""
echo "===== 8. الترقيم التسلسلي ====="
grep -q "orderNumber\|last_order_number" bridge.js qr-menu.html waiter.html orders.html && check_pass "رقم تسلسلي موجود" || check_fail "الترقيم ناقص"

# ========== 9. أمان ==========
echo ""
echo "===== 9. فحص أمان ====="
grep -q "eval(" *.html *.js 2>/dev/null && check_fail "استخدام eval (خطر)" || check_pass "لا eval"
grep -q "AES-GCM\|encrypt\|crypto.subtle" auth.html secure-storage.js 2>/dev/null && check_pass "تشفير AES" || check_fail "تشفير ناقص"

# ========== 10. إحصائيات ==========
echo ""
echo "===== 10. إحصائيات ====="
echo "   📄 HTML: $(ls -1 *.html 2>/dev/null | wc -l)"
echo "   🎨 CSS: $(ls -1 *.css 2>/dev/null | wc -l)"
echo "   🧠 JS: $(ls -1 *.js 2>/dev/null | wc -l)"
echo "   📋 JSON: $(ls -1 *.json 2>/dev/null | wc -l)"
echo "   📦 المجموع: $(ls -1 *.* 2>/dev/null | wc -l)"
echo "   💾 الحجم: $(du -sh . | cut -f1)"

# ========== 11. استجابة HTTP ==========
echo ""
echo "===== 11. اختبار HTTP (محلي) ====="
if command -v python3 &>/dev/null; then
    python3 -m http.server 9876 &
    sleep 2
    for page in login.html index.html kitchen.html waiter.html qr-menu.html orders.html close.html; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:9876/$page | grep -q 200; then
            check_pass "$page ← 200 OK"
        else
            check_fail "$page ← فشل"
        fi
    done
    kill %1 2>/dev/null
else
    echo "   ⚠️ Python غير متاح - تخطي"
fi

# ========== الحكم النهائي ==========
echo ""
echo "╔══════════════════════════════════════════╗"
TOTAL=$((PASS+FAIL))
SCORE=$((PASS*100/TOTAL))
if [ $SCORE -ge 90 ]; then
    echo "║   🟢 جاهز للتشغيل الميداني              ║"
elif [ $SCORE -ge 70 ]; then
    echo "║   🟡 قريب - يحتاج تعديلات               ║"
else
    echo "║   🔴 غير جاهز - تفحص المشاكل             ║"
fi
echo "║   ✅ $PASS / ❌ $FAIL / 📊 $SCORE%              ║"
echo "║   📄 التقرير: $REPORT        ║"
echo "╚══════════════════════════════════════════╝"
