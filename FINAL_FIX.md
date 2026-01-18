# الحل النهائي لمشكلة 500 Error

## المشكلة
- الصفحة الرئيسية تعطي 500 Internal Server Error
- الخطأ في PM2: `Could not parse content as FormData`
- `login()` يحاول قراءة FormData حتى في طلبات GET

## الحل

### 1. رفع الملفات المحدثة

```bash
cd ~/public_html/theonesystemco.tek-part.com
git pull
# أو انسخ index.php يدوياً
```

### 2. اختبار الموقع

```bash
curl -I https://theonesystemco.tek-part.com/
```

يجب أن يعيد HTTP 200 أو 302 بدلاً من 500.

### 3. إذا استمرت المشكلة

#### أ) اختبار PHP مباشرة

```bash
# افتح في المتصفح
https://theonesystemco.tek-part.com/test-simple.php
```

يجب أن ترى معلومات PHP.

#### ب) التحقق من PM2

```bash
pm2 logs shopify-pos-sync --lines 20 | grep -i error
```

#### ج) اختبار الاتصال المباشر

```bash
curl -v http://127.0.0.1:3000/ 2>&1 | head -30
```

يجب أن يعيد HTTP 200.

### 4. التحقق من Apache Error Logs

```bash
tail -50 /home/sortat/logs/error_log 2>/dev/null | grep -i "shopify-pos\|index.php" | tail -20
```

## ملاحظات

- تم تحديث `index.php` لعدم تمرير Content-Type في طلبات GET
- تم تحديث `index.php` لاستخدام `$_SERVER` بدلاً من `getallheaders()`
- تم تحديث `index.php` لمعالجة chunked encoding بشكل صحيح
