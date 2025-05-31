import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Perplexity Sonar API configuration
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Default news topics
const DEFAULT_NEWS_TOPICS = [
  'artificial intelligence technology breakthroughs',
  'startup funding and venture capital',
  'space exploration and discoveries',
];

// Cache management functions
function getCacheKey(topics: string[]) {
  const today = new Date().toISOString().split('T')[0];
  const topicsString = topics.sort().join('|');
  const hash = crypto.createHash('md5').update(`${today}-${topicsString}`).digest('hex');
  return `news-cache-${hash}.json`;
}

function getCacheFilePath(cacheKey: string) {
  const cacheDir = path.join(process.cwd(), 'temp', 'news-cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  return path.join(cacheDir, cacheKey);
}

function getCachedNews(topics: string[]) {
  try {
    const cacheKey = getCacheKey(topics);
    const cacheFilePath = getCacheFilePath(cacheKey);
    
    if (fs.existsSync(cacheFilePath)) {
      const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
      
      const cacheTime = new Date(cacheData.timestamp);
      const now = new Date();
      const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        console.log(`📱 Found cached news response (${hoursDiff.toFixed(1)}h old)`);
        return cacheData.newsData;
      } else {
        console.log(`🗑️ Cache expired (${hoursDiff.toFixed(1)}h old), will fetch fresh news`);
        fs.unlinkSync(cacheFilePath);
      }
    }
    
    return null;
  } catch (error) {
    console.log(`Cache read error: ${error.message}`);
    return null;
  }
}

function setCachedNews(topics: string[], newsData: any[]) {
  try {
    const cacheKey = getCacheKey(topics);
    const cacheFilePath = getCacheFilePath(cacheKey);
    
    const cacheData = {
      timestamp: new Date().toISOString(),
      topics: topics,
      newsData: newsData
    };
    
    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2));
    console.log(`💾 Cached news response for topics: ${topics.join(', ')}`);
  } catch (error) {
    console.log(`Cache write error: ${error.message}`);
  }
}

function cleanupOldCache() {
  try {
    const cacheDir = path.join(process.cwd(), 'temp', 'news-cache');
    if (!fs.existsSync(cacheDir)) return;
    
    const files = fs.readdirSync(cacheDir);
    const now = new Date();
    let deletedCount = 0;
    
    files.forEach(file => {
      const filePath = path.join(cacheDir, file);
      const stats = fs.statSync(filePath);
      const hoursDiff = (now - stats.mtime) / (1000 * 60 * 60);
      
      if (hoursDiff > 48) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    });
    
    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} old cache files`);
    }
  } catch (error) {
    console.log(`Cache cleanup error: ${error.message}`);
  }
}

async function fetchNewsWithPerplexity(topics: string[]) {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY is not configured');
  }

  // Check cache first
  const cachedNews = getCachedNews(topics);
  if (cachedNews) {
    console.log(`✅ Using cached news for ${topics.length} topics`);
    return cachedNews;
  }

  console.log(`🌐 Fetching fresh news for ${topics.length} topics using Perplexity Sonar API`);
  
  // Clean up old cache files
  cleanupOldCache();
  
  try {
    const topicsText = topics.map((topic, index) => `${index + 1}. ${topic}`).join('\n');
    
    const payload = {
      model: "sonar-pro",
      messages: [
        {
          role: "system",
          content: "You are a professional news analyst. Provide concise, sharp, and deeply informative news summaries. For each topic, focus on the most significant recent developments and their implications. Include specific details, numbers, and context that matter. Be analytical and insightful, not just descriptive. Structure your response clearly by topic."
        },
        {
          role: "user",
          content: `Give me the most important recent news stories for each of these topics. For each topic, provide 1-2 key stories with:
          - What happened (specific details)
          - Why it matters (implications and context)
          - Key numbers or data points
          - What to watch next
          
          Topics:
          ${topicsText}
          
          Keep each story to 2-3 sentences maximum but make them information-dense and insightful. Clearly separate each topic with headers.`
        }
      ],
      search_recency_filter: "day",
      temperature: 0.1,
      max_tokens: 1200
    };
    
    console.log('Making API request to Perplexity Sonar...');
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const newsContent = data.choices[0]?.message?.content;
    
    if (newsContent) {
      const newsData = [{
        topic: 'Combined News Intelligence',
        content: newsContent,
        citations: data.citations || []
      }];
      
      console.log(`✅ Successfully fetched news for all ${topics.length} topics`);
      console.log(`📊 Response: ${newsContent.length} chars, ${data.citations?.length || 0} citations`);
      
      // Cache the response
      setCachedNews(topics, newsData);
      
      return newsData;
      
    } else {
      throw new Error('No content received from Perplexity API');
    }
    
  } catch (error) {
    console.log(`Error fetching news from Perplexity API: ${error.message}`);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topicsParam = searchParams.get('topics');
    
    // Parse topics from query parameter or use default
    let topics = DEFAULT_NEWS_TOPICS;
    if (topicsParam) {
      try {
        topics = JSON.parse(topicsParam);
      } catch {
        // If JSON parsing fails, treat as comma-separated string
        topics = topicsParam.split(',').map(t => t.trim()).filter(t => t.length > 0);
      }
    }
    
    console.log(`📰 News API called with ${topics.length} topics:`, topics);
    
    const newsData = await fetchNewsWithPerplexity(topics);
    
    return NextResponse.json({
      success: true,
      data: newsData,
      topics: topics,
      cached: getCachedNews(topics) !== null
    });
    
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch news' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topics = DEFAULT_NEWS_TOPICS } = body;
    
    console.log(`📰 News API (POST) called with ${topics.length} topics:`, topics);
    
    const newsData = await fetchNewsWithPerplexity(topics);
    
    return NextResponse.json({
      success: true,
      data: newsData,
      topics: topics,
      cached: getCachedNews(topics) !== null
    });
    
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch news' 
      },
      { status: 500 }
    );
  }
} 