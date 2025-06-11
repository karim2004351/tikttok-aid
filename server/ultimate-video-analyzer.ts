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
    alternative_apis: 'success' | 'failed' | 'not_tested';
  };
  extractionDetails: {
    attemptedMethods: string[];
    successfulMethod: string;
    failureReasons: string[];
    recommendedActions: string[];
    authenticationStatus: string;
  };
}

export class UltimateVideoAnalyzer {
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
    
    console.log(`🚀 Ultimate analysis starting for ${platform} video...`);
    
    const apiStatus = {
      youtube_official: 'not_tested' as const,
      rapidapi_general: 'not_tested' as const,
      rapidapi_tiktok: 'not_tested' as const,
      web_scraping: 'not_tested' as const,
      oembed: 'not_tested' as const,
      alternative_apis: 'not_tested' as const
    };

    const extractionDetails = {
      attemptedMethods: [] as string[],
      successfulMethod: '',
      failureReasons: [] as string[],
      recommendedActions: [] as string[],
      authenticationStatus: this.getAuthenticationStatus()
    };

    if (platform === 'youtube') {
      return await this.analyzeYouTubeUltimate(videoUrl, apiStatus, extractionDetails);
    } else if (platform === 'tiktok') {
      return await this.analyzeTikTokUltimate(videoUrl, apiStatus, extractionDetails);
    } else {
      throw new Error(`Platform ${platform} not supported`);
    }
  }

  private getAuthenticationStatus(): string {
    const keys = [];
    if (this.youtubeApiKey) keys.push('YouTube API');
    if (this.rapidApiKey) keys.push('RapidAPI General');
    if (this.rapidApiTikTokKey) keys.push('RapidAPI TikTok');
    
    return keys.length > 0 ? `Available: ${keys.join(', ')}` : 'No API keys available';
  }

  private async analyzeYouTubeUltimate(
    videoUrl: string, 
    apiStatus: any, 
    extractionDetails: any
  ): Promise<VideoAnalysisData> {
    const videoId = this.extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL format');
    }

    // Try all available methods in parallel for faster results
    const methods = [];

    // Method 1: YouTube Data API
    if (this.youtubeApiKey) {
      methods.push(this.tryYouTubeOfficial(videoUrl, videoId, extractionDetails));
    }

    // Method 2: Multiple RapidAPI services
    if (this.rapidApiKey) {
      methods.push(this.tryYouTubeRapidAPIs(videoUrl, videoId, extractionDetails));
    }

    // Method 3: Alternative APIs
    methods.push(this.tryYouTubeAlternativeAPIs(videoUrl, videoId, extractionDetails));

    // Method 4: oEmbed
    methods.push(this.tryYouTubeOEmbed(videoUrl, videoId, extractionDetails));

    // Execute all methods and return the first successful one with authentic data
    try {
      const results = await Promise.allSettled(methods);
      
      // Find the first successful result with authentic data
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value && result.value.isAuthentic) {
          result.value.apiStatus = apiStatus;
          result.value.extractionDetails = extractionDetails;
          return result.value;
        }
      }

      // If no authentic data, return the first successful result
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          result.value.apiStatus = apiStatus;
          result.value.extractionDetails = extractionDetails;
          return result.value;
        }
      }
    } catch (error) {
      console.log('All parallel methods failed, trying sequential approach...');
    }

    // Sequential fallback approach
    return await this.analyzeYouTubeSequential(videoUrl, videoId, apiStatus, extractionDetails);
  }

  private async analyzeTikTokUltimate(
    videoUrl: string, 
    apiStatus: any, 
    extractionDetails: any
  ): Promise<VideoAnalysisData> {
    
    // Try multiple TikTok extraction methods in parallel
    const methods = [];

    if (this.rapidApiTikTokKey) {
      methods.push(this.tryTikTokSpecialized(videoUrl, extractionDetails));
    }

    if (this.rapidApiKey) {
      methods.push(this.tryTikTokGeneralAPIs(videoUrl, extractionDetails));
    }

    methods.push(this.tryTikTokAlternative(videoUrl, extractionDetails));
    methods.push(this.tryTikTokScraping(videoUrl, extractionDetails));

    try {
      const results = await Promise.allSettled(methods);
      
      // Find the first successful result with authentic data
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value && result.value.isAuthentic) {
          result.value.apiStatus = apiStatus;
          result.value.extractionDetails = extractionDetails;
          return result.value;
        }
      }

      // If no authentic data, return the first successful result
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          result.value.apiStatus = apiStatus;
          result.value.extractionDetails = extractionDetails;
          return result.value;
        }
      }
    } catch (error) {
      console.log('All parallel TikTok methods failed');
    }

    // Sequential fallback
    return await this.analyzeTikTokSequential(videoUrl, apiStatus, extractionDetails);
  }

  private async tryYouTubeOfficial(videoUrl: string, videoId: string, extractionDetails: any): Promise<VideoAnalysisData> {
    extractionDetails.attemptedMethods.push('YouTube Data API v3');
    console.log('🔑 Trying YouTube Data API...');

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

    extractionDetails.successfulMethod = 'YouTube Data API v3';
    
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

  private async tryYouTubeRapidAPIs(videoUrl: string, videoId: string, extractionDetails: any): Promise<VideoAnalysisData> {
    extractionDetails.attemptedMethods.push('RapidAPI YouTube Services');
    console.log('🔑 Trying RapidAPI YouTube services...');

    const services = [
      {
        name: 'YouTube v3.1',
        url: `https://youtube-v31.p.rapidapi.com/videos?part=snippet,statistics&id=${videoId}`,
        host: 'youtube-v31.p.rapidapi.com'
      },
      {
        name: 'YouTube Data8',
        url: 'https://youtube-data8.p.rapidapi.com/video/details/',
        host: 'youtube-data8.p.rapidapi.com',
        method: 'POST',
        body: { url: videoUrl }
      },
      {
        name: 'YouTube Search and Download',
        url: 'https://youtube-search-and-download.p.rapidapi.com/video/details',
        host: 'youtube-search-and-download.p.rapidapi.com',
        method: 'GET',
        params: `?id=${videoId}`
      }
    ];

    for (const service of services) {
      try {
        console.log(`Trying ${service.name}...`);
        
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

        const url = service.params ? `${service.url}${service.params}` : service.url;
        const response = await fetch(url, options);

        if (response.ok) {
          const data = await response.json() as any;
          
          if (data.items && data.items[0]) {
            const video = data.items[0];
            const snippet = video.snippet || {};
            const statistics = video.statistics || {};

            extractionDetails.successfulMethod = `RapidAPI ${service.name}`;

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
              dataSource: `RapidAPI ${service.name}`,
              extractionMethod: 'RapidAPI',
              apiStatus: {} as any,
              extractionDetails: {} as any
            };
          } else if (data.title) {
            // Handle direct response format
            extractionDetails.successfulMethod = `RapidAPI ${service.name}`;

            return {
              title: data.title || 'YouTube Video',
              description: data.description || '',
              views: parseInt(data.viewCount) || 0,
              likes: parseInt(data.likeCount) || 0,
              comments: parseInt(data.commentCount) || 0,
              shares: 0,
              author: {
                username: data.channelTitle || 'Unknown',
                displayName: data.channelTitle || 'Unknown',
                followers: parseInt(data.subscriberCount) || 0,
                verified: false,
                profilePicture: '',
                bio: ''
              },
              hashtags: this.extractHashtags(data.description || ''),
              platform: 'YouTube',
              rating: this.calculateRating(parseInt(data.viewCount) || 0, parseInt(data.likeCount) || 0),
              publishedAt: data.publishedAt || new Date().toISOString(),
              duration: parseInt(data.duration) || 0,
              videoUrl,
              thumbnailUrl: data.thumbnail || '',
              isAuthentic: true,
              dataSource: `RapidAPI ${service.name}`,
              extractionMethod: 'RapidAPI',
              apiStatus: {} as any,
              extractionDetails: {} as any
            };
          }
        }
      } catch (error) {
        console.log(`RapidAPI service ${service.name} failed: ${error}`);
        continue;
      }
    }

    throw new Error('All RapidAPI YouTube services failed');
  }

  private async tryYouTubeAlternativeAPIs(videoUrl: string, videoId: string, extractionDetails: any): Promise<VideoAnalysisData> {
    extractionDetails.attemptedMethods.push('Alternative YouTube APIs');
    console.log('🔍 Trying alternative YouTube APIs...');

    // Try Invidious API (open source YouTube frontend)
    try {
      const invidiousInstances = [
        'https://invidious.io',
        'https://yewtu.be',
        'https://invidious.fdn.fr'
      ];

      for (const instance of invidiousInstances) {
        try {
          const response = await fetch(`${instance}/api/v1/videos/${videoId}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; VideoAnalyzer/1.0)'
            }
          });

          if (response.ok) {
            const data = await response.json() as any;
            
            extractionDetails.successfulMethod = `Invidious API (${instance})`;

            return {
              title: data.title || 'YouTube Video',
              description: data.description || '',
              views: parseInt(data.viewCount) || 0,
              likes: parseInt(data.likeCount) || 0,
              comments: 0,
              shares: 0,
              author: {
                username: data.author || 'Unknown',
                displayName: data.author || 'Unknown',
                followers: parseInt(data.subCountText?.replace(/[^\d]/g, '')) || 0,
                verified: data.authorVerified || false,
                profilePicture: '',
                bio: ''
              },
              hashtags: this.extractHashtags(data.description || ''),
              platform: 'YouTube',
              rating: this.calculateRating(parseInt(data.viewCount) || 0, parseInt(data.likeCount) || 0),
              publishedAt: new Date(data.published * 1000).toISOString() || new Date().toISOString(),
              duration: parseInt(data.lengthSeconds) || 0,
              videoUrl,
              thumbnailUrl: data.videoThumbnails?.[0]?.url || '',
              isAuthentic: true,
              dataSource: `Invidious API`,
              extractionMethod: 'Alternative API',
              apiStatus: {} as any,
              extractionDetails: {} as any
            };
          }
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      console.log('Invidious API failed');
    }

    throw new Error('All alternative YouTube APIs failed');
  }

  private async tryYouTubeOEmbed(videoUrl: string, videoId: string, extractionDetails: any): Promise<VideoAnalysisData> {
    extractionDetails.attemptedMethods.push('YouTube oEmbed API');
    console.log('📡 Trying YouTube oEmbed...');

    const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`);

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;

    extractionDetails.successfulMethod = 'YouTube oEmbed API';

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

  private async tryTikTokSpecialized(videoUrl: string, extractionDetails: any): Promise<VideoAnalysisData> {
    extractionDetails.attemptedMethods.push('RapidAPI TikTok Scraper');
    console.log('🔑 Trying specialized TikTok API...');

    const apis = [
      {
        name: 'TikTok Scraper 7',
        url: 'https://tiktok-scraper7.p.rapidapi.com/video/info',
        host: 'tiktok-scraper7.p.rapidapi.com'
      },
      {
        name: 'TikTok Full Info',
        url: 'https://tiktok-full-info.p.rapidapi.com/video/info',
        host: 'tiktok-full-info.p.rapidapi.com'
      },
      {
        name: 'TikTok Video Data',
        url: 'https://tiktok-video-data.p.rapidapi.com/video/details',
        host: 'tiktok-video-data.p.rapidapi.com'
      }
    ];

    for (const api of apis) {
      try {
        const response = await fetch(api.url, {
          method: 'POST',
          headers: {
            'X-RapidAPI-Key': this.rapidApiTikTokKey,
            'X-RapidAPI-Host': api.host,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url: videoUrl })
        });

        if (response.ok) {
          const data = await response.json() as any;
          
          if (data.data || data.video) {
            const videoInfo = data.data?.video || data.video || data;
            const authorInfo = data.data?.author || data.author || {};
            const stats = data.data?.stats || data.stats || {};

            extractionDetails.successfulMethod = `RapidAPI ${api.name}`;

            return {
              title: videoInfo.desc || videoInfo.title || 'TikTok Video',
              description: videoInfo.desc || '',
              views: parseInt(stats.playCount || videoInfo.playCount) || 0,
              likes: parseInt(stats.diggCount || videoInfo.diggCount) || 0,
              comments: parseInt(stats.commentCount || videoInfo.commentCount) || 0,
              shares: parseInt(stats.shareCount || videoInfo.shareCount) || 0,
              author: {
                username: authorInfo.uniqueId || authorInfo.username || 'Unknown',
                displayName: authorInfo.nickname || authorInfo.displayName || 'Unknown',
                followers: parseInt(authorInfo.followerCount) || 0,
                verified: authorInfo.verified || false,
                profilePicture: authorInfo.avatarMedium || authorInfo.avatar || '',
                bio: authorInfo.signature || authorInfo.bio || ''
              },
              hashtags: this.extractHashtags(videoInfo.desc || ''),
              platform: 'TikTok',
              rating: this.calculateRating(
                parseInt(stats.playCount || videoInfo.playCount) || 0, 
                parseInt(stats.diggCount || videoInfo.diggCount) || 0
              ),
              publishedAt: new Date((videoInfo.createTime || Date.now() / 1000) * 1000).toISOString(),
              duration: parseInt(videoInfo.duration) || 0,
              videoUrl,
              thumbnailUrl: videoInfo.cover || videoInfo.thumbnail || '',
              isAuthentic: true,
              dataSource: `RapidAPI ${api.name}`,
              extractionMethod: 'Specialized API',
              apiStatus: {} as any,
              extractionDetails: {} as any
            };
          }
        }
      } catch (error) {
        console.log(`Specialized TikTok API ${api.name} failed: ${error}`);
        continue;
      }
    }

    throw new Error('All specialized TikTok APIs failed');
  }

  private async tryTikTokGeneralAPIs(videoUrl: string, extractionDetails: any): Promise<VideoAnalysisData> {
    extractionDetails.attemptedMethods.push('General RapidAPI TikTok Services');
    console.log('🔑 Trying general RapidAPI TikTok services...');

    const apis = [
      {
        name: 'TikTok Video No Watermark',
        url: 'https://tiktok-video-no-watermark2.p.rapidapi.com/video/info',
        host: 'tiktok-video-no-watermark2.p.rapidapi.com'
      },
      {
        name: 'TikTok Download Without Watermark',
        url: 'https://tiktok-download-without-watermark.p.rapidapi.com/video-info',
        host: 'tiktok-download-without-watermark.p.rapidapi.com'
      },
      {
        name: 'TikTok API by Toolbench',
        url: 'https://tiktok-api25.p.rapidapi.com/video/info',
        host: 'tiktok-api25.p.rapidapi.com'
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
          if (data && (data.data || data.video || data.result)) {
            const videoInfo = data.data || data.video || data.result || data;
            
            extractionDetails.successfulMethod = `RapidAPI ${api.name}`;

            return {
              title: videoInfo.title || videoInfo.desc || 'TikTok Video',
              description: videoInfo.desc || videoInfo.description || '',
              views: parseInt(videoInfo.play_count || videoInfo.playCount || videoInfo.viewCount) || 0,
              likes: parseInt(videoInfo.digg_count || videoInfo.likeCount || videoInfo.likes) || 0,
              comments: parseInt(videoInfo.comment_count || videoInfo.commentCount || videoInfo.comments) || 0,
              shares: parseInt(videoInfo.share_count || videoInfo.shareCount || videoInfo.shares) || 0,
              author: {
                username: videoInfo.author?.unique_id || videoInfo.author?.username || videoInfo.creator?.username || 'Unknown',
                displayName: videoInfo.author?.nickname || videoInfo.author?.display_name || videoInfo.creator?.name || 'Unknown',
                followers: parseInt(videoInfo.author?.follower_count || videoInfo.creator?.followers) || 0,
                verified: videoInfo.author?.verified || videoInfo.creator?.verified || false,
                profilePicture: videoInfo.author?.avatar || videoInfo.creator?.avatar || '',
                bio: videoInfo.author?.signature || videoInfo.creator?.bio || ''
              },
              hashtags: this.extractHashtags(videoInfo.desc || videoInfo.description || ''),
              platform: 'TikTok',
              rating: this.calculateRating(
                parseInt(videoInfo.play_count || videoInfo.playCount || videoInfo.viewCount) || 0,
                parseInt(videoInfo.digg_count || videoInfo.likeCount || videoInfo.likes) || 0
              ),
              publishedAt: new Date().toISOString(),
              duration: parseInt(videoInfo.duration) || 0,
              videoUrl,
              thumbnailUrl: videoInfo.cover || videoInfo.thumbnail || '',
              isAuthentic: true,
              dataSource: `RapidAPI ${api.name}`,
              extractionMethod: 'General API',
              apiStatus: {} as any,
              extractionDetails: {} as any
            };
          }
        }
      } catch (error) {
        console.log(`General TikTok API ${api.name} failed: ${error}`);
        continue;
      }
    }

    throw new Error('All general TikTok APIs failed');
  }

  private async tryTikTokAlternative(videoUrl: string, extractionDetails: any): Promise<VideoAnalysisData> {
    extractionDetails.attemptedMethods.push('Alternative TikTok APIs');
    console.log('🔍 Trying alternative TikTok APIs...');

    // Try TikTok public API endpoints
    try {
      // Extract video ID from URL
      const videoIdMatch = videoUrl.match(/\/video\/(\d+)/);
      if (videoIdMatch) {
        const videoId = videoIdMatch[1];
        
        // Try TikTok's mobile API
        const mobileApiUrl = `https://api.tiktokv.com/aweme/v1/aweme/detail/?aweme_id=${videoId}`;
        
        const response = await fetch(mobileApiUrl, {
          headers: {
            'User-Agent': 'com.ss.android.ugc.trill/494+',
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json() as any;
          
          if (data.aweme_detail) {
            const aweme = data.aweme_detail;
            const statistics = aweme.statistics || {};
            const author = aweme.author || {};
            
            extractionDetails.successfulMethod = 'TikTok Mobile API';

            return {
              title: aweme.desc || 'TikTok Video',
              description: aweme.desc || '',
              views: parseInt(statistics.play_count) || 0,
              likes: parseInt(statistics.digg_count) || 0,
              comments: parseInt(statistics.comment_count) || 0,
              shares: parseInt(statistics.share_count) || 0,
              author: {
                username: author.unique_id || 'Unknown',
                displayName: author.nickname || 'Unknown',
                followers: parseInt(author.follower_count) || 0,
                verified: author.verification_type === 1,
                profilePicture: author.avatar_medium?.url_list?.[0] || '',
                bio: author.signature || ''
              },
              hashtags: this.extractHashtags(aweme.desc || ''),
              platform: 'TikTok',
              rating: this.calculateRating(parseInt(statistics.play_count) || 0, parseInt(statistics.digg_count) || 0),
              publishedAt: new Date(aweme.create_time * 1000).toISOString(),
              duration: parseInt(aweme.duration) || 0,
              videoUrl,
              thumbnailUrl: aweme.video?.cover?.url_list?.[0] || '',
              isAuthentic: true,
              dataSource: 'TikTok Mobile API',
              extractionMethod: 'Alternative API',
              apiStatus: {} as any,
              extractionDetails: {} as any
            };
          }
        }
      }
    } catch (error) {
      console.log('TikTok alternative API failed');
    }

    throw new Error('All alternative TikTok APIs failed');
  }

  private async tryTikTokScraping(videoUrl: string, extractionDetails: any): Promise<VideoAnalysisData> {
    extractionDetails.attemptedMethods.push('TikTok Web Scraping');
    console.log('🌐 Trying TikTok web scraping...');

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

    extractionDetails.successfulMethod = 'TikTok Web Scraping';

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

  // Sequential fallback methods
  private async analyzeYouTubeSequential(
    videoUrl: string, 
    videoId: string, 
    apiStatus: any, 
    extractionDetails: any
  ): Promise<VideoAnalysisData> {
    
    // Final attempt with enhanced scraping
    try {
      const result = await this.tryYouTubeOEmbed(videoUrl, videoId, extractionDetails);
      result.apiStatus = apiStatus;
      result.extractionDetails = extractionDetails;
      return result;
    } catch (error) {
      extractionDetails.failureReasons.push(`All methods failed`);
      extractionDetails.recommendedActions.push('Enable YouTube Data API v3 or subscribe to RapidAPI services');
      throw new Error('All YouTube extraction methods failed');
    }
  }

  private async analyzeTikTokSequential(
    videoUrl: string, 
    apiStatus: any, 
    extractionDetails: any
  ): Promise<VideoAnalysisData> {
    
    try {
      const result = await this.tryTikTokScraping(videoUrl, extractionDetails);
      result.apiStatus = apiStatus;
      result.extractionDetails = extractionDetails;
      return result;
    } catch (error) {
      extractionDetails.failureReasons.push('All methods failed');
      extractionDetails.recommendedActions.push('Subscribe to RapidAPI TikTok services for authentic data');
      throw new Error('All TikTok extraction methods failed');
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

export const ultimateVideoAnalyzer = new UltimateVideoAnalyzer();