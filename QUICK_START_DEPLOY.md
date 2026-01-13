# 🚀 دليل النشر السريع - POS Sync

## الخطوات الأساسية للنشر

### 1️⃣ اختر منصة الاستضافة

**الخيار الأسهل: Render.com** (موصى به للمبتدئين)

### 2️⃣ النشر على Render

#### الخطوة 1: رفع الكود على GitHub
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

#### الخطوة 2: إنشاء حساب على Render
1. اذهب إلى https://render.com
2. سجل الدخول بحساب GitHub
3. اضغط "New" → "Web Service"
4. اختر المستودع الخاص بك

#### الخطوة 3: إعدادات Render
- **Name**: `shopify-pos-sync`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Starter` ($7/شهر)

#### الخطوة 4: إضافة Environment Variables
في Render Dashboard → Environment:

```
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=read_products,write_products,read_product_listings,write_product_listings,read_inventory,write_inventory
HOST=https://your-app-name.onrender.com
DATABASE_URL=file:./prod.db
NODE_ENV=production
```

#### الخطوة 5: النشر
- Render سينشر تلقائياً
- انتظر حتى يكتمل النشر (5-10 دقائق)
- احصل على الرابط: `https://your-app-name.onrender.com`

---

### 3️⃣ تحديث Shopify App Settings

1. اذهب إلى https://partners.shopify.com/
2. اختر التطبيق "POS Sync"
3. اذهب إلى **App setup** → **App URLs**
4. قم بتحديث:
   - **App URL**: `https://your-app-name.onrender.com`
   - **Allowed redirection URLs**:
     - `https://your-app-name.onrender.com/auth/callback`
     - `https://your-app-name.onrender.com/auth/shopify/callback`
5. احفظ التغييرات

---

### 4️⃣ رفع الإعدادات إلى Shopify

```bash
# في مجلد المشروع
shopify app deploy
```

---

### 5️⃣ اختبار التطبيق

1. افتح: `https://your-app-name.onrender.com`
2. جرب تثبيت التطبيق على متجر تجريبي
3. اختبر المزامنة

---

### 6️⃣ النشر على App Store (اختياري)

1. اذهب إلى Partners Dashboard → App listing
2. املأ المعلومات المطلوبة
3. أرفق Screenshots
4. اضغط "Submit for review"

---

## ⚠️ ملاحظات مهمة

- **لا تضع** `SHOPIFY_API_SECRET` في الكود
- استخدم Environment Variables دائماً
- تأكد من أن التطبيق يعمل على HTTPS
- راقب Logs بعد النشر

---

## 📞 المساعدة

إذا واجهت مشاكل:
1. تحقق من Logs في Render Dashboard
2. تأكد من أن جميع Environment Variables موجودة
3. تحقق من أن Shopify App URLs محدثة

---

**بعد النشر، سيتمكن المتاجر من تثبيت واستخدام التطبيق! 🎉**
