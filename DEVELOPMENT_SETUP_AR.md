# دليل تشغيل التطبيق في وضع التطوير وتثبيته على متاجر متعددة

## المتطلبات الأساسية

1. **Node.js** إصدار 20 أو أحدث
2. **Shopify CLI** مثبت على جهازك
3. **حساب Shopify Partner** مع تطبيق تم إنشاؤه
4. **متجر تطوير Shopify** (Development Store)

## خطوات الإعداد

### 1. تثبيت المتطلبات

```bash
# تثبيت الحزم
npm install

# إعداد قاعدة البيانات
npm run setup
```

### 2. إنشاء ملف `.env`

أنشئ ملف `.env` في المجلد الرئيسي للمشروع:

```env
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SCOPES=read_products,write_products,read_product_listings,write_product_listings,read_inventory,write_inventory
HOST=http://localhost:3001
DATABASE_URL=file:./dev.db
```

**ملاحظة:** يمكنك الحصول على `SHOPIFY_API_KEY` و `SHOPIFY_API_SECRET` من:
- Shopify Partners Dashboard → Apps → تطبيقك → App setup

### 3. تشغيل التطبيق في وضع التطوير

#### الطريقة الأولى: استخدام Shopify CLI (موصى بها)

```bash
npm run dev:shopify
```

هذا الأمر سيقوم بـ:
- تشغيل خادم التطوير على المنفذ 3001
- إنشاء نفق (tunnel) آمن للوصول إلى التطبيق
- فتح نافذة المتصفح تلقائياً لعملية التثبيت

#### الطريقة الثانية: تشغيل يدوي

```bash
# في نافذة terminal الأولى
npm run dev

# في نافذة terminal ثانية
shopify app dev
```

### 4. تثبيت التطبيق على متجر ثاني

عند تشغيل `shopify app dev`، ستحصل على خيارات:

#### أ) تثبيت على متجر افتراضي (من shopify.app.toml)

المتجر الافتراضي محدد في ملف `shopify.app.toml`:
```toml
dev_store_url = "tarawud.myshopify.com"
```

#### ب) تثبيت على متجر مختلف

عند تشغيل `shopify app dev`، يمكنك:

1. **تغيير المتجر في shopify.app.toml:**
   ```toml
   dev_store_url = "your-second-store.myshopify.com"
   ```

2. **أو استخدام الأمر مع تحديد المتجر:**
   ```bash
   shopify app dev --store=your-second-store.myshopify.com
   ```

3. **أو اختيار المتجر عند التشغيل:**
   - سيظهر لك قائمة بالمتاجر المتاحة
   - اختر المتجر الذي تريد التثبيت عليه

### 5. عملية التثبيت

بعد تشغيل `shopify app dev`:

1. سيتم فتح المتصفح تلقائياً
2. ستحتاج إلى تسجيل الدخول إلى متجر Shopify
3. الموافقة على الصلاحيات المطلوبة
4. سيتم تثبيت التطبيق تلقائياً

## تثبيت التطبيق على متاجر متعددة

التطبيق يدعم تثبيت على متاجر متعددة. كل متجر له:
- إعدادات POS API منفصلة
- سجلات مزامنة منفصلة
- جدولة مزامنة مستقلة

### لتثبيت على متجر ثاني:

1. **تأكد من أن التطبيق يعمل:**
   ```bash
   npm run dev:shopify
   ```

2. **في نافذة terminal جديدة، قم بتشغيل:**
   ```bash
   shopify app dev --store=second-store.myshopify.com
   ```

3. **أو قم بتغيير `dev_store_url` في `shopify.app.toml` ثم أعد التشغيل**

## استكشاف الأخطاء

### خطأ: "App not found"
- تأكد من أن `SHOPIFY_API_KEY` و `SHOPIFY_API_SECRET` صحيحة
- تأكد من أن التطبيق موجود في Shopify Partners Dashboard

### خطأ: "Port already in use"
- قم بتغيير المنفذ في `package.json`:
  ```json
  "dev": "remix vite:dev --port 3002"
  ```

### خطأ: "Database not found"
- قم بتشغيل:
  ```bash
  npm run setup
  ```

### التطبيق لا يفتح في المتصفح
- تأكد من أن Shopify CLI محدث:
  ```bash
  shopify version
  npm install -g @shopify/cli @shopify/theme
  ```

## نصائح مهمة

1. **استخدم متاجر تطوير منفصلة** لكل متجر تريد اختباره
2. **احفظ إعدادات POS API** لكل متجر بشكل منفصل في صفحة Settings
3. **راقب سجلات المزامنة** في صفحة Logs لكل متجر
4. **استخدم `npm run dev:shopify`** بدلاً من `npm run dev` للوصول الكامل لـ Shopify CLI

## الأوامر المفيدة

```bash
# تشغيل التطبيق في وضع التطوير
npm run dev:shopify

# إعداد قاعدة البيانات
npm run setup

# بناء التطبيق
npm run build

# فحص الأخطاء
npm run typecheck

# فحص الكود
npm run lint
```

## الملفات المهمة

- `shopify.app.toml` - إعدادات تطبيق Shopify
- `.env` - متغيرات البيئة (لا ترفعه إلى Git!)
- `prisma/schema.prisma` - هيكل قاعدة البيانات
- `app/shopify.server.ts` - إعدادات Shopify App

## الدعم

إذا واجهت أي مشاكل:
1. تحقق من سجلات Terminal
2. تحقق من Shopify Partners Dashboard
3. تأكد من أن جميع المتطلبات مثبتة بشكل صحيح
