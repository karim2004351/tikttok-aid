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
}

export class AdvancedVideoAnalyzer {
  private youtubeApiKey: string;

  constructor() {
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY || '';
  }

  async analyzeVideo(videoUrl: string): Promise<VideoAnalysisData> {
    const platform = this.detectPlatform(videoUrl);
    
    console.log(`Starting analysis for ${platform} video...`);
    
    switch (platform) {
      case 'youtube':
        return await this.analyzeYouTubeVideo(videoUrl);
      case 'tiktok':
        return await this.analyzeTikTokVideo(videoUrl);
      case 'instagram':
        return await this.analyzeInstagramVideo(videoUrl);
      default:
        throw new Error(`Platform ${platform} not supported`);
    }
  }

  private async analyzeYouTubeVideo(videoUrl: string): Promise<VideoAnalysisData> {
    const videoId = this.extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    if (!this.youtubeApiKey) {
      throw new Error('YouTube API key required for authentic analysis');
    }

    console.log('Fetching YouTube data via official API...');

    // Get video details with all required parts
    const videoApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${this.youtubeApiKey}`;
    const response = await fetch(videoApiUrl);

    if (!response.ok) {
      const errorData = await response.json() as any;
      throw new Error(`YouTube API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json() as any;
    
    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found or is private');
    }

    const video = data.items[0];
    const snippet = video.snippet;
    const statistics = video.statistics;
    const contentDetails = video.contentDetails;

