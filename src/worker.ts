/**
 * Cloudflare Worker for Story Weaver API
 * Provides serverless backend functionality
 */

export interface Env {
  STORIES_KV: KVNamespace;
  ANALYTICS_KV: KVNamespace;
  ANALYTICS: AnalyticsEngineDataset;
  STORY_ASSETS?: R2Bucket;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route API requests
      if (url.pathname.startsWith('/api/')) {
        const response = await handleApiRequest(request, env, url);
        
        // Add CORS headers to all API responses
        Object.keys(corsHeaders).forEach(key => {
          response.headers.set(key, corsHeaders[key]);
        });
        
        return response;
      }

      // Serve static files for SPA
      return serveStaticFile(request, env);

    } catch (error) {
      console.error('Worker error:', error);
      
      return new Response(
        JSON.stringify({ 
          error: 'Internal Server Error',
          message: error.message,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }
  },
};

async function handleApiRequest(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.replace('/api', '');
  const method = request.method;

  // Analytics tracking
  trackApiRequest(env.ANALYTICS, request, path);

  // Route handling
  if (path.startsWith('/stories')) {
    return handleStoriesApi(request, env, path, method);
  } else if (path.startsWith('/collections')) {
    return handleCollectionsApi(request, env, path, method);
  } else if (path.startsWith('/analytics')) {
    return handleAnalyticsApi(request, env, path, method);
  } else if (path.startsWith('/export')) {
    return handleExportApi(request, env, path, method);
  }

  return new Response('Not Found', { status: 404 });
}

async function handleStoriesApi(request: Request, env: Env, path: string, method: string): Promise<Response> {
  switch (method) {
    case 'GET':
      if (path === '/stories') {
        return getStories(env);
      } else {
        const storyId = path.split('/')[2];
        return getStory(env, storyId);
      }
    
    case 'POST':
      return createStory(request, env);
    
    case 'PUT':
      const storyId = path.split('/')[2];
      return updateStory(request, env, storyId);
    
    case 'DELETE':
      const deleteId = path.split('/')[2];
      return deleteStory(env, deleteId);
    
    default:
      return new Response('Method Not Allowed', { status: 405 });
  }
}

async function getStories(env: Env): Promise<Response> {
  try {
    const { keys } = await env.STORIES_KV.list({ prefix: 'story:' });
    const stories = [];

    for (const key of keys) {
      const story = await env.STORIES_KV.get(key.name, 'json');
      if (story) {
        stories.push(story);
      }
    }

    // Sort by creation date (newest first)
    stories.sort((a, b) => b.createdAt - a.createdAt);

    return new Response(JSON.stringify(stories), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch stories' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function getStory(env: Env, storyId: string): Promise<Response> {
  try {
    const story = await env.STORIES_KV.get(`story:${storyId}`, 'json');
    
    if (!story) {
      return new Response('Story not found', { status: 404 });
    }

    return new Response(JSON.stringify(story), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch story' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function createStory(request: Request, env: Env): Promise<Response> {
  try {
    const story = await request.json() as any;
    
    // Validate required fields
    if (!story.title || !story.content || !story.prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Add server-side metadata
    story.id = story.id || generateId();
    story.createdAt = story.createdAt || Date.now();
    story.updatedAt = Date.now();

    // Store in KV
    await env.STORIES_KV.put(`story:${story.id}`, JSON.stringify(story));

    // Track analytics
    trackStoryCreation(env.ANALYTICS, story);

    return new Response(JSON.stringify(story), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to create story' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function updateStory(request: Request, env: Env, storyId: string): Promise<Response> {
  try {
    const updates = await request.json() as any;
    const existing = await env.STORIES_KV.get(`story:${storyId}`, 'json') as any;

    if (!existing) {
      return new Response('Story not found', { status: 404 });
    }

    // Merge updates
    const updated = {
      ...existing,
      ...updates,
      id: storyId, // Ensure ID doesn't change
      createdAt: existing.createdAt, // Preserve creation date
      updatedAt: Date.now()
    };

    await env.STORIES_KV.put(`story:${storyId}`, JSON.stringify(updated));

    return new Response(JSON.stringify(updated), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to update story' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function deleteStory(env: Env, storyId: string): Promise<Response> {
  try {
    await env.STORIES_KV.delete(`story:${storyId}`);
    
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to delete story' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleCollectionsApi(request: Request, env: Env, path: string, method: string): Promise<Response> {
  // Similar implementation for collections
  return new Response('Collections API not implemented yet', { status: 501 });
}

async function handleAnalyticsApi(request: Request, env: Env, path: string, method: string): Promise<Response> {
  // Analytics endpoint for dashboard
  return new Response('Analytics API not implemented yet', { status: 501 });
}

async function handleExportApi(request: Request, env: Env, path: string, method: string): Promise<Response> {
  // Export functionality
  return new Response('Export API not implemented yet', { status: 501 });
}

async function serveStaticFile(request: Request, env: Env): Promise<Response> {
  // For SPA routing, always return index.html
  // In production, this would be handled by Cloudflare Pages
  return new Response('Static file serving handled by Cloudflare Pages', { 
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
}

function trackApiRequest(analytics: AnalyticsEngineDataset, request: Request, path: string) {
  try {
    analytics.writeDataPoint({
      blobs: [request.method, path, request.headers.get('User-Agent') || 'unknown'],
      doubles: [Date.now()],
      indexes: [request.cf?.colo || 'unknown']
    });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
}

function trackStoryCreation(analytics: AnalyticsEngineDataset, story: any) {
  try {
    analytics.writeDataPoint({
      blobs: ['story_created', story.language, story.categoryId || 'none'],
      doubles: [Date.now(), story.content.length],
      indexes: ['story_metrics']
    });
  } catch (error) {
    console.error('Story analytics tracking failed:', error);
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}