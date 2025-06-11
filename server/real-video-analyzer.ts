import fetch from 'node-fetch';

export interface RealVideoData {
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
}

export class RealVideoAnalyzer {
  private rapidApiKey: string;

  constructor() {
    this.rapidApiKey = process.env.RAPIDAPI_KEY || '';
    if (!this.rapidApiKey) {
      throw new Error('RAPIDAPI_KEY environment variable is required');
    }
  }

  async analyzeVideoFromUrl(videoUrl: string): Promise<RealVideoData> {
    try {
      const platform = this.detectPlatform(videoUrl);
      
      switch (platform) {
        case 'tiktok':
          return await this.analyzeTikTokVideo(videoUrl);
        case 'youtube':
          return await this.analyzeYouTubeVideo(videoUrl);
        case 'instagram':
          return await this.analyzeInstagramVideo(videoUrl);
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (error: any) {
      console.error('Error analyzing video:', error);
      throw new Error(`Failed to analyze video: ${error.message}`);
    }
  }

  private async analyzeTikTokVideo(videoUrl: string): Promise<RealVideoData> {
    try {
      // Using TikTok API via RapidAPI
      const response = await fetch('https://tiktok-scraper7.p.rapidapi.com/video/info', {
        method: 'POST',
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'tiktok-scraper7.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: videoUrl
        })
      });

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.status}`);
      }

      const data = await response.json() as any;
      
      if (!data.data) {
        throw new Error('No data returned from TikTok API');
      }

      const videoData = data.data;
      
      return {
        title: videoData.title || videoData.desc || 'TikTok Video',
        description: videoData.desc || '',
        views: parseInt(videoData.play_count) || 0,
        likes: parseInt(videoData.digg_count) || 0,
        comments: parseInt(videoData.comment_count) || 0,
        shares: parseInt(videoData.share_count) || 0,
        author: {
          username: videoData.author?.unique_id || 'unknown',
          displayName: videoData.author?.nickname || 'Unknown User',
          followers: parseInt(videoData.author?.follower_count) || 0,
          verified: videoData.author?.verified || false
        },
        hashtags: this.extractHashtags(videoData.desc || ''),
        platform: 'TikTok',
        rating: this.calculateRating(
          parseInt(videoData.play_count) || 0,
          parseInt(videoData.digg_count) || 0
        ),
        publishedAt: new Date(videoData.create_time * 1000).toISOString(),
        duration: parseInt(videoData.duration) || 0,
        videoUrl: videoUrl
      };
    } catch (error: any) {
      console.error('TikTok analysis error:', error);
      throw new Error(`Failed to analyze TikTok video: ${error.message}`);
    }
  }

  private async analyzeYouTubeVideo(videoUrl: string): Promise<RealVideoData> {
    try {
      const videoId = this.extractYouTubeVideoId(videoUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      // Using YouTube API via RapidAPI
      const response = await fetch(`https://youtube-v31.p.rapidapi.com/videos?part=snippet,statistics&id=${videoId}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'youtube-v31.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json() as any;
      
      if (!data.items || data.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = data.items[0];
      const snippet = video.snippet;
      const statistics = video.statistics;

      return {
        title: snippet.title || 'YouTube Video',
        description: snippet.description || '',
        views: parseInt(statistics.viewCount) || 0,
        likes: parseInt(statistics.likeCount) || 0,
        comments: parseInt(statistics.commentCount) || 0,
        shares: 0, // YouTube doesn't provide share count in API
        author: {
          username: snippet.channelTitle || 'unknown',
          displayName: snippet.channelTitle || 'Unknown Channel',
          followers: 0, // Would need separate channel API call
          verified: false
        },
        hashtags: this.extractHashtags(snippet.description || ''),
        platform: 'YouTube',
        rating: this.calculateRating(
          parseInt(statistics.viewCount) || 0,
          parseInt(statistics.likeCount) || 0
        ),
        publishedAt: snippet.publishedAt || new Date().toISOString(),
        duration: 0, // Would need contentDetails part
        videoUrl: videoUrl
      };
    } catch (error: any) {
      console.error('YouTube analysis error:', error);
      throw new Error(`Failed to analyze YouTube video: ${error.message}`);
    }
  }

  private async analyzeInstagramVideo(videoUrl: string): Promise<RealVideoData> {
    try {
      // Using Instagram API via RapidAPI
      const params = new URLSearchParams({
        code_or_id_or_url: videoUrl
      });
      
      const response = await fetch(`https://instagram-scraper-api2.p.rapidapi.com/v1/post_info?${params}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status}`);
      }

      const data = await response.json() as any;
      
      if (!data.data) {
        throw new Error('No data returned from Instagram API');
      }

      const postData = data.data;
      
      return {
        title: 'Instagram Video',
        description: postData.caption?.text || '',
        views: postData.video_view_count || 0,
        likes: postData.like_count || 0,
        comments: postData.comment_count || 0,
        shares: 0,
        author: {
          username: postData.owner?.username || 'unknown',
          displayName: postData.owner?.full_name || 'Unknown User',
          followers: postData.owner?.edge_followed_by?.count || 0,
          verified: postData.owner?.is_verified || false
        },
        hashtags: this.extractHashtags(postData.caption?.text || ''),
        platform: 'Instagram',
        rating: this.calculateRating(
          postData.video_view_count || 0,
          postData.like_count || 0
        ),
        publishedAt: new Date(postData.taken_at_timestamp * 1000).toISOString(),
        duration: postData.video_duration || 0,
        videoUrl: videoUrl
      };
    } catch (error: any) {
      console.error('Instagram analysis error:', error);
      throw new Error(`Failed to analyze Instagram video: ${error.message}`);
    }
  }

  private detectPlatform(url: string): string {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('tiktok.com') || lowerUrl.includes('vm.tiktok.com')) {
      return 'tiktok';
    }
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      return 'youtube';
    }
    if (lowerUrl.includes('instagram.com')) {
      return 'instagram';
    }
    
    throw new Error('Unsupported platform');
  }

  private extractYouTubeVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#[\w\u0590-\u05ff\u0600-\u06ff]+/g;
    const matches = text.match(hashtagRegex) || [];
    return matches.slice(0, 10); // Limit to 10 hashtags
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
}

export const realVideoAnalyzer = new RealVideoAnalyzer();