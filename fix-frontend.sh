#!/bin/bash

# ============================================
# Frontend Container Fix Script
# ============================================

echo "=== Attempting to fix frontend container ==="
echo ""

echo "Step 1: Stopping frontend container..."
docker compose stop frontend

echo ""
echo "Step 2: Removing frontend container..."
docker compose rm -f frontend

echo ""
echo "Step 3: Rebuilding frontend container (this may take a few minutes)..."
docker compose build --no-cache frontend

echo ""
echo "Step 4: Starting frontend container..."
docker compose up -d frontend

echo ""
echo "Step 5: Waiting for container to start (10 seconds)..."
sleep 10

echo ""
echo "Step 6: Checking frontend logs..."
docker compose logs frontend --tail 30

echo ""
echo "Step 7: Testing connection..."
curl -I http://localhost:3000

echo ""
echo "=== Fix attempt complete ==="
echo ""
echo "Try accessing: http://localhost:3000"
echo "If still not working, run: ./diagnose-frontend.sh"
