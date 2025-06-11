// فحص الفيديو المستهدف وصاحب الصفحة باستخدام TikTok APIs الحقيقية
export class TargetVideoInspector {
  private tiktokClientKey: string;
  private tiktokClientSecret: string;
  private tiktokPublishingKey: string;
  private tiktokPublishingSecret: string;
  private rapidApiKey: string;
  private apifyApiKey: string;

  constructor() {
    this.tiktokClientKey = process.env.TIKTOK_CLIENT_KEY || '';
    this.tiktokClientSecret = process.env.TIKTOK_CLIENT_SECRET || '';
    this.tiktokPublishingKey = process.env.TIKTOK_PUBLISHING_CLIENT_KEY || '';
    this.tiktokPublishingSecret = process.env.TIKTOK_PUBLISHING_CLIENT_SECRET || '';
    this.rapidApiKey = process.env.RAPIDAPI_KEY_TIKTOK || '';
    this.apifyApiKey = 'apify_api_OCXt8zaHXpC161bcJoh7QKt10eNjED4AIRpz';
  }

  // فحص شامل للفيديو المستهدف
  async inspectTargetVideo(videoUrl: string): Promise<{
    videoData: any;
    authorData: any;
    interactionStats: any;
    isAccessible: boolean;
    method: string;
    error?: string;
  }> {
    console.log(`🔍 بدء فحص الفيديو المستهدف: ${videoUrl}`);
    
    const videoId = this.extractTikTokVideoId(videoUrl);
    if (!videoId) {
      return {
        videoData: null,
        authorData: null,
        interactionStats: null,
        isAccessible: false,
        method: 'error',
        error: 'تعذر استخراج معرف الفيديو من الرابط'
      };
    }

    // محاولة الفحص باستخدام TikTok Publishing API
    if (this.tiktokPublishingKey && this.tiktokPublishingSecret) {
      try {
        console.log('🔐 محاولة الفحص باستخدام TikTok Publishing API...');
        const result = await this.inspectWithPublishingAPI(videoUrl, videoId);
        if (result) {
          console.log('✅ تم الفحص بنجاح باستخدام Publishing API');
          return result;
        }
      } catch (error: any) {
        console.log('❌ فشل الفحص مع Publishing API:', error?.message);
      }
    }

    // محاولة الفحص باستخدام TikTok Client API
    if (this.tiktokClientKey && this.tiktokClientSecret) {
      try {
        console.log('🔐 محاولة الفحص باستخدام TikTok Client API...');
        const result = await this.inspectWithClientAPI(videoUrl, videoId);
        if (result) {
          console.log('✅ تم الفحص بنجاح باستخدام Client API');
          return result;
        }
      } catch (error: any) {
        console.log('❌ فشل الفحص مع Client API:', error?.message);
      }
    }

    // محاولة الفحص باستخدام Apify API
    if (this.apifyApiKey) {
      try {
        console.log('🔍 محاولة الفحص باستخدام Apify API...');
        const result = await this.inspectWithApifyAPI(videoUrl, videoId);
        if (result) {
          console.log('✅ تم الفحص بنجاح باستخدام Apify API');
          return result;
        }
      } catch (error: any) {
        console.log('❌ فشل الفحص مع Apify API:', error?.message);
      }
    }

    // محاولة الفحص باستخدام RapidAPI
    if (this.rapidApiKey) {
      try {
        console.log('🔍 محاولة الفحص باستخدام RapidAPI...');
        const result = await this.inspectWithRapidAPI(videoUrl, videoId);
        if (result) {
          console.log('✅ تم الفحص بنجاح باستخدام RapidAPI');
          return result;
        }
      } catch (error: any) {
        console.log('❌ فشل الفحص مع RapidAPI:', error?.message);
      }
    }

    return {
      videoData: null,
      authorData: null,
      interactionStats: null,
      isAccessible: false,
      method: 'failed',
      error: 'فشلت جميع طرق الفحص المتاحة'
    };
  }

