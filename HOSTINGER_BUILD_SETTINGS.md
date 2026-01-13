# ⚙️ إعدادات Build لـ Hostinger

## Build Settings

### Build Command
```
npm install && npm run build && npm run generate
```

### Output Directory
```
.
```
**أو اتركه فارغاً** - لأن Remix يبني في `build/` داخل المشروع

### Start Command
```
npm start
```

---

## ملاحظات مهمة

1. **Output Directory**: اتركه فارغاً أو ضع `.` (النقطة)
2. **Build Command**: يجب أن يتضمن `npm run generate` لتوليد Prisma Client
3. **Start Command**: `npm start` سيستخدم `remix-serve ./build/server/index.js`

---

## إذا استمرت المشكلة

جرب تغيير **Output Directory** إلى:
- `build` (بدون نقطة)
- أو اتركه فارغاً تماماً
