#!/bin/bash

# Simple deploy script for demo purposes
echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
npm install --only=production

# Restart application
if command -v pm2 &> /dev/null; then
    pm2 restart ci-cd-demo || pm2 start src/app.js --name "ci-cd-demo"
else
    # Fallback to systemd or simple node
    pkill -f "node src/app.js" || true
    nohup node src/app.js > app.log 2>&1 &
fi

echo "✅ Deployment completed!"