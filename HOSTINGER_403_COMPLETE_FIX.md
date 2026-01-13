# 🔧 حل كامل لمشكلة 403 Forbidden في Hostinger

## المشكلة
بعد Build، يظهر في `public_html`:
- `server/`
- `client/`
- `.builds/`

لكن عند فتح الرابط يظهر **403 Forbidden**.

---

## ✅ الحل الكامل

### 1️⃣ تأكد من وجود server.js

`server.js` يجب أن يكون في **الجذر** (نفس مستوى `package.json`):

```
public_html/
├── server.js          ← يجب أن يكون هنا
├── package.json
├── build/
│   ├── server/
│   └── client/
└── ...
```

---

### 2️⃣ تحديث Start Command

في Hostinger Dashboard → **Settings** → **Start Command**:

```
node server.js
```

**أو**

```
npm start
```

---

### 3️⃣ إضافة PORT في Environment Variables

في Hostinger Dashboard → **Environment Variables**:

```
PORT=3000
```

**أو** اتركه فارغاً إذا كان Hostinger يعينه تلقائياً.

**تأكد من وجود جميع Environment Variables:**
```
SHOPIFY_API_KEY=your_key
SHOPIFY_API_SECRET=your_secret
SCOPES=read_products,write_products,read_product_listings,write_product_listings,read_inventory,write_inventory
HOST=https://pos-sync-shopify.tarawud.com
DATABASE_URL=file:./prod.db
NODE_ENV=production
PORT=3000
```

---

### 4️⃣ تحقق من Logs

في Hostinger Dashboard → **Logs**، يجب أن ترى:

```
🚀 Server running on http://0.0.0.0:3000
📦 Environment: production
🔗 HOST: https://pos-sync-shopify.tarawud.com
🌐 PORT: 3000
```

**إذا لم تر هذه الرسائل:**
- التطبيق لا يبدأ
- تحقق من Environment Variables
- تحقق من Start Command
- تحقق من أن `server.js` موجود في الجذر

---

### 5️⃣ إعادة تشغيل التطبيق

في Hostinger Dashboard:
1. اضغط **Restart App**
2. انتظر 1-2 دقيقة
3. تحقق من Logs مرة أخرى

---

## 🔍 خطوات التحقق الكاملة

### ✅ تحقق 1: الملفات
- [ ] `server.js` موجود في الجذر
- [ ] `package.json` يحتوي على `"start": "node server.js"`
- [ ] `build/server/` موجود
- [ ] `build/client/` موجود

### ✅ تحقق 2: Environment Variables
- [ ] `PORT` موجود (أو اتركه فارغاً)
- [ ] `HOST` محدث: `https://pos-sync-shopify.tarawud.com`
- [ ] جميع Environment Variables موجودة

### ✅ تحقق 3: Start Command
- [ ] `node server.js` (أو `npm start`)
- [ ] `server.js` موجود في الجذر

### ✅ تحقق 4: Logs
- [ ] التطبيق يبدأ بدون أخطاء
- [ ] تظهر رسالة "Server running"
- [ ] لا توجد أخطاء في Logs

---

## 🚨 إذا استمرت المشكلة

### الحل 1: تحقق من Logs بالتفصيل

في Hostinger Dashboard → **Logs**:
- ابحث عن أخطاء
- تحقق من أن التطبيق يبدأ
- تحقق من PORT
- تحقق من أن `server.js` يتم تنفيذه

### الحل 2: جرب Start Command مختلف

جرب في Hostinger → Start Command:

```
node server.js
```

**أو**

```
npm start
```

**أو**

```
PORT=3000 node server.js
```

### الحل 3: تحقق من Domain

في Hostinger Dashboard → **Domains**:
- تأكد من أن Domain مربوط
- تحقق من SSL Certificate
- تأكد من أن DNS records محدثة

### الحل 4: تحقق من Build

تأكد من أن Build تم بنجاح:
- `build/server/index.js` موجود
- `build/client/` موجود
- لا توجد أخطاء في Build

---

## 📝 ملاحظة مهمة جداً

**Shopify Apps لا يمكن الوصول إليها مباشرة من المتصفح!**

يجب الوصول إليها من خلال:
- **Shopify Admin** → Apps → POS Sync
- أو من خلال **Shopify OAuth flow**

**جرب الوصول من Shopify Admin بدلاً من الوصول المباشر!**

---

## 🎯 الخطوات السريعة (مرة أخرى)

1. ✅ تأكد من أن `server.js` موجود في الجذر
2. ✅ أضف `PORT=3000` في Environment Variables (أو اتركه فارغاً)
3. ✅ حدث Start Command إلى `node server.js`
4. ✅ أعد تشغيل التطبيق
5. ✅ تحقق من Logs
6. ✅ جرب الوصول من Shopify Admin (ليس مباشرة)

---

## 📞 إذا استمرت المشكلة

1. **تحقق من Logs بالتفصيل** - ابحث عن أي أخطاء
2. **تحقق من Environment Variables** - تأكد من أن جميعها موجودة
3. **تحقق من Start Command** - تأكد من أنه صحيح
4. **تحقق من Domain** - تأكد من أنه مربوط
5. **اتصل بدعم Hostinger** - قد تكون المشكلة من جانبهم

---

**بعد هذه الخطوات، يجب أن يعمل التطبيق! 🎉**
