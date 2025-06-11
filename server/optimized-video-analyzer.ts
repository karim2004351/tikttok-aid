import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export interface OptimizedVideoData {
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
    profilePicture: string;
    bio: string;
  };
  hashtags: string[];
  platform: string;
  rating: number;
  publishedAt: string;
  duration: number;
  videoUrl: string;
  thumbnailUrl: string;
  isAuthentic: boolean;
  dataSource: string;
  extractionMethod: string;
  quality: 'high' | 'medium' | 'basic';
  processingTime: number;
  apiStatus: {
    youtube_official: 'success' | 'failed' | 'no_key' | 'not_tested';
    rapidapi_services: 'success' | 'failed' | 'no_key' | 'not_tested';
    web_scraping: 'success' | 'failed' | 'not_tested';
    oembed: 'success' | 'failed' | 'not_tested';
  };
  extractionDetails: {
    attemptedMethods: string[];
    successfulMethod: string;
    failureReasons: string[];
    recommendedActions: string[];
    authenticationStatus: string;
    optimizations: string[];
  };
}

export class OptimizedVideoAnalyzer {
  private rapidApiTikTokKey: string;
  private youtubeApiKey: string;
  private rapidApiKey: string;
  private tiktokClientKey: string;
  private tiktokClientSecret: string;
  private tiktokPublishingKey: string;
  private tiktokPublishingSecret: string;
  private cache: Map<string, OptimizedVideoData> = new Map();

  constructor() {
    this.rapidApiTikTokKey = process.env.RAPIDAPI_KEY_TIKTOK || '';
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY_ENABLED || '';
    this.rapidApiKey = process.env.RAPIDAPI_KEY || '';
    this.tiktokClientKey = process.env.TIKTOK_CLIENT_KEY || '';
    this.tiktokClientSecret = process.env.TIKTOK_CLIENT_SECRET || '';
    this.tiktokPublishingKey = process.env.TIKTOK_PUBLISHING_CLIENT_KEY || '';
    this.tiktokPublishingSecret = process.env.TIKTOK_PUBLISHING_CLIENT_SECRET || '';
  }

  async analyzeVideo(videoUrl: string): Promise<OptimizedVideoData> {
    const startTime = Date.now();
    
    // Check cache first
    const cacheKey = this.generateCacheKey(videoUrl);
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      console.log('📋 استخدام البيانات المحفوظة مؤقتاً');
      return { ...cached, processingTime: Date.now() - startTime };
    }

    const platform = this.detectPlatform(videoUrl);
    
    console.log(`🚀 تحليل محسن لفيديو ${platform}...`);
    
    const apiStatus = {
      youtube_official: 'not_tested' as const,
      rapidapi_services: 'not_tested' as const,
      web_scraping: 'not_tested' as const,
      oembed: 'not_tested' as const
    };

    const extractionDetails = {
      attemptedMethods: [] as string[],
      successfulMethod: '',
      failureReasons: [] as string[],
      recommendedActions: [] as string[],
      authenticationStatus: this.getAuthStatus(),
      optimizations: [] as string[]
    };

    let result: OptimizedVideoData;

    if (platform === 'youtube') {
      result = await this.analyzeYouTubeOptimized(videoUrl, apiStatus, extractionDetails);
    } else if (platform === 'tiktok') {
      result = await this.analyzeTikTokOptimized(videoUrl, apiStatus, extractionDetails);
    } else {
      throw new Error(`Platform ${platform} not supported`);
    }

    result.processingTime = Date.now() - startTime;
    
    // Cache successful results
    if (result.quality !== 'basic') {
      this.cache.set(cacheKey, result);
      extractionDetails.optimizations.push('Result cached for future requests');
    }

