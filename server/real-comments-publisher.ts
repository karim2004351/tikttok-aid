import fetch from 'node-fetch';

interface CommentPostResult {
  success: boolean;
  platform: string;
  videoUrl: string;
  commentText: string;
  error?: string;
  timestamp: Date;
}

interface PlatformCredentials {
  youtube: string;
  tiktok: { clientKey: string; clientSecret: string };
  facebook: { appId: string; appSecret: string };
  twitter: { apiKey: string; apiSecret: string };
  rapidApi: string;
}

export class RealCommentsPublisher {
  private credentials: PlatformCredentials;

  constructor() {
    this.credentials = {
      youtube: process.env.YOUTUBE_API_KEY_V3 || process.env.YOUTUBE_API_KEY || '',
      tiktok: {
        clientKey: process.env.TIKTOK_CLIENT_KEY || '',
        clientSecret: process.env.TIKTOK_CLIENT_SECRET || ''
      },
      facebook: {
        appId: process.env.FACEBOOK_APP_ID || '',
        appSecret: process.env.FACEBOOK_APP_SECRET || ''
      },
      twitter: {
        apiKey: process.env.TWITTER_API_KEY || '',
        apiSecret: process.env.TWITTER_API_SECRET || ''
      },
      rapidApi: process.env.RAPIDAPI_KEY || ''
    };
  }

  async publishComment(
    platform: string,
    videoUrl: string,
    commentText: string
  ): Promise<CommentPostResult> {
    const result: CommentPostResult = {
      success: false,
      platform,
      videoUrl,
      commentText,
      timestamp: new Date()
    };

    try {
      switch (platform.toLowerCase()) {
        case 'youtube':
          return await this.publishYouTubeComment(videoUrl, commentText);
        case 'tiktok':
          return await this.publishTikTokComment(videoUrl, commentText);
        case 'facebook':
          return await this.publishFacebookComment(videoUrl, commentText);
        case 'twitter':
          return await this.publishTwitterComment(videoUrl, commentText);
        case 'instagram':
          return await this.publishInstagramComment(videoUrl, commentText);
        default:
          result.error = `منصة غير مدعومة: ${platform}`;
          return result;
      }
    } catch (error: any) {
      result.error = error.message;
      return result;
    }
  }

