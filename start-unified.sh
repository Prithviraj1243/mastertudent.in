#!/bin/bash

# Start Unified Student Notes Marketplace
# This script starts both the main website and unified admin panel

echo "🚀 Starting Student Notes Marketplace with Unified Database..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please create one with your database configuration."
    exit 1
fi

# Check if DATABASE_URL is set (not the placeholder)
if grep -q "your_postgresql_connection_string_here" .env; then
    echo "⚠️  Please update your DATABASE_URL in .env file with your actual PostgreSQL connection string"
    echo "   Example: DATABASE_URL=postgresql://username:password@localhost:5432/database_name"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️  Setting up database..."
npm run db:push

echo ""
echo "🌐 Starting main website server (Port 8000)..."
npm run dev &
MAIN_PID=$!

echo ""
echo "🔧 Starting enhanced admin panel (Port 3001)..."
npm run admin &
ADMIN_PID=$!

echo ""
echo "✅ Both servers are starting..."
echo ""
echo "📱 Main Website: http://localhost:8000"
echo "🛠️  Admin Panel: http://localhost:3001/admin"
echo "✅ Enhanced Features:"
echo "   • Detailed note upload information"
echo "   • File management and statistics"
echo "   • Real-time note approval/rejection"
echo "   • Bulk note operations"
echo "   • Note analytics and insights"
echo "   • Enhanced activity logging"
echo "   • Complete user profile views"
echo "   • Note file viewing and download"
echo "   • Real-time user activity tracking"
echo "   • Performance metrics and risk scoring"
echo "   - User data from main website appears in admin panel in real-time"
echo "   - Admin can manage all users, notes, and transactions"
echo ""
echo "Press Ctrl+C to stop both servers..."

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $MAIN_PID 2>/dev/null
    kill $ADMIN_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
