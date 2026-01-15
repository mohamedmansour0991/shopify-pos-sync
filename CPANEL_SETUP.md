# cPanel Setup Guide

## Steps to Deploy on cPanel

### 1. Upload Files via Git
```bash
cd ~/public_html/shopify-pos.tek-part.com
git pull origin main  # or your branch name
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Generate Prisma Client
```bash
npm run generate
```

### 4. Build the Application
```bash
npm run build
```

### 5. Set Up Node.js App in cPanel

1. Log in to cPanel
2. Go to **Software** → **Setup Node.js App**
3. Click **Create Application**
4. Configure:
   - **Node.js version**: 20.x or higher
   - **Application mode**: Production
   - **Application root**: `shopify-pos.tek-part.com`
   - **Application URL**: `shopify-pos.tek-part.com` (or your domain)
   - **Application startup file**: `server.js`
   - **Application port**: Leave default or set to available port

5. Add Environment Variables:
   - `NODE_ENV=production`
   - `SHOPIFY_API_KEY=your_api_key`
   - `SHOPIFY_API_SECRET=your_api_secret`
   - `HOST=https://shopify-pos.tek-part.com`
   - `SCOPES=read_products,write_products,read_product_listings,write_product_listings,read_inventory,write_inventory`
   - `DATABASE_URL=file:./prisma/dev.db` (or your database URL)
   - `PORT` (will be set automatically by cPanel)

6. Click **Create**

### 6. Start the Application

In cPanel Node.js App Manager:
1. Find your application
2. Click **Run NPM Install** (if needed)
3. Click **Start App**

### 7. Verify File Permissions

Make sure these directories are writable:
```bash
chmod 755 ~/public_html/shopify-pos.tek-part.com
chmod 755 ~/public_html/shopify-pos.tek-part.com/build
chmod 755 ~/public_html/shopify-pos.tek-part.com/prisma
```

### 8. Database Setup

If using SQLite, ensure the database file is writable:
```bash
touch ~/public_html/shopify-pos.tek-part.com/prisma/dev.db
chmod 666 ~/public_html/shopify-pos.tek-part.com/prisma/dev.db
```

Then run migrations:
```bash
npm run db:push
```

## Troubleshooting 403 Forbidden Error

### Check 1: Node.js App is Running
- Go to cPanel → Node.js App Manager
- Verify the app status shows "Running"
- Check the logs for errors

### Check 2: File Permissions
```bash
# Set correct permissions
find ~/public_html/shopify-pos.tek-part.com -type d -exec chmod 755 {} \;
find ~/public_html/shopify-pos.tek-part.com -type f -exec chmod 644 {} \;
chmod +x ~/public_html/shopify-pos.tek-part.com/server.js
```

### Check 3: Environment Variables
- Verify all required environment variables are set in cPanel Node.js App Manager
- Check that `HOST` matches your actual domain

### Check 4: Port Configuration
- In cPanel Node.js App Manager, note the port number
- The app should automatically use this port
- If using a reverse proxy, configure it in `.htaccess`

### Check 5: Build Output
Ensure the build completed successfully:
```bash
ls -la ~/public_html/shopify-pos.tek-part.com/build/server/
```

Should see `index.js` file.

## Alternative: Using PM2 (if available)

If you have SSH access and PM2 installed:

```bash
cd ~/public_html/shopify-pos.tek-part.com
pm2 start server.js --name shopify-pos-sync
pm2 save
pm2 startup
```

## Checking Logs

### Application Logs
In cPanel Node.js App Manager, click "View Logs" to see:
- Application startup messages
- Runtime errors
- Console output

### Server Logs
Check cPanel error logs:
- cPanel → Metrics → Errors
- Or via SSH: `tail -f ~/logs/error_log`

## Common Issues

### Issue: "Cannot find module './build/server/index.js'"
**Solution**: Run `npm run build` again

### Issue: "Prisma Client not generated"
**Solution**: Run `npm run generate`

### Issue: "Database locked" (SQLite)
**Solution**: Check file permissions and ensure only one instance is running

### Issue: "Port already in use"
**Solution**: Stop other Node.js apps or change the port in cPanel