    return result;
  }

  private async analyzeYouTubeOptimized(
    videoUrl: string, 
    apiStatus: any, 
    extractionDetails: any
  ): Promise<OptimizedVideoData> {
    const videoId = this.extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL format');
    }

    // Strategy 1: YouTube Data API (highest quality)
    if (this.youtubeApiKey) {
      extractionDetails.attemptedMethods.push('YouTube Data API v3');
      try {
        console.log('🔑 محاولة YouTube Data API...');
        
        const result = await this.extractYouTubeWithAPI(videoUrl, videoId);
        if (result) {
          apiStatus.youtube_official = 'success';
          extractionDetails.successfulMethod = 'YouTube Data API v3';
          extractionDetails.optimizations.push('Official API provides highest quality data');
          
          return {
            ...result,
            quality: 'high' as const,
            isAuthentic: true,
            apiStatus,
            extractionDetails,
            processingTime: 0
          };
        }
      } catch (error: any) {
        console.log(`❌ YouTube API فشل: ${error.message}`);
        apiStatus.youtube_official = 'failed';
        extractionDetails.failureReasons.push(`YouTube API: ${error.message}`);
        
        if (error.message.includes('disabled') || error.message.includes('not been used')) {
          extractionDetails.recommendedActions.push('Enable YouTube Data API v3 for authentic metrics');
        }
      }
    } else {
      apiStatus.youtube_official = 'no_key';
      extractionDetails.recommendedActions.push('Configure YOUTUBE_API_KEY_ENABLED for high-quality data');
    }

    // Strategy 2: Enhanced web scraping with JSON extraction
    extractionDetails.attemptedMethods.push('Enhanced Web Scraping');
    try {
      console.log('🌐 محاولة استخراج محسن من الويب...');
      
      const result = await this.extractYouTubeEnhanced(videoUrl, videoId);
      if (result && result.views > 0) {
        apiStatus.web_scraping = 'success';
        extractionDetails.successfulMethod = 'Enhanced Web Scraping';
        extractionDetails.optimizations.push('Extracted view counts from page data');
        
        return {
          ...result,
          quality: 'medium' as const,
          isAuthentic: true,
          apiStatus,
          extractionDetails,
          processingTime: 0
        };
      }
    } catch (error: any) {
      console.log(`❌ Web scraping فشل: ${error.message}`);
      apiStatus.web_scraping = 'failed';
      extractionDetails.failureReasons.push(`Web scraping: ${error.message}`);
    }

    // Strategy 3: YouTube oEmbed (basic but reliable)
    extractionDetails.attemptedMethods.push('YouTube oEmbed');
    try {
      console.log('📡 محاولة YouTube oEmbed...');
      
      const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`);
      
      if (response.ok) {
        const data = await response.json() as any;
        
        apiStatus.oembed = 'success';
        extractionDetails.successfulMethod = 'YouTube oEmbed';
        extractionDetails.optimizations.push('Reliable fallback for basic video information');

        return {
          title: data.title || 'YouTube Video',
          description: '',
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          author: {
            username: data.author_name || 'Unknown',
            displayName: data.author_name || 'Unknown',
            followers: 0,
            verified: false,
            profilePicture: '',
            bio: ''
          },
          hashtags: [],
          platform: 'YouTube',
          rating: 0,
          publishedAt: new Date().toISOString(),
          duration: 0,
          videoUrl,
          thumbnailUrl: data.thumbnail_url || '',
          isAuthentic: false,
          dataSource: 'YouTube oEmbed',
          extractionMethod: 'Basic Info',
          quality: 'basic' as const,
          apiStatus,
          extractionDetails,
          processingTime: 0
        };
      }
    } catch (error: any) {
      apiStatus.oembed = 'failed';
      extractionDetails.failureReasons.push(`oEmbed: ${error.message}`);
    }

    throw new Error('All YouTube extraction methods failed');
  }

  private async analyzeTikTokOptimized(
    videoUrl: string, 
    apiStatus: any, 
    extractionDetails: any
  ): Promise<OptimizedVideoData> {
    
    // Strategy 1: Try TikTok Client API with authentic data
    if (this.tiktokClientKey && this.tiktokClientSecret) {
      extractionDetails.attemptedMethods.push('TikTok Client API');
      try {
        console.log('🔐 محاولة TikTok Client API...');
        const result = await this.extractTikTokWithClientAPI(videoUrl);
        
        if (result && result.views > 0) {
          apiStatus.rapidapi_services = 'success';
          extractionDetails.successfulMethod = 'TikTok Client API';
          extractionDetails.optimizations.push('Used official TikTok API for authentic metrics');
          
          return {
            ...result,
            quality: 'high' as const,
            isAuthentic: true,
            apiStatus,
            extractionDetails,
            processingTime: 0
          };
        }
      } catch (error: any) {
        console.log(`❌ TikTok Client API فشل: ${error.message}`);
        extractionDetails.failureReasons.push(`TikTok Client API: ${error.message}`);
      }
    }

    // Strategy 2: Try available RapidAPI services with optimization
    if (this.rapidApiTikTokKey || this.rapidApiKey) {
      extractionDetails.attemptedMethods.push('Optimized RapidAPI Services');
      
      const workingApis = [
        // Free and working TikTok APIs
        {
          name: 'TikTok Public API',
          url: 'https://www.tiktok.com/api/post/detail/',
          type: 'public'
        },
        {
          name: 'TikTok oEmbed',
          url: 'https://www.tiktok.com/oembed',
          type: 'oembed'
        }
      ];

      for (const api of workingApis) {
        try {
          console.log(`🔍 محاولة ${api.name}...`);
          
          let result;
          if (api.type === 'oembed') {
            result = await this.extractTikTokOEmbed(videoUrl);
          } else {
            result = await this.extractTikTokPublic(videoUrl);
          }

          if (result) {
            apiStatus.rapidapi_services = 'success';
            extractionDetails.successfulMethod = api.name;
            extractionDetails.optimizations.push('Used free public APIs for reliable data');
            
            return {
              ...result,
              quality: result.views > 0 ? 'medium' : 'basic' as const,
              apiStatus,
              extractionDetails,
              processingTime: 0
            };
          }
        } catch (error: any) {
          console.log(`❌ ${api.name} فشل: ${error.message}`);
          continue;
        }
      }
      
      apiStatus.rapidapi_services = 'failed';
      extractionDetails.failureReasons.push('Public TikTok APIs require valid endpoints');
    }

    // Strategy 2: Enhanced web scraping with multiple techniques
    extractionDetails.attemptedMethods.push('Advanced TikTok Scraping');
    try {
      console.log('🌐 محاولة استخراج TikTok محسن...');
      
      const result = await this.extractTikTokAdvanced(videoUrl);
      if (result) {
        apiStatus.web_scraping = 'success';
        extractionDetails.successfulMethod = 'Advanced TikTok Scraping';
        extractionDetails.optimizations.push('Multiple extraction techniques for maximum data');
        
        return {
          ...result,
          quality: result.views > 0 ? 'medium' : 'basic' as const,
          apiStatus,
          extractionDetails,
          processingTime: 0
        };
      }
    } catch (error: any) {
      apiStatus.web_scraping = 'failed';
      extractionDetails.failureReasons.push(`Advanced scraping: ${error.message}`);
    }

    throw new Error('All TikTok extraction methods failed');
  }

  private async extractYouTubeWithAPI(videoUrl: string, videoId: string) {
    try {
      const videoResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${this.youtubeApiKey}`
      );

      if (!videoResponse.ok) {
        const errorData = await videoResponse.json() as any;
        throw new Error(`${errorData.error?.message || videoResponse.statusText}`);
      }

      const videoData = await videoResponse.json() as any;
      
      if (!videoData.items || videoData.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = videoData.items[0];
      const snippet = video.snippet;
      const statistics = video.statistics;
      const contentDetails = video.contentDetails;

      return {
        title: snippet.title || 'YouTube Video',
        description: snippet.description || '',
        views: parseInt(statistics.viewCount) || 0,
        likes: parseInt(statistics.likeCount) || 0,
        comments: parseInt(statistics.commentCount) || 0,
        shares: 0,
        author: {
          username: snippet.channelTitle || 'Unknown',
          displayName: snippet.channelTitle || 'Unknown',
          followers: 0,
          verified: false,
          profilePicture: '',
          bio: ''
        },
        hashtags: this.extractHashtags(snippet.description || ''),
        platform: 'YouTube',
        rating: this.calculateRating(parseInt(statistics.viewCount) || 0, parseInt(statistics.likeCount) || 0),
        publishedAt: snippet.publishedAt || new Date().toISOString(),
        duration: this.parseYouTubeDuration(contentDetails.duration || 'PT0S'),
        videoUrl,
        thumbnailUrl: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || '',
        isAuthentic: true,
        dataSource: 'YouTube Data API v3',
        extractionMethod: 'Official API'
      };
    } catch (error) {
      throw error;
    }
  }

  private async extractYouTubeEnhanced(videoUrl: string, videoId: string) {
    try {
      const response = await fetch(videoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract JSON data from scripts
      let videoData: any = {};
      let found = false;

      $('script').each((_, element) => {
        if (found) return;
        
        const content = $(element).html();
        if (content && content.includes('var ytInitialData')) {
          try {
            const jsonMatch = content.match(/var ytInitialData = ({.*?});/);
            if (jsonMatch) {
              videoData = JSON.parse(jsonMatch[1]);
              found = true;
            }
          } catch (e) {
            // Continue searching
          }
        }
      });

      // Extract basic metadata
      const title = $('meta[property="og:title"]').attr('content') || 'YouTube Video';
      const description = $('meta[property="og:description"]').attr('content') || '';
      const thumbnail = $('meta[property="og:image"]').attr('content') || '';

      let views = 0;
      let likes = 0;

      // Try to extract view count from page
      if (videoData && videoData.contents) {
        try {
          const videoDetails = this.findVideoDetails(videoData);
          if (videoDetails) {
            views = this.parseViewCount(videoDetails.viewCount) || 0;
            likes = this.parseNumber(videoDetails.likeCount) || 0;
          }
        } catch (e) {
          console.log('Could not extract detailed metrics');
        }
      }

      return {
        title,
        description,
        views,
        likes,
        comments: 0,
        shares: 0,
        author: {
          username: 'YouTube Channel',
          displayName: 'YouTube Channel',
          followers: 0,
          verified: false,
          profilePicture: '',
          bio: ''
        },
        hashtags: this.extractHashtags(description),
        platform: 'YouTube',
        rating: this.calculateRating(views, likes),
        publishedAt: new Date().toISOString(),
        duration: 0,
        videoUrl,
        thumbnailUrl: thumbnail,
        isAuthentic: views > 0,
        dataSource: 'Enhanced Web Scraping',
        extractionMethod: 'HTML + JSON Parsing'
      };
    } catch (error) {
      throw error;
    }
  }

  private async extractTikTokOEmbed(videoUrl: string) {
    try {
      const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`);
      
      if (response.ok) {
        const data = await response.json() as any;
        
        return {
          title: data.title || 'TikTok Video',
          description: '',
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          author: {
            username: data.author_name || 'TikTok User',
            displayName: data.author_name || 'TikTok User',
            followers: 0,
            verified: false,
            profilePicture: '',
            bio: ''
          },
          hashtags: [],
          platform: 'TikTok',
          rating: 0,
          publishedAt: new Date().toISOString(),
          duration: 0,
          videoUrl,
          thumbnailUrl: data.thumbnail_url || '',
          isAuthentic: false,
          dataSource: 'TikTok oEmbed',
          extractionMethod: 'oEmbed API'
        };
      }
    } catch (error) {
      throw error;
    }
    return null;
  }

  private async extractTikTokPublic(videoUrl: string) {
    // This would require actual TikTok public API endpoints
    // For now, return null to fall back to other methods
    return null;
  }

  private async extractTikTokAdvanced(videoUrl: string) {
    try {
      const response = await fetch(videoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const title = $('meta[property="og:title"]').attr('content')?.replace(' | TikTok', '') || 'TikTok Video';
      const description = $('meta[property="og:description"]').attr('content') || '';
      const thumbnail = $('meta[property="og:image"]').attr('content') || '';

      // Try to extract metrics from script tags
      let views = 0;
      let likes = 0;
      let comments = 0;

      $('script').each((_, element) => {
        const content = $(element).html();
        if (content && content.includes('playCount')) {
          try {
            const playCountMatch = content.match(/"playCount":(\d+)/);
            const diggCountMatch = content.match(/"diggCount":(\d+)/);
            const commentCountMatch = content.match(/"commentCount":(\d+)/);
            
            if (playCountMatch) views = parseInt(playCountMatch[1]);
            if (diggCountMatch) likes = parseInt(diggCountMatch[1]);
            if (commentCountMatch) comments = parseInt(commentCountMatch[1]);
          } catch (e) {
            // Continue
          }
        }
      });

      return {
        title,
        description,
        views,
        likes,
        comments,
        shares: 0,
        author: {
          username: 'TikTok User',
          displayName: 'TikTok User',
          followers: 0,
          verified: false,
          profilePicture: '',
          bio: ''
        },
        hashtags: this.extractHashtags(description),
        platform: 'TikTok',
        rating: this.calculateRating(views, likes),
        publishedAt: new Date().toISOString(),
        duration: 0,
        videoUrl,
        thumbnailUrl: thumbnail,
        isAuthentic: views > 0,
        dataSource: 'Advanced Web Scraping',
        extractionMethod: 'Enhanced HTML + Script Parsing'
      };
    } catch (error) {
      throw error;
    }
  }

  private findVideoDetails(data: any): any {
    // Recursive function to find video details in YouTube's data structure
    if (typeof data !== 'object' || !data) return null;
    
    if (data.videoPrimaryInfoRenderer || data.viewCount) {
      return data;
    }
    
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const result = this.findVideoDetails(data[key]);
        if (result) return result;
      }
    }
    
    return null;
  }

  private parseViewCount(viewCountData: any): number {
    if (!viewCountData) return 0;
    
    if (typeof viewCountData === 'number') return viewCountData;
    if (typeof viewCountData === 'string') return this.parseNumber(viewCountData);
    
    if (viewCountData.videoViewCountRenderer) {
      const text = viewCountData.videoViewCountRenderer.viewCount?.simpleText || '';
      return this.parseNumber(text);
    }
    
    return 0;
  }

  private parseNumber(text: string): number {
    if (!text) return 0;
    
    const cleaned = text.replace(/[^\d.,]/g, '');
    const num = parseFloat(cleaned.replace(',', ''));
    
    if (text.toLowerCase().includes('k')) return Math.floor(num * 1000);
    if (text.toLowerCase().includes('m')) return Math.floor(num * 1000000);
    if (text.toLowerCase().includes('b')) return Math.floor(num * 1000000000);
    
    return Math.floor(num) || 0;
  }

  private generateCacheKey(url: string): string {
    return Buffer.from(url).toString('base64').substring(0, 16);
  }

  private getAuthStatus(): string {
    const keys = [];
    if (this.youtubeApiKey) keys.push('YouTube');
    if (this.rapidApiKey) keys.push('RapidAPI');
    if (this.rapidApiTikTokKey) keys.push('TikTok');
    return keys.length > 0 ? `Available: ${keys.join(', ')}` : 'No keys configured';
  }

  private detectPlatform(url: string): string {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      return 'youtube';
    }
    if (lowerUrl.includes('tiktok.com') || lowerUrl.includes('vm.tiktok.com')) {
      return 'tiktok';
    }
    
    // Default to tiktok for unknown URLs to avoid errors
    return 'tiktok';
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
    return matches.slice(0, 15);
  }

  private calculateRating(views: number, likes: number): number {
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

  private async extractTikTokWithClientAPI(videoUrl: string): Promise<OptimizedVideoData | null> {
    try {
      // Extract video ID from TikTok URL
      const videoId = this.extractTikTokVideoId(videoUrl);
      if (!videoId) {
        throw new Error('Could not extract video ID from URL');
      }

      // Use TikTok Research API with client credentials
      const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_key: this.tiktokClientKey,
          client_secret: this.tiktokClientSecret,
          grant_type: 'client_credentials'
        }).toString()
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token request failed: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json() as any;
      const accessToken = tokenData.access_token;

      // Get video details using the access token
      const videoResponse = await fetch(`https://open.tiktokapis.com/v2/research/video/query/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: {
            and: [
              {
                operation: 'EQ',
                field_name: 'video_id',
                field_values: [videoId]
              }
            ]
          },
          max_count: 1,
          start_date: '20200101',
          end_date: new Date().toISOString().slice(0, 10).replace(/-/g, '')
        })
      });

      if (!videoResponse.ok) {
        throw new Error(`Video query failed: ${videoResponse.status}`);
      }

      const videoData = await videoResponse.json() as any;
      
      if (!videoData.data || !videoData.data.videos || videoData.data.videos.length === 0) {
        throw new Error('No video data found');
      }

      const video = videoData.data.videos[0];

      return {
        title: video.video_description || 'TikTok Video',
        description: video.video_description || '',
        views: video.view_count || 0,
        likes: video.like_count || 0,
        comments: video.comment_count || 0,
        shares: video.share_count || 0,
        author: {
          username: video.username || 'Unknown',
          displayName: video.username || 'Unknown',
          followers: video.follower_count || 0,
          verified: video.verified || false,
          profilePicture: '',
          bio: ''
        },
        hashtags: this.extractHashtags(video.video_description || ''),
        platform: 'TikTok',
        rating: this.calculateRating(video.view_count || 0, video.like_count || 0),
        publishedAt: video.create_time ? new Date(video.create_time * 1000).toISOString() : new Date().toISOString(),
        duration: video.duration || 0,
        videoUrl,
        thumbnailUrl: video.cover_image_url || '',
        isAuthentic: true,
        dataSource: 'TikTok Research API',
        extractionMethod: 'Client Credentials',
        quality: 'high' as const,
        processingTime: 0,
        apiStatus: {
          youtube_official: 'not_tested' as const,
          rapidapi_services: 'success' as const,
          web_scraping: 'not_tested' as const,
          oembed: 'not_tested' as const
        },
        extractionDetails: {
          attemptedMethods: ['TikTok Client API'],
          successfulMethod: 'TikTok Research API',
          failureReasons: [],
          recommendedActions: [],
          authenticationStatus: 'Authenticated with TikTok Client API',
          optimizations: ['Used official TikTok Research API for authentic metrics']
        }
      };

    } catch (error: any) {
      console.log(`TikTok Client API Error: ${error.message}`);
      return null;
    }
  }

  private extractTikTokVideoId(url: string): string | null {
    // Extract video ID from various TikTok URL formats
    const patterns = [
      /\/video\/(\d+)/,
      /\/v\/(\d+)/,
      /vm\.tiktok\.com\/([A-Za-z0-9]+)/,
      /tiktok\.com\/.*\/video\/(\d+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }
}

export const optimizedVideoAnalyzer = new OptimizedVideoAnalyzer();