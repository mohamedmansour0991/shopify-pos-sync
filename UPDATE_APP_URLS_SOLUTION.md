# 🔄 حل مشكلة تحديث App URLs في Shopify Partners

## المشكلة
لا يوجد زر للتعديل في صفحة Version بعد إنشائه.

---

## ✅ الحل: استخدام Shopify CLI

لا يمكن تعديل Version مباشرة من Partners Dashboard. يجب استخدام **Shopify CLI** لتحديث الإعدادات.

---

## 🎯 الخطوات الكاملة

### 1️⃣ تحديث ملف shopify.app.pos-sync.toml

تأكد من أن الملف يحتوي على:

```toml
client_id = "2e0d4096fb1c73f0851cb3bfb9e92210"
name = "POS Sync"
application_url = "https://shopify-pos.tek-part.com"
embedded = true

[build]
automatically_update_urls_on_dev = false
include_config_on_deploy = true

[webhooks]
api_version = "2026-01"

[access_scopes]
scopes = "read_inventory,read_product_listings,read_products,write_inventory,write_product_listings,write_products"

[auth]
redirect_urls = [
  "https://shopify-pos.tek-part.com/auth/callback",
  "https://shopify-pos.tek-part.com/auth/shopify/callback"
]
```

---

### 2️⃣ تحديث الإعدادات عبر Shopify CLI

في Terminal (في مجلد المشروع):

```bash
# تأكد من أنك في مجلد المشروع
cd "h:\new company\shopify-pos-sync"

# تحديث الإعدادات
shopify app deploy
```

**أو** إذا كان `shopify app deploy` لا يعمل:

```bash
# تحديث الإعدادات فقط (بدون نشر)
shopify app config push
```

---

### 3️⃣ إنشاء Version جديد (إذا لم يعمل CLI)

إذا لم يعمل Shopify CLI، يمكنك إنشاء Version جديد:

1. في Partners Dashboard → **Versions**
2. اضغط **"New version"**
3. سيتم نسخ إعدادات Version السابق
4. بعد إنشاء Version جديد، استخدم Shopify CLI لتحديث الإعدادات:

```bash
shopify app deploy
```

---

## 📝 ملاحظات مهمة

### ⚠️ تحذيرات

1. **Shopify CLI** يجب أن يكون مثبتاً ومربوطاً بحسابك
2. تأكد من أنك في المجلد الصحيح قبل تشغيل الأوامر
3. قد تحتاج إلى تسجيل الدخول: `shopify auth login`

### ✅ بعد التحديث

1. انتظر بضع دقائق حتى يتم تطبيق التغييرات
2. تحقق من Partners Dashboard → Versions → pos-sync-1
3. تأكد من أن App URL و Redirect URLs تم تحديثهما

---

## 🎯 الخطوات السريعة

1. ✅ تأكد من أن `shopify.app.pos-sync.toml` محدث
2. ✅ افتح Terminal في مجلد المشروع
3. ✅ شغّل `shopify app deploy`
4. ✅ انتظر حتى يكتمل التحديث
5. ✅ تحقق من Partners Dashboard

---

## 🔧 إذا لم يعمل Shopify CLI

### تحقق من:

1. **تثبيت Shopify CLI:**
   ```bash
   npm install -g @shopify/cli @shopify/theme
   ```

2. **تسجيل الدخول:**
   ```bash
   shopify auth login
   ```

3. **التحقق من الاتصال:**
   ```bash
   shopify whoami
   ```

---

**بعد تشغيل `shopify app deploy`، سيتم تحديث الإعدادات! 🎉**
