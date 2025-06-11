import fetch from 'node-fetch';
import { videoContentExtractor } from './video-content-extractor';

export interface FreePublishingConfig {
  videoUrl: string;
  title: string;
  description?: string;
  hashtags: string[];
}

export interface PublishingResult {
  platform: string;
  success: boolean;
  publishedUrl?: string;
  error?: string;
  responseTime: number;
}

export class FreePublishingSystem {
  
  async publishToReddit(config: FreePublishingConfig, subreddit: string = 'test'): Promise<PublishingResult> {
    const startTime = Date.now();
    
    try {
      const clientId = process.env.REDDIT_CLIENT_ID;
      const clientSecret = process.env.REDDIT_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        return {
          platform: 'Reddit',
          success: false,
          error: 'Reddit API credentials not configured. Please provide REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET.',
          responseTime: Date.now() - startTime
        };
      }

      // الحصول على access token
      const authResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'FreePublisher/1.0'
        },
        body: 'grant_type=client_credentials'
      });

      if (!authResponse.ok) {
        throw new Error(`Reddit authentication failed: ${authResponse.status}`);
      }

      const authData = await authResponse.json() as any;
      const accessToken = authData.access_token;

      // تحضير المحتوى
      const postContent = `${config.description || ''}

🔗 المصدر: ${config.videoUrl}

${config.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}`;

      // إرسال المنشور
      const postResponse = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'FreePublisher/1.0'
        },
        body: new URLSearchParams({
          'api_type': 'json',
          'kind': 'self',
          'sr': subreddit,
          'title': config.title,
          'text': postContent
        }).toString()
      });

      if (!postResponse.ok) {
        throw new Error(`Reddit post submission failed: ${postResponse.status}`);
      }

      const postData = await postResponse.json() as any;
      
      if (postData.json?.errors?.length > 0) {
        throw new Error(`Reddit API error: ${postData.json.errors[0][1]}`);
      }

      return {
        platform: 'Reddit',
        success: true,
        publishedUrl: postData.json?.data?.url || `https://reddit.com/r/${subreddit}`,
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        platform: 'Reddit',
        success: false,
        error: error instanceof Error ? error.message : 'Reddit posting failed',
        responseTime: Date.now() - startTime
      };
    }
  }

  async publishToTelegram(config: FreePublishingConfig, chatId: string): Promise<PublishingResult> {
    const startTime = Date.now();
    
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      
      if (!botToken) {
        return {
          platform: 'Telegram',
          success: false,
          error: 'Telegram bot token not configured. Please provide TELEGRAM_BOT_TOKEN.',
          responseTime: Date.now() - startTime
        };
      }

      const message = `🎬 ${config.title}

${config.description || ''}

🔗 ${config.videoUrl}

${config.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}`;

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`);
      }

      const data = await response.json() as any;
      
      if (!data.ok) {
        throw new Error(`Telegram error: ${data.description}`);
      }

      return {
        platform: 'Telegram',
        success: true,
        publishedUrl: `https://t.me/${chatId}`,
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        platform: 'Telegram',
        success: false,
        error: error instanceof Error ? error.message : 'Telegram posting failed',
        responseTime: Date.now() - startTime
      };
    }
  }

  async publishToDiscord(config: FreePublishingConfig, webhookUrl: string): Promise<PublishingResult> {
    const startTime = Date.now();
    
    try {
      if (!webhookUrl || !webhookUrl.includes('discord.com/api/webhooks/')) {
        return {
          platform: 'Discord',
          success: false,
          error: 'Invalid Discord webhook URL provided.',
          responseTime: Date.now() - startTime
        };
      }

      const embed = {
        title: config.title,
        description: config.description || '',
        url: config.videoUrl,
        color: 5814783, // لون أزرق
        fields: [
          {
            name: '🔗 رابط الفيديو',
            value: config.videoUrl,
            inline: false
          },
          {
            name: '🏷️ الهاشتاغات',
            value: config.hashtags.join(' ') || 'لا توجد',
            inline: false
          }
        ],
        timestamp: new Date().toISOString()
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          embeds: [embed]
        })
      });

      if (!response.ok) {
        throw new Error(`Discord webhook error: ${response.status}`);
      }

      return {
        platform: 'Discord',
        success: true,
        publishedUrl: 'Discord Channel',
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        platform: 'Discord',
        success: false,
        error: error instanceof Error ? error.message : 'Discord posting failed',
        responseTime: Date.now() - startTime
      };
    }
  }

  async publishToWordPress(config: FreePublishingConfig, siteUrl: string, username: string, password: string): Promise<PublishingResult> {
    const startTime = Date.now();
    
    try {
      const postData = {
        title: config.title,
        content: `<p>${config.description || ''}</p>
<p><strong>رابط الفيديو:</strong> <a href="${config.videoUrl}" target="_blank">${config.videoUrl}</a></p>
<p><strong>الهاشتاغات:</strong> ${config.hashtags.join(' ')}</p>`,
        status: 'publish'
      };

      const response = await fetch(`${siteUrl}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status}`);
      }

      const data = await response.json() as any;

      return {
        platform: 'WordPress',
        success: true,
        publishedUrl: data.link,
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        platform: 'WordPress',
        success: false,
        error: error instanceof Error ? error.message : 'WordPress posting failed',
        responseTime: Date.now() - startTime
      };
    }
  }

  async publishToMastodon(config: FreePublishingConfig, instanceUrl: string, accessToken: string): Promise<PublishingResult> {
    const startTime = Date.now();
    
    try {
      const status = `🎬 ${config.title}

${config.description || ''}

🔗 ${config.videoUrl}

${config.hashtags.join(' ')}`;

      const response = await fetch(`${instanceUrl}/api/v1/statuses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          status: status,
          visibility: 'public'
        })
      });

      if (!response.ok) {
        throw new Error(`Mastodon API error: ${response.status}`);
      }

      const data = await response.json() as any;

      return {
        platform: 'Mastodon',
        success: true,
        publishedUrl: data.url,
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        platform: 'Mastodon',
        success: false,
        error: error instanceof Error ? error.message : 'Mastodon posting failed',
        responseTime: Date.now() - startTime
      };
    }
  }

  async extractAndPublish(videoUrl: string, platforms: string[]): Promise<{
    extractedData: any;
    publishingResults: PublishingResult[];
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }> {
    console.log('🎯 بدء عملية الاستخراج والنشر المجاني...');
    
    // استخراج المحتوى من الفيديو
    const extractedData = await videoContentExtractor.extractFromAnyPlatform(videoUrl);
    
    if (!extractedData) {
      throw new Error('فشل في استخراج بيانات الفيديو');
    }

    console.log('✅ تم استخراج البيانات بنجاح');

    const config: FreePublishingConfig = {
      videoUrl,
      title: extractedData.title,
      description: extractedData.description,
      hashtags: extractedData.hashtags
    };

    const results: PublishingResult[] = [];

    // النشر على المنصات المختارة
    for (const platform of platforms) {
      console.log(`📝 النشر على ${platform}...`);
      
      let result: PublishingResult;
      
      switch (platform) {
        case 'reddit':
          result = await this.publishToReddit(config);
          break;
        case 'telegram':
          result = await this.publishToTelegram(config, process.env.TELEGRAM_CHAT_ID || '');
          break;
        case 'discord':
          result = await this.publishToDiscord(config, process.env.DISCORD_WEBHOOK_URL || '');
          break;
        case 'wordpress':
          result = await this.publishToWordPress(config, 
            process.env.WORDPRESS_SITE_URL || '', 
            process.env.WORDPRESS_USERNAME || '', 
            process.env.WORDPRESS_PASSWORD || ''
          );
          break;
        case 'mastodon':
          result = await this.publishToMastodon(config, 
            process.env.MASTODON_INSTANCE_URL || '', 
            process.env.MASTODON_ACCESS_TOKEN || ''
          );
          break;
        default:
          result = {
            platform,
            success: false,
            error: 'منصة غير مدعومة',
            responseTime: 0
          };
      }
      
      results.push(result);
      
      // تأخير بسيط بين المنصات
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`🏁 انتهاء العملية: ${successful} نجح، ${failed} فشل`);

    return {
      extractedData,
      publishingResults: results,
      summary: {
        total: results.length,
        successful,
        failed
      }
    };
  }
}

export const freePublishingSystem = new FreePublishingSystem();