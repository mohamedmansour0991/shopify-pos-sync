# الحل النهائي - المشكلة والحل

## المشكلة الحالية

1. ✅ `test-proxy-direct.php` يعمل بشكل صحيح
2. ✅ Node.js يعمل على البورت 3000 ويعيد `{}`
3. ❌ `https://theonesystemco.tek-part.com/` يعطي 500 error
4. ❌ PM2 logs تظهر `Could not parse content as FormData` (أحياناً)

## السبب

المشكلة هي أن `login()` من Shopify يحاول قراءة FormData حتى في طلبات GET. عندما يتم تمرير الطلب من خلال PHP proxy، قد يتم تمرير Content-Type أو Content-Length بشكل خاطئ.

## الحل

تم تحديث `index.php` لضمان:
1. عدم تمرير Content-Type في طلبات GET/HEAD
2. عدم تمرير Content-Length في طلبات GET/HEAD
3. استخدام `$_SERVER` بدلاً من `getallheaders()` (متوافق مع CGI)

## الخطوات المطلوبة

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

#### أ) التحقق من Apache Error Logs

```bash
tail -50 /home/sortat/logs/error_log 2>/dev/null | grep -i "shopify-pos\|index.php" | tail -20
```

#### ب) اختبار مباشر من Node.js

```bash
curl -v http://127.0.0.1:3000/ 2>&1 | grep -i "HTTP\|Location\|content-type"
```

#### ج) التحقق من PM2

```bash
pm2 logs shopify-pos-sync --lines 30 | grep -i "error\|formdata" | tail -10
```

## ملاحظات مهمة

- `login()` يعيد Response مباشرة (redirect أو HTML)
- يجب أن يتم تمرير Response بشكل صحيح من Node.js إلى PHP إلى المتصفح
- إذا كان Node.js يعيد `{}`، هذا يعني أن `login()` لم يعمل بشكل صحيح

## الخطوات التالية

بعد إصلاح 500 error:
1. تحديث Shopify Partners Dashboard
2. التحقق من HOST في .env
3. اختبار التطبيق من Shopify Admin
