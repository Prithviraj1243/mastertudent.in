#!/bin/bash

# Deployment startup script for Student Notes Marketplace
# Runs both Node.js and Python servers in parallel

set -e

echo "🚀 Starting Student Notes Marketplace with Chatbot..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd chatbot
pip3 install -r requirements.txt
cd ..

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Start Python chatbot server in background with Gunicorn
echo "🤖 Starting Python chatbot server with Gunicorn on port 5000..."
cd chatbot
gunicorn --workers 4 --worker-class sync --bind 0.0.0.0:5000 --timeout 120 --access-logfile - --error-logfile - app:app &
PYTHON_PID=$!
cd ..

# Start Node.js server
echo "🌐 Starting Node.js server on port 5000 (mapped to 80)..."
npm run start

# Cleanup on exit
trap "kill $PYTHON_PID 2>/dev/null || true" EXIT
