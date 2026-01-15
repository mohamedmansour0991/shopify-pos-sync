# حل مشكلة 500 Internal Server Error

## الخطوات السريعة

```bash
# 1. التحقق من أن PM2 يعمل
pm2 status

# 2. التحقق من البورت
pm2 logs shopify-pos-sync | grep PORT
# يجب أن ترى: 🌐 PORT: 3000

# 3. التحقق من أن التطبيق يستمع على localhost:3000
netstat -tulpn | grep 3000
# أو
ss -tulpn | grep 3000

# 4. اختبار الاتصال مباشرة
curl http://localhost:3000
# يجب أن يعيد HTML أو response

# 5. التحقق من سجلات Apache
tail -f ~/logs/error_log
# أو
tail -f /var/log/apache2/error_log
```

## الحلول المحتملة

### الحل 1: تفعيل mod_proxy في Apache

إذا كان `mod_proxy` غير مفعل، يجب تفعيله. في معظم خوادم cPanel، يمكنك:

```bash
# التحقق من حالة mod_proxy
apache2ctl -M | grep proxy
# أو
httpd -M | grep proxy

# إذا لم يكن مفعلاً، اتصل بالدعم الفني
# أو إذا كان لديك صلاحيات root:
a2enmod proxy
a2enmod proxy_http
systemctl restart apache2
```

### الحل 2: استخدام ProxyPass بدلاً من RewriteRule

إذا كان `.htaccess` لا يعمل، قد تحتاج إلى إعدادات في `httpd.conf` أو `.htaccess` مختلفة:

```apache
# في .htaccess
<IfModule mod_proxy.c>
    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</IfModule>
```

### الحل 3: التحقق من البورت

```bash
# تأكد من أن PM2 يستخدم البورت 3000
pm2 logs shopify-pos-sync | grep "PORT\|running"

# إذا كان البورت مختلفاً، حدث .htaccess
nano .htaccess
# غير 3000 إلى البورت الصحيح
```

### الحل 4: اختبار الاتصال المباشر

```bash
# من السيرفر نفسه
curl http://localhost:3000

# إذا لم يعمل، المشكلة في Node.js
# إذا عمل، المشكلة في reverse proxy
```

### الحل 5: استخدام بديل - Node.js مباشرة على البورت 80/443

إذا كان reverse proxy لا يعمل، يمكنك:
1. تشغيل Node.js على البورت 80 مباشرة (يتطلب root)
2. أو استخدام nginx بدلاً من Apache
3. أو استخدام cPanel Node.js App Manager
