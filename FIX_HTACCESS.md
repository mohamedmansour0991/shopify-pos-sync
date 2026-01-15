# إصلاح .htaccess

## المشكلة

`.htaccess` لا يعمل بشكل صحيح - الملفات يمكن الوصول إليها مباشرة بدلاً من التوجيه إلى `index.php`.

## الحل

تم تحديث `.htaccess` لضمان:
1. إضافة `DirectoryIndex` لتحديد الملف الافتراضي
2. استخدام escape characters (`\.`) في patterns للـ RewriteCond
3. إضافة جميع ملفات الاختبار إلى القائمة المستثناة

## الخطوات المطلوبة

### 1. رفع الملفات المحدثة

```bash
cd ~/public_html/shopify-pos.tek-part.com
git pull
# أو انسخ .htaccess يدوياً
```

### 2. اختبار الموقع

```bash
curl -I https://shopify-pos.tek-part.com/
```

يجب أن يعيد HTTP 200 أو 302 بدلاً من 500.

### 3. اختبار .htaccess

```bash
# افتح في المتصفح
https://shopify-pos.tek-part.com/test-htaccess.php
```

- إذا رأيت محتوى الملف: `.htaccess` لا يزال لا يعمل
- إذا رأيت 404 أو redirect: `.htaccess` يعمل الآن

### 4. إذا استمرت المشكلة

#### أ) التحقق من Apache mod_rewrite

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
    echo "Try checking cPanel → Apache Modules\n";
}
?>
EOF

# ثم افتح في المتصفح
https://shopify-pos.tek-part.com/test-rewrite.php
```

#### ب) التحقق من Apache Error Logs

```bash
tail -50 /home/sortat/logs/error_log 2>/dev/null | grep -i "rewrite\|htaccess" | tail -20
```

#### ج) التحقق من صلاحيات الملفات

```bash
ls -la .htaccess index.php
```

يجب أن تكون:
- `.htaccess`: `-rw-r--r--`
- `index.php`: `-rw-r--r--` أو `-rwxr-xr-x`

## ملاحظات

- إذا كان `mod_rewrite` غير مفعل، يجب تفعيله من cPanel
- إذا كان `.htaccess` لا يعمل، قد يكون Apache معطل `.htaccess` في cPanel
- في بعض الحالات، قد تحتاج إلى استخدام `AllowOverride All` في Apache config
