# 🔧 حل مشكلة 403 Forbidden في Hostinger

## ✅ الخطوات السريعة

### 1️⃣ أضف PORT في Environment Variables

في Hostinger Dashboard → **Environment Variables**:

```
PORT=3000
```

**أو** اتركه فارغاً إذا كان Hostinger يعينه تلقائياً.

---

### 2️⃣ تحقق من Start Command

في Hostinger Dashboard → **Settings** → **Start Command**:

```
npm start
```

**أو**

```
remix-serve ./build/server/index.js
```

---

### 3️⃣ تحقق من Logs

في Hostinger Dashboard → **Logs**، يجب أن ترى:

```
🚀 Server running...
```

**إذا لم تر هذه الرسالة:**
- التطبيق لا يبدأ
- تحقق من Environment Variables
- تحقق من Start Command

---

### 4️⃣ إعادة تشغيل التطبيق

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
- [ ] `npm start` (أو `remix-serve ./build/server/index.js`)
- [ ] `package.json` يحتوي على `"start": "remix-serve ./build/server/index.js"`

### ✅ تحقق 4: Build
- [ ] `build/server/` موجود
- [ ] `build/client/` موجود
- [ ] لا توجد أخطاء في Build

---

## 🚨 إذا استمرت المشكلة

### الحل 1: تحقق من PORT

جرب إضافة `PORT` في Environment Variables:
```
PORT=3000
```

أو اتركه فارغاً تماماً.

### الحل 2: تحقق من Logs

في Hostinger Dashboard → **Logs**:
- ابحث عن أخطاء
- تحقق من أن التطبيق يبدأ
- تحقق من PORT

### الحل 3: تحقق من Domain

في Hostinger Dashboard → **Domains**:
- تأكد من أن Domain مربوط
- تحقق من SSL Certificate

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
2. ✅ تأكد من Start Command: `npm start`
3. ✅ أعد تشغيل التطبيق
4. ✅ تحقق من Logs
5. ✅ جرب الوصول من Shopify Admin (ليس مباشرة)

---

**بعد هذه الخطوات، يجب أن يعمل التطبيق! 🎉**
