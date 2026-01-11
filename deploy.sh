#!/bin/bash

# StoryTime Deployment Script
# This script deploys the StoryTime app to Firebase Hosting

echo "🚀 StoryTime Deployment Script"
echo "================================"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in
echo ""
echo "📋 Pre-deployment checklist:"
if ! firebase projects:list &> /dev/null; then
    echo "⚠️  You need to log in to Firebase first."
    echo "Run: firebase login"
    exit 1
fi

echo "✅ Firebase CLI is ready"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Please set up your Firebase credentials first."
    echo "Copy .env.example to .env and fill in your values."
    exit 1
fi

echo "✅ Environment variables configured"

# Build the project
echo ""
echo "🔨 Building the application..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed. The dist folder was not created."
    exit 1
fi

echo "✅ Build successful"

# Deploy to Firebase
echo ""
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "✅ Deployment complete!"
echo "📝 Your app is now live on Firebase Hosting."
