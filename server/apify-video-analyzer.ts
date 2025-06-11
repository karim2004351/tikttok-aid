import fetch from 'node-fetch';

export interface ApifyVideoData {
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

export class ApifyVideoAnalyzer {
  private apifyApiKey: string;
  private youtubeApiKey: string;

  constructor() {
    this.apifyApiKey = 'apify_api_OCXt8zaHXpC161bcJoh7QKt10eNjED4AIRpz';
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY_V3 || '';
  }

  async analyzeVideo(videoUrl: string): Promise<ApifyVideoData> {
    const platform = this.detectPlatform(videoUrl);
    
    if (platform === 'youtube') {
      return await this.analyzeYouTubeVideo(videoUrl);
    } else if (platform === 'tiktok') {
      return await this.analyzeTikTokVideo(videoUrl);
    } else {
      throw new Error(`منصة ${platform} غير مدعومة حالياً`);
    }
  }

  private async analyzeYouTubeVideo(videoUrl: string): Promise<ApifyVideoData> {
    const videoId = this.extractYouTubeVideoId(videoUrl);
    
    if (!videoId) {
      throw new Error('رابط YouTube غير صحيح');
    }

    // جرب YouTube Data API الرسمي أولاً
    if (this.youtubeApiKey) {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${this.youtubeApiKey}&part=snippet,statistics`
        );

        if (response.ok) {
          const data = await response.json() as any;
          
          if (data.items && data.items.length > 0) {
            const video = data.items[0];
            const snippet = video.snippet;
            const stats = video.statistics;

            return {
              title: snippet.title,
              description: snippet.description,
              views: parseInt(stats.viewCount) || 0,
              likes: parseInt(stats.likeCount) || 0,
              comments: parseInt(stats.commentCount) || 0,
              shares: 0,
              author: {
                username: snippet.channelTitle,
                displayName: snippet.channelTitle,
                followers: 0,
                verified: false,
                profilePicture: '',
                bio: ''
              },
              hashtags: this.extractHashtags(snippet.description),
              platform: 'YouTube',
              rating: this.calculateRating(parseInt(stats.viewCount) || 0, parseInt(stats.likeCount) || 0),
              publishedAt: snippet.publishedAt,
              duration: this.parseYouTubeDuration(video.contentDetails?.duration || ''),
              videoUrl,
              thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
              isAuthentic: true,
              dataSource: 'YouTube Official API'
            };
          }
        }
      } catch (error) {
        console.log('YouTube API error:', error);
      }
    }

    // استخدم Apify كبديل لـ YouTube
    try {
      const response = await fetch('https://api.apify.com/v2/acts/jupri~youtube-scraper/run-sync-get-dataset-items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apifyApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startUrls: [{ url: videoUrl }],
          maxResults: 1
        })
      });

      if (response.ok) {
        const data = await response.json() as any;
        
        if (data && data.length > 0) {
          const video = data[0];
          
          return {
            title: video.title || 'YouTube Video',
            description: video.description || '',
            views: parseInt(video.viewCount) || 0,
            likes: parseInt(video.likeCount) || 0,
            comments: parseInt(video.commentCount) || 0,
            shares: 0,
            author: {
              username: video.channelName || 'Unknown',
              displayName: video.channelName || 'Unknown',
              followers: parseInt(video.subscriberCount) || 0,
              verified: video.verified || false,
              profilePicture: '',
              bio: ''
            },
            hashtags: this.extractHashtags(video.description || ''),
            platform: 'YouTube',
            rating: this.calculateRating(parseInt(video.viewCount) || 0, parseInt(video.likeCount) || 0),
            publishedAt: video.publishedAt || new Date().toISOString(),
            duration: parseInt(video.duration) || 0,
            videoUrl,
            thumbnailUrl: video.thumbnail || '',
            isAuthentic: true,
            dataSource: 'Apify YouTube Scraper'
          };
        }
      }
    } catch (error) {
      console.log('Apify YouTube error:', error);
    }

    throw new Error('فشل في الحصول على بيانات YouTube من جميع المصادر');
  }

  private async analyzeTikTokVideo(videoUrl: string): Promise<ApifyVideoData> {
    // استخدم Apify TikTok Scraper
    try {
      const response = await fetch('https://api.apify.com/v2/acts/OtzYfK1ndEGdwWFKQ/run-sync-get-dataset-items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apifyApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postURLs: [videoUrl],
          resultsLimit: 1
        })
      });

      if (response.ok) {
        const data = await response.json() as any;
        
        if (data && data.length > 0) {
          const video = data[0];
          
          return {
            title: video.text || video.description || 'TikTok Video',
            description: video.text || video.description || '',
            views: parseInt(video.playCount) || parseInt(video.viewCount) || 0,
            likes: parseInt(video.diggCount) || parseInt(video.likeCount) || 0,
            comments: parseInt(video.commentCount) || 0,
            shares: parseInt(video.shareCount) || 0,
            author: {
              username: video.authorMeta?.name || video.author?.uniqueId || 'Unknown',
              displayName: video.authorMeta?.nickName || video.author?.nickname || 'Unknown',
              followers: parseInt(video.authorMeta?.fans) || parseInt(video.author?.followerCount) || 0,
              verified: video.authorMeta?.verified || video.author?.verified || false,
              profilePicture: video.authorMeta?.avatar || video.author?.avatarMedium || '',
              bio: video.authorMeta?.signature || video.author?.signature || ''
            },
            hashtags: this.extractHashtags(video.text || video.description || ''),
            platform: 'TikTok',
            rating: this.calculateRating(
              parseInt(video.playCount) || parseInt(video.viewCount) || 0,
              parseInt(video.diggCount) || parseInt(video.likeCount) || 0
            ),
            publishedAt: new Date((video.createTime || Date.now() / 1000) * 1000).toISOString(),
            duration: parseInt(video.videoMeta?.duration) || parseInt(video.duration) || 0,
            videoUrl,
            thumbnailUrl: video.covers?.[0] || video.thumbnail || '',
            isAuthentic: true,
            dataSource: 'Apify TikTok Scraper'
          };
        }
      }
    } catch (error) {
      console.log('Apify TikTok error:', error);
    }

    throw new Error('فشل في الحصول على بيانات TikTok من Apify');
  }

  private detectPlatform(url: string): string {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('tiktok.com')) {
      return 'tiktok';
    }
    return 'unknown';
  }

  private extractYouTubeVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#[a-zA-Z0-9_\u0600-\u06FF]+/g;
    const matches = text.match(hashtagRegex);
    return matches || [];
  }

  private calculateRating(views: number, likes: number): number {
    if (views === 0) return 0;
    const ratio = likes / views;
    if (ratio >= 0.1) return 5;
    if (ratio >= 0.05) return 4;
    if (ratio >= 0.02) return 3;
    if (ratio >= 0.01) return 2;
    return 1;
  }

  private parseYouTubeDuration(duration: string): number {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1]?.replace('H', '') || '0');
    const minutes = parseInt(match[2]?.replace('M', '') || '0');
    const seconds = parseInt(match[3]?.replace('S', '') || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }
}

export const apifyVideoAnalyzer = new ApifyVideoAnalyzer();