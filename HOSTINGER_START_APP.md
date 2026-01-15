# 🚀 بدء التطبيق في Hostinger بعد Build

## ✅ Build تم بنجاح!

الـ Build تم بنجاح، لكن التطبيق لم يبدأ بعد.

---

## 🔧 الخطوات لبدء التطبيق

### 1️⃣ تحقق من Start Command

في Hostinger Dashboard → **Settings** → **Start Command**:

يجب أن يكون:
```
node server.js
```

**أو**

```
npm start
```

---

### 2️⃣ تحقق من Environment Variables

في Hostinger Dashboard → **Environment Variables**:

تأكد من وجود:
```
PORT=3000
HOST=https://shopify-pos.tek-part.com
NODE_ENV=production
SHOPIFY_API_KEY=your_key
SHOPIFY_API_SECRET=your_secret
SCOPES=read_products,write_products,read_product_listings,write_product_listings,read_inventory,write_inventory
DATABASE_URL=file:./prod.db
```

---

### 3️⃣ إعادة تشغيل التطبيق

في Hostinger Dashboard:
1. اضغط **Restart App**
2. انتظر 1-2 دقيقة
3. تحقق من Logs مرة أخرى

---

### 4️⃣ تحقق من Logs

بعد إعادة التشغيل، يجب أن ترى في Logs:

```
🚀 Server running on http://0.0.0.0:3000
📦 Environment: production
🔗 HOST: https://shopify-pos.tek-part.com
🌐 PORT: 3000
```

---

## 🎯 الخطوات السريعة

1. ✅ تحقق من Start Command: `node server.js`
2. ✅ تحقق من Environment Variables (خاصة `PORT` و `HOST`)
3. ✅ اضغط **Restart App** في Hostinger Dashboard
4. ✅ تحقق من Logs - يجب أن ترى "Server running"

---

## 📝 ملاحظات مهمة

### ⚠️ إذا لم تظهر رسالة "Server running":

1. **تحقق من Start Command:**
   - يجب أن يكون `node server.js` أو `npm start`
   - تأكد من أن `server.js` موجود في الجذر

2. **تحقق من Environment Variables:**
   - `PORT` يجب أن يكون موجوداً (أو اتركه فارغاً)
   - `HOST` يجب أن يكون محدثاً

3. **تحقق من Build:**
   - `build/server/index.js` يجب أن يكون موجوداً
   - `build/client/` يجب أن يكون موجوداً

---

## 🔍 خطوات التحقق

### ✅ تحقق 1: Start Command
- [ ] Start Command = `node server.js` أو `npm start`
- [ ] `server.js` موجود في الجذر

### ✅ تحقق 2: Environment Variables
- [ ] `PORT` موجود (أو اتركه فارغاً)
- [ ] `HOST` محدث: `https://shopify-pos.tek-part.com`
- [ ] جميع Environment Variables موجودة

### ✅ تحقق 3: Logs
- [ ] بعد Restart App، تظهر رسالة "Server running"
- [ ] لا توجد أخطاء في Logs

---

**بعد إعادة التشغيل، يجب أن يبدأ التطبيق! 🎉**
