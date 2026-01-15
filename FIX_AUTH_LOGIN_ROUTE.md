# إصلاح Route `/auth/login` - خطوات التنفيذ

## المشكلة
- `/auth/login` يعطي 404 Not Found
- Build output لا يزال يشير إلى `auth.login/route.tsx` (ملف محذوف)
- PM2 logs تظهر FormData errors

## السبب
التغييرات موجودة محلياً فقط ولم يتم رفعها إلى السيرفر.

## الحل

### 1. رفع التغييرات إلى Git
```bash
git add app/routes/auth.login.tsx
git add app/routes/_index.tsx
git rm -r app/routes/auth.login/route.tsx  # إذا كان الملف لا يزال موجوداً في git
git commit -m "Fix: Change auth.login/route.tsx to auth.login.tsx and fix FormData parsing"
git push
```

### 2. على السيرفر - Pull التغييرات
```bash
cd ~/public_html/shopify-pos.tek-part.com
git pull
```

### 3. مسح Build Cache
```bash
# حذف build directory
rm -rf build
rm -rf node_modules/.vite
```

### 4. إعادة البناء
```bash
npm run build
```

### 5. إعادة تشغيل PM2
```bash
pm2 restart server
# أو
pm2 delete server
pm2 start server.js --name shopify-pos-sync
```

### 6. التحقق
```bash
# اختبار Route
curl -I https://shopify-pos.tek-part.com/auth/login

# يجب أن يعيد HTTP 200 أو 302 (ليس 404)

# التحقق من PM2 logs
pm2 logs server --lines 30
# يجب ألا تظهر FormData errors
```

## ملاحظات
- `auth.login.tsx` = `/auth/login` في Remix file-based routing
- `auth.login.tsx` له أولوية أعلى من `auth.$.tsx` (catch-all route)
- إذا استمر 404، تحقق من أن `.htaccess` يعمل بشكل صحيح
