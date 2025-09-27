#!/bin/bash

# Firebase Firestore Setup Script for 48 Kos Tirths
# This script helps set up Firebase Firestore for the tirths data

echo "🚀 Firebase Firestore Setup for 48 Kos Tirths"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "📝 Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm is installed"

# Install Firebase Admin SDK
echo ""
echo "📦 Installing Firebase Admin SDK..."
npm install firebase-admin

if [ $? -eq 0 ]; then
    echo "✅ Firebase Admin SDK installed successfully"
else
    echo "❌ Failed to install Firebase Admin SDK"
    exit 1
fi

# Create service account directory
echo ""
echo "📁 Creating service account directory..."
mkdir -p firebase-service-account

# Instructions for service account key
echo ""
echo "📝 Next Steps:"
echo "=============="
echo ""
echo "1. Go to Firebase Console: https://console.firebase.google.com/"
echo "2. Select your project (or create a new one)"
echo "3. Go to Project Settings > Service Accounts"
echo "4. Click 'Generate new private key'"
echo "5. Download the JSON file"
echo "6. Rename it to 'serviceAccountKey.json'"
echo "7. Place it in the 'firebase-service-account' directory"
echo ""
echo "8. Update the SERVICE_ACCOUNT_PATH in upload-tirths.js:"
echo "   Change './path/to/your/serviceAccountKey.json' to"
echo "   './firebase-service-account/serviceAccountKey.json'"
echo ""
echo "9. Run the upload script:"
echo "   node upload-tirths.js"
echo ""
echo "📚 For detailed instructions, see: FIREBASE_FIRESTORE_SETUP.md"
echo ""
echo "🎉 Setup script completed!"
