# Cloudflare Deployment Guide for Story Weaver

This guide explains how to deploy Story Weaver to Cloudflare Workers and Pages for global edge performance.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Install the Cloudflare CLI tool
   ```bash
   npm install -g wrangler
   ```
3. **Authentication**: Login to your Cloudflare account
   ```bash
   wrangler login
   ```

## Deployment Steps

### 1. Frontend Deployment (Cloudflare Pages)

#### Option A: Git Integration (Recommended)
1. Push your code to GitHub/GitLab
2. Go to Cloudflare Dashboard → Pages
3. Click "Create a project" → "Connect to Git"
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variables**: (optional)
     ```
     NODE_VERSION=18
     ```

#### Option B: Direct Upload
```bash
# Build the project
npm run build

# Deploy to Pages
wrangler pages deploy dist --project-name=story-weaver
```

### 2. Backend Deployment (Cloudflare Workers)

#### Create KV Namespaces
```bash
# Create production KV namespaces
wrangler kv:namespace create "STORIES_KV"
wrangler kv:namespace create "ANALYTICS_KV"

# Create preview KV namespaces
wrangler kv:namespace create "STORIES_KV" --preview
wrangler kv:namespace create "ANALYTICS_KV" --preview
```

#### Update wrangler.toml
Replace the placeholder IDs in `wrangler.toml` with the actual namespace IDs from the previous step.

#### Deploy Workers
```bash
# Deploy to production
wrangler deploy

# Deploy to preview environment
wrangler deploy --env preview
```

### 3. Custom Domain Setup

#### For Pages:
1. Go to Pages → Custom domains
2. Add your domain (e.g., `storyweaver.yourdomain.com`)
3. Update DNS records as instructed

#### For Workers:
1. Go to Workers → Triggers
2. Add custom domain
3. Configure routing rules

## Environment Configuration

### Environment Variables

Create a `.env` file for local development:
```env
# Cloudflare Account Details
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token

# KV Namespace IDs (get from wrangler output)
STORIES_KV_ID=your_stories_kv_id
ANALYTICS_KV_ID=your_analytics_kv_id

# Optional: External API Keys
OPENAI_API_KEY=your_openai_key  # If using real AI generation
```

### Production Secrets
```bash
# Set sensitive environment variables
wrangler secret put OPENAI_API_KEY
wrangler secret put ANALYTICS_TOKEN
```

## Analytics Setup

### Cloudflare Web Analytics
1. Go to Analytics → Web Analytics
2. Create new site
3. Add beacon to `index.html`:
   ```html
   <script defer src='https://static.cloudflareinsights.com/beacon.min.js' 
           data-cf-beacon='{"token": "your-token"}'></script>
   ```

### Custom Analytics Engine
The worker includes built-in analytics tracking for:
- API requests
- Story creation metrics
- User engagement

Query analytics data:
```bash
wrangler analytics query --dataset-id=your_dataset_id
```

## Performance Optimization

### Caching Strategy
- **Static assets**: Cached at edge for 1 year
- **API responses**: Cached for 5 minutes with stale-while-revalidate
- **Stories data**: Cached in KV with eventual consistency

### Geographic Distribution
- **Workers**: Deploy to all 300+ Cloudflare locations
- **Pages**: Global CDN with edge caching
- **KV**: Replicated globally with eventual consistency

## Monitoring and Maintenance

### Health Checks
```bash
# Check worker status
wrangler tail

# Test endpoints
curl https://your-worker.your-subdomain.workers.dev/api/stories

# Monitor KV usage
wrangler kv:key list --binding=STORIES_KV
```

### Scaling Considerations
- **KV Storage**: 25 million keys per namespace
- **Worker CPU**: 50ms per request (adjustable)
- **Memory**: 128MB per worker
- **Requests**: 100,000 per day (free tier)

## Security

### API Security
```bash
# Generate API tokens for external access
wrangler secret put API_SECRET_KEY
```

### Content Security Policy
Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com">
```

### Rate Limiting
Implemented in worker for API endpoints:
- **Story creation**: 10 per minute per IP
- **API calls**: 100 per minute per IP

## Backup and Recovery

### Data Backup
```bash
# Export all stories
node scripts/export-kv-data.js

# Backup to R2 storage
wrangler r2 object put story-weaver-backups/backup-$(date +%Y%m%d).json --file=stories-backup.json
```

### Disaster Recovery
- **KV data**: Automatically replicated globally
- **Worker code**: Version controlled and deployable
- **Static assets**: Backed up in Git repository

## Cost Estimation

### Free Tier Limits
- **Pages**: Unlimited requests, 500 builds/month
- **Workers**: 100,000 requests/day
- **KV**: 100,000 reads/day, 1,000 writes/day
- **Analytics**: 100,000 queries/month

### Paid Features
- **Workers Paid**: $5/month (10M requests)
- **KV**: $0.50/GB stored, $0.50/million reads
- **R2 Storage**: $0.015/GB/month
- **Analytics Engine**: $0.05/million rows

## Troubleshooting

### Common Issues
1. **Build failures**: Check Node.js version compatibility
2. **KV errors**: Verify namespace IDs in wrangler.toml
3. **CORS issues**: Check worker CORS headers
4. **Performance**: Monitor worker CPU usage

### Debug Commands
```bash
# View worker logs
wrangler tail --format=pretty

# Test locally
wrangler dev

# Check KV data
wrangler kv:key get "story:123" --binding=STORIES_KV
```

## Advanced Features

### WebSockets (Future)
Enable real-time collaboration:
```toml
[durable_objects.bindings]
name = "COLLABORATION"
class_name = "CollaborationDurableObject"
```

### Image Processing
Use Cloudflare Images for story illustrations:
```bash
# Configure image variants
wrangler images variants create --name=story-thumbnail --width=300 --height=200
```

### Email Integration
Use MailChannels for story sharing:
```javascript
await fetch('https://api.mailchannels.net/tx/v1/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(emailData)
});
```

## Support

For deployment issues:
1. Check [Cloudflare Documentation](https://developers.cloudflare.com/)
2. Review worker logs with `wrangler tail`
3. Test locally with `wrangler dev`
4. Contact Cloudflare support for platform issues

## Deployment Checklist

- [ ] Install Wrangler CLI
- [ ] Authenticate with Cloudflare
- [ ] Create KV namespaces
- [ ] Update wrangler.toml with namespace IDs
- [ ] Deploy worker with `wrangler deploy`
- [ ] Deploy frontend to Pages
- [ ] Configure custom domain
- [ ] Set up analytics
- [ ] Test all endpoints
- [ ] Configure monitoring
- [ ] Set up backup procedures