# اختبار Route `/auth/login`

## المشكلة
- Build output يظهر `auth.login-c1RSdsmM.js` - Route موجود في build ✓
- PM2 logs لا تظهر أخطاء - Server يعمل ✓
- لكن `/auth/login` يعطي 404

## الحل - اختبار مباشر

### 1. اختبار من Node.js مباشرة (تجاوز Apache/PHP)
```bash
# على السيرفر
curl -I http://localhost:3000/auth/login
# يجب أن يعيد HTTP 200 أو 302 (ليس 404)
```

### 2. إذا عمل من localhost:3000 لكن لا يعمل من public domain:
المشكلة في `.htaccess` أو `index.php`

### 3. إذا لم يعمل من localhost:3000:
المشكلة في Remix routing

## الحل المحتمل

في Remix file-based routing:
- `auth.login.tsx` = `/auth/login` ✓
- لكن `auth.$.tsx` (catch-all) قد يلتقط `/auth/login` قبل `auth.login.tsx`

**الحل**: حذف أو تعديل `auth.$.tsx` لاستثناء `/auth/login`
