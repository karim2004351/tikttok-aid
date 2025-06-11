import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export interface VideoAnalysisData {
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
  apiStatus: {
    youtube_official: 'success' | 'failed' | 'no_key' | 'not_tested';
    rapidapi_general: 'success' | 'failed' | 'no_key' | 'not_tested';
    rapidapi_tiktok: 'success' | 'failed' | 'no_key' | 'not_tested';
    web_scraping: 'success' | 'failed' | 'not_tested';
    oembed: 'success' | 'failed' | 'not_tested';
  };
  extractionDetails: {
    attemptedMethods: string[];
    successfulMethod: string;
    failureReasons: string[];
    recommendedActions: string[];
  };
}

export class ComprehensiveVideoAnalyzer {
  private rapidApiTikTokKey: string;
  private youtubeApiKey: string;
  private rapidApiKey: string;

  constructor() {
    this.rapidApiTikTokKey = process.env.RAPIDAPI_KEY_TIKTOK || '';
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY_ENABLED || '';
    this.rapidApiKey = process.env.RAPIDAPI_KEY || '';
  }

  async analyzeVideo(videoUrl: string): Promise<VideoAnalysisData> {
    const platform = this.detectPlatform(videoUrl);
    
    console.log(`Starting comprehensive analysis for ${platform} video...`);
    
    const apiStatus = {
      youtube_official: 'not_tested' as const,
      rapidapi_general: 'not_tested' as const,
      rapidapi_tiktok: 'not_tested' as const,
      web_scraping: 'not_tested' as const,
      oembed: 'not_tested' as const
    };

    const extractionDetails = {
      attemptedMethods: [] as string[],
      successfulMethod: '',
      failureReasons: [] as string[],
      recommendedActions: [] as string[]
    };

    if (platform === 'youtube') {
      return await this.analyzeYouTubeComprehensive(videoUrl, apiStatus, extractionDetails);
    } else if (platform === 'tiktok') {
      return await this.analyzeTikTokComprehensive(videoUrl, apiStatus, extractionDetails);
    } else {
      throw new Error(`Platform ${platform} not supported`);
    }
  }

  private async analyzeYouTubeComprehensive(
    videoUrl: string, 
    apiStatus: any, 
    extractionDetails: any
  ): Promise<VideoAnalysisData> {
    const videoId = this.extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL format');
    }

    // Method 1: YouTube Data API
    if (this.youtubeApiKey) {
      extractionDetails.attemptedMethods.push('YouTube Data API v3');
      try {
        console.log('Attempting YouTube Data API...');
        const result = await this.extractYouTubeOfficial(videoUrl, videoId);
        apiStatus.youtube_official = 'success';
        extractionDetails.successfulMethod = 'YouTube Data API v3';
        result.apiStatus = apiStatus;
        result.extractionDetails = extractionDetails;
        return result;
      } catch (error: any) {
        console.log(`YouTube API failed: ${error.message}`);
        apiStatus.youtube_official = 'failed';
        extractionDetails.failureReasons.push(`YouTube API: ${error.message}`);
        
        if (error.message.includes('not been used') || error.message.includes('disabled')) {
          extractionDetails.recommendedActions.push('Enable YouTube Data API v3 in Google Cloud Console');
        }
      }
    } else {
      apiStatus.youtube_official = 'no_key';
      extractionDetails.recommendedActions.push('Provide YOUTUBE_API_KEY_ENABLED for full video metrics');
    }

    // Method 2: RapidAPI YouTube Services
    if (this.rapidApiKey) {
      extractionDetails.attemptedMethods.push('RapidAPI YouTube Services');
      try {
        console.log('Attempting RapidAPI YouTube services...');
        const result = await this.extractYouTubeViaRapidAPI(videoUrl, videoId);
        apiStatus.rapidapi_general = 'success';
        extractionDetails.successfulMethod = 'RapidAPI YouTube Services';
        result.apiStatus = apiStatus;
        result.extractionDetails = extractionDetails;
        return result;
      } catch (error: any) {
        console.log(`RapidAPI YouTube failed: ${error.message}`);
        apiStatus.rapidapi_general = 'failed';
        extractionDetails.failureReasons.push(`RapidAPI: ${error.message}`);
        
        if (error.message.includes('403') || error.message.includes('quota')) {
          extractionDetails.recommendedActions.push('Check RapidAPI subscription and quota limits');
        }
      }
    } else {
      apiStatus.rapidapi_general = 'no_key';
      extractionDetails.recommendedActions.push('Provide RAPIDAPI_KEY for alternative data sources');
    }

