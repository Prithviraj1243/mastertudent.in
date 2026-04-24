#!/bin/bash

# Start both main website and admin panel on port 8000
# Data is shared automatically through the same database

echo "🚀 Starting Student Notes Marketplace..."
echo "📍 Main Website: http://localhost:8000"
echo "📍 Admin Panel: http://localhost:8000/admin-panel"
echo "📍 Teacher Dashboard: http://localhost:8000/review-queue"
echo ""
echo "✅ Both interfaces share the same database"
echo "✅ Login data is saved automatically"
echo ""

PORT=8000 NODE_ENV=development npm run dev
