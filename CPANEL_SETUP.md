# cPanel Setup Guide (SSH/PM2)

## Steps to Deploy on cPanel via SSH

### 1. Connect via SSH
```bash
ssh your-username@your-server
cd ~/public_html/shopify-pos.tek-part.com
```

### 2. Pull Latest Code
```bash
git pull origin main  # or your branch name
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Generate Prisma Client
```bash
npm run generate
```

### 5. Build the Application
```bash
npm run build
```

### 6. Set Up Environment Variables

Create a `.env` file in the project root:
```bash
nano .env
```

Add the following:
```env
NODE_ENV=production
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
HOST=https://shopify-pos.tek-part.com
SCOPES=read_products,write_products,read_product_listings,write_product_listings,read_inventory,write_inventory
DATABASE_URL=file:./prisma/dev.db
PORT=3000
```

Save and exit (Ctrl+X, then Y, then Enter)

### 7. Database Setup

```bash
# Create database file if it doesn't exist
touch prisma/dev.db
chmod 666 prisma/dev.db

# Run database migrations
npm run db:push
```

### 8. Install PM2 (if not already installed)

```bash
npm install -g pm2
```

### 9. Start Application with PM2

**Option 1: Using ecosystem.config.js (Recommended)**
```bash
# Stop old instance if exists
pm2 delete shopify-pos-sync 2>/dev/null || true

# Start using ecosystem config (automatically loads .env)
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on server reboot
pm2 startup
# Follow the instructions it provides
```

**Option 2: Direct start (server.js now loads .env automatically)**
```bash
# Stop old instance if exists
pm2 delete shopify-pos-sync 2>/dev/null || true

# Start the application
pm2 start server.js --name shopify-pos-sync

# Save PM2 configuration
pm2 save

# Setup PM2 to start on server reboot
pm2 startup
# Follow the instructions it provides
```

### 10. Configure Reverse Proxy (if needed)

If your server uses Apache with mod_proxy, update `.htaccess`:

### 11. Verify File Permissions

Make sure these directories are writable:
```bash
chmod 755 ~/public_html/shopify-pos.tek-part.com
chmod 755 ~/public_html/shopify-pos.tek-part.com/build
chmod 755 ~/public_html/shopify-pos.tek-part.com/prisma
chmod +x ~/public_html/shopify-pos.tek-part.com/server.js
chmod 666 ~/public_html/shopify-pos.tek-part.com/prisma/dev.db
```

### 12. Check PM2 Status

```bash
# Check if app is running
pm2 status

# View logs
pm2 logs shopify-pos-sync

# View real-time logs
pm2 logs shopify-pos-sync --lines 50
```

## PM2 Commands Reference

```bash
# Start application
pm2 start server.js --name shopify-pos-sync

# Stop application
pm2 stop shopify-pos-sync

# Restart application
pm2 restart shopify-pos-sync

# Delete application from PM2
pm2 delete shopify-pos-sync

# View status
pm2 status

# View logs
pm2 logs shopify-pos-sync

# Monitor (real-time)
pm2 monit

# Reload (zero-downtime restart)
pm2 reload shopify-pos-sync
```

## Troubleshooting 403 Forbidden Error

### Check 1: Application is Running
```bash
# Check PM2 status
pm2 status

# Should show "online" status for shopify-pos-sync
# If not, check logs:
pm2 logs shopify-pos-sync --lines 100
```

### Check 2: File Permissions
```bash
# Set correct permissions
find ~/public_html/shopify-pos.tek-part.com -type d -exec chmod 755 {} \;
find ~/public_html/shopify-pos.tek-part.com -type f -exec chmod 644 {} \;
chmod +x ~/public_html/shopify-pos.tek-part.com/server.js
```

### Check 3: Environment Variables
```bash
# Check if .env file exists and has correct values
cat .env

# Or check environment in PM2
pm2 env shopify-pos-sync
```

### Check 4: Port Configuration
```bash
# Check what port the app is using
pm2 logs shopify-pos-sync | grep PORT

# Or check in .env file
grep PORT .env

# Make sure the port matches your reverse proxy configuration
```

### Check 5: Reverse Proxy Configuration
If using Apache, make sure `.htaccess` is configured correctly:
```bash
cat .htaccess
```

The `.htaccess` should proxy requests to your Node.js app on the correct port.

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

### Application Logs (PM2)
```bash
# View all logs
pm2 logs shopify-pos-sync

# View last 100 lines
pm2 logs shopify-pos-sync --lines 100

# View error logs only
pm2 logs shopify-pos-sync --err

# View output logs only
pm2 logs shopify-pos-sync --out

# Follow logs in real-time
pm2 logs shopify-pos-sync --lines 0
```

### Server Logs
```bash
# Apache error logs
tail -f ~/logs/error_log

# Or check cPanel error logs
tail -f ~/public_html/shopify-pos.tek-part.com/error_log
```

## Common Issues

### Issue: "Cannot find module './build/server/index.js'"
**Solution**: Run `npm run build` again

### Issue: "Prisma Client not generated"
**Solution**: Run `npm run generate`

### Issue: "Database locked" (SQLite)
**Solution**: Check file permissions and ensure only one instance is running

### Issue: "Port already in use"
**Solution**: Stop other Node.js apps or change the port in cPanel
