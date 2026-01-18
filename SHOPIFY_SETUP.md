# إعداد التطبيق في Shopify Partners Dashboard

## الخطوات المهمة بعد النشر

### 1. تحديث إعدادات التطبيق في Shopify Partners

1. اذهب إلى [Shopify Partners Dashboard](https://partners.shopify.com/)
2. اختر التطبيق "POS Sync"
3. اذهب إلى **App setup**

#### 4. تحديث App URL:
```
https://theonesystemco.tek-part.com
```

#### 5. تحديث Allowed redirection URLs:
```
https://theonesystemco.tek-part.com/auth/callback
https://theonesystemco.tek-part.com/auth/shopify/callback
```

#### 6. حفظ التغييرات

### 2. التحقق من متغير HOST في .env

```bash
cd ~/public_html/theonesystemco.tek-part.com
grep HOST .env
```

يجب أن يكون:
```
HOST=https://theonesystemco.tek-part.com
```

**مهم**: يجب أن يبدأ بـ `https://` وليس `http://`

### 3. إعادة تشغيل التطبيق بعد تحديث HOST

```bash
pm2 restart shopify-pos-sync
pm2 logs shopify-pos-sync --lines 10
```

يجب أن ترى:
```
🔗 HOST: https://theonesystemco.tek-part.com
```

### 4. التحقق من أن الموقع يعمل من الخارج

```bash
# اختبار من السيرفر نفسه
curl -I https://theonesystemco.tek-part.com

# يجب أن يعيد HTTP 200 أو 302
```

### 5. التحقق من SSL Certificate

تأكد من أن SSL Certificate مفعل على الدومين:
- في cPanel → SSL/TLS Status
- تأكد من أن Certificate مفعل

### 6. اختبار التطبيق من Shopify

1. اذهب إلى: https://admin.shopify.com/store/tarawud1/apps
2. ابحث عن "POS Sync"
3. اضغط "Install" أو "Open"

## مشاكل شائعة

### المشكلة: "refused to connect"
**الحلول**:
1. تأكد من أن HOST في .env صحيح: `https://theonesystemco.tek-part.com`
2. تأكد من تحديث App URL في Shopify Partners Dashboard
3. تأكد من أن SSL Certificate مفعل
4. تحقق من Firewall - قد يكون البورت 3000 محظور من الخارج (هذا طبيعي، لكن Apache يجب أن يكون متاح)

### المشكلة: "This site can't be reached"
**الحلول**:
1. تحقق من أن PM2 يعمل: `pm2 status`
2. تحقق من أن Apache يعمل
3. تحقق من سجلات PM2: `pm2 logs shopify-pos-sync`

### المشكلة: "Invalid redirect URI"
**الحلول**:
1. تأكد من أن Allowed redirection URLs في Shopify Partners Dashboard مطابقة تماماً:
   - `https://theonesystemco.tek-part.com/auth/callback`
   - `https://theonesystemco.tek-part.com/auth/shopify/callback`
2. لا تضيف `/` في النهاية
3. تأكد من استخدام `https://` وليس `http://`
