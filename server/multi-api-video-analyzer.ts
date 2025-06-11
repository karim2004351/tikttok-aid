import fetch from 'node-fetch';

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
}

export class MultiAPIVideoAnalyzer {
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
    
    console.log(`Starting multi-API analysis for ${platform} video...`);
    
    if (platform === 'youtube') {
      return await this.analyzeYouTubeVideo(videoUrl);
    } else if (platform === 'tiktok') {
      return await this.analyzeTikTokVideo(videoUrl);
    } else {
      throw new Error(`Platform ${platform} not supported`);
    }
  }

  private async analyzeYouTubeVideo(videoUrl: string): Promise<VideoAnalysisData> {
    const videoId = this.extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL format');
    }

    // Try YouTube Data API first
    if (this.youtubeApiKey) {
      try {
        console.log('Attempting YouTube Data API extraction...');
        return await this.extractYouTubeWithAPI(videoUrl, videoId);
      } catch (error: any) {
        console.log(`YouTube API failed: ${error.message}`);
      }
    }

    // Try RapidAPI YouTube services
    if (this.rapidApiKey) {
      try {
        console.log('Attempting RapidAPI YouTube extraction...');
        return await this.extractYouTubeWithRapidAPI(videoUrl, videoId);
      } catch (error: any) {
        console.log(`RapidAPI YouTube failed: ${error.message}`);
      }
    }

    // Try oEmbed API (basic info only)
    try {
      console.log('Attempting YouTube oEmbed extraction...');
      return await this.extractYouTubeWithOEmbed(videoUrl, videoId);
    } catch (error: any) {
      console.log(`YouTube oEmbed failed: ${error.message}`);
    }

    throw new Error('All YouTube extraction methods failed. API keys may be required.');
  }

  private async analyzeTikTokVideo(videoUrl: string): Promise<VideoAnalysisData> {
    // Try specialized TikTok RapidAPI
    if (this.rapidApiTikTokKey) {
      try {
        console.log('Attempting TikTok RapidAPI extraction...');
        return await this.extractTikTokWithSpecializedAPI(videoUrl);
      } catch (error: any) {
        console.log(`TikTok specialized API failed: ${error.message}`);
      }
    }

    // Try general RapidAPI TikTok services
    if (this.rapidApiKey) {
      try {
        console.log('Attempting general RapidAPI TikTok extraction...');
        return await this.extractTikTokWithGeneralAPI(videoUrl);
      } catch (error: any) {
        console.log(`General RapidAPI TikTok failed: ${error.message}`);
      }
    }

    // Try web scraping approach
    try {
      console.log('Attempting TikTok web scraping extraction...');
      return await this.extractTikTokWithScraping(videoUrl);
    } catch (error: any) {
      console.log(`TikTok scraping failed: ${error.message}`);
    }

    throw new Error('All TikTok extraction methods failed. API subscriptions may be required.');
  }

  private async extractYouTubeWithAPI(videoUrl: string, videoId: string): Promise<VideoAnalysisData> {
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${this.youtubeApiKey}`
    );

    if (!videoResponse.ok) {
      const errorData = await videoResponse.json() as any;
      throw new Error(`YouTube API: ${errorData.error?.message || videoResponse.statusText}`);
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
        console.log('Channel data extraction failed, using basic info');
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
      extractionMethod: 'Official API'
    };
  }

  private async extractYouTubeWithRapidAPI(videoUrl: string, videoId: string): Promise<VideoAnalysisData> {
    const response = await fetch('https://youtube-v31.p.rapidapi.com/videos', {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': this.rapidApiKey,
        'X-RapidAPI-Host': 'youtube-v31.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`RapidAPI YouTube error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    
    if (!data.items || data.items.length === 0) {
      throw new Error('No video data from RapidAPI');
    }

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
      dataSource: 'RapidAPI YouTube',
      extractionMethod: 'RapidAPI'
    };
  }

  private async extractYouTubeWithOEmbed(videoUrl: string, videoId: string): Promise<VideoAnalysisData> {
    const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`);

    if (!response.ok) {
      throw new Error(`YouTube oEmbed error: ${response.status} ${response.statusText}`);
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
      extractionMethod: 'Basic Info Only'
    };
  }

  private async extractTikTokWithSpecializedAPI(videoUrl: string): Promise<VideoAnalysisData> {
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
      throw new Error(`TikTok Scraper API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    
    if (!data.data || !data.data.video) {
      throw new Error('No video data returned from TikTok API');
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
      extractionMethod: 'Specialized API'
    };
  }

  private async extractTikTokWithGeneralAPI(videoUrl: string): Promise<VideoAnalysisData> {
    // Try alternative TikTok APIs
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
              extractionMethod: 'General API'
            };
          }
        }
      } catch (error) {
        console.log(`Failed with ${api.host}: ${error}`);
        continue;
      }
    }

    throw new Error('All general TikTok APIs failed');
  }

  private async extractTikTokWithScraping(videoUrl: string): Promise<VideoAnalysisData> {
    // Basic scraping approach - limited but might extract some data
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch TikTok page: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract basic info from HTML
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(' | TikTok', '') : 'TikTok Video';

    return {
      title,
      description: '',
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
      hashtags: [],
      platform: 'TikTok',
      rating: 0,
      publishedAt: new Date().toISOString(),
      duration: 0,
      videoUrl,
      thumbnailUrl: '',
      isAuthentic: false,
      dataSource: 'Web Scraping',
      extractionMethod: 'Basic Scraping'
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

export const multiAPIVideoAnalyzer = new MultiAPIVideoAnalyzer();