  private async publishYouTubeComment(videoUrl: string, commentText: string): Promise<CommentPostResult> {
    const result: CommentPostResult = {
      success: false,
      platform: 'YouTube',
      videoUrl,
      commentText,
      timestamp: new Date()
    };

    if (!this.credentials.youtube) {
      result.error = 'مفتاح YouTube API غير متوفر';
      return result;
    }

    try {
      const videoId = this.extractYouTubeVideoId(videoUrl);
      if (!videoId) {
        result.error = 'رابط يوتيوب غير صحيح';
        return result;
      }

      // استخدام YouTube Comments API
      const response = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&key=${this.credentials.youtube}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.credentials.youtube}`
        },
        body: JSON.stringify({
          snippet: {
            videoId: videoId,
            topLevelComment: {
              snippet: {
                textOriginal: commentText
              }
            }
          }
        })
      });

      if (response.ok) {
        result.success = true;
        console.log(`✅ تم نشر التعليق على يوتيوب: ${commentText.substring(0, 30)}...`);
      } else {
        try {
          const errorData = await response.json() as any;
          result.error = `فشل نشر التعليق على يوتيوب: ${errorData.error?.message || 'خطأ غير معروف'}`;
        } catch {
          result.error = `فشل نشر التعليق على يوتيوب: ${response.status} ${response.statusText}`;
        }
        console.log(`❌ ${result.error}`);
      }
    } catch (error: any) {
      result.error = `خطأ في الاتصال بـ YouTube: ${error.message}`;
      console.log(`❌ ${result.error}`);
    }

    return result;
  }

  private async publishTikTokComment(videoUrl: string, commentText: string): Promise<CommentPostResult> {
    const result: CommentPostResult = {
      success: false,
      platform: 'TikTok',
      videoUrl,
      commentText,
      timestamp: new Date()
    };

    if (!this.credentials.tiktok.clientKey) {
      result.error = 'مفاتيح TikTok API غير متوفرة';
      return result;
    }

    try {
      // استخدام TikTok API للتعليقات
      const response = await fetch('https://open-api.tiktok.com/platform/oauth/connect/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.credentials.tiktok.clientKey}`
        },
        body: JSON.stringify({
          video_id: this.extractTikTokVideoId(videoUrl),
          comment_text: commentText
        })
      });

      if (response.ok) {
        result.success = true;
        console.log(`✅ تم نشر التعليق على تيك توك: ${commentText.substring(0, 30)}...`);
      } else {
        result.error = 'فشل نشر التعليق على تيك توك';
        console.log(`❌ ${result.error}`);
      }
    } catch (error: any) {
      result.error = `خطأ في الاتصال بـ TikTok: ${error.message}`;
      console.log(`❌ ${result.error}`);
    }

    return result;
  }

  private async publishFacebookComment(videoUrl: string, commentText: string): Promise<CommentPostResult> {
    const result: CommentPostResult = {
      success: false,
      platform: 'Facebook',
      videoUrl,
      commentText,
      timestamp: new Date()
    };

    if (!this.credentials.facebook.appId) {
      result.error = 'مفاتيح Facebook API غير متوفرة';
      return result;
    }

    try {
      // استخدام Facebook Graph API
      const response = await fetch(`https://graph.facebook.com/v18.0/me/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: commentText,
          access_token: this.credentials.facebook.appId
        })
      });

      if (response.ok) {
        result.success = true;
        console.log(`✅ تم نشر التعليق على فيسبوك: ${commentText.substring(0, 30)}...`);
      } else {
        result.error = 'فشل نشر التعليق على فيسبوك';
        console.log(`❌ ${result.error}`);
      }
    } catch (error: any) {
      result.error = `خطأ في الاتصال بـ Facebook: ${error.message}`;
      console.log(`❌ ${result.error}`);
    }

    return result;
  }

  private async publishTwitterComment(videoUrl: string, commentText: string): Promise<CommentPostResult> {
    const result: CommentPostResult = {
      success: false,
      platform: 'Twitter',
      videoUrl,
      commentText,
      timestamp: new Date()
    };

    if (!this.credentials.twitter.apiKey) {
      result.error = 'مفاتيح Twitter API غير متوفرة';
      return result;
    }

    try {
      // استخدام Twitter API v2
      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.credentials.twitter.apiKey}`
        },
        body: JSON.stringify({
          text: `${commentText} ${videoUrl}`
        })
      });

      if (response.ok) {
        result.success = true;
        console.log(`✅ تم نشر التعليق على تويتر: ${commentText.substring(0, 30)}...`);
      } else {
        result.error = 'فشل نشر التعليق على تويتر';
        console.log(`❌ ${result.error}`);
      }
    } catch (error: any) {
      result.error = `خطأ في الاتصال بـ Twitter: ${error.message}`;
      console.log(`❌ ${result.error}`);
    }

    return result;
  }

  private async publishInstagramComment(videoUrl: string, commentText: string): Promise<CommentPostResult> {
    const result: CommentPostResult = {
      success: false,
      platform: 'Instagram',
      videoUrl,
      commentText,
      timestamp: new Date()
    };

    if (!this.credentials.facebook.appId) {
      result.error = 'مفاتيح Instagram API غير متوفرة';
      return result;
    }

    try {
      // استخدام Instagram Basic Display API
      const response = await fetch(`https://graph.instagram.com/me/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          caption: commentText,
          access_token: this.credentials.facebook.appId
        })
      });

      if (response.ok) {
        result.success = true;
        console.log(`✅ تم نشر التعليق على انستغرام: ${commentText.substring(0, 30)}...`);
      } else {
        result.error = 'فشل نشر التعليق على انستغرام';
        console.log(`❌ ${result.error}`);
      }
    } catch (error: any) {
      result.error = `خطأ في الاتصال بـ Instagram: ${error.message}`;
      console.log(`❌ ${result.error}`);
    }

    return result;
  }

  private extractYouTubeVideoId(url: string): string | null {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  private extractTikTokVideoId(url: string): string | null {
    const regex = /tiktok\.com\/@[^\/]+\/video\/(\d+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  async batchPublishComments(
    comments: Array<{
      platform: string;
      videoUrl: string;
      commentText: string;
    }>
  ): Promise<CommentPostResult[]> {
    const results: CommentPostResult[] = [];
    
    for (const comment of comments) {
      const result = await this.publishComment(
        comment.platform,
        comment.videoUrl,
        comment.commentText
      );
      results.push(result);
      
      // تأخير بين التعليقات لتجنب الحظر
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return results;
  }

  getCredentialsStatus(): { [key: string]: boolean } {
    return {
      youtube: !!this.credentials.youtube,
      tiktok: !!(this.credentials.tiktok.clientKey && this.credentials.tiktok.clientSecret),
      facebook: !!(this.credentials.facebook.appId && this.credentials.facebook.appSecret),
      twitter: !!(this.credentials.twitter.apiKey && this.credentials.twitter.apiSecret),
      rapidApi: !!this.credentials.rapidApi
    };
  }
}

export const realCommentsPublisher = new RealCommentsPublisher();