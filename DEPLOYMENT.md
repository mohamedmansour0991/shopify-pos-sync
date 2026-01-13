# دليل نشر التطبيق - POS Sync

## 📋 متطلبات ما قبل النشر

### 1. التحقق من الجاهزية

- [ ] التطبيق يعمل بشكل صحيح في بيئة التطوير
- [ ] جميع الميزات تم اختبارها
- [ ] قاعدة البيانات جاهزة للإنتاج
- [ ] متغيرات البيئة (Environment Variables) محددة

### 2. إعدادات Shopify App

1. اذهب إلى [Shopify Partners Dashboard](https://partners.shopify.com/)
2. اختر التطبيق "POS Sync"
3. اذهب إلى **App setup** → **App URLs**
4. قم بتحديث:
   - **App URL**: `https://your-production-domain.com`
   - **Allowed redirection URLs**:
     - `https://your-production-domain.com/auth/callback`
     - `https://your-production-domain.com/auth/shopify/callback`

---

## 🚀 خطوات النشر

### الخيار 1: النشر على Render (موصى به)

#### 1. إعداد المشروع على Render

```bash
# 1. تأكد من أن الكود موجود على GitHub
git add .
git commit -m "Prepare for production deployment"
git push origin main

# 2. اذهب إلى https://render.com
# 3. سجل الدخول أو أنشئ حساب جديد
# 4. اضغط على "New" → "Web Service"
# 5. اربط مستودع GitHub الخاص بك
```

#### 2. إعدادات Render

- **Name**: `shopify-pos-sync`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Starter` (أو `Standard` للإنتاج)

#### 3. متغيرات البيئة (Environment Variables)

أضف المتغيرات التالية في Render Dashboard:

```env
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SCOPES=read_products,write_products,read_product_listings,write_product_listings,read_inventory,write_inventory
HOST=https://your-app-name.onrender.com
DATABASE_URL=file:./prod.db
NODE_ENV=production
```

#### 4. النشر

```bash
# Render سيقوم بالنشر تلقائياً عند push للـ main branch
# أو يمكنك النشر يدوياً من Dashboard
```

---

### الخيار 2: النشر على Railway

#### 1. إعداد المشروع على Railway

```bash
# 1. اذهب إلى https://railway.app
# 2. سجل الدخول أو أنشئ حساب جديد
# 3. اضغط على "New Project" → "Deploy from GitHub repo"
# 4. اختر المستودع الخاص بك
```

#### 2. إعدادات Railway

Railway سيكتشف الإعدادات تلقائياً من `railway.toml`

#### 3. متغيرات البيئة

أضف المتغيرات في Railway Dashboard → Variables:

```env
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SCOPES=read_products,write_products,read_product_listings,write_product_listings,read_inventory,write_inventory
HOST=https://your-app-name.up.railway.app
DATABASE_URL=file:./prod.db
NODE_ENV=production
```

---

### الخيار 3: النشر على Fly.io

#### 1. تثبيت Fly CLI

```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# أو استخدم Chocolatey
choco install flyctl
```

#### 2. تسجيل الدخول

```bash
flyctl auth login
```

#### 3. إعداد المشروع

```bash
# في مجلد المشروع
flyctl launch

# اتبع التعليمات:
# - App name: shopify-pos-sync
# - Region: اختر أقرب منطقة
# - PostgreSQL: No (نستخدم SQLite)
# - Redis: No
```

#### 4. إعداد متغيرات البيئة

```bash
flyctl secrets set SHOPIFY_API_KEY=your_api_key_here
flyctl secrets set SHOPIFY_API_SECRET=your_api_secret_here
flyctl secrets set SCOPES="read_products,write_products,read_product_listings,write_product_listings,read_inventory,write_inventory"
flyctl secrets set HOST=https://your-app-name.fly.dev
flyctl secrets set DATABASE_URL=file:./prod.db
flyctl secrets set NODE_ENV=production
```

#### 5. النشر

```bash
flyctl deploy
```

---

## 🔧 تحديث إعدادات Shopify App بعد النشر

### 1. تحديث App URLs

1. اذهب إلى [Shopify Partners Dashboard](https://partners.shopify.com/)
2. اختر التطبيق "POS Sync"
3. اذهب إلى **App setup** → **App URLs**
4. قم بتحديث:
   - **App URL**: `https://your-production-domain.com`
   - **Allowed redirection URLs**:
     - `https://your-production-domain.com/auth/callback`
     - `https://your-production-domain.com/auth/shopify/callback`

### 2. تحديث shopify.app.toml

قم بتحديث `shopify.app.pos-sync.toml`:

```toml
application_url = "https://your-production-domain.com"

[auth]
redirect_urls = [
  "https://your-production-domain.com/auth/callback",
  "https://your-production-domain.com/auth/shopify/callback"
]
```

### 3. رفع الإعدادات إلى Shopify

```bash
shopify app deploy
```

---

## 📦 النشر على Shopify App Store

### 1. التحقق من متطلبات App Store

- [ ] التطبيق يعمل بشكل صحيح في الإنتاج
- [ ] جميع الميزات تم اختبارها
- [ ] الوثائق جاهزة
- [ ] Privacy Policy و Terms of Service متوفرة
- [ ] Support email جاهز

### 2. إعداد App Listing

1. اذهب إلى [Shopify Partners Dashboard](https://partners.shopify.com/)
2. اختر التطبيق "POS Sync"
3. اذهب إلى **App listing**
4. املأ المعلومات التالية:

#### App Information
- **App name**: POS Sync
- **Short description**: مزامنة تلقائية للمنتجات والأقسام من نظام POS إلى Shopify
- **Long description**: 
  ```
  POS Sync هو تطبيق Shopify الذي يقوم بمزامنة المنتجات والأقسام تلقائياً من نظام POS الخاص بك إلى متجر Shopify.
  
  الميزات:
  - مزامنة تلقائية مجدولة (ساعة، يوم، أو مخصص)
  - مزامنة يدوية عند الطلب
  - تحويل الأقسام إلى Collections
  - مزامنة المنتجات مع الأسعار والصور والأوصاف
  - دعم API مشفر (AES-256-CBC)
  - سجل مفصل لجميع عمليات المزامنة
  ```

#### App Icon & Screenshots
- **App icon**: 1200x1200px PNG
- **Screenshots**: 
  - Dashboard screenshot
  - Settings page screenshot
  - Sync logs screenshot

#### Support Information
- **Support email**: your-support@email.com
- **Support URL**: `https://your-production-domain.com/support`
- **Privacy Policy URL**: `https://your-production-domain.com/privacy`
- **Terms of Service URL**: `https://your-production-domain.com/terms`

### 3. إرسال للتقييم

1. اذهب إلى **App listing** → **Submit for review**
2. املأ نموذج التقييم
3. أرفق معلومات إضافية إذا لزم الأمر
4. اضغط **Submit**

### 4. بعد الموافقة

- سيتم نشر التطبيق على Shopify App Store
- يمكن للمتاجر البحث عن التطبيق وتثبيته
- ستتلقى إشعارات عند تثبيت التطبيق

---

## ✅ التحقق من النشر

### 1. اختبار التطبيق في الإنتاج

1. افتح رابط التطبيق: `https://your-production-domain.com`
2. تأكد من أن الصفحة تعمل
3. جرب تثبيت التطبيق على متجر تجريبي

### 2. اختبار المزامنة

1. قم بتسجيل الدخول إلى التطبيق
2. اذهب إلى Settings وأدخل إعدادات POS API
3. اضغط Test Connection
4. اضغط Save Settings
5. اذهب إلى Sync واضغط Start Sync
6. تأكد من أن المزامنة تعمل بشكل صحيح

### 3. مراقبة الأخطاء

- تحقق من logs في منصة الاستضافة
- راقب الأخطاء في Shopify Partners Dashboard
- تحقق من Sync Logs في التطبيق

---

## 🔒 الأمان

### 1. متغيرات البيئة

- **لا تضع** `SHOPIFY_API_SECRET` في الكود
- استخدم Environment Variables دائماً
- لا ترفع ملف `.env` إلى GitHub

### 2. قاعدة البيانات

- استخدم قاعدة بيانات آمنة للإنتاج
- قم بعمل نسخ احتياطية منتظمة
- لا تضع معلومات حساسة في قاعدة البيانات

### 3. HTTPS

- تأكد من أن التطبيق يعمل على HTTPS فقط
- استخدم SSL certificate صالح

---

## 📞 الدعم

إذا واجهت أي مشاكل أثناء النشر:

1. تحقق من logs في منصة الاستضافة
2. تحقق من [Shopify App Development Docs](https://shopify.dev/docs/apps)
3. افتح issue على GitHub

---

## 🎉 تهانينا!

بعد اكتمال النشر، سيتمكن المتاجر من:
- البحث عن التطبيق في Shopify App Store
- تثبيت التطبيق بسهولة
- استخدام ميزات المزامنة التلقائية

**نصيحة**: راقب التطبيق بعد النشر للتأكد من أن كل شيء يعمل بشكل صحيح!
