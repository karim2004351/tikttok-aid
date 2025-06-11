import fetch from 'node-fetch';

export interface AuthenticVideoData {
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
}

export class AuthenticVideoExtractor {
  private rapidApiTikTokKey: string;
  private youtubeApiKey: string;

  constructor() {
    this.rapidApiTikTokKey = process.env.RAPIDAPI_KEY_TIKTOK || '';
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY_ENABLED || '';
  }

  async extractVideoData(videoUrl: string): Promise<AuthenticVideoData> {
    const platform = this.detectPlatform(videoUrl);
    
    console.log(`Extracting authentic data from ${platform}...`);
    
    switch (platform) {
      case 'youtube':
        return await this.extractYouTubeData(videoUrl);
      case 'tiktok':
        return await this.extractTikTokData(videoUrl);
      default:
        throw new Error(`Platform ${platform} not supported for authentic extraction`);
    }
  }

  private async extractYouTubeData(videoUrl: string): Promise<AuthenticVideoData> {
    if (!this.youtubeApiKey) {
      throw new Error('YouTube API key required for authentic data extraction');
    }

    const videoId = this.extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL format');
    }

    console.log('Fetching YouTube data from official API...');

    try {
      // Get video details
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
      let channelInfo = {
        subscriberCount: 0,
        description: '',
        thumbnails: { default: { url: '' } }
      };

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
          console.log('Channel data extraction failed');
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
        rating: this.calculateRating(
          parseInt(statistics.viewCount) || 0,
          parseInt(statistics.likeCount) || 0
        ),
        publishedAt: snippet.publishedAt || new Date().toISOString(),
        duration: this.parseYouTubeDuration(contentDetails.duration || 'PT0S'),
        videoUrl,
        thumbnailUrl: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || '',
        isAuthentic: true,
        dataSource: 'YouTube Data API v3'
      };
    } catch (error: any) {
      throw new Error(`YouTube extraction failed: ${error.message}`);
    }
  }

  private async extractTikTokData(videoUrl: string): Promise<AuthenticVideoData> {
    if (!this.rapidApiTikTokKey) {
      throw new Error('RapidAPI TikTok key required for authentic data extraction');
    }

    console.log('Fetching TikTok data from RapidAPI...');

    try {
      // Use TikTok Scraper API via RapidAPI
      const response = await fetch('https://tiktok-scraper7.p.rapidapi.com/video/info', {
        method: 'POST',
        headers: {
          'X-RapidAPI-Key': this.rapidApiTikTokKey,
          'X-RapidAPI-Host': 'tiktok-scraper7.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: videoUrl
        })
      });

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.status} ${response.statusText}`);
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
        rating: this.calculateRating(
          parseInt(stats.playCount) || 0,
          parseInt(stats.diggCount) || 0
        ),
        publishedAt: new Date(videoInfo.createTime * 1000).toISOString() || new Date().toISOString(),
        duration: parseInt(videoInfo.duration) || 0,
        videoUrl,
        thumbnailUrl: videoInfo.cover || '',
        isAuthentic: true,
        dataSource: 'RapidAPI TikTok Scraper'
      };
    } catch (error: any) {
      throw new Error(`TikTok extraction failed: ${error.message}`);
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

export const authenticVideoExtractor = new AuthenticVideoExtractor();