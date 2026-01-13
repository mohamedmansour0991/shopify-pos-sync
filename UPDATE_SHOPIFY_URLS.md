# 🔄 تحديث إعدادات التطبيق في Shopify Partners Dashboard

## الخطوات لتحديث App URL في Shopify Partners

### 1️⃣ اذهب إلى Shopify Partners Dashboard

1. افتح: https://partners.shopify.com/
2. سجل الدخول
3. اذهب إلى **Apps** → **POS Sync**

---

### 2️⃣ تحديث App URLs

1. في صفحة التطبيق، اضغط على **App setup** (أو **Settings**)
2. ابحث عن قسم **App URLs** أو **App configuration**
3. قم بتحديث:

   **App URL:**
   ```
   https://pos-sync-shopify.tarawud.com
   ```

   **Allowed redirection URLs:**
   ```
   https://pos-sync-shopify.tarawud.com/auth/callback
   https://pos-sync-shopify.tarawud.com/auth/shopify/callback
   ```

4. اضغط **Save** لحفظ التغييرات

---

### 3️⃣ رفع الإعدادات إلى Shopify

بعد تحديث الإعدادات في Partners Dashboard، قم برفع الإعدادات من الكود:

```bash
# في مجلد المشروع
shopify app deploy
```

**أو** إذا كنت تستخدم Shopify CLI:

```bash
shopify app config push
```

---

### 4️⃣ التحقق من التحديث

1. في Partners Dashboard → **App setup** → **App URLs**
2. تأكد من أن:
   - **App URL** = `https://pos-sync-shopify.tarawud.com`
   - **Redirect URLs** تحتوي على:
     - `https://pos-sync-shopify.tarawud.com/auth/callback`
     - `https://pos-sync-shopify.tarawud.com/auth/shopify/callback`

---

## 📝 ملاحظات مهمة

### ⚠️ تحذيرات

1. **لا تحذف** Redirect URLs القديمة فوراً - اتركها لمدة يومين للتأكد من أن كل شيء يعمل
2. **تأكد** من أن التطبيق يعمل على الرابط الجديد قبل حذف القديم
3. **اختبر** التطبيق بعد التحديث

### ✅ بعد التحديث

1. اختبر تثبيت التطبيق على متجر تجريبي
2. تأكد من أن OAuth flow يعمل بشكل صحيح
3. تحقق من أن جميع الميزات تعمل

---

## 🎯 الخطوات السريعة

1. ✅ اذهب إلى Partners Dashboard → Apps → POS Sync
2. ✅ اضغط **App setup** → **App URLs**
3. ✅ حدث **App URL** إلى `https://pos-sync-shopify.tarawud.com`
4. ✅ حدث **Redirect URLs** إلى:
   - `https://pos-sync-shopify.tarawud.com/auth/callback`
   - `https://pos-sync-shopify.tarawud.com/auth/shopify/callback`
5. ✅ اضغط **Save**
6. ✅ شغّل `shopify app deploy` من Terminal
7. ✅ اختبر التطبيق

---

**بعد هذه الخطوات، سيتم تحديث إعدادات التطبيق! 🎉**
