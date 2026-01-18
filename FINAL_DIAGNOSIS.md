# التشخيص النهائي

## الوضع الحالي

1. ✅ `test-proxy-direct.php` يعمل ويعيد HTTP 200
2. ✅ Node.js يعمل على البورت 3000
3. ✅ PM2 يعمل بشكل صحيح
4. ❌ `https://theonesystemco.tek-part.com/` يعطي 500 error

## التشخيص

المشكلة قد تكون في:
1. `.htaccess` لا يستدعي `index.php` بشكل صحيح
2. `index.php` لا يتم استدعاؤه على الإطلاق
3. Apache يعيد 500 error قبل الوصول إلى `index.php`

## الخطوات المطلوبة

### 1. اختبار .htaccess

```bash
# افتح في المتصفح
https://theonesystemco.tek-part.com/test-htaccess.php
```

- إذا رأيت محتوى الملف: `.htaccess` لا يعمل
- إذا رأيت 404 أو redirect: `.htaccess` يعمل

### 2. التحقق من Apache Error Logs

```bash
tail -100 /home/sortat/logs/error_log 2>/dev/null | grep -i "shopify-pos\|index.php\|500" | tail -30
```

ابحث عن:
- `PHP Fatal error`
- `mod_rewrite`
- `index.php`
- `500`

### 3. اختبار index.php مباشرة

```bash
# من SSH
cd ~/public_html/theonesystemco.tek-part.com
php index.php
```

إذا كان هناك خطأ PHP، ستراه هنا.

### 4. التحقق من صلاحيات الملفات

```bash
ls -la index.php .htaccess
```

يجب أن تكون:
- `index.php`: `-rw-r--r--` أو `-rwxr-xr-x`
- `.htaccess`: `-rw-r--r--`

### 5. اختبار Apache mod_rewrite

```bash
# إنشاء ملف test-rewrite.php
cat > test-rewrite.php << 'EOF'
<?php
header('Content-Type: text/plain');
if (function_exists('apache_get_modules')) {
    $modules = apache_get_modules();
    echo "mod_rewrite enabled: " . (in_array('mod_rewrite', $modules) ? 'Yes' : 'No') . "\n";
} else {
    echo "Cannot check Apache modules (not available in CGI mode)\n";
}
?>
EOF

# ثم افتح في المتصفح
https://theonesystemco.tek-part.com/test-rewrite.php
```

## الحلول المحتملة

### الحل 1: إصلاح .htaccess

إذا كان `.htaccess` لا يعمل، جرب:

```apache
# في .htaccess
DirectoryIndex index.php
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [L,QSA]
```

### الحل 2: استخدام DirectoryIndex

إذا كان `.htaccess` لا يعمل، جرب إضافة:

```apache
DirectoryIndex index.php index.html
```

### الحل 3: التحقق من Apache Configuration

قد يكون Apache معطل `mod_rewrite` أو `.htaccess` في cPanel.

## الخطوات التالية

بعد تحديد المشكلة:
1. إصلاح `.htaccess` أو Apache configuration
2. اختبار الموقع مرة أخرى
3. إذا عمل، تحديث Shopify Partners Dashboard
