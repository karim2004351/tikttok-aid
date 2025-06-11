import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export interface AuthenticVideoAnalysis {
  title: string;
  description: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  author: {
    username: string;
    displayName: string;
    followers: number;
    verified: boolean;
  };
  hashtags: string[];
  platform: string;
  rating: number;
  publishedAt: string;
  duration: number;
  videoUrl: string;
  dataSource: 'official_api' | 'web_scraping' | 'unavailable';
  isAuthentic: boolean;
}

export class RealDataAnalyzer {
  private youtubeApiKey: string;

  constructor() {
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY || '';
  }

  async analyzeVideo(videoUrl: string): Promise<AuthenticVideoAnalysis> {
    const platform = this.detectPlatform(videoUrl);
    
    try {
      switch (platform) {
        case 'youtube':
          return await this.analyzeYouTubeVideo(videoUrl);
        case 'tiktok':
          return await this.analyzeTikTokVideo(videoUrl);
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (error: any) {
      console.error(`Analysis error for ${platform}:`, error.message);
      throw new Error(`Unable to analyze ${platform} video: ${error.message}`);
    }
  }

  private async analyzeYouTubeVideo(videoUrl: string): Promise<AuthenticVideoAnalysis> {
    if (!this.youtubeApiKey) {
      throw new Error('YouTube API key required for authentic data analysis');
    }

    const videoId = this.extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL format');
    }

    console.log('Fetching authentic YouTube data via official API...');

    // Get video details
    const videoApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${this.youtubeApiKey}`;
    const response = await fetch(videoApiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`YouTube API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json() as any;
    
    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found or is private');
    }

    const video = data.items[0];
    const snippet = video.snippet;
    const statistics = video.statistics;
    const contentDetails = video.contentDetails;

    // Get channel subscriber count
    let subscriberCount = 0;
    if (snippet.channelId) {
      try {
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${snippet.channelId}&key=${this.youtubeApiKey}`;
        const channelResponse = await fetch(channelUrl);
        if (channelResponse.ok) {
          const channelData = await channelResponse.json() as any;
          if (channelData.items && channelData.items[0]) {
            subscriberCount = parseInt(channelData.items[0].statistics.subscriberCount) || 0;
          }
        }
      } catch (e) {
        console.log('Channel info unavailable');
      }
    }

    return {
      title: snippet.title || 'YouTube Video',
      description: snippet.description || '',
      views: parseInt(statistics.viewCount) || 0,
      likes: parseInt(statistics.likeCount) || 0,
      comments: parseInt(statistics.commentCount) || 0,
      shares: 0, // YouTube API doesn't provide share count
      author: {
        username: snippet.channelTitle || 'Unknown Channel',
        displayName: snippet.channelTitle || 'Unknown Channel',
        followers: subscriberCount,
        verified: false
      },
      hashtags: this.extractHashtags(snippet.description || ''),
      platform: 'YouTube',
      rating: this.calculateEngagementRating(
        parseInt(statistics.viewCount) || 0,
        parseInt(statistics.likeCount) || 0
      ),
      publishedAt: snippet.publishedAt || new Date().toISOString(),
      duration: this.parseYouTubeDuration(contentDetails.duration),
      videoUrl,
      dataSource: 'official_api',
      isAuthentic: true
    };
  }

  private async analyzeTikTokVideo(videoUrl: string): Promise<AuthenticVideoAnalysis> {
    console.log('Attempting TikTok analysis via web scraping...');
    
    try {
      // Try to extract basic info from TikTok page
      const response = await fetch(videoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`TikTok page returned ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract metadata from page
      const title = $('meta[property="og:title"]').attr('content') || 
                   $('title').text() || 
                   'TikTok Video';
      
      const description = $('meta[property="og:description"]').attr('content') || 
                         $('meta[name="description"]').attr('content') || 
                         '';

      // Look for JSON data in script tags
      let videoStats = { views: 0, likes: 0, comments: 0, shares: 0 };
      
      $('script').each((i, elem) => {
        const scriptContent = $(elem).html();
        if (scriptContent && scriptContent.includes('playCount')) {
          try {
            // Try to extract stats from various JSON structures
            const statsMatch = scriptContent.match(/"playCount":(\d+)/);
            const likesMatch = scriptContent.match(/"diggCount":(\d+)/);
            const commentsMatch = scriptContent.match(/"commentCount":(\d+)/);
            const sharesMatch = scriptContent.match(/"shareCount":(\d+)/);
            
            if (statsMatch) videoStats.views = parseInt(statsMatch[1]);
            if (likesMatch) videoStats.likes = parseInt(likesMatch[1]);
            if (commentsMatch) videoStats.comments = parseInt(commentsMatch[1]);
            if (sharesMatch) videoStats.shares = parseInt(sharesMatch[1]);
          } catch (e) {
            // Continue searching
          }
        }
      });

      return {
        title: this.cleanText(title),
        description: this.cleanText(description),
        views: videoStats.views,
        likes: videoStats.likes,
        comments: videoStats.comments,
        shares: videoStats.shares,
        author: {
          username: 'TikTok User',
          displayName: 'TikTok User',
          followers: 0,
          verified: false
        },
        hashtags: this.extractHashtags(description),
        platform: 'TikTok',
        rating: this.calculateEngagementRating(videoStats.views, videoStats.likes),
        publishedAt: new Date().toISOString(),
        duration: 30, // Typical TikTok video length
        videoUrl,
        dataSource: videoStats.views > 0 ? 'web_scraping' : 'unavailable',
        isAuthentic: videoStats.views > 0
      };
    } catch (error: any) {
      throw new Error(`TikTok analysis failed: ${error.message}`);
    }
  }

  private detectPlatform(url: string): string {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      return 'youtube';
    }
    if (lowerUrl.includes('tiktok.com') || lowerUrl.includes('vm.tiktok.com')) {
      return 'tiktok';
    }
    
    throw new Error('Unsupported video platform');
  }

  private extractYouTubeVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#[\w\u0590-\u05ff\u0600-\u06ff]+/g;
    const matches = text.match(hashtagRegex) || [];
    return matches.slice(0, 10);
  }

  private cleanText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  private calculateEngagementRating(views: number, likes: number): number {
    if (views === 0) return 0;
    
    const engagementRate = (likes / views) * 100;
    
    if (engagementRate >= 10) return 5;
    if (engagementRate >= 5) return 4;
    if (engagementRate >= 2) return 3;
    if (engagementRate >= 1) return 2;
    return 1;
  }

  private parseYouTubeDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }
}

export const realDataAnalyzer = new RealDataAnalyzer();