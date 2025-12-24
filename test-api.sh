#!/bin/bash

echo "Testing SINKRONA Login API..."
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
curl -s http://localhost:5000/api/health | jq . 2>/dev/null || echo "Health check failed"
echo ""

# Test 2: Admin Login
echo "2️⃣  Testing Admin Login..."
response=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "$response" | jq . 2>/dev/null || echo "$response"
token=$(echo "$response" | jq -r '.token' 2>/dev/null)
echo ""

# Test 3: Get Current User (if token obtained)
if [ ! -z "$token" ] && [ "$token" != "null" ]; then
  echo "3️⃣  Testing Get Current User..."
  curl -s http://localhost:5000/api/auth/me \
    -H "Authorization: Bearer $token" | jq . 2>/dev/null || echo "Get user failed"
  echo ""
fi

# Test 4: Invalid Login
echo "4️⃣  Testing Invalid Login..."
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"invalid","password":"wrong"}' | jq . 2>/dev/null || echo "Invalid login test failed"
echo ""

echo "✅ API tests completed!"
