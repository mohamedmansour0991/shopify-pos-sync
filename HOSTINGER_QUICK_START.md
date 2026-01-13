# ⚡ دليل سريع - النشر على Hostinger

## 🚀 الخطوات السريعة (5 دقائق)

### 1️⃣ إنشاء Node.js App

1. اذهب إلى [Hostinger hPanel](https://hpanel.hostinger.com/)
2. **Websites** → **Node.js** → **Create Node.js App**
3. املأ:
   - **App Name**: `shopify-pos-sync`
   - **Node.js Version**: `20.x`
   - **Start Command**: `npm start`

### 2️⃣ رفع الملفات

**خيار 1: Git (الأسهل)**
```bash
cd ~/shopify-pos-sync
git clone https://github.com/yourusername/shopify-pos-sync.git .
```

**خيار 2: File Manager**
- ارفع جميع الملفات عبر File Manager

### 3️⃣ تثبيت وبناء

في Terminal:
```bash
npm install
npm run build
npm run setup
```

### 4️⃣ Environment Variables

في Hostinger Dashboard → **Environment Variables**:

```
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=read_products,write_products,read_product_listings,write_product_listings,read_inventory,write_inventory
HOST=https://your-domain.com
DATABASE_URL=file:./prod.db
NODE_ENV=production
```

### 5️⃣ تحديث Shopify

1. [Partners Dashboard](https://partners.shopify.com/) → App → **App setup** → **App URLs**
2. **App URL**: `https://your-domain.com`
3. **Redirect URLs**:
   - `https://your-domain.com/auth/callback`
   - `https://your-domain.com/auth/shopify/callback`

### 6️⃣ Deploy

```bash
shopify app deploy
```

### 7️⃣ Restart

في Hostinger Dashboard → **Restart App**

---

## ✅ جاهز!

افتح `https://your-domain.com` واختبر التطبيق! 🎉

---

## 📝 ملاحظات

- **Port**: Hostinger سيعينه تلقائياً
- **Database**: SQLite سيعمل تلقائياً
- **HTTPS**: تأكد من تفعيل SSL في Hostinger

---

## 🐛 مشاكل شائعة

**التطبيق لا يبدأ:**
- تحقق من Logs في Hostinger Dashboard
- تأكد من Environment Variables

**خطأ في قاعدة البيانات:**
- شغّل: `npm run setup`
- تحقق من صلاحيات الملفات

---

**للمزيد من التفاصيل، راجع `DEPLOYMENT_HOSTINGER.md`**
