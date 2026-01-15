# الخطوات التالية بعد النشر

## ✅ ما تم إنجازه

1. ✅ تم إصلاح مشكلة بناء التطبيق
2. ✅ تم إعداد قاعدة البيانات
3. ✅ تم تشغيل التطبيق على PM2
4. ✅ تم إعداد PHP proxy للعمل مع Apache
5. ✅ تم تحميل متغيرات البيئة من .env

## 🔧 الخطوات التالية المطلوبة

### 1. تحديث Shopify Partners Dashboard

**مهم جداً**: يجب تحديث إعدادات التطبيق في Shopify Partners Dashboard:

1. اذهب إلى: https://partners.shopify.com/
2. اختر التطبيق "POS Sync"
3. اذهب إلى **App setup**

#### تحديث:
- **App URL**: `https://shopify-pos.tek-part.com`
- **Allowed redirection URLs**:
  ```
  https://shopify-pos.tek-part.com/auth/callback
  https://shopify-pos.tek-part.com/auth/shopify/callback
  ```

4. **احفظ التغييرات**

### 2. التحقق من HOST في .env

```bash
cd ~/public_html/shopify-pos.tek-part.com
cat .env | grep HOST
```

يجب أن يكون:
```
HOST=https://shopify-pos.tek-part.com
```

**مهم**: 
- يجب أن يبدأ بـ `https://` (وليس `http://`)
- بدون `/` في النهاية

### 3. إعادة تشغيل التطبيق

```bash
pm2 restart shopify-pos-sync
pm2 logs shopify-pos-sync --lines 5
```

### 4. اختبار الموقع

```bash
# اختبار من السيرفر
curl -I https://shopify-pos.tek-part.com

# يجب أن يعيد HTTP 200 أو 302
```

### 5. اختبار التطبيق من Shopify

1. اذهب إلى: https://admin.shopify.com/store/tarawud1/apps
2. ابحث عن "POS Sync"
3. اضغط "Install" أو "Open"

## 🔍 حل مشكلة "refused to connect"

إذا استمرت المشكلة بعد تحديث Shopify Partners Dashboard:

### الحل 1: التحقق من SSL Certificate
- في cPanel → SSL/TLS Status
- تأكد من أن Certificate مفعل للدومين

### الحل 2: التحقق من Firewall
- البورت 3000 يجب أن يكون محظور من الخارج (هذا طبيعي)
- لكن Apache (البورت 80/443) يجب أن يكون متاح

### الحل 3: اختبار PHP Proxy
```bash
# افتح في المتصفح
https://shopify-pos.tek-part.com/debug.php

# يجب أن ترى معلومات الاتصال
```

### الحل 4: التحقق من سجلات PM2
```bash
pm2 logs shopify-pos-sync --lines 50 | grep -i error
```

## 📝 ملاحظات مهمة

1. **HOST في .env**: يجب أن يكون `https://shopify-pos.tek-part.com` (مع https)
2. **Shopify Partners Dashboard**: يجب تحديث App URL و Redirect URLs
3. **SSL Certificate**: يجب أن يكون مفعل
4. **PM2**: يجب أن يكون يعمل بشكل مستمر

## 🎯 الخطوات النهائية

بعد تحديث Shopify Partners Dashboard:

1. انتظر 1-2 دقيقة حتى يتم تحديث الإعدادات
2. حاول فتح التطبيق من Shopify Admin
3. إذا لم يعمل، تحقق من سجلات PM2
