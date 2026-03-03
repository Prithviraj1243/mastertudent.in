#!/bin/bash

echo "🔍 RENDER DEPLOYMENT READINESS CHECK"
echo "====================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Source the .env file
set -a
source .env
set +a

echo "📋 Checking Environment Variables:"
echo ""

# Function to check variable
check_var() {
    local var_name=$1
    local var_value="${!var_name}"
    
    if [ -z "$var_value" ]; then
        echo "❌ $var_name - NOT SET"
        return 1
    elif [[ "$var_value" == *"your"* ]] || [[ "$var_value" == *"change"* ]] || [[ "$var_value" == *"dummy"* ]]; then
        echo "⚠️  $var_name - NEEDS UPDATE (placeholder value)"
        return 1
    else
        echo "✅ $var_name - OK"
        return 0
    fi
}

total=0
passed=0

# Critical Frontend Variables
echo "🎨 Frontend Variables (VITE_*):"
for var in VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY VITE_GOOGLE_CLIENT_ID; do
    check_var $var && ((passed++))
    ((total++))
done
echo ""

# Critical Backend Variables
echo "⚙️  Backend Variables:"
for var in SUPABASE_URL SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY DATABASE_URL; do
    check_var $var && ((passed++))
    ((total++))
done
echo ""

# Admin Variables
echo "🔐 Admin Variables:"
for var in ADMIN_USERNAME ADMIN_PASSWORD ADMIN_SECRET_KEY ADMIN_JWT_SECRET SESSION_SECRET; do
    check_var $var && ((passed++))
    ((total++))
done
echo ""

# API Configuration
echo "🌐 API Configuration:"
for var in GEMINI_API_KEY; do
    check_var $var && ((passed++))
    ((total++))
done
echo ""

# Storage Configuration
echo "📦 Storage Configuration:"
for var in STORAGE_PROVIDER SUPABASE_BUCKET_NAME; do
    check_var $var && ((passed++))
    ((total++))
done
echo ""

# Summary
echo "====================================="
echo "📊 SUMMARY: $passed/$total variables configured"
echo ""

if [ $passed -eq $total ]; then
    echo "✅ ALL CHECKS PASSED! Ready for deployment."
    echo ""
    echo "📝 NEXT STEPS:"
    echo "1. Copy all environment variables to Render dashboard"
    echo "2. Update VITE_API_URL and VITE_ADMIN_API_URL with your Render URL"
    echo "3. Deploy on Render"
    echo "4. Update Google OAuth redirect URIs"
    echo "5. Update Supabase Site URL and Redirect URLs"
    exit 0
else
    echo "⚠️  SOME CHECKS FAILED! Please fix the issues above."
    echo ""
    echo "📖 See RENDER-FIX-DEPLOYMENT.md for detailed instructions"
    exit 1
fi
