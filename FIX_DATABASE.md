# إصلاح مشكلة قاعدة البيانات

## المشكلة
الجداول غير موجودة في قاعدة البيانات رغم تشغيل `prisma db push`.

## الحل

### 1. التحقق من موقع قاعدة البيانات
```bash
cd ~/public_html/theonesystemco.tek-part.com

# تحقق من وجود قاعدة البيانات
ls -la dev.db
ls -la prisma/dev.db

# تحقق من محتوى قاعدة البيانات
sqlite3 dev.db ".tables"
# أو
sqlite3 prisma/dev.db ".tables"
```

### 2. تحديث DATABASE_URL في .env
```bash
nano .env
```

تأكد من أن `DATABASE_URL` يشير إلى المسار الصحيح:
- إذا كانت قاعدة البيانات في المجلد الرئيسي: `DATABASE_URL=file:./dev.db`
- إذا كانت في مجلد prisma: `DATABASE_URL=file:./prisma/dev.db`

### 3. حذف قاعدة البيانات القديمة وإنشاء جديدة
```bash
# احذف قاعدة البيانات القديمة
rm -f dev.db prisma/dev.db

# أنشئ قاعدة بيانات جديدة
touch dev.db
chmod 666 dev.db

# أو إذا كنت تريدها في مجلد prisma:
mkdir -p prisma
touch prisma/dev.db
chmod 666 prisma/dev.db
```

### 4. إعادة إنشاء الجداول
```bash
# تأكد من أن DATABASE_URL في .env صحيح أولاً
npm run db:push
```

### 5. التحقق من الجداول
```bash
sqlite3 dev.db ".tables"
# يجب أن ترى: Session, Shop, SyncLog
```

### 6. إعادة تشغيل التطبيق
```bash
pm2 restart shopify-pos-sync
pm2 logs shopify-pos-sync --lines 30
```
