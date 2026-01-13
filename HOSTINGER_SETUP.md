# ⚡ إعداد سريع لـ Hostinger Node.js App

## 📦 الخطوات السريعة

### 1. إنشاء Node.js App في Hostinger

```
1. اذهب إلى hpanel.hostinger.com
2. Websites → Node.js → Create Node.js App
3. App Name: shopify-pos-sync
4. Node.js Version: 20.x
5. Start Command: npm start
```

### 2. رفع الملفات

**الطريقة 1: Git (موصى به)**
```bash
cd ~/shopify-pos-sync
git clone https://github.com/yourusername/shopify-pos-sync.git .
```

**الطريقة 2: File Manager**
- ارفع جميع الملفات عبر File Manager في Hostinger

### 3. تثبيت وبناء

```bash
npm install
npm run build
npm run setup
```

### 4. Environment Variables

في Hostinger Dashboard → Environment Variables:

```
SHOPIFY_API_KEY=your_key
SHOPIFY_API_SECRET=your_secret
SCOPES=read_products,write_products,read_product_listings,write_product_listings,read_inventory,write_inventory
HOST=https://your-domain.com
DATABASE_URL=file:./prod.db
NODE_ENV=production
```

### 5. تحديث Shopify

1. Partners Dashboard → App URLs
2. App URL: `https://your-domain.com`
3. Redirect URLs:
   - `https://your-domain.com/auth/callback`
   - `https://your-domain.com/auth/shopify/callback`

### 6. Deploy

```bash
shopify app deploy
```

### 7. Restart App

في Hostinger Dashboard → Restart App

---

## ✅ جاهز!

التطبيق الآن يعمل على Hostinger! 🎉
