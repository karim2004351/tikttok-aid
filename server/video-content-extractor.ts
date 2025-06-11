import fetch from 'node-fetch';

export interface ExtractedVideoData {
  title: string;
  description: string;
  author: {
    username: string;
    displayName: string;
    verified: boolean;
  };
  stats: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
  hashtags: string[];
  platform: string;
  extractedAt: string;
}

export class VideoContentExtractor {
  
  async extractFromTikTok(videoUrl: string): Promise<ExtractedVideoData | null> {
    try {
      // استخراج ID الفيديو من الرابط
      const videoId = this.extractTikTokVideoId(videoUrl);
      if (!videoId) {
        throw new Error('Invalid TikTok URL format');
      }

      // محاولة استخراج البيانات من الصفحة مباشرة
      const response = await fetch(videoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      return this.parseTikTokHtml(html);

    } catch (error) {
      console.error('TikTok extraction error:', error);
      return null;
    }
  }

  async extractFromYouTube(videoUrl: string): Promise<ExtractedVideoData | null> {
    try {
      const videoId = this.extractYouTubeVideoId(videoUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL format');
      }

      // محاولة استخدام YouTube Data API إذا كان متوفر
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (apiKey) {
        return await this.extractYouTubeWithAPI(videoId, apiKey);
      }

      // استخراج من الصفحة مباشرة كبديل
      return await this.extractYouTubeFromPage(videoUrl);

    } catch (error) {
      console.error('YouTube extraction error:', error);
      return null;
    }
  }

  async extractFromReddit(postUrl: string): Promise<ExtractedVideoData | null> {
    try {
      // إضافة .json للحصول على البيانات الخام
      const jsonUrl = postUrl.endsWith('/') ? postUrl + '.json' : postUrl + '.json';
      
      const response = await fetch(jsonUrl, {
        headers: {
          'User-Agent': 'ContentExtractor/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return this.parseRedditData(data);

    } catch (error) {
      console.error('Reddit extraction error:', error);
      return null;
    }
  }

  private async extractYouTubeWithAPI(videoId: string, apiKey: string): Promise<ExtractedVideoData | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,statistics`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json() as any;
      const video = data.items?.[0];

      if (!video) {
        return null;
      }

      return {
        title: video.snippet.title || '',
        description: video.snippet.description || '',
        author: {
          username: video.snippet.channelTitle || '',
          displayName: video.snippet.channelTitle || '',
          verified: false
        },
        stats: {
          viewCount: parseInt(video.statistics.viewCount) || 0,
          likeCount: parseInt(video.statistics.likeCount) || 0,
          commentCount: parseInt(video.statistics.commentCount) || 0
        },
        hashtags: this.extractHashtags(video.snippet.description || ''),
        platform: 'YouTube',
        extractedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('YouTube API extraction error:', error);
      return null;
    }
  }

  private async extractYouTubeFromPage(videoUrl: string): Promise<ExtractedVideoData | null> {
    try {
      const response = await fetch(videoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const html = await response.text();
      return this.parseYouTubeHtml(html);

    } catch (error) {
      console.error('YouTube page extraction error:', error);
      return null;
    }
  }

  private parseTikTokHtml(html: string): ExtractedVideoData | null {
    try {
      // البحث عن البيانات المنظمة في الصفحة
      const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/s);
      if (jsonLdMatch) {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        if (jsonData['@type'] === 'VideoObject') {
          return {
            title: jsonData.name || '',
            description: jsonData.description || '',
            author: {
              username: jsonData.author?.alternateName || '',
              displayName: jsonData.author?.name || '',
              verified: false
            },
            stats: {
              viewCount: parseInt(jsonData.interactionStatistic?.find((stat: any) => stat.interactionType === 'http://schema.org/WatchAction')?.userInteractionCount) || 0,
              likeCount: 0,
              commentCount: 0
            },
            hashtags: this.extractHashtags(jsonData.description || ''),
            platform: 'TikTok',
            extractedAt: new Date().toISOString()
          };
        }
      }

      // البحث عن meta tags
      const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/);
      const descriptionMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/);

      if (titleMatch || descriptionMatch) {
        const title = titleMatch ? titleMatch[1] : '';
        const description = descriptionMatch ? descriptionMatch[1] : '';

        return {
          title,
          description,
          author: {
            username: '',
            displayName: '',
            verified: false
          },
          stats: {
            viewCount: 0,
            likeCount: 0,
            commentCount: 0
          },
          hashtags: this.extractHashtags(description),
          platform: 'TikTok',
          extractedAt: new Date().toISOString()
        };
      }

      return null;

    } catch (error) {
      console.error('TikTok HTML parsing error:', error);
      return null;
    }
  }

  private parseYouTubeHtml(html: string): ExtractedVideoData | null {
    try {
      // البحث عن بيانات ytInitialData
      const ytDataMatch = html.match(/var ytInitialData = ({.*?});/);
      if (ytDataMatch) {
        const ytData = JSON.parse(ytDataMatch[1]);
        const videoDetails = ytData?.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[0]?.videoPrimaryInfoRenderer;
        
        if (videoDetails) {
          return {
            title: videoDetails.title?.runs?.[0]?.text || '',
            description: videoDetails.videoDetails?.shortDescription || '',
            author: {
              username: videoDetails.owner?.videoOwnerRenderer?.title?.runs?.[0]?.text || '',
              displayName: videoDetails.owner?.videoOwnerRenderer?.title?.runs?.[0]?.text || '',
              verified: false
            },
            stats: {
              viewCount: parseInt(videoDetails.viewCount?.videoViewCountRenderer?.viewCount?.simpleText?.replace(/[^0-9]/g, '')) || 0,
              likeCount: 0,
              commentCount: 0
            },
            hashtags: [],
            platform: 'YouTube',
            extractedAt: new Date().toISOString()
          };
        }
      }

      // البحث عن meta tags كبديل
      const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/);
      const descriptionMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/);

      if (titleMatch || descriptionMatch) {
        return {
          title: titleMatch ? titleMatch[1] : '',
          description: descriptionMatch ? descriptionMatch[1] : '',
          author: {
            username: '',
            displayName: '',
            verified: false
          },
          stats: {
            viewCount: 0,
            likeCount: 0,
            commentCount: 0
          },
          hashtags: [],
          platform: 'YouTube',
          extractedAt: new Date().toISOString()
        };
      }

      return null;

    } catch (error) {
      console.error('YouTube HTML parsing error:', error);
      return null;
    }
  }

  private parseRedditData(data: any): ExtractedVideoData | null {
    try {
      const post = data[0]?.data?.children?.[0]?.data;
      if (!post) {
        return null;
      }

      return {
        title: post.title || '',
        description: post.selftext || '',
        author: {
          username: post.author || '',
          displayName: post.author || '',
          verified: false
        },
        stats: {
          viewCount: 0,
          likeCount: post.score || 0,
          commentCount: post.num_comments || 0
        },
        hashtags: [],
        platform: 'Reddit',
        extractedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Reddit data parsing error:', error);
      return null;
    }
  }

  private extractTikTokVideoId(url: string): string | null {
    const patterns = [
      /tiktok\.com\/.*\/video\/(\d+)/,
      /tiktok\.com\/v\/(\d+)/,
      /vm\.tiktok\.com\/([A-Za-z0-9]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
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
    const hashtags = text.match(/#[\w\u0600-\u06FF]+/g) || [];
    return hashtags.slice(0, 10); // الحد الأقصى 10 هاشتاغات
  }

  async extractFromAnyPlatform(url: string): Promise<ExtractedVideoData | null> {
    if (url.includes('tiktok.com')) {
      return await this.extractFromTikTok(url);
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return await this.extractFromYouTube(url);
    } else if (url.includes('reddit.com')) {
      return await this.extractFromReddit(url);
    }

    throw new Error('Unsupported platform. Supported platforms: TikTok, YouTube, Reddit');
  }
}

export const videoContentExtractor = new VideoContentExtractor();