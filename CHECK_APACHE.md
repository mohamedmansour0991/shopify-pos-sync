# التحقق من Apache Configuration

## المشكلة

`.htaccess` لا يعمل - الملفات يمكن الوصول إليها مباشرة بدلاً من التوجيه إلى `index.php`.

## الأسباب المحتملة

1. `mod_rewrite` غير مفعل
2. `AllowOverride` معطل في Apache config
3. `.htaccess` لا يتم قراءته

## الخطوات المطلوبة

### 1. التحقق من mod_rewrite

في cPanel:
- اذهب إلى **Software** → **Apache Modules**
- ابحث عن `mod_rewrite`
- تأكد من أنه مفعل

أو من SSH:
```bash
# إنشاء ملف test-rewrite.php
cat > test-rewrite.php << 'EOF'
<?php
header('Content-Type: text/plain');
if (function_exists('apache_get_modules')) {
    $modules = apache_get_modules();
    echo "mod_rewrite enabled: " . (in_array('mod_rewrite', $modules) ? 'Yes' : 'No') . "\n";
    echo "\nAll modules:\n";
    print_r($modules);
} else {
    echo "Cannot check Apache modules (not available in CGI mode)\n";
    echo "Try checking cPanel → Apache Modules\n";
}
?>
EOF

# ثم افتح في المتصفح
https://theonesystemco.tek-part.com/test-rewrite.php
```

### 2. التحقق من Apache Error Logs

```bash
tail -100 /home/sortat/logs/error_log 2>/dev/null | grep -i "rewrite\|htaccess\|500" | tail -30
```

ابحث عن:
- `.htaccess: RewriteEngine: option not allowed here`
- `.htaccess: Invalid command`
- `mod_rewrite`

### 3. التحقق من صلاحيات الملفات

```bash
ls -la .htaccess index.php
chmod 644 .htaccess
chmod 644 index.php
```

### 4. اختبار .htaccess مباشرة

```bash
# إنشاء ملف test-htaccess-syntax.php
cat > test-htaccess-syntax.php << 'EOF'
<?php
header('Content-Type: text/plain');
echo "Testing .htaccess syntax...\n\n";

// Try to read .htaccess
$htaccess = file_get_contents('.htaccess');
if ($htaccess) {
    echo ".htaccess content (first 500 chars):\n";
    echo substr($htaccess, 0, 500) . "\n";
} else {
    echo "Cannot read .htaccess file\n";
}
?>
EOF

# ثم افتح في المتصفح
https://theonesystemco.tek-part.com/test-htaccess-syntax.php
```

### 5. إذا كان mod_rewrite غير مفعل

اتصل بالدعم الفني للاستضافة لتفعيل `mod_rewrite` أو `AllowOverride All`.

### 6. حل بديل: استخدام PHP Router

إذا كان `.htaccess` لا يعمل، يمكن استخدام PHP router مباشرة:

```php
// في index.php - إضافة في البداية
if ($_SERVER['REQUEST_URI'] === '/' || $_SERVER['REQUEST_URI'] === '') {
    // Already handled by DirectoryIndex
}
```

## ملاحظات

- في بعض استضافات cPanel، `mod_rewrite` مفعل افتراضياً
- في بعض الحالات، قد تحتاج إلى تفعيل `AllowOverride All` في Apache config (يتطلب صلاحيات root)
- إذا كان `.htaccess` لا يعمل، قد تحتاج إلى استخدام طريقة أخرى للتوجيه
