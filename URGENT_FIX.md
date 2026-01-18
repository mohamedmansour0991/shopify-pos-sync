# الحل العاجل - المشكلة والحل

## المشكلة الحالية

1. ❌ `.htaccess` لا يعمل - `mod_rewrite` غير مفعل أو `AllowOverride` معطل
2. ❌ الموقع الرئيسي `/` يعطي 500 error
3. ✅ `php index.php` يعمل ويعيد `{}`
4. ✅ Node.js يعمل على البورت 3000

## الحل السريع

بما أن `.htaccess` لا يعمل، يمكننا استخدام `DirectoryIndex` فقط. لكن المشكلة هي أن `index.php` يعطي 500 error عند استدعائه من Apache.

### الخطوة 1: التحقق من Apache Error Logs

```bash
tail -100 /home/sortat/logs/error_log 2>/dev/null | grep -i "index.php\|500\|fatal" | tail -30
```

ابحث عن:
- `PHP Fatal error`
- `index.php`
- `500`

### الخطوة 2: تفعيل Error Reporting مؤقتاً

```bash
# نسخ index.php إلى index-debug.php
cp index.php index-debug.php

# تعديل index-debug.php - في البداية أضف:
# ini_set('display_errors', 1);
# error_reporting(E_ALL);
```

### الخطوة 3: اختبار index.php مباشرة من Apache

```bash
# افتح في المتصفح
https://theonesystemco.tek-part.com/index.php
```

إذا عمل، المشكلة في `DirectoryIndex`. إذا لم يعمل، المشكلة في `index.php` نفسه.

### الخطوة 4: إذا كان index.php يعمل مباشرة

المشكلة هي أن `DirectoryIndex` لا يعمل. جرب:

```bash
# إنشاء ملف .htaccess بسيط
cat > .htaccess << 'EOF'
DirectoryIndex index.php
EOF

# ثم اختبر
curl -I https://theonesystemco.tek-part.com/
```

### الخطوة 5: إذا استمرت المشكلة

المشكلة قد تكون في `index.php` نفسه. دعني أتحقق من أن `index.php` لا يحتوي على أخطاء PHP.

## الحل البديل: استخدام PHP Router

إذا كان `.htaccess` لا يعمل نهائياً، يمكن استخدام PHP router:

```php
// في index.php - إضافة في البداية
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
if ($requestUri !== '/' && $requestUri !== '/index.php') {
    // This is not the root, proxy to Node.js
    // ... existing proxy code ...
}
```

## الخطوات التالية

1. التحقق من Apache error logs
2. اختبار `index.php` مباشرة
3. إذا عمل، إصلاح `DirectoryIndex`
4. إذا لم يعمل، إصلاح `index.php`
