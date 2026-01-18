# إعداد Mandatory Compliance Webhooks

## المتطلبات من Shopify

Shopify يتطلب **Mandatory Compliance Webhooks** لجميع التطبيقات في App Store:

| Topic | الوصف |
|-------|-------|
| `customers/data_request` | عندما يطلب العميل بياناته |
| `customers/redact` | عندما يطلب العميل حذف بياناته |
| `shop/redact` | عندما يطلب صاحب المتجر حذف بيانات المتجر (48 ساعة بعد إلغاء التثبيت) |

### المتطلبات التقنية:
1. ✅ التطبيق يجب أن يستجيب لـ POST requests مع JSON body
2. ✅ التطبيق يجب أن يتحقق من HMAC signature
3. ✅ إذا كان HMAC غير صحيح، يجب إرجاع `401 Unauthorized`
4. ✅ إذا نجح الطلب، يجب إرجاع `200 OK`
5. ✅ يجب أن يكون لديك SSL certificate صالح

## الإعداد في shopify.app.toml

تم إضافة الإعدادات التالية في `shopify.app.pos-sync.toml`:

```toml
[webhooks]
api_version = "2026-01"

# App webhooks
[[webhooks.subscriptions]]
topics = ["app/uninstalled"]
uri = "/webhooks"

# Mandatory compliance webhooks
[[webhooks.subscriptions]]
compliance_topics = ["customers/data_request", "customers/redact", "shop/redact"]
uri = "/webhooks"
```

## خطوات التنفيذ

### 1. على السيرفر - تحديث الكود

```bash
cd ~/public_html/theonesystemco.tek-part.com
git pull
npm run build
pm2 restart server
pm2 logs server --lines 20
```

### 2. تحديث Shopify Partners Dashboard

1. اذهب إلى: https://partners.shopify.com/
2. اختر التطبيق **"POS Sync"**
3. اذهب إلى **"Configuration"** → **"Compliance webhooks"**
4. أضف URL واحد لجميع الـ webhooks:

```
https://theonesystemco.tek-part.com/webhooks
```

| Field | Value |
|-------|-------|
| Customer data request endpoint | `https://theonesystemco.tek-part.com/webhooks` |
| Customer data erasure endpoint | `https://theonesystemco.tek-part.com/webhooks` |
| Shop data erasure endpoint | `https://theonesystemco.tek-part.com/webhooks` |

5. احفظ التغييرات

### 3. اختبار Webhooks

```bash
# اختبار من السيرفر - يجب أن يعيد 401 (HMAC غير صحيح)
curl -X POST http://localhost:3000/webhooks \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: customers/data_request" \
  -d '{"shop_id": 123, "shop_domain": "test.myshopify.com"}'
```

### 4. استخدام Shopify CLI للاختبار

```bash
# اختبار webhook محلياً
shopify app webhook trigger --topic customers/data_request --address https://theonesystemco.tek-part.com/webhooks
```

## كيف يعمل الكود

### `app/routes/webhooks.tsx`

```typescript
export const action = async ({ request }: ActionFunctionArgs) => {
  // authenticate.webhook() يتحقق من HMAC تلقائياً
  // إذا كان HMAC غير صحيح، سيرمي 401 Unauthorized
  const { topic, shop, payload } = await authenticate.webhook(request);

  switch (topic) {
    case "CUSTOMERS_DATA_REQUEST":
      // معالجة طلب بيانات العميل
      break;
    case "CUSTOMERS_REDACT":
      // حذف بيانات العميل
      break;
    case "SHOP_REDACT":
      // حذف بيانات المتجر
      break;
  }

  // إرجاع 200 OK
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
```

## استكشاف الأخطاء

### 1. فشل التحقق من Webhooks

```bash
# تحقق من SSL
curl -I https://theonesystemco.tek-part.com/webhooks

# تحقق من PM2
pm2 status
pm2 logs server --lines 30 | grep -i webhook
```

### 2. خطأ 401 Unauthorized

هذا طبيعي إذا كان HMAC غير صحيح. Shopify سيرسل HMAC صحيح.

### 3. خطأ 404 Not Found

تأكد من أن:
- `.htaccess` يوجه `/webhooks` إلى `index.php`
- `index.php` يوجه الطلب إلى Node.js
- PM2 يعمل

### 4. خطأ 500 Internal Server Error

```bash
pm2 logs server --lines 50 | grep -i error
```

## ملاحظات مهمة

1. **HMAC Verification**: يتم تلقائياً من `authenticate.webhook()`
2. **Response Time**: يجب الرد خلال 5 ثواني
3. **Retries**: Shopify سيعيد المحاولة إذا لم يحصل على 2xx
4. **SSL Required**: يجب استخدام HTTPS
