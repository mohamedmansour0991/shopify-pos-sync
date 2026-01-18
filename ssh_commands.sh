#!/bin/bash
# SSH Commands to run on server
# Host: 75.119.139.162
# Port: 2222
# User: sortat
# Password: Tekpart@2025

# Connect with:
# ssh -p 2222 sortat@75.119.139.162

# Then run these commands:

# 1. Go to the app directory
cd ~/public_html/theonesystemco.tek-part.com

# 2. Check current HOST value
cat .env | grep HOST

# 3. Update HOST to new domain
sed -i 's|HOST=.*|HOST=https://theonesystemco.tek-part.com|' .env

# 4. Verify the update
cat .env | grep HOST

# 5. Restart PM2
pm2 restart server

# 6. Check logs
pm2 logs server --lines 10

# 7. Test the app
curl -I https://theonesystemco.tek-part.com
curl -I https://theonesystemco.tek-part.com/auth/login
