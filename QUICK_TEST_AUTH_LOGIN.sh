#!/bin/bash
# اختبار Route /auth/login مباشرة من Node.js

echo "=== Testing /auth/login route ==="
echo ""

# 1. اختبار من localhost:3000 مباشرة (تجاوز Apache/PHP)
echo "1. Testing from Node.js directly (localhost:3000):"
curl -I http://localhost:3000/auth/login 2>&1 | head -10
echo ""

# 2. اختبار من public domain
echo "2. Testing from public domain:"
curl -I https://theonesystemco.tek-part.com/auth/login 2>&1 | head -10
echo ""

# 3. اختبار من index.php proxy
echo "3. Testing from index.php proxy:"
curl -I https://theonesystemco.tek-part.com/index.php/auth/login 2>&1 | head -10
echo ""

# 4. التحقق من PM2 logs
echo "4. Checking PM2 logs for errors:"
pm2 logs server --lines 5 --nostream | grep -i "error\|404\|auth" | tail -5
echo ""

echo "=== Test Complete ==="
