# تغيير الدومين إلى theonesystemco.tek-part.com

## ✅ ما تم تحديثه في الملفات

تم تغيير الدومين من `shopify-pos.tek-part.com` إلى `theonesystemco.tek-part.com` في جميع الملفات.

## الخطوات المطلوبة على السيرفر

### 1. تحديث HOST في .env

```bash
cd ~/public_html/theonesystemco.tek-part.com

# تحديث HOST
sed -i 's|HOST=.*|HOST=https://theonesystemco.tek-part.com|' .env

# التحقق من التحديث
cat .env | grep HOST
```

**يجب أن يكون:**
```
HOST=https://theonesystemco.tek-part.com
```

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

### 3. إعادة بناء التطبيق

```bash
cd ~/public_html/theonesystemco.tek-part.com
npm run build
```

### 4. إعادة تشغيل PM2

```bash
pm2 restart server
pm2 logs server --lines 10
```

**يجب أن ترى:**
```
🔗 HOST: https://theonesystemco.tek-part.com
```

### 5. التحقق من SSL Certificate

في cPanel:
1. اذهب إلى **SSL/TLS Status**
2. تأكد من أن Certificate مفعل للدومين `theonesystemco.tek-part.com`

### 6. اختبار الموقع

```bash
# اختبار من السيرفر
curl -I https://theonesystemco.tek-part.com

# يجب أن يعيد HTTP 200 أو 302
```

### 7. اختبار من Shopify Admin

1. اذهب إلى: https://admin.shopify.com/store/tarawud1/apps
2. ابحث عن "POS Sync"
3. اضغط "Install" أو "Open"

## ملاحظات مهمة

1. **HOST في .env**: يجب أن يكون `https://theonesystemco.tek-part.com` (مع https)
2. **Shopify Partners Dashboard**: يجب تحديث App URL و Redirect URLs
3. **SSL Certificate**: يجب أن يكون مفعل
4. **انتظر 1-2 دقيقة** بعد تحديث Shopify Partners Dashboard

## إذا كان المجلد مختلفاً

إذا كان المجلد على السيرفر مختلفاً (مثل `shopify-pos.tek-part.com`)، استخدم:

```bash
cd ~/public_html/shopify-pos.tek-part.com
# أو
cd ~/public_html/theonesystemco.tek-part.com
```

حسب اسم المجلد الفعلي على السيرفر.
