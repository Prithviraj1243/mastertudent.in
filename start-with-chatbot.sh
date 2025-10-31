#!/bin/bash

# Master Student Chatbot Startup Script
# This script starts both the main application and the Python chatbot backend

echo "🚀 Starting Master Student Chatbot System..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed. Please install Python 3."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is required but not installed. Please install pip3."
    exit 1
fi

# Install Python dependencies for chatbot
echo "📦 Installing Python dependencies..."
cd chatbot
pip3 install -r requirements.txt

# Start the chatbot backend in the background
echo "🤖 Starting Master Student Chatbot Backend on port 5001..."
python3 app.py &
CHATBOT_PID=$!

# Wait a moment for the chatbot to start
sleep 3

# Go back to main directory
cd ..

# Start the main application
echo "🌐 Starting Main Application on port 8000..."
USE_SQLITE=1 PORT=8000 npm run dev &
MAIN_PID=$!

echo ""
echo "✅ System Started Successfully!"
echo "📱 Main Application: http://localhost:8000"
echo "🤖 Chatbot API: http://localhost:5001"
echo ""
echo "💡 To stop both services, press Ctrl+C"
echo ""

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $CHATBOT_PID 2>/dev/null
    kill $MAIN_PID 2>/dev/null
    echo "✅ Services stopped successfully!"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
