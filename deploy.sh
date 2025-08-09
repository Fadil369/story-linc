# Production Deployment Script for Cloudflare

#!/bin/bash

echo "🚀 Starting Story Weaver deployment to Cloudflare..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Create KV namespaces if they don't exist
echo "🗄️  Setting up KV namespaces..."
wrangler kv:namespace create "STORIES_KV" || true
wrangler kv:namespace create "ANALYTICS_KV" || true
wrangler kv:namespace create "STORIES_KV" --preview || true
wrangler kv:namespace create "ANALYTICS_KV" --preview || true

# Deploy Pages
echo "🌐 Deploying to Cloudflare Pages..."
wrangler pages deploy dist --project-name=story-weaver

# Deploy Workers
echo "⚡ Deploying Cloudflare Workers..."
wrangler deploy

echo "✅ Deployment complete!"
echo "🔗 Your Story Weaver app is now live on Cloudflare's global network!"
echo ""
echo "Next steps:"
echo "1. Configure your custom domain in Cloudflare Dashboard"
echo "2. Set up analytics in the dashboard"
echo "3. Monitor performance and user feedback"
echo ""
echo "Happy storytelling! 📚✨"