    // Method 3: YouTube oEmbed
    extractionDetails.attemptedMethods.push('YouTube oEmbed API');
    try {
      console.log('Attempting YouTube oEmbed...');
      const result = await this.extractYouTubeOEmbed(videoUrl, videoId);
      apiStatus.oembed = 'success';
      extractionDetails.successfulMethod = 'YouTube oEmbed API';
      result.apiStatus = apiStatus;
      result.extractionDetails = extractionDetails;
      return result;
    } catch (error: any) {
      console.log(`YouTube oEmbed failed: ${error.message}`);
      apiStatus.oembed = 'failed';
      extractionDetails.failureReasons.push(`oEmbed: ${error.message}`);
    }

    // Method 4: Web Scraping
    extractionDetails.attemptedMethods.push('Web Scraping');
    try {
      console.log('Attempting web scraping...');
      const result = await this.extractYouTubeViaScraping(videoUrl, videoId);
      apiStatus.web_scraping = 'success';
      extractionDetails.successfulMethod = 'Web Scraping';
      result.apiStatus = apiStatus;
      result.extractionDetails = extractionDetails;
      return result;
    } catch (error: any) {
      console.log(`Web scraping failed: ${error.message}`);
      apiStatus.web_scraping = 'failed';
      extractionDetails.failureReasons.push(`Scraping: ${error.message}`);
    }

