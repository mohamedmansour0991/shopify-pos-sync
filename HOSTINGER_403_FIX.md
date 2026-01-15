# 🔧 حل مشكلة 403 Forbidden في Hostinger

## المشكلة
التطبيق تم بناؤه بنجاح لكن يظهر خطأ 403 Forbidden عند الوصول إليه.

## الحلول المحتملة

### 1. تحقق من Logs
في Hostinger Dashboard → **Logs**:
- تحقق من أن التطبيق يبدأ بشكل صحيح
- ابحث عن أي أخطاء في بدء التشغيل
- تحقق من أن Port يتم تعيينه بشكل صحيح

### 2. تحقق من Environment Variables
تأكد من أن جميع Environment Variables موجودة:
- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SCOPES`
- `HOST` (يجب أن يكون `https://shopify-pos.tek-part.com`)
- `DATABASE_URL`
- `NODE_ENV`

### 3. تحقق من Start Command
في Hostinger Dashboard → **Settings**:
- **Start Command**: `npm start`
- تأكد من أنه صحيح

### 4. تحقق من Port
Hostinger Node.js App يعين Port تلقائياً. تأكد من:
- لا تحدد PORT في Environment Variables (اتركه لـ Hostinger)
- أو أضف `PORT` إذا كان مطلوباً

### 5. تحقق من Domain Configuration
في Hostinger Dashboard → **Domains**:
- تأكد من أن `pos-sync-shopify.tarawud.com` مربوط بالتطبيق
- تحقق من DNS records

### 6. إعادة تشغيل التطبيق
في Hostinger Dashboard:
- اضغط **Restart App**
- انتظر حتى يبدأ التطبيق
- تحقق من Logs مرة أخرى

---

## خطوات التحقق

1. ✅ تحقق من Logs في Hostinger Dashboard
2. ✅ تحقق من Environment Variables
3. ✅ تحقق من Domain Configuration
4. ✅ أعد تشغيل التطبيق
5. ✅ جرب الوصول من Shopify App (ليس مباشرة من المتصفح)

---

## ملاحظة مهمة

Shopify Apps عادة لا يمكن الوصول إليها مباشرة من المتصفح. يجب الوصول إليها من خلال:
- Shopify Admin → Apps → POS Sync
- أو من خلال Shopify OAuth flow

جرب الوصول من Shopify Admin بدلاً من الوصول المباشر!
