#!/bin/bash
# Quick fix script for 500 Internal Server Error

echo "🔍 Checking PM2 status..."
pm2 status

echo ""
echo "🔍 Checking if Node.js is listening on port 3000..."
netstat -tulpn | grep 3000 || ss -tulpn | grep 3000

echo ""
echo "🔍 Testing direct connection to Node.js..."
curl -I http://localhost:3000 2>&1 | head -5

echo ""
echo "🔍 Checking Apache error logs..."
tail -20 ~/logs/error_log 2>/dev/null || tail -20 /var/log/apache2/error_log 2>/dev/null || echo "Could not access error logs"

echo ""
echo "📋 Next steps:"
echo "1. If PM2 is not running: pm2 start server.js --name shopify-pos-sync"
echo "2. If port 3000 is not listening: check PM2 logs"
echo "3. If curl fails: check server.js and PM2 logs"
echo "4. If mod_proxy is not enabled: contact hosting support"
