import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

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
    authenticationStatus: string;
  };
}

export class EnhancedAuthenticExtractor {
  private rapidApiTikTokKey: string;
  private youtubeApiKey: string;
  private rapidApiKey: string;

  constructor() {
    this.rapidApiTikTokKey = process.env.RAPIDAPI_KEY_TIKTOK || '';
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY_ENABLED || '';
    this.rapidApiKey = process.env.RAPIDAPI_KEY || '';
  }

  async extractVideoData(videoUrl: string): Promise<AuthenticVideoData> {
    const platform = this.detectPlatform(videoUrl);
    
    console.log(`Starting enhanced authentic extraction for ${platform}...`);
    
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
      recommendedActions: [] as string[],
      authenticationStatus: this.getAuthStatus()
    };

    if (platform === 'youtube') {
      return await this.extractYouTubeData(videoUrl, apiStatus, extractionDetails);
    } else if (platform === 'tiktok') {
      return await this.extractTikTokData(videoUrl, apiStatus, extractionDetails);
    } else {
      throw new Error(`Platform ${platform} not supported`);
    }
  }

  private getAuthStatus(): string {
    const available = [];
    if (this.youtubeApiKey) available.push('YouTube API');
    if (this.rapidApiKey) available.push('RapidAPI');
    if (this.rapidApiTikTokKey) available.push('TikTok API');
    return available.length > 0 ? `Keys: ${available.join(', ')}` : 'No API keys';
  }

  private async extractYouTubeData(
    videoUrl: string, 
    apiStatus: any, 
    extractionDetails: any
  ): Promise<AuthenticVideoData> {
    const videoId = this.extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL format');
    }

    // YouTube Data API v3
    if (this.youtubeApiKey) {
      extractionDetails.attemptedMethods.push('YouTube Data API v3');
      try {
        console.log('Trying YouTube Data API v3...');
        
        const videoResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${this.youtubeApiKey}`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'VideoAnalyzer/1.0'
            }
          }
        );

        if (videoResponse.ok) {
          const videoData = await videoResponse.json() as any;
          
          if (videoData.items && videoData.items.length > 0) {
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

            apiStatus.youtube_official = 'success';
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
              apiStatus,
              extractionDetails
            };
          }
        } else {
          const errorData = await videoResponse.json() as any;
          apiStatus.youtube_official = 'failed';
          extractionDetails.failureReasons.push(`YouTube API: ${errorData.error?.message || videoResponse.statusText}`);
          
          if (errorData.error?.message?.includes('not been used') || errorData.error?.message?.includes('disabled')) {
            extractionDetails.recommendedActions.push('Enable YouTube Data API v3 in Google Cloud Console');
          }
        }
      } catch (error: any) {
        apiStatus.youtube_official = 'failed';
        extractionDetails.failureReasons.push(`YouTube API error: ${error.message}`);
      }
    } else {
      apiStatus.youtube_official = 'no_key';
      extractionDetails.recommendedActions.push('Provide YOUTUBE_API_KEY_ENABLED for authentic data');
    }

    // YouTube oEmbed fallback
    extractionDetails.attemptedMethods.push('YouTube oEmbed');
    try {
      console.log('Trying YouTube oEmbed...');
      
      const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`);

      if (response.ok) {
        const data = await response.json() as any;

        apiStatus.oembed = 'success';
        extractionDetails.successfulMethod = 'YouTube oEmbed';

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
          apiStatus,
          extractionDetails
        };
      }
    } catch (error: any) {
      apiStatus.oembed = 'failed';
      extractionDetails.failureReasons.push(`oEmbed error: ${error.message}`);
    }

    throw new Error('All YouTube extraction methods failed');
  }

  private async extractTikTokData(
    videoUrl: string, 
    apiStatus: any, 
    extractionDetails: any
  ): Promise<AuthenticVideoData> {
    
    // TikTok specialized API
    if (this.rapidApiTikTokKey) {
      extractionDetails.attemptedMethods.push('RapidAPI TikTok Specialized');
      
      const tiktokApis = [
        {
          name: 'TikTok Scraper 7',
          url: 'https://tiktok-scraper7.p.rapidapi.com/video/info',
          host: 'tiktok-scraper7.p.rapidapi.com'
        },
        {
          name: 'TikTok Video Info',
          url: 'https://tiktok-video-info1.p.rapidapi.com/get_video_info',
          host: 'tiktok-video-info1.p.rapidapi.com'
        },
        {
          name: 'TikTok API Premium',
          url: 'https://tiktok-api24.p.rapidapi.com/video/info',
          host: 'tiktok-api24.p.rapidapi.com'
        }
      ];

      for (const api of tiktokApis) {
        try {
          console.log(`Trying ${api.name}...`);
          
          const response = await fetch(api.url, {
            method: 'POST',
            headers: {
              'X-RapidAPI-Key': this.rapidApiTikTokKey,
              'X-RapidAPI-Host': api.host,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ 
              url: videoUrl,
              video_url: videoUrl
            })
          });

          if (response.ok) {
            const data = await response.json() as any;
            
            if (data && (data.data || data.video || data.result)) {
              const videoInfo = data.data?.video || data.video || data.result || data;
              const authorInfo = data.data?.author || data.author || {};
              const stats = data.data?.stats || data.stats || {};

              apiStatus.rapidapi_tiktok = 'success';
              extractionDetails.successfulMethod = `${api.name} (RapidAPI)`;

              return {
                title: videoInfo.desc || videoInfo.title || 'TikTok Video',
                description: videoInfo.desc || '',
                views: parseInt(stats.playCount || videoInfo.playCount || stats.view_count) || 0,
                likes: parseInt(stats.diggCount || videoInfo.diggCount || stats.like_count) || 0,
                comments: parseInt(stats.commentCount || videoInfo.commentCount || stats.comment_count) || 0,
                shares: parseInt(stats.shareCount || videoInfo.shareCount || stats.share_count) || 0,
                author: {
                  username: authorInfo.uniqueId || authorInfo.username || 'Unknown',
                  displayName: authorInfo.nickname || authorInfo.displayName || 'Unknown',
                  followers: parseInt(authorInfo.followerCount || authorInfo.followers) || 0,
                  verified: authorInfo.verified || false,
                  profilePicture: authorInfo.avatarMedium || authorInfo.avatar || '',
                  bio: authorInfo.signature || authorInfo.bio || ''
                },
                hashtags: this.extractHashtags(videoInfo.desc || ''),
                platform: 'TikTok',
                rating: this.calculateRating(
                  parseInt(stats.playCount || videoInfo.playCount || stats.view_count) || 0,
                  parseInt(stats.diggCount || videoInfo.diggCount || stats.like_count) || 0
                ),
                publishedAt: new Date((videoInfo.createTime || Date.now() / 1000) * 1000).toISOString(),
                duration: parseInt(videoInfo.duration) || 0,
                videoUrl,
                thumbnailUrl: videoInfo.cover || videoInfo.thumbnail || '',
                isAuthentic: true,
                dataSource: api.name,
                extractionMethod: 'RapidAPI Specialized',
                apiStatus,
                extractionDetails
              };
            }
          } else {
            console.log(`${api.name} failed with status: ${response.status}`);
          }
        } catch (error: any) {
          console.log(`${api.name} error: ${error.message}`);
          continue;
        }
      }
      
      apiStatus.rapidapi_tiktok = 'failed';
      extractionDetails.failureReasons.push('All specialized TikTok APIs failed');
    } else {
      apiStatus.rapidapi_tiktok = 'no_key';
      extractionDetails.recommendedActions.push('Provide RAPIDAPI_KEY_TIKTOK for authentic TikTok data');
    }

    // General RapidAPI services
    if (this.rapidApiKey) {
      extractionDetails.attemptedMethods.push('RapidAPI General Services');
      
      const generalApis = [
        {
          name: 'TikTok Video No Watermark',
          url: 'https://tiktok-video-no-watermark2.p.rapidapi.com/video/info',
          host: 'tiktok-video-no-watermark2.p.rapidapi.com'
        },
        {
          name: 'TikTok Download',
          url: 'https://tiktok-download-without-watermark.p.rapidapi.com/video-info',
          host: 'tiktok-download-without-watermark.p.rapidapi.com'
        }
      ];

      for (const api of generalApis) {
        try {
          console.log(`Trying ${api.name}...`);
          
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
              
              apiStatus.rapidapi_general = 'success';
              extractionDetails.successfulMethod = `${api.name} (General API)`;

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
                dataSource: api.name,
                extractionMethod: 'General API',
                apiStatus,
                extractionDetails
              };
            }
          }
        } catch (error: any) {
          console.log(`${api.name} error: ${error.message}`);
          continue;
        }
      }
      
      apiStatus.rapidapi_general = 'failed';
      extractionDetails.failureReasons.push('All general RapidAPI services failed');
    } else {
      apiStatus.rapidapi_general = 'no_key';
      extractionDetails.recommendedActions.push('Provide RAPIDAPI_KEY for alternative data sources');
    }

    // Web scraping fallback
    extractionDetails.attemptedMethods.push('TikTok Web Scraping');
    try {
      console.log('Trying TikTok web scraping...');
      
      const response = await fetch(videoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);

        const title = $('meta[property="og:title"]').attr('content')?.replace(' | TikTok', '') || 'TikTok Video';
        const description = $('meta[property="og:description"]').attr('content') || '';
        const thumbnail = $('meta[property="og:image"]').attr('content') || '';

        apiStatus.web_scraping = 'success';
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
          apiStatus,
          extractionDetails
        };
      }
    } catch (error: any) {
      apiStatus.web_scraping = 'failed';
      extractionDetails.failureReasons.push(`Web scraping error: ${error.message}`);
    }

    throw new Error('All TikTok extraction methods failed');
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

export const enhancedAuthenticExtractor = new EnhancedAuthenticExtractor();