    extractionDetails.recommendedActions.push('Enable at least one API service for video analysis');
    throw new Error('All YouTube extraction methods failed. API credentials required for authentic data.');
  }

  private async analyzeTikTokComprehensive(
    videoUrl: string, 
    apiStatus: any, 
    extractionDetails: any
  ): Promise<VideoAnalysisData> {
    
    // Method 1: Specialized TikTok API
    if (this.rapidApiTikTokKey) {
      extractionDetails.attemptedMethods.push('RapidAPI TikTok Scraper');
      try {
        console.log('Attempting specialized TikTok API...');
        const result = await this.extractTikTokSpecialized(videoUrl);
        apiStatus.rapidapi_tiktok = 'success';
        extractionDetails.successfulMethod = 'RapidAPI TikTok Scraper';
        result.apiStatus = apiStatus;
        result.extractionDetails = extractionDetails;
        return result;
      } catch (error: any) {
        console.log(`Specialized TikTok API failed: ${error.message}`);
        apiStatus.rapidapi_tiktok = 'failed';
        extractionDetails.failureReasons.push(`TikTok API: ${error.message}`);
        
        if (error.message.includes('403') || error.message.includes('subscription')) {
          extractionDetails.recommendedActions.push('Check RapidAPI TikTok subscription status');
        }
      }
    } else {
      apiStatus.rapidapi_tiktok = 'no_key';
      extractionDetails.recommendedActions.push('Provide RAPIDAPI_KEY_TIKTOK for authentic TikTok metrics');
    }

    // Method 2: General RapidAPI TikTok Services
    if (this.rapidApiKey) {
      extractionDetails.attemptedMethods.push('General RapidAPI TikTok Services');
      try {
        console.log('Attempting general RapidAPI TikTok services...');
        const result = await this.extractTikTokViaGeneralAPI(videoUrl);
        apiStatus.rapidapi_general = 'success';
        extractionDetails.successfulMethod = 'General RapidAPI TikTok Services';
        result.apiStatus = apiStatus;
        result.extractionDetails = extractionDetails;
        return result;
      } catch (error: any) {
        console.log(`General RapidAPI TikTok failed: ${error.message}`);
        apiStatus.rapidapi_general = 'failed';
        extractionDetails.failureReasons.push(`General API: ${error.message}`);
      }
    } else {
      apiStatus.rapidapi_general = 'no_key';
      extractionDetails.recommendedActions.push('Provide RAPIDAPI_KEY for alternative TikTok sources');
    }

    // Method 3: Web Scraping
    extractionDetails.attemptedMethods.push('TikTok Web Scraping');
    try {
      console.log('Attempting TikTok web scraping...');
      const result = await this.extractTikTokViaScraping(videoUrl);
      apiStatus.web_scraping = 'success';
      extractionDetails.successfulMethod = 'TikTok Web Scraping';
      result.apiStatus = apiStatus;
      result.extractionDetails = extractionDetails;
      return result;
    } catch (error: any) {
      console.log(`TikTok scraping failed: ${error.message}`);
      apiStatus.web_scraping = 'failed';
      extractionDetails.failureReasons.push(`TikTok Scraping: ${error.message}`);
    }

    extractionDetails.recommendedActions.push('Subscribe to RapidAPI TikTok services for authentic data');
    throw new Error('All TikTok extraction methods failed. API subscriptions required for authentic data.');
  }

  private async extractYouTubeOfficial(videoUrl: string, videoId: string): Promise<VideoAnalysisData> {
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${this.youtubeApiKey}`
    );

    if (!videoResponse.ok) {
      const errorData = await videoResponse.json() as any;
      throw new Error(`${errorData.error?.message || videoResponse.statusText}`);
    }

    const videoData = await videoResponse.json() as any;
    
    if (!videoData.items || videoData.items.length === 0) {
      throw new Error('Video not found or private');
    }

    const video = videoData.items[0];
    const snippet = video.snippet;
    const statistics = video.statistics;
    const contentDetails = video.contentDetails;

    // Get channel data
    let channelInfo = { subscriberCount: 0, description: '', thumbnails: { default: { url: '' } } };
    if (snippet.channelId) {
      try {
        const channelResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${snippet.channelId}&key=${this.youtubeApiKey}`
        );
        
        if (channelResponse.ok) {
          const channelData = await channelResponse.json() as any;
          if (channelData.items && channelData.items[0]) {
            const channel = channelData.items[0];
            channelInfo = {
              subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
              description: channel.snippet.description || '',
              thumbnails: channel.snippet.thumbnails || { default: { url: '' } }
            };
          }
        }
      } catch (e) {
        console.log('Channel data unavailable');
      }
    }

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
        followers: channelInfo.subscriberCount,
        verified: false,
        profilePicture: channelInfo.thumbnails.default?.url || '',
        bio: channelInfo.description
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
      extractionMethod: 'Official API',
      apiStatus: {} as any,
      extractionDetails: {} as any
    };
  }

  private async extractYouTubeViaRapidAPI(videoUrl: string, videoId: string): Promise<VideoAnalysisData> {
    const services = [
      {
        url: `https://youtube-v31.p.rapidapi.com/videos?part=snippet,statistics&id=${videoId}`,
        host: 'youtube-v31.p.rapidapi.com'
      },
      {
        url: 'https://youtube-data8.p.rapidapi.com/video/details/',
        host: 'youtube-data8.p.rapidapi.com',
        method: 'POST',
        body: { url: videoUrl }
      }
    ];

    for (const service of services) {
      try {
        const options: any = {
          method: service.method || 'GET',
          headers: {
            'X-RapidAPI-Key': this.rapidApiKey,
            'X-RapidAPI-Host': service.host
          }
        };

        if (service.body) {
          options.headers['Content-Type'] = 'application/json';
          options.body = JSON.stringify(service.body);
        }

        const response = await fetch(service.url, options);

        if (response.ok) {
          const data = await response.json() as any;
          
          if (data.items && data.items[0]) {
            const video = data.items[0];
            const snippet = video.snippet || {};
            const statistics = video.statistics || {};

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
              duration: 0,
              videoUrl,
              thumbnailUrl: snippet.thumbnails?.high?.url || '',
              isAuthentic: true,
              dataSource: `RapidAPI ${service.host}`,
              extractionMethod: 'RapidAPI',
              apiStatus: {} as any,
              extractionDetails: {} as any
            };
          }
        }
      } catch (error) {
        console.log(`RapidAPI service ${service.host} failed`);
        continue;
      }
    }

    throw new Error('All RapidAPI YouTube services failed');
  }

  private async extractYouTubeOEmbed(videoUrl: string, videoId: string): Promise<VideoAnalysisData> {
    const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`);

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;

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
      extractionMethod: 'Basic Info Only',
      apiStatus: {} as any,
      extractionDetails: {} as any
    };
  }

  private async extractYouTubeViaScraping(videoUrl: string, videoId: string): Promise<VideoAnalysisData> {
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

    const title = $('meta[property="og:title"]').attr('content') || 
                  $('title').text().replace(' - YouTube', '') || 
                  'YouTube Video';

    const description = $('meta[property="og:description"]').attr('content') || '';
    const thumbnail = $('meta[property="og:image"]').attr('content') || '';

    return {
      title,
      description,
      views: 0,
      likes: 0,
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
      rating: 0,
      publishedAt: new Date().toISOString(),
      duration: 0,
      videoUrl,
      thumbnailUrl: thumbnail,
      isAuthentic: false,
      dataSource: 'Web Scraping',
      extractionMethod: 'HTML Parsing',
      apiStatus: {} as any,
      extractionDetails: {} as any
    };
  }

  private async extractTikTokSpecialized(videoUrl: string): Promise<VideoAnalysisData> {
    const response = await fetch('https://tiktok-scraper7.p.rapidapi.com/video/info', {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': this.rapidApiTikTokKey,
        'X-RapidAPI-Host': 'tiktok-scraper7.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: videoUrl })
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    
    if (!data.data || !data.data.video) {
      throw new Error('No video data returned');
    }

    const videoInfo = data.data.video;
    const authorInfo = data.data.author || {};
    const stats = data.data.stats || {};

    return {
      title: videoInfo.desc || videoInfo.title || 'TikTok Video',
      description: videoInfo.desc || '',
      views: parseInt(stats.playCount) || 0,
      likes: parseInt(stats.diggCount) || 0,
      comments: parseInt(stats.commentCount) || 0,
      shares: parseInt(stats.shareCount) || 0,
      author: {
        username: authorInfo.uniqueId || 'Unknown',
        displayName: authorInfo.nickname || 'Unknown',
        followers: parseInt(authorInfo.followerCount) || 0,
        verified: authorInfo.verified || false,
        profilePicture: authorInfo.avatarMedium || '',
        bio: authorInfo.signature || ''
      },
      hashtags: this.extractHashtags(videoInfo.desc || ''),
      platform: 'TikTok',
      rating: this.calculateRating(parseInt(stats.playCount) || 0, parseInt(stats.diggCount) || 0),
      publishedAt: new Date(videoInfo.createTime * 1000).toISOString() || new Date().toISOString(),
      duration: parseInt(videoInfo.duration) || 0,
      videoUrl,
      thumbnailUrl: videoInfo.cover || '',
      isAuthentic: true,
      dataSource: 'TikTok Scraper API',
      extractionMethod: 'Specialized API',
      apiStatus: {} as any,
      extractionDetails: {} as any
    };
  }

  private async extractTikTokViaGeneralAPI(videoUrl: string): Promise<VideoAnalysisData> {
    const apis = [
      {
        url: 'https://tiktok-video-no-watermark2.p.rapidapi.com/video/info',
        host: 'tiktok-video-no-watermark2.p.rapidapi.com'
      },
      {
        url: 'https://tiktok-download-without-watermark.p.rapidapi.com/video-info',
        host: 'tiktok-download-without-watermark.p.rapidapi.com'
      }
    ];

    for (const api of apis) {
      try {
        const response = await fetch(api.url, {
          method: 'POST',
          headers: {
            'X-RapidAPI-Key': this.rapidApiKey,
            'X-RapidAPI-Host': api.host,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url: videoUrl })
        });

        if (response.ok) {
          const data = await response.json() as any;
          if (data && (data.data || data.video)) {
            const videoInfo = data.data || data.video || data;
            
            return {
              title: videoInfo.title || videoInfo.desc || 'TikTok Video',
              description: videoInfo.desc || videoInfo.description || '',
              views: parseInt(videoInfo.play_count || videoInfo.playCount) || 0,
              likes: parseInt(videoInfo.digg_count || videoInfo.likeCount) || 0,
              comments: parseInt(videoInfo.comment_count || videoInfo.commentCount) || 0,
              shares: parseInt(videoInfo.share_count || videoInfo.shareCount) || 0,
              author: {
                username: videoInfo.author?.unique_id || videoInfo.author?.username || 'Unknown',
                displayName: videoInfo.author?.nickname || videoInfo.author?.display_name || 'Unknown',
                followers: parseInt(videoInfo.author?.follower_count) || 0,
                verified: videoInfo.author?.verified || false,
                profilePicture: videoInfo.author?.avatar || '',
                bio: videoInfo.author?.signature || ''
              },
              hashtags: this.extractHashtags(videoInfo.desc || videoInfo.description || ''),
              platform: 'TikTok',
              rating: this.calculateRating(
                parseInt(videoInfo.play_count || videoInfo.playCount) || 0,
                parseInt(videoInfo.digg_count || videoInfo.likeCount) || 0
              ),
              publishedAt: new Date().toISOString(),
              duration: parseInt(videoInfo.duration) || 0,
              videoUrl,
              thumbnailUrl: videoInfo.cover || videoInfo.thumbnail || '',
              isAuthentic: true,
              dataSource: `RapidAPI ${api.host}`,
              extractionMethod: 'General API',
              apiStatus: {} as any,
              extractionDetails: {} as any
            };
          }
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error('All general TikTok APIs failed');
  }

  private async extractTikTokViaScraping(videoUrl: string): Promise<VideoAnalysisData> {
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

    const title = $('meta[property="og:title"]').attr('content')?.replace(' | TikTok', '') || 'TikTok Video';
    const description = $('meta[property="og:description"]').attr('content') || '';
    const thumbnail = $('meta[property="og:image"]').attr('content') || '';

    return {
      title,
      description,
      views: 0,
      likes: 0,
      comments: 0,
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
      rating: 0,
      publishedAt: new Date().toISOString(),
      duration: 0,
      videoUrl,
      thumbnailUrl: thumbnail,
      isAuthentic: false,
      dataSource: 'Web Scraping',
      extractionMethod: 'HTML Parsing',
      apiStatus: {} as any,
      extractionDetails: {} as any
    };
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
}

export const comprehensiveVideoAnalyzer = new ComprehensiveVideoAnalyzer();