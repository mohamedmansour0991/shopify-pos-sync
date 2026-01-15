# 🔍 كيفية العثور على App URLs في Shopify Partners Dashboard

## المشكلة
أنت في صفحة **Settings** لكن App URLs موجودة في مكان آخر.

---

## ✅ الحل: اذهب إلى App setup

### الخطوات:

1. **من صفحة Settings الحالية:**
   - انظر في القائمة الجانبية (Sidebar) على اليسار
   - ابحث عن **"App setup"** أو **"Configuration"**
   - اضغط عليه

2. **أو من الصفحة الرئيسية:**
   - اذهب إلى **Apps** → **POS Sync**
   - في القائمة الجانبية، اضغط **"App setup"** (ليس Settings)

---

## 📍 موقع App URLs

بعد فتح **App setup**، ستجد:

### قسم App URLs يحتوي على:

1. **App URL:**
   ```
   https://shopify-pos.tek-part.com
   ```

2. **Allowed redirection URLs:**
   ```
   https://shopify-pos.tek-part.com/auth/callback
   https://shopify-pos.tek-part.com/auth/shopify/callback
   ```

---

## 🎯 الخطوات الكاملة

1. ✅ من صفحة **POS Sync** الرئيسية
2. ✅ اضغط **"App setup"** في القائمة الجانبية (ليس Settings)
3. ✅ ابحث عن قسم **"App URLs"** أو **"App configuration"**
4. ✅ حدث **App URL** إلى `https://shopify-pos.tek-part.com`
5. ✅ حدث **Redirect URLs** إلى:
   - `https://shopify-pos.tek-part.com/auth/callback`
   - `https://shopify-pos.tek-part.com/auth/shopify/callback`
6. ✅ اضغط **Save**

---

## 📝 ملاحظة

**Settings** و **App setup** هما قسمان مختلفان:
- **Settings**: للإعدادات العامة (Credentials, Contact info, etc.)
- **App setup**: لإعدادات التطبيق (App URLs, Scopes, etc.)

---

**ابحث عن "App setup" في القائمة الجانبية! 🎯**
