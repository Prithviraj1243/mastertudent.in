#!/bin/bash

echo "🔥 Starting MasterStudent React Admin Panel..."
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to admin-react directory
cd admin-react

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please ensure you're in the correct directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing React dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies."
        exit 1
    fi
    echo "✅ Dependencies installed successfully!"
fi

# Start the React development server
echo "🚀 Starting React Admin Panel on port 3000..."
echo "🔗 Admin Panel will be available at: http://localhost:3000"
echo "🔑 API Key: masterstudent_admin_2024_secure_key"
echo "================================================"

# Set environment variables
export BROWSER=none
export PORT=3000

# Start React app
npm start
