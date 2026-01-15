# إصلاح خطأ 500 Internal Server Error

## المشكلة
الصفحة الرئيسية `https://shopify-pos.tek-part.com/` تعطي 500 error، بينما:
- ✅ `test-index.php` يعمل بشكل صحيح
- ✅ Node.js يعمل على البورت 3000
- ✅ PM2 يعمل بشكل صحيح

## الحل

### 1. تحديث الملفات

تم تحديث `index.php` لمعالجة `Transfer-Encoding: chunked` بشكل صحيح.

### 2. رفع الملفات المحدثة

```bash
cd ~/public_html/shopify-pos.tek-part.com
git pull
# أو انسخ index.php يدوياً
```

### 3. اختبار مباشر

```bash
# اختبار من SSH
curl -v https://shopify-pos.tek-part.com/ 2>&1 | head -50
```

### 4. إذا استمرت المشكلة

#### أ) التحقق من Apache Error Logs

```bash
# جرب هذه المسارات
tail -50 /home/sortat/logs/error_log 2>/dev/null
tail -50 /var/log/apache2/error_log 2>/dev/null
tail -50 /usr/local/apache/logs/error_log 2>/dev/null
tail -50 /var/log/httpd/error_log 2>/dev/null
```

ابحث عن أخطاء متعلقة بـ:
- `index.php`
- `mod_rewrite`
- `PHP Fatal error`
- `mod_proxy`

#### ب) اختبار PHP مباشرة

```bash
cd ~/public_html/shopify-pos.tek-part.com
php -r "echo 'PHP Version: ' . phpversion() . PHP_EOL;"
php -r "var_dump(function_exists('curl_init'));"
php -r "var_dump(function_exists('getallheaders'));"
```

#### ج) اختبار index.php مباشرة

```bash
# إنشاء ملف test-direct.php
cat > test-direct.php << 'EOF'
<?php
require 'index.php';
?>
EOF

# ثم من المتصفح
https://shopify-pos.tek-part.com/test-direct.php
```

#### د) التحقق من .htaccess

```bash
# تعطيل .htaccess مؤقتاً
mv .htaccess .htaccess.bak

# ثم جرب
curl -I https://shopify-pos.tek-part.com/

# إذا عمل، المشكلة في .htaccess
# إذا لم يعمل، المشكلة في index.php
```

### 5. حل بديل: استخدام mod_proxy مباشرة

إذا استمرت المشكلة، يمكنك محاولة استخدام `mod_proxy` مباشرة في `.htaccess`:

```apache
# في .htaccess
RewriteEngine On

# Serve static files
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^(.*)$ - [L]

# Proxy to Node.js (requires mod_proxy)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
```

**ملاحظة**: يتطلب تفعيل `mod_proxy` و `mod_proxy_http` في Apache.

## الخطوات التالية

بعد إصلاح 500 error:

1. ✅ تحديث Shopify Partners Dashboard
2. ✅ التحقق من HOST في .env
3. ✅ اختبار التطبيق من Shopify Admin