    // Get channel information for complete author data
    let channelData = null;
    if (snippet.channelId) {
      try {
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${snippet.channelId}&key=${this.youtubeApiKey}`;
        const channelResponse = await fetch(channelUrl);
        if (channelResponse.ok) {
          const channelResult = await channelResponse.json() as any;
          if (channelResult.items && channelResult.items[0]) {
            channelData = channelResult.items[0];
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
      shares: 0, // YouTube API doesn't provide share count
      author: {
        username: snippet.channelTitle || 'Unknown Channel',
        displayName: snippet.channelTitle || 'Unknown Channel',
        followers: channelData ? parseInt(channelData.statistics.subscriberCount) || 0 : 0,
        verified: false, // Would need additional verification check
        profilePicture: channelData ? channelData.snippet.thumbnails?.default?.url || '' : '',
        bio: channelData ? channelData.snippet.description || '' : ''
      },
      hashtags: this.extractHashtags(snippet.description || ''),
      platform: 'YouTube',
      rating: this.calculateRating(
        parseInt(statistics.viewCount) || 0,
        parseInt(statistics.likeCount) || 0
      ),
      publishedAt: snippet.publishedAt || new Date().toISOString(),
      duration: this.parseYouTubeDuration(contentDetails.duration),
      videoUrl,
      thumbnailUrl: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || '',
      isAuthentic: true
    };
  }

  private async analyzeTikTokVideo(videoUrl: string): Promise<VideoAnalysisData> {
    console.log('Extracting TikTok data via web analysis...');
    
    try {
      const response = await fetch(videoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate'
        }
      });

      if (!response.ok) {
        throw new Error(`TikTok request failed: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract title and description from meta tags
      const title = $('meta[property="og:title"]').attr('content') || 
                   $('title').text() || 
                   'TikTok Video';
      
      const description = $('meta[property="og:description"]').attr('content') || 
                         $('meta[name="description"]').attr('content') || 
                         '';

      const thumbnailUrl = $('meta[property="og:image"]').attr('content') || '';

      // Extract JSON data from script tags
      let videoStats = { views: 0, likes: 0, comments: 0, shares: 0 };
      let authorInfo = { username: 'TikTok User', displayName: 'TikTok User', followers: 0, verified: false };
      
      $('script').each((i, elem) => {
        const scriptContent = $(elem).html();
        if (scriptContent && scriptContent.includes('__UNIVERSAL_DATA_FOR_REHYDRATION__')) {
          try {
            // Try to extract comprehensive data from TikTok's data structure
            const dataMatch = scriptContent.match(/__UNIVERSAL_DATA_FOR_REHYDRATION__\s*=\s*({.+?});/);
            if (dataMatch) {
              const universalData = JSON.parse(dataMatch[1]);
              const defaultScope = universalData.__DEFAULT_SCOPE__;
              
              // Navigate through TikTok's complex data structure
              if (defaultScope && defaultScope['webapp.video-detail']) {
                const videoDetail = defaultScope['webapp.video-detail'];
                const itemInfo = videoDetail.itemInfo?.itemStruct;
                
                if (itemInfo) {
                  videoStats.views = parseInt(itemInfo.stats?.playCount) || 0;
                  videoStats.likes = parseInt(itemInfo.stats?.diggCount) || 0;
                  videoStats.comments = parseInt(itemInfo.stats?.commentCount) || 0;
                  videoStats.shares = parseInt(itemInfo.stats?.shareCount) || 0;
                  
                  if (itemInfo.author) {
                    authorInfo.username = itemInfo.author.uniqueId || 'TikTok User';
                    authorInfo.displayName = itemInfo.author.nickname || 'TikTok User';
                    authorInfo.followers = parseInt(itemInfo.authorStats?.followerCount) || 0;
                    authorInfo.verified = itemInfo.author.verified || false;
                  }
                }
              }
            }
          } catch (e) {
            // Continue with other methods if JSON parsing fails
          }
        }
        
        // Alternative extraction methods
        if (scriptContent && (scriptContent.includes('playCount') || scriptContent.includes('diggCount'))) {
          try {
            const viewsMatch = scriptContent.match(/"playCount":(\d+)/);
            const likesMatch = scriptContent.match(/"diggCount":(\d+)/);
            const commentsMatch = scriptContent.match(/"commentCount":(\d+)/);
            const sharesMatch = scriptContent.match(/"shareCount":(\d+)/);
            
            if (viewsMatch) videoStats.views = Math.max(videoStats.views, parseInt(viewsMatch[1]));
            if (likesMatch) videoStats.likes = Math.max(videoStats.likes, parseInt(likesMatch[1]));
            if (commentsMatch) videoStats.comments = Math.max(videoStats.comments, parseInt(commentsMatch[1]));
            if (sharesMatch) videoStats.shares = Math.max(videoStats.shares, parseInt(sharesMatch[1]));
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
          username: authorInfo.username,
          displayName: authorInfo.displayName,
          followers: authorInfo.followers,
          verified: authorInfo.verified,
          profilePicture: '',
          bio: ''
        },
        hashtags: this.extractHashtags(description),
        platform: 'TikTok',
        rating: this.calculateRating(videoStats.views, videoStats.likes),
        publishedAt: new Date().toISOString(),
        duration: 30, // Typical TikTok duration
        videoUrl,
        thumbnailUrl,
        isAuthentic: videoStats.views > 0
      };
    } catch (error: any) {
      throw new Error(`TikTok analysis failed: ${error.message}`);
    }
  }

  private async analyzeInstagramVideo(videoUrl: string): Promise<VideoAnalysisData> {
    console.log('Extracting Instagram data...');
    
    try {
      const response = await fetch(videoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Instagram request failed: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const title = $('meta[property="og:title"]').attr('content') || 'Instagram Video';
      const description = $('meta[property="og:description"]').attr('content') || '';
      const thumbnailUrl = $('meta[property="og:image"]').attr('content') || '';

      return {
        title: this.cleanText(title),
        description: this.cleanText(description),
        views: 0, // Instagram doesn't expose view counts easily
        likes: 0,
        comments: 0,
        shares: 0,
        author: {
          username: 'Instagram User',
          displayName: 'Instagram User',
          followers: 0,
          verified: false,
          profilePicture: '',
          bio: ''
        },
        hashtags: this.extractHashtags(description),
        platform: 'Instagram',
        rating: 3,
        publishedAt: new Date().toISOString(),
        duration: 0,
        videoUrl,
        thumbnailUrl,
        isAuthentic: false
      };
    } catch (error: any) {
      throw new Error(`Instagram analysis failed: ${error.message}`);
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
    if (lowerUrl.includes('instagram.com')) {
      return 'instagram';
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

  private cleanText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
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

export const advancedVideoAnalyzer = new AdvancedVideoAnalyzer();