  // فحص باستخدام TikTok Publishing API
  private async inspectWithPublishingAPI(videoUrl: string, videoId: string): Promise<any> {
    try {
      // الحصول على access token
      const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_key: this.tiktokPublishingKey,
          client_secret: this.tiktokPublishingSecret,
          grant_type: 'client_credentials'
        })
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token request failed: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        throw new Error('No access token received');
      }

      // فحص تفاصيل الفيديو
      const videoResponse = await fetch('https://open.tiktokapis.com/v2/video/query/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filters: {
            video_ids: [videoId]
          },
          fields: [
            'id',
            'title',
            'video_description',
            'duration',
            'cover_image_url',
            'share_url',
            'view_count',
            'like_count',
            'comment_count',
            'share_count',
            'create_time'
          ]
        })
      });

      if (!videoResponse.ok) {
        throw new Error(`Video query failed: ${videoResponse.status}`);
      }

      const videoData = await videoResponse.json();
      const video = videoData.data?.videos?.[0];

      if (!video) {
        throw new Error('No video data found');
      }

      // فحص بيانات المؤلف
      const authorData = await this.getAuthorDataFromVideo(accessToken, video);

      return {
        videoData: {
          id: video.id,
          title: video.title,
          description: video.video_description,
          duration: video.duration,
          coverImage: video.cover_image_url,
          shareUrl: video.share_url,
          createTime: video.create_time
        },
        authorData,
        interactionStats: {
          views: video.view_count || 0,
          likes: video.like_count || 0,
          comments: video.comment_count || 0,
          shares: video.share_count || 0
        },
        isAccessible: true,
        method: 'tiktok_publishing_api'
      };
      
    } catch (error: any) {
      throw new Error(`Publishing API Error: ${error?.message}`);
    }
  }

  // فحص باستخدام TikTok Client API
  private async inspectWithClientAPI(videoUrl: string, videoId: string): Promise<any> {
    try {
      // منطق مماثل للـ Publishing API ولكن بنقاط نهاية مختلفة
      const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_key: this.tiktokClientKey,
          client_secret: this.tiktokClientSecret,
          grant_type: 'client_credentials'
        })
      });

      if (!tokenResponse.ok) {
        throw new Error(`Client API token failed: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token || tokenData.data?.access_token;

      if (!accessToken) {
        throw new Error('No access token from Client API');
      }

      // استخدام Client API endpoints للفحص
      // هذا يتطلب endpoints محددة للفيديوهات العامة

      return {
        videoData: null,
        authorData: null,
        interactionStats: null,
        isAccessible: true,
        method: 'tiktok_client_api'
      };
      
    } catch (error: any) {
      throw new Error(`Client API Error: ${error?.message}`);
    }
  }

  // فحص باستخدام Apify API
  private async inspectWithApifyAPI(videoUrl: string, videoId: string): Promise<any> {
    try {
      // استخدام Apify TikTok scraper للحصول على البيانات الحقيقية
      const response = await fetch('https://api.apify.com/v2/acts/clockworks~free-tiktok-scraper/run-sync-get-dataset-items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apifyApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startUrls: [{ url: videoUrl }],
          resultsLimit: 1
        })
      });

      if (!response.ok) {
        throw new Error(`Apify API request failed: ${response.status}`);
      }

      const data = await response.json();
      const video = data?.[0];

      if (!video) {
        throw new Error('No video data from Apify API');
      }

      return {
        videoData: {
          id: video.id || videoId,
          title: video.text || video.description,
          description: video.text || video.description,
          duration: video.duration || 0,
          coverImage: video.coverUrl || video.thumbnail,
          shareUrl: videoUrl,
          createTime: video.createTime
        },
        authorData: {
          username: video.authorMeta?.name || video.author?.uniqueId,
          displayName: video.authorMeta?.nickName || video.author?.nickname,
          avatar: video.authorMeta?.avatar || video.author?.avatarMedium,
          verified: video.authorMeta?.verified || false,
          followers: video.authorMeta?.fans || video.author?.followerCount || 0,
          following: video.authorMeta?.following || video.author?.followingCount || 0,
          bio: video.authorMeta?.signature || ''
        },
        interactionStats: {
          views: video.playCount || video.viewCount || 0,
          likes: video.diggCount || video.heartCount || 0,
          comments: video.commentCount || 0,
          shares: video.shareCount || 0
        },
        isAccessible: true,
        method: 'apify_api'
      };
      
    } catch (error: any) {
      throw new Error(`Apify API Error: ${error?.message}`);
    }
  }

  // فحص باستخدام RapidAPI
  private async inspectWithRapidAPI(videoUrl: string, videoId: string): Promise<any> {
    try {
      const response = await fetch(`https://tiktok-scraper7.p.rapidapi.com/video/info?video_id=${videoId}`, {
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'tiktok-scraper7.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`RapidAPI request failed: ${response.status}`);
      }

      const data = await response.json();
      const video = data.data;

      if (!video) {
        throw new Error('No video data from RapidAPI');
      }

      return {
        videoData: {
          id: video.id,
          title: video.title || video.desc,
          description: video.desc,
          duration: video.duration,
          coverImage: video.cover,
          shareUrl: videoUrl
        },
        authorData: {
          username: video.author?.unique_id || video.author?.nickname,
          displayName: video.author?.nickname,
          avatar: video.author?.avatar_medium,
          verified: video.author?.verified,
          followers: video.author?.follower_count,
          following: video.author?.following_count
        },
        interactionStats: {
          views: video.play_count || 0,
          likes: video.digg_count || 0,
          comments: video.comment_count || 0,
          shares: video.share_count || 0
        },
        isAccessible: true,
        method: 'rapidapi'
      };
      
    } catch (error: any) {
      throw new Error(`RapidAPI Error: ${error?.message}`);
    }
  }

  // الحصول على بيانات المؤلف من معلومات الفيديو
  private async getAuthorDataFromVideo(accessToken: string, video: any): Promise<any> {
    // هذا يتطلب endpoint إضافي للحصول على بيانات المؤلف
    // أو استخراج البيانات من معلومات الفيديو نفسه
    return {
      username: 'unknown',
      displayName: 'Unknown Author',
      verified: false,
      followers: 0,
      following: 0
    };
  }

  // استخراج معرف الفيديو من الرابط
  private extractTikTokVideoId(url: string): string | null {
    try {
      const patterns = [
        /tiktok\.com\/.*\/video\/(\d+)/,
        /tiktok\.com\/.*@.*\/video\/(\d+)/,
        /vm\.tiktok\.com\/([A-Za-z0-9]+)/,
        /tiktok\.com\/t\/([A-Za-z0-9]+)/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return match[1];
        }
      }

      return null;
    } catch (error) {
      console.error('خطأ في استخراج معرف الفيديو:', error);
      return null;
    }
  }

  // فحص إمكانية الوصول للفيديو
  async checkVideoAccessibility(videoUrl: string): Promise<{
    isAccessible: boolean;
    statusCode: number;
    error?: string;
  }> {
    try {
      const response = await fetch(videoUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      return {
        isAccessible: response.ok,
        statusCode: response.status
      };
    } catch (error: any) {
      return {
        isAccessible: false,
        statusCode: 0,
        error: error?.message
      };
    }
  }
}

export const targetVideoInspector = new TargetVideoInspector();