import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export interface VideoData {
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

export class AuthenticDataExtractor {
  private rapidApiTikTokKey: string;
  private youtubeApiKey: string;
  private rapidApiKey: string;

  constructor() {
    this.rapidApiTikTokKey = process.env.RAPIDAPI_KEY_TIKTOK || '';
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY_ENABLED || '';
    this.rapidApiKey = process.env.RAPIDAPI_KEY || '';
  }

  async extractData(videoUrl: string): Promise<VideoData> {
    const platform = this.detectPlatform(videoUrl);
    
    console.log(`Extracting authentic data for ${platform} video...`);
    
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
      authenticationStatus: this.getKeyStatus()
    };

    if (platform === 'youtube') {
      return await this.extractYouTubeData(videoUrl, apiStatus, extractionDetails);
    } else if (platform === 'tiktok') {
      return await this.extractTikTokData(videoUrl, apiStatus, extractionDetails);
    } else {
      throw new Error(`Platform ${platform} not supported`);
    }
  }

  private getKeyStatus(): string {
    const keys = [];
    if (this.youtubeApiKey) keys.push('YouTube');
    if (this.rapidApiKey) keys.push('RapidAPI');
    if (this.rapidApiTikTokKey) keys.push('TikTok');
    return keys.length > 0 ? `Available: ${keys.join(', ')}` : 'No keys configured';
  }

  private async extractYouTubeData(
    videoUrl: string, 
    apiStatus: any, 
    extractionDetails: any
  ): Promise<VideoData> {
    const videoId = this.extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // YouTube Data API
    if (this.youtubeApiKey) {
      extractionDetails.attemptedMethods.push('YouTube Data API v3');
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${this.youtubeApiKey}`
        );

        if (response.ok) {
          const data = await response.json() as any;
          
          if (data.items && data.items.length > 0) {
            const video = data.items[0];
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
                console.log('Channel data not available');
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
          const errorData = await response.json() as any;
          apiStatus.youtube_official = 'failed';
          extractionDetails.failureReasons.push(`YouTube API: ${errorData.error?.message || response.statusText}`);
          
          if (errorData.error?.message?.includes('disabled') || errorData.error?.message?.includes('not been used')) {
            extractionDetails.recommendedActions.push('Enable YouTube Data API v3 in Google Cloud Console');
          }
        }
      } catch (error: any) {
        apiStatus.youtube_official = 'failed';
        extractionDetails.failureReasons.push(`YouTube API error: ${error.message}`);
      }
    } else {
      apiStatus.youtube_official = 'no_key';
      extractionDetails.recommendedActions.push('Configure YOUTUBE_API_KEY_ENABLED for authentic data');
    }

    // YouTube oEmbed fallback
    extractionDetails.attemptedMethods.push('YouTube oEmbed');
    try {
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
          extractionMethod: 'Basic Info',
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
  ): Promise<VideoData> {
    
    // Try working TikTok APIs with proper authentication
    if (this.rapidApiTikTokKey || this.rapidApiKey) {
      const workingApis = [
        // Try these working TikTok APIs
        {
          name: 'TikApi by Toolkit',
          url: 'https://tikapi1.p.rapidapi.com/video',
          host: 'tikapi1.p.rapidapi.com',
          key: this.rapidApiTikTokKey || this.rapidApiKey,
          method: 'GET',
          params: `?url=${encodeURIComponent(videoUrl)}`
        },
        {
          name: 'TikTok Video Data',
          url: 'https://tiktok-video-data1.p.rapidapi.com/video/info',
          host: 'tiktok-video-data1.p.rapidapi.com', 
          key: this.rapidApiTikTokKey || this.rapidApiKey,
          method: 'POST',
          body: { url: videoUrl }
        },
        {
          name: 'TikTok Info',
          url: 'https://tiktok-info1.p.rapidapi.com/video/info',
          host: 'tiktok-info1.p.rapidapi.com',
          key: this.rapidApiTikTokKey || this.rapidApiKey,
          method: 'POST', 
          body: { url: videoUrl }
        },
        {
          name: 'TikTok Unlimited',
          url: 'https://tiktok-unlimited1.p.rapidapi.com/video_info',
          host: 'tiktok-unlimited1.p.rapidapi.com',
          key: this.rapidApiTikTokKey || this.rapidApiKey,
          method: 'POST',
          body: { video_url: videoUrl }
        }
      ];

      extractionDetails.attemptedMethods.push('Enhanced TikTok APIs');

      for (const api of workingApis) {
        if (!api.key) continue;
        
        try {
          console.log(`Testing ${api.name}...`);
          
          const options: any = {
            method: api.method,
            headers: {
              'X-RapidAPI-Key': api.key,
              'X-RapidAPI-Host': api.host,
              'Accept': 'application/json'
            }
          };

          if (api.body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(api.body);
          }

          const url = api.params ? `${api.url}${api.params}` : api.url;
          const response = await fetch(url, options);

          if (response.ok) {
            const data = await response.json() as any;
            
            // Parse different response formats
            let videoInfo, authorInfo, stats;
            
            if (data.data) {
              videoInfo = data.data.video || data.data;
              authorInfo = data.data.author || data.data.user || {};
              stats = data.data.stats || data.data.statistics || {};
            } else if (data.video) {
              videoInfo = data.video;
              authorInfo = data.author || data.user || {};
              stats = data.stats || data.statistics || {};
            } else {
              videoInfo = data;
              authorInfo = data.author || data.user || {};
              stats = data.stats || data.statistics || {};
            }

            if (videoInfo && (videoInfo.title || videoInfo.desc || stats.playCount || stats.viewCount)) {
              const keyType = api.key === this.rapidApiTikTokKey ? 'rapidapi_tiktok' : 'rapidapi_general';
              apiStatus[keyType] = 'success';
              extractionDetails.successfulMethod = `${api.name}`;

              return {
                title: videoInfo.title || videoInfo.desc || 'TikTok Video',
                description: videoInfo.desc || videoInfo.description || '',
                views: parseInt(stats.playCount || stats.viewCount || videoInfo.playCount) || 0,
                likes: parseInt(stats.diggCount || stats.likeCount || videoInfo.diggCount) || 0,
                comments: parseInt(stats.commentCount || videoInfo.commentCount) || 0,
                shares: parseInt(stats.shareCount || videoInfo.shareCount) || 0,
                author: {
                  username: authorInfo.uniqueId || authorInfo.username || 'Unknown',
                  displayName: authorInfo.nickname || authorInfo.displayName || 'Unknown',
                  followers: parseInt(authorInfo.followerCount || authorInfo.followers) || 0,
                  verified: authorInfo.verified || false,
                  profilePicture: authorInfo.avatarMedium || authorInfo.avatar || '',
                  bio: authorInfo.signature || authorInfo.bio || ''
                },
                hashtags: this.extractHashtags(videoInfo.desc || videoInfo.description || ''),
                platform: 'TikTok',
                rating: this.calculateRating(
                  parseInt(stats.playCount || stats.viewCount || videoInfo.playCount) || 0,
                  parseInt(stats.diggCount || stats.likeCount || videoInfo.diggCount) || 0
                ),
                publishedAt: new Date((videoInfo.createTime || Date.now() / 1000) * 1000).toISOString(),
                duration: parseInt(videoInfo.duration) || 0,
                videoUrl,
                thumbnailUrl: videoInfo.cover || videoInfo.thumbnail || '',
                isAuthentic: true,
                dataSource: api.name,
                extractionMethod: 'Enhanced API',
                apiStatus,
                extractionDetails
              };
            }
          } else {
            console.log(`${api.name} failed: ${response.status} ${response.statusText}`);
          }
        } catch (error: any) {
          console.log(`${api.name} error: ${error.message}`);
          continue;
        }
      }

      const keyType = this.rapidApiTikTokKey ? 'rapidapi_tiktok' : 'rapidapi_general';
      apiStatus[keyType] = 'failed';
      extractionDetails.failureReasons.push('Enhanced TikTok APIs require valid subscription');
      extractionDetails.recommendedActions.push('Verify RapidAPI subscription and quota limits');
    } else {
      apiStatus.rapidapi_tiktok = 'no_key';
      apiStatus.rapidapi_general = 'no_key';
      extractionDetails.recommendedActions.push('Configure RapidAPI keys for authentic TikTok data');
    }

    // Web scraping fallback
    extractionDetails.attemptedMethods.push('Enhanced Web Scraping');
    try {
      const response = await fetch(videoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);

        // Try to extract from meta tags
        const title = $('meta[property="og:title"]').attr('content')?.replace(' | TikTok', '') || 
                     $('title').text().replace(' | TikTok', '') ||
                     'TikTok Video';
        
        const description = $('meta[property="og:description"]').attr('content') || '';
        const thumbnail = $('meta[property="og:image"]').attr('content') || '';

        // Try to extract JSON data from scripts
        let additionalData = {};
        $('script').each((_, element) => {
          const scriptContent = $(element).html();
          if (scriptContent && scriptContent.includes('"videoObjectPageProps"')) {
            try {
              const jsonMatch = scriptContent.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/);
              if (jsonMatch) {
                const data = JSON.parse(jsonMatch[1]);
                if (data.ItemModule) {
                  const videoData = Object.values(data.ItemModule)[0] as any;
                  if (videoData) {
                    additionalData = {
                      views: videoData.stats?.playCount || 0,
                      likes: videoData.stats?.diggCount || 0,
                      comments: videoData.stats?.commentCount || 0,
                      shares: videoData.stats?.shareCount || 0,
                      author: {
                        username: videoData.author?.uniqueId || 'Unknown',
                        displayName: videoData.author?.nickname || 'Unknown',
                        followers: videoData.author?.followerCount || 0,
                        verified: videoData.author?.verified || false
                      }
                    };
                  }
                }
              }
            } catch (e) {
              // Continue with basic extraction
            }
          }
        });

        apiStatus.web_scraping = 'success';
        extractionDetails.successfulMethod = 'Enhanced Web Scraping';

        return {
          title,
          description,
          views: (additionalData as any).views || 0,
          likes: (additionalData as any).likes || 0,
          comments: (additionalData as any).comments || 0,
          shares: (additionalData as any).shares || 0,
          author: (additionalData as any).author || {
            username: 'TikTok User',
            displayName: 'TikTok User',
            followers: 0,
            verified: false,
            profilePicture: '',
            bio: ''
          },
          hashtags: this.extractHashtags(description),
          platform: 'TikTok',
          rating: this.calculateRating((additionalData as any).views || 0, (additionalData as any).likes || 0),
          publishedAt: new Date().toISOString(),
          duration: 0,
          videoUrl,
          thumbnailUrl: thumbnail,
          isAuthentic: (additionalData as any).views > 0,
          dataSource: 'Enhanced Web Scraping',
          extractionMethod: 'HTML + JSON Parsing',
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

export const authenticDataExtractor = new AuthenticDataExtractor();