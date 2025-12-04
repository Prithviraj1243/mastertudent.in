#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Student Notes Marketplace${NC}"
echo -e "${BLUE}  Starting Services${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js is installed${NC}"
echo ""

# Main Website (Port 8000)
echo -e "${YELLOW}Starting Main Website...${NC}"
echo -e "${BLUE}Location: StudentNotesMarketplace 6${NC}"
echo -e "${BLUE}Port: 8000${NC}"
echo -e "${BLUE}URL: http://localhost:8000${NC}"
echo ""

cd "$(dirname "$0")" || exit

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies for main website...${NC}"
    npm install
fi

# Start main website in background
npm run dev &
MAIN_PID=$!

echo -e "${GREEN}✓ Main website started (PID: $MAIN_PID)${NC}"
echo ""

# Wait a bit for main website to start
sleep 3

# Standalone Admin Panel (Port 3000)
echo -e "${YELLOW}Starting Admin Panel...${NC}"
echo -e "${BLUE}Location: /Users/prithviraj/admin masterstudents${NC}"
echo -e "${BLUE}Port: 3000${NC}"
echo -e "${BLUE}URL: http://localhost:3000${NC}"
echo ""

cd "/Users/prithviraj/admin masterstudents" || exit

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies for admin panel...${NC}"
    npm install
fi

# Start admin panel in background
npm run dev &
ADMIN_PID=$!

echo -e "${GREEN}✓ Admin panel started (PID: $ADMIN_PID)${NC}"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ All services are running!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Access Points:${NC}"
echo -e "  ${BLUE}Main Website:${NC}    http://localhost:8000"
echo -e "  ${BLUE}Admin Panel:${NC}     http://localhost:3000"
echo ""
echo -e "${YELLOW}Admin Login Credentials:${NC}"
echo -e "  ${BLUE}Email:${NC}    admin@studentnotes.com"
echo -e "  ${BLUE}Password:${NC} admin123"
echo ""
echo -e "${YELLOW}Database:${NC} SQLite (shared between services)"
echo ""
echo -e "${YELLOW}To stop all services, press Ctrl+C${NC}"
echo ""

# Wait for both processes
wait $MAIN_PID $ADMIN_PID

echo -e "${YELLOW}Services stopped${NC}"
