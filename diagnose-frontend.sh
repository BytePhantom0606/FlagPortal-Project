#!/bin/bash

# ============================================
# Frontend Container Diagnostic Script
# ============================================

echo "=== FlagForge Frontend Diagnostics ==="
echo ""

echo "1. Checking container status..."
docker compose ps

echo ""
echo "2. Checking frontend container logs (last 50 lines)..."
docker compose logs frontend --tail 50

echo ""
echo "3. Checking if frontend container is responding..."
docker compose exec frontend wget -q -O- http://localhost/ | head -20 || echo "❌ Frontend not responding inside container"

echo ""
echo "4. Checking nginx status inside container..."
docker compose exec frontend ps aux | grep nginx || echo "❌ Nginx not running"

echo ""
echo "5. Checking if files were built..."
docker compose exec frontend ls -la /usr/share/nginx/html/ || echo "❌ Cannot access nginx html directory"

echo ""
echo "6. Testing port mapping from host..."
curl -v http://localhost:3000 2>&1 | head -30 || echo "❌ Cannot connect to localhost:3000"

echo ""
echo "7. Checking docker port mapping..."
docker compose port frontend 80

echo ""
echo "8. Checking all listening ports..."
docker compose exec frontend netstat -tuln | grep LISTEN || ss -tuln | grep LISTEN

echo ""
echo "=== Diagnostic Complete ==="
echo ""
echo "If the container is not running, try:"
echo "  docker compose up --build frontend"
echo ""
echo "If the container is running but not responding, check logs for build errors:"
echo "  docker compose logs frontend"
