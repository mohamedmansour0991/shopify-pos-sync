# دليل سريع: تشغيل التطبيق في وضع التطوير

## الخطوات السريعة

### 1. إعداد المتغيرات البيئية

أنشئ ملف `.env` في المجلد الرئيسي:

```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=read_products,write_products,read_product_listings,write_product_listings,read_inventory,write_inventory
HOST=http://localhost:3001
DATABASE_URL=file:./dev.db
```

### 2. تثبيت الحزم وإعداد قاعدة البيانات

```bash
npm install
npm run setup
```

### 3. تشغيل التطبيق

```bash
npm run dev:shopify
```

سيتم فتح المتصفح تلقائياً لعملية التثبيت على المتجر المحدد في `shopify.app.toml`

## تثبيت على متجر ثاني

### الطريقة 1: تغيير المتجر في shopify.app.toml

1. افتح `shopify.app.toml`
2. غيّر `dev_store_url` إلى متجرك الثاني:
   ```toml
   dev_store_url = "your-second-store.myshopify.com"
   ```
3. شغّل:
   ```bash
   npm run dev:shopify
   ```

### الطريقة 2: استخدام الأمر مباشرة

```bash
shopify app dev --store=your-second-store.myshopify.com
```

## ملاحظات مهمة

- ✅ التطبيق يدعم تثبيت على متاجر متعددة
- ✅ كل متجر له إعدادات POS API منفصلة
- ✅ استخدم متاجر تطوير (Development Stores) للاختبار
- ✅ تأكد من تحديث Shopify CLI: `npm install -g @shopify/cli`

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| Port في الاستخدام | غيّر المنفذ في `package.json` |
| Database not found | شغّل `npm run setup` |
| App not found | تحقق من `SHOPIFY_API_KEY` و `SHOPIFY_API_SECRET` |
