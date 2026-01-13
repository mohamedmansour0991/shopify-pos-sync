# Environment Variables للإنتاج

## المتغيرات المطلوبة

أضف هذه المتغيرات في منصة الاستضافة (Render/Railway/Fly.io):

```env
SHOPIFY_API_KEY=your_shopify_api_key_here
SHOPIFY_API_SECRET=your_shopify_api_secret_here
SCOPES=read_products,write_products,read_product_listings,write_product_listings,read_inventory,write_inventory
HOST=https://your-production-domain.com
DATABASE_URL=file:./prod.db
NODE_ENV=production
```

## كيفية الحصول على القيم

### SHOPIFY_API_KEY و SHOPIFY_API_SECRET
1. اذهب إلى https://partners.shopify.com/
2. اختر التطبيق "POS Sync"
3. اذهب إلى **App setup** → **Client credentials**
4. انسخ **Client ID** و **Client secret**

### HOST
- بعد النشر على Render: `https://your-app-name.onrender.com`
- بعد النشر على Railway: `https://your-app-name.up.railway.app`
- بعد النشر على Fly.io: `https://your-app-name.fly.dev`

### SCOPES
- هذه القيمة ثابتة، انسخها كما هي

### DATABASE_URL
- للإنتاج: `file:./prod.db`
- SQLite سينشئ ملف قاعدة البيانات تلقائياً

---

## ⚠️ تحذيرات أمنية

- **لا تضع** هذه القيم في الكود
- **لا ترفع** ملف `.env` إلى GitHub
- استخدم Environment Variables في منصة الاستضافة فقط
- **SHOPIFY_API_SECRET** حساس جداً - لا تشاركه أبداً
