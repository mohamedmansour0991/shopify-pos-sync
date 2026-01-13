# 🔧 حل نهائي لمشكلة 403 Forbidden في Hostinger

## المشكلة
بعد Build، يظهر في `public_html`:
- `server/`
- `client/`
- `.builds/`

لكن عند فتح الرابط يظهر **403 Forbidden**.

---

## ✅ الحل

### 1️⃣ تحديث Start Command

في Hostinger Dashboard → **Settings** → **Start Command**:

```
node server.js
```

**أو** إذا كان `server.js` غير موجود في الجذر:

```
node ./server.js
```

---

### 2️⃣ إضافة PORT في Environment Variables

في Hostinger Dashboard → **Environment Variables**:

```
PORT=3000
```

**أو** اتركه فارغاً إذا كان Hostinger يعينه تلقائياً.

---

### 3️⃣ تحقق من موقع server.js

`server.js` يجب أن يكون في **الجذر** (نفس مستوى `package.json`):

```
public_html/
├── server.js          ← هنا
├── package.json
├── build/
│   ├── server/
│   └── client/
└── ...
```

---

### 4️⃣ تحقق من Logs

في Hostinger Dashboard → **Logs**، يجب أن ترى:

```
🚀 Server running on http://0.0.0.0:3000
📦 Environment: production
🔗 HOST: https://pos-sync-shopify.tarawud.com
```

**إذا لم تر هذه الرسائل:**
- التطبيق لا يبدأ
- تحقق من Environment Variables
- تحقق من Start Command

---

### 5️⃣ إعادة تشغيل التطبيق

في Hostinger Dashboard:
1. اضغط **Restart App**
2. انتظر 1-2 دقيقة
3. تحقق من Logs مرة أخرى

---

## 🔍 خطوات التحقق

### ✅ تحقق 1: Logs
- [ ] التطبيق يبدأ بدون أخطاء
- [ ] تظهر رسالة "Server running"
- [ ] لا توجد أخطاء في Logs

### ✅ تحقق 2: Environment Variables
- [ ] `PORT` موجود (أو اتركه فارغاً)
- [ ] `HOST` محدث: `https://pos-sync-shopify.tarawud.com`
- [ ] جميع Environment Variables موجودة

### ✅ تحقق 3: Start Command
- [ ] `node server.js` (أو `npm start`)
- [ ] `server.js` موجود في الجذر

### ✅ تحقق 4: Build
- [ ] `build/server/` موجود
- [ ] `build/client/` موجود
- [ ] لا توجد أخطاء في Build

---

## 🚨 إذا استمرت المشكلة

### الحل البديل 1: استخدام remix-serve

في `package.json`:
```json
{
  "scripts": {
    "start": "remix-serve ./build/server/index.js"
  }
}
```

في Hostinger → Start Command:
```
npm start
```

### الحل البديل 2: تحقق من Port

جرب إضافة `PORT` في Environment Variables:
```
PORT=3000
```

أو اتركه فارغاً تماماً.

---

## 📝 ملاحظة مهمة

**Shopify Apps لا يمكن الوصول إليها مباشرة من المتصفح!**

يجب الوصول إليها من خلال:
- **Shopify Admin** → Apps → POS Sync
- أو من خلال **Shopify OAuth flow**

**جرب الوصول من Shopify Admin بدلاً من الوصول المباشر!**

---

## 🎯 الخطوات السريعة

1. ✅ أضف `PORT=3000` في Environment Variables (أو اتركه فارغاً)
2. ✅ تأكد من أن `server.js` موجود في الجذر
3. ✅ حدث Start Command إلى `node server.js`
4. ✅ أعد تشغيل التطبيق
5. ✅ تحقق من Logs
6. ✅ جرب الوصول من Shopify Admin (ليس مباشرة)

---

**بعد هذه الخطوات، يجب أن يعمل التطبيق! 🎉**
