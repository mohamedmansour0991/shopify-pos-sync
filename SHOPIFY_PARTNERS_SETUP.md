# إعداد التطبيق في Shopify Partners Dashboard - خطوة بخطوة

## الخطوات المطلوبة

### 1. الوصول إلى App Setup

من الصفحة الحالية:
1. اضغط على **"POS Sync"** (اسم التطبيق)
2. من القائمة الجانبية، اضغط على **"App setup"** أو **"Settings"**

### 2. تحديث App URL

في صفحة **App setup**، ابحث عن:
- **App URL** أو **Application URL**

**قم بتحديثه إلى:**
```
https://theonesystemco.tek-part.com
```

**مهم:**
- يجب أن يبدأ بـ `https://` (وليس `http://`)
- بدون `/` في النهاية
- بدون مسافات

### 3. تحديث Allowed redirection URLs

في نفس الصفحة، ابحث عن:
- **Allowed redirection URLs** أو **Redirect URLs**

**قم بإضافة/تحديث:**
```
https://theonesystemco.tek-part.com/auth/callback
https://theonesystemco.tek-part.com/auth/shopify/callback
```

**مهم:**
- كل URL في سطر منفصل
- بدون `/` في النهاية
- بدون مسافات
- يجب أن تبدأ بـ `https://`

### 4. حفظ التغييرات

1. اضغط على **"Save"** أو **"Update"**
2. انتظر رسالة التأكيد

### 5. التحقق من HOST في .env

على السيرفر:
```bash
cd ~/public_html/theonesystemco.tek-part.com
cat .env | grep HOST
```

**يجب أن يكون:**
```
HOST=https://theonesystemco.tek-part.com
```

إذا كان مختلفاً، قم بتحديثه:
```bash
# احفظ نسخة احتياطية
cp .env .env.backup

# قم بتحديث HOST
sed -i 's|HOST=.*|HOST=https://theonesystemco.tek-part.com|' .env

# تحقق من التحديث
cat .env | grep HOST
```

### 6. إعادة تشغيل PM2

```bash
pm2 restart server
pm2 logs server --lines 10
```

**يجب أن ترى:**
```
🔗 HOST: https://theonesystemco.tek-part.com
```

### 7. انتظر 1-2 دقيقة

بعد تحديث Shopify Partners Dashboard، انتظر 1-2 دقيقة حتى يتم تحديث الإعدادات.

### 8. اختبار التطبيق

1. اذهب إلى: https://admin.shopify.com/store/tarawud1/apps
2. ابحث عن "POS Sync"
3. اضغط "Install" أو "Open"

## ملاحظات مهمة

### إذا لم تجد "App setup":
- قد يكون اسم القسم مختلفاً حسب إصدار Shopify Partners Dashboard
- ابحث عن: "Settings", "Configuration", "App configuration"
- أو ابحث في القائمة الجانبية عن أي قسم يحتوي على "URL" أو "redirect"

### إذا استمرت المشكلة "refused to connect":
1. تأكد من أن HOST في .env صحيح
2. تأكد من أن SSL Certificate مفعل في cPanel
3. تأكد من أن PM2 يعمل: `pm2 status`
4. تحقق من سجلات PM2: `pm2 logs server --lines 20`

### التحقق من SSL Certificate:
في cPanel:
1. اذهب إلى **SSL/TLS Status**
2. تأكد من أن Certificate مفعل للدومين `theonesystemco.tek-part.com`
3. إذا لم يكن مفعل، فعّله

## الخطوات النهائية

بعد تحديث Shopify Partners Dashboard:

1. ✅ انتظر 1-2 دقيقة
2. ✅ تأكد من أن HOST في .env صحيح
3. ✅ أعد تشغيل PM2
4. ✅ حاول فتح التطبيق من Shopify Admin
5. ✅ إذا لم يعمل، تحقق من سجلات PM2
