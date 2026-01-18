# دليل النشر عبر SSH و PM2

## الخطوات السريعة

### 1. الاتصال عبر SSH
```bash
ssh your-username@your-server
cd ~/public_html/theonesystemco.tek-part.com
```

### 2. سحب آخر التحديثات
```bash
git pull origin main
```

### 3. تثبيت الحزم
```bash
npm install
```

### 4. إنشاء Prisma Client
```bash
npm run generate
```

### 5. بناء التطبيق
```bash
npm run build
```

### 6. إعداد ملف البيئة (.env)
```bash
nano .env
```

أضف المتغيرات التالية:
```env
NODE_ENV=production
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
HOST=https://theonesystemco.tek-part.com
SCOPES=read_products,write_products,read_product_listings,write_product_listings,read_inventory,write_inventory
DATABASE_URL=file:./prisma/dev.db
PORT=3000
```

احفظ الملف (Ctrl+X ثم Y ثم Enter)

### 7. إعداد قاعدة البيانات
```bash
# إنشاء ملف قاعدة البيانات
touch prisma/dev.db
chmod 666 prisma/dev.db

# تشغيل migrations
npm run db:push
```

### 8. تثبيت PM2 (إذا لم يكن مثبتاً)
```bash
npm install -g pm2
```

### 9. تشغيل التطبيق باستخدام PM2

**الطريقة الأولى: استخدام ملف ecosystem.config.js (موصى بها)**
```bash
# إيقاف التطبيق القديم إن وجد
pm2 delete shopify-pos-sync 2>/dev/null || true

# تشغيل التطبيق باستخدام ملف الإعداد
pm2 start ecosystem.config.js

# حفظ إعدادات PM2
pm2 save

# إعداد PM2 للبدء تلقائياً عند إعادة تشغيل السيرفر
pm2 startup
# اتبع التعليمات التي تظهر
```

**الطريقة الثانية: تشغيل مباشر (server.js يقرأ .env تلقائياً)**
```bash
# إيقاف التطبيق القديم إن وجد
pm2 delete shopify-pos-sync 2>/dev/null || true

# تشغيل التطبيق مباشرة
pm2 start server.js --name shopify-pos-sync

# حفظ إعدادات PM2
pm2 save

# إعداد PM2 للبدء تلقائياً عند إعادة تشغيل السيرفر
pm2 startup
# اتبع التعليمات التي تظهر
```

### 10. التحقق من الحالة
```bash
# عرض حالة التطبيق
pm2 status

# عرض السجلات
pm2 logs shopify-pos-sync --lines 50
```

## أوامر PM2 المهمة

```bash
# إعادة تشغيل التطبيق
pm2 restart shopify-pos-sync

# إيقاف التطبيق
pm2 stop shopify-pos-sync

# عرض السجلات
pm2 logs shopify-pos-sync

# متابعة السجلات مباشرة
pm2 logs shopify-pos-sync --lines 0

# عرض معلومات التطبيق
pm2 info shopify-pos-sync

# مراقبة الأداء
pm2 monit
```

## إعداد Reverse Proxy

### إذا كان Apache مثبتاً مع mod_proxy:

1. تأكد من تفعيل mod_proxy:
```bash
# في معظم الخوادم، يكون مفعلاً بالفعل
```

2. تحديث ملف `.htaccess`:
الملف موجود في المشروع ويحتوي على إعدادات reverse proxy

3. تأكد من أن البورت في `.htaccess` يطابق البورت في `.env`:
```bash
# في .htaccess يجب أن يكون:
# RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# في .env يجب أن يكون:
# PORT=3000
```

## حل مشكلة 403 Forbidden

### 1. التحقق من أن التطبيق يعمل
```bash
pm2 status
# يجب أن يظهر "online" بجانب shopify-pos-sync
```

### 2. التحقق من السجلات
```bash
pm2 logs shopify-pos-sync --lines 100
# ابحث عن أخطاء في السجلات
```

### 3. التحقق من الصلاحيات
```bash
chmod 755 ~/public_html/theonesystemco.tek-part.com
chmod +x ~/public_html/theonesystemco.tek-part.com/server.js
chmod 666 ~/public_html/theonesystemco.tek-part.com/prisma/dev.db
```

### 4. التحقق من البورت
```bash
# تحقق من البورت المستخدم
pm2 logs shopify-pos-sync | grep PORT

# تأكد من تطابق البورت في .htaccess و .env
grep PORT .env
grep localhost .htaccess
```

### 5. التحقق من mod_proxy
```bash
# تحقق من أن mod_proxy مفعل
apache2ctl -M | grep proxy
# أو
httpd -M | grep proxy
```

إذا لم يكن مفعلاً، اتصل بالدعم الفني لتفعيله.

## تحديث التطبيق

عند وجود تحديثات جديدة:

```bash
# 1. سحب التحديثات
git pull origin main

# 2. تثبيت الحزم الجديدة (إن وجدت)
npm install

# 3. إعادة بناء التطبيق
npm run build

# 4. إعادة تشغيل PM2
pm2 restart shopify-pos-sync

# 5. التحقق من السجلات
pm2 logs shopify-pos-sync --lines 20
```

## المشاكل الشائعة

### المشكلة: "Cannot find module './build/server/index.js'"
**الحل**: 
```bash
npm run build
```

### المشكلة: "Prisma Client not generated"
**الحل**:
```bash
npm run generate
```

### المشكلة: "Database locked"
**الحل**:
```bash
# تأكد من أن قاعدة البيانات قابلة للكتابة
chmod 666 prisma/dev.db

# تأكد من أن تطبيق واحد فقط يعمل
pm2 list
```

### المشكلة: "Port already in use"
**الحل**:
```bash
# ابحث عن العملية التي تستخدم البورت
lsof -i :3000
# أو
netstat -tulpn | grep 3000

# أو غير البورت في .env
```

### المشكلة: 403 Forbidden
**الحل**:
1. تأكد من أن PM2 يعمل: `pm2 status`
2. تأكد من إعدادات reverse proxy في `.htaccess`
3. تأكد من تفعيل mod_proxy في Apache
4. تحقق من السجلات: `pm2 logs shopify-pos-sync`
