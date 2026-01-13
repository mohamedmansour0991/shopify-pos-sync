# 🚀 دليل النشر على Hostinger Node.js App

## 📋 متطلبات

- حساب Hostinger مع Node.js App متاح
- Node.js 20 أو أحدث
- وصول إلى cPanel أو Hostinger Control Panel

---

## 🚀 خطوات النشر على Hostinger

### 1️⃣ إعداد Node.js App في Hostinger

#### الخطوة 1: إنشاء Node.js App
1. سجل الدخول إلى [Hostinger Control Panel](https://hpanel.hostinger.com/)
2. اذهب إلى **Websites** → **Node.js**
3. اضغط **Create Node.js App**
4. املأ المعلومات:
   - **App Name**: `shopify-pos-sync`
   - **Node.js Version**: `20.x` أو أحدث
   - **App Mode**: `Production`
   - **Start Command**: `npm start`
   - **Port**: اتركه فارغاً (سيتم تعيينه تلقائياً)

#### الخطوة 2: رفع الملفات
1. في Node.js App Dashboard، اضغط **Open File Manager**
2. ارفع جميع ملفات المشروع (أو استخدم Git إذا كان متاحاً)

**أو استخدم Git (موصى به):**

```bash
# في Terminal في Hostinger
cd ~/shopify-pos-sync
git clone https://github.com/yourusername/shopify-pos-sync.git .
```

---

### 2️⃣ تثبيت Dependencies

#### في Hostinger Terminal:

```bash
# انتقل إلى مجلد التطبيق
cd ~/shopify-pos-sync

# تثبيت Dependencies
npm install

# بناء التطبيق
npm run build

# إعداد قاعدة البيانات
npm run setup
```

---

### 3️⃣ إعداد Environment Variables

في Hostinger Node.js App Dashboard:

1. اذهب إلى **Environment Variables**
2. أضف المتغيرات التالية:

```env
SHOPIFY_API_KEY=your_shopify_api_key_here
SHOPIFY_API_SECRET=your_shopify_api_secret_here
SCOPES=read_products,write_products,read_product_listings,write_product_listings,read_inventory,write_inventory
HOST=https://your-domain.com
DATABASE_URL=file:./prod.db
NODE_ENV=production
PORT=3000
```

**ملاحظة**: استبدل `your-domain.com` بالدومين الخاص بك من Hostinger.

---

### 4️⃣ تحديث package.json (إذا لزم الأمر)

تأكد من أن `start` script موجود:

```json
{
  "scripts": {
    "start": "remix-serve ./build/server/index.js"
  }
}
```

---

### 5️⃣ إعداد قاعدة البيانات

```bash
# في Terminal
cd ~/shopify-pos-sync
npm run generate  # توليد Prisma Client
npm run db:push    # إنشاء قاعدة البيانات
```

---

### 6️⃣ تحديث إعدادات Shopify App

1. اذهب إلى [Shopify Partners Dashboard](https://partners.shopify.com/)
2. اختر التطبيق "POS Sync"
3. اذهب إلى **App setup** → **App URLs**
4. قم بتحديث:
   - **App URL**: `https://your-domain.com`
   - **Allowed redirection URLs**:
     - `https://your-domain.com/auth/callback`
     - `https://your-domain.com/auth/shopify/callback`

---

### 7️⃣ تحديث shopify.app.pos-sync.toml

قم بتحديث الملف:

```toml
client_id = "your_client_id"
name = "POS Sync"
application_url = "https://your-domain.com"
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
  "https://your-domain.com/auth/callback",
  "https://your-domain.com/auth/shopify/callback"
]
```

---

### 8️⃣ رفع الإعدادات إلى Shopify

```bash
# في Terminal
cd ~/shopify-pos-sync
shopify app deploy
```

---

### 9️⃣ تشغيل التطبيق

في Hostinger Node.js App Dashboard:

1. اضغط **Restart App**
2. انتظر حتى يبدأ التطبيق
3. تحقق من Logs للتأكد من عدم وجود أخطاء

---

## 🔧 إعدادات إضافية

### SSL Certificate

1. في Hostinger Control Panel، اذهب إلى **SSL**
2. قم بتفعيل SSL Certificate (Let's Encrypt مجاني)
3. تأكد من أن HTTPS يعمل

### Domain Configuration

1. في Node.js App Dashboard، اذهب إلى **Domains**
2. أضف الدومين الخاص بك
3. تأكد من أن DNS records محدثة

---

## 📝 ملفات مهمة للنشر

### .htaccess (إذا كان مطلوباً)

إذا كان Hostinger يستخدم Apache، أنشئ ملف `.htaccess`:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.js [L]
```

### package.json

تأكد من وجود:

```json
{
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "start": "remix-serve ./build/server/index.js",
    "build": "remix vite:build"
  }
}
```

---

## ✅ التحقق من النشر

### 1. اختبار التطبيق

1. افتح: `https://your-domain.com`
2. تأكد من أن الصفحة تعمل
3. جرب تثبيت التطبيق على متجر تجريبي

### 2. مراقبة Logs

في Hostinger Node.js App Dashboard:
- اذهب إلى **Logs**
- راقب الأخطاء والتحذيرات
- تحقق من أن التطبيق يعمل بشكل صحيح

---

## 🔄 تحديث التطبيق

عند تحديث الكود:

```bash
# في Terminal
cd ~/shopify-pos-sync

# سحب التحديثات (إذا كنت تستخدم Git)
git pull

# تثبيت Dependencies الجديدة
npm install

# بناء التطبيق
npm run build

# إعادة تشغيل التطبيق
# من Hostinger Dashboard → Restart App
```

---

## ⚠️ ملاحظات مهمة

1. **Port**: Hostinger سيعين Port تلقائياً، لا تحتاج لتحديده
2. **Database**: SQLite سيعمل بشكل جيد على Hostinger
3. **File Permissions**: تأكد من أن التطبيق لديه صلاحيات الكتابة لملف قاعدة البيانات
4. **Memory**: تأكد من أن خطة الاستضافة تدعم Node.js Apps
5. **HTTPS**: تأكد من تفعيل SSL Certificate

---

## 🐛 حل المشاكل الشائعة

### التطبيق لا يبدأ

1. تحقق من Logs في Hostinger Dashboard
2. تأكد من أن جميع Environment Variables موجودة
3. تحقق من أن `npm start` يعمل محلياً

### خطأ في قاعدة البيانات

1. تأكد من أن Prisma Client تم توليده: `npm run generate`
2. تحقق من صلاحيات الملفات
3. تأكد من أن `DATABASE_URL` صحيح

### خطأ في Authentication

1. تحقق من أن App URLs محدثة في Shopify Partners Dashboard
2. تأكد من أن `SHOPIFY_API_KEY` و `SHOPIFY_API_SECRET` صحيحة
3. تحقق من Redirect URLs

---

## 📞 الدعم

إذا واجهت مشاكل:

1. تحقق من [Hostinger Documentation](https://support.hostinger.com/)
2. تحقق من Logs في Hostinger Dashboard
3. تأكد من أن جميع الخطوات تمت بشكل صحيح

---

## 🎉 تهانينا!

بعد اكتمال النشر على Hostinger، سيتمكن المتاجر من:
- تثبيت التطبيق من Shopify App Store
- استخدام ميزات المزامنة التلقائية
- إدارة المنتجات والأقسام بسهولة

**نصيحة**: راقب التطبيق بعد النشر للتأكد من أن كل شيء يعمل بشكل صحيح!
