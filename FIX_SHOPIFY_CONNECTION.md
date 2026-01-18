# حل مشكلة "refused to connect" من Shopify Admin

## ✅ ما تم إنجازه
- ✅ `/auth/login` يعمل ويعرض صفحة تسجيل الدخول
- ✅ Route `/auth/login` يعمل بشكل صحيح
- ✅ Node.js server يعمل على port 3000

## ❌ المشكلة الحالية
Shopify Admin لا يستطيع الاتصال: "refused to connect"

## الحل الشامل

### 1. التحقق من HOST في .env

```bash
cd ~/public_html/theonesystemco.tek-part.com
cat .env | grep HOST
```

**يجب أن يكون:**
```
HOST=https://theonesystemco.tek-part.com
```

**مهم:**
- يجب أن يبدأ بـ `https://` (وليس `http://`)
- بدون `/` في النهاية
- بدون مسافات

### 2. تحديث Shopify Partners Dashboard

1. اذهب إلى: https://partners.shopify.com/
2. اختر التطبيق "POS Sync"
3. اذهب إلى **App setup**

#### تحديث:
- **App URL**: `https://theonesystemco.tek-part.com`
- **Allowed redirection URLs**:
  ```
  https://theonesystemco.tek-part.com/auth/callback
  https://theonesystemco.tek-part.com/auth/shopify/callback
  ```

4. **احفظ التغييرات**
5. **انتظر 1-2 دقيقة** حتى يتم تحديث الإعدادات

### 3. إعادة تشغيل PM2

```bash
pm2 restart server
pm2 logs server --lines 10
```

**يجب أن ترى:**
```
🔗 HOST: https://theonesystemco.tek-part.com
```

### 4. التحقق من SSL Certificate

في cPanel:
1. اذهب إلى **SSL/TLS Status**
2. تأكد من أن Certificate مفعل للدومين `theonesystemco.tek-part.com`
3. إذا لم يكن مفعل، فعّله

### 5. اختبار الاتصال

```bash
# اختبار من السيرفر
curl -I https://theonesystemco.tek-part.com

# يجب أن يعيد HTTP 200 أو 302
```

### 6. التحقق من Firewall

- البورت 3000 يجب أن يكون محظور من الخارج (هذا طبيعي)
- لكن Apache (البورت 80/443) يجب أن يكون متاح
- تأكد من أن Firewall لا يحجب البورت 443 (HTTPS)

### 7. اختبار من Shopify Admin

1. اذهب إلى: https://admin.shopify.com/store/tarawud1/apps
2. ابحث عن "POS Sync"
3. اضغط "Install" أو "Open"
4. إذا لم يعمل، انتظر 2-3 دقائق ثم حاول مرة أخرى

## حلول إضافية

### إذا استمرت المشكلة:

#### الحل 1: التحقق من App URL في Shopify Partners
- تأكد من أن App URL مطابق تماماً: `https://theonesystemco.tek-part.com`
- بدون `/` في النهاية
- بدون `http://` (يجب أن يكون `https://`)

#### الحل 2: التحقق من Redirect URLs
- تأكد من أن Redirect URLs مطابقة تماماً:
  - `https://theonesystemco.tek-part.com/auth/callback`
  - `https://theonesystemco.tek-part.com/auth/shopify/callback`
- بدون `/` في النهاية
- بدون مسافات

#### الحل 3: مسح Cache
```bash
# مسح PM2 logs
pm2 flush

# إعادة تشغيل PM2
pm2 restart server
```

#### الحل 4: التحقق من سجلات PM2
```bash
pm2 logs server --lines 50 | grep -i "error\|refused\|connection"
```

## ملاحظات مهمة

1. **HOST في .env**: يجب أن يكون `https://theonesystemco.tek-part.com` (مع https)
2. **Shopify Partners Dashboard**: يجب تحديث App URL و Redirect URLs
3. **SSL Certificate**: يجب أن يكون مفعل
4. **PM2**: يجب أن يكون يعمل بشكل مستمر
5. **انتظر 1-2 دقيقة** بعد تحديث Shopify Partners Dashboard

## الخطوات النهائية

بعد تحديث Shopify Partners Dashboard:

1. ✅ انتظر 1-2 دقيقة حتى يتم تحديث الإعدادات
2. ✅ تأكد من أن HOST في .env صحيح
3. ✅ أعد تشغيل PM2
4. ✅ حاول فتح التطبيق من Shopify Admin
5. ✅ إذا لم يعمل، تحقق من سجلات PM2
