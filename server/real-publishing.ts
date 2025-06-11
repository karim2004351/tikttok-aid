import puppeteer, { Browser, Page } from 'puppeteer';

export interface RealPublishingConfig {
  videoUrl: string;
  title: string;
  description?: string;
  postsPerSite: number;
  userEmail: string;
  userPassword: string;
}

export interface PublishingResult {
  siteName: string;
  attempted: number;
  successful: number;
  failed: number;
  successRate: number;
  errors: string[];
}

export class RealPublishingService {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  }

  async publishToSocialMediaAPIs(config: RealPublishingConfig): Promise<PublishingResult[]> {
    const results: PublishingResult[] = [];

    // نشر على Twitter باستخدام API
    if (process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET) {
      const twitterResult = await this.publishToTwitter(config);
      results.push(twitterResult);
    }

    // نشر على Reddit باستخدام API
    if (process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET) {
      const redditResult = await this.publishToReddit(config);
      results.push(redditResult);
    }

    // نشر على Facebook باستخدام API
    if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
      const facebookResult = await this.publishToFacebook(config);
      results.push(facebookResult);
    }

    // نشر على TikTok باستخدام API مفاتيح النشر الخاصة
    if (process.env.TIKTOK_PUBLISHING_CLIENT_KEY && process.env.TIKTOK_PUBLISHING_CLIENT_SECRET) {
      const tiktokResult = await this.publishToTikTok(config);
      results.push(tiktokResult);
    }

    return results;
  }

  private async publishToTwitter(config: RealPublishingConfig): Promise<PublishingResult> {
    const result: PublishingResult = {
      siteName: 'Twitter',
      attempted: config.postsPerSite,
      successful: 0,
      failed: 0,
      successRate: 0,
      errors: []
    };

    try {
      const apiKey = process.env.TWITTER_API_KEY;
      const apiSecret = process.env.TWITTER_API_SECRET;

      if (!apiKey || !apiSecret) {
        throw new Error('Twitter API keys not configured');
      }

      console.log(`نشر على Twitter باستخدام API الحقيقي: ${config.videoUrl}`);
      
      for (let i = 0; i < config.postsPerSite; i++) {
        let postSuccess = false;
        let attempts = 0;
        const maxRetries = 3;
        
        // إعادة المحاولة 3 مرات قبل الفشل النهائي
        while (!postSuccess && attempts < maxRetries) {
          attempts++;
          
          try {
            // استخدام Twitter API v2 الحقيقي
            const response = await fetch('https://api.twitter.com/2/tweets', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                text: `${config.title}\n\n${config.description}\n\n${config.videoUrl}`
              })
            });

            if (response.ok) {
              result.successful++;
              postSuccess = true;
              console.log(`Twitter - نشرة ${i + 1}/${config.postsPerSite} نجحت في المحاولة ${attempts}`);
            } else {
              const errorData = await response.text();
              console.log(`Twitter - فشل النشر ${i + 1} في المحاولة ${attempts}: ${errorData}`);
              
              if (attempts === maxRetries) {
                result.failed++;
                result.errors.push(`Twitter: فشل النشر ${i + 1} بعد ${maxRetries} محاولات - ${errorData}`);
              }
            }
          } catch (error: any) {
            console.log(`Twitter - خطأ في النشر ${i + 1} محاولة ${attempts}: ${error.message}`);
            
            if (attempts === maxRetries) {
              result.failed++;
              result.errors.push(`Twitter: خطأ في النشر ${i + 1} بعد ${maxRetries} محاولات - ${error.message}`);
            }
          }
          
          // تأخير بين المحاولات
          if (!postSuccess && attempts < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        
        // تأخير بين المنشورات
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      result.successRate = Math.round((result.successful / result.attempted) * 100);
    } catch (error: any) {
      result.errors.push(`Twitter API error: ${error.message}`);
      result.failed = result.attempted;
    }

    return result;
  }

  private async publishToReddit(config: RealPublishingConfig): Promise<PublishingResult> {
    const result: PublishingResult = {
      siteName: 'Reddit',
      attempted: config.postsPerSite,
      successful: 0,
      failed: 0,
      successRate: 0,
      errors: []
    };

    try {
      console.log(`نشر على Reddit: ${config.videoUrl}`);
      
      // النشر على subreddits مختلفة
      const subreddits = ['videos', 'TikTok', 'funny', 'entertainment', 'viral'];
      
      const clientId = process.env.REDDIT_CLIENT_ID;
      const clientSecret = process.env.REDDIT_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error('Reddit API keys not configured');
      }

      for (let i = 0; i < Math.min(config.postsPerSite, subreddits.length); i++) {
        let postSuccess = false;
        let attempts = 0;
        const maxRetries = 3;
        const subreddit = subreddits[i];
        
        // إعادة المحاولة 3 مرات قبل الفشل النهائي
        while (!postSuccess && attempts < maxRetries) {
          attempts++;
          
          try {
            // استخدام Reddit API الحقيقي
            const response = await fetch(`https://oauth.reddit.com/api/submit`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${clientId}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'PublishingBot/1.0'
              },
              body: new URLSearchParams({
                api_type: 'json',
                kind: 'link',
                sr: subreddit,
                title: config.title,
                url: config.videoUrl,
                text: config.description || ''
              })
            });

            if (response.ok) {
              result.successful++;
              postSuccess = true;
              console.log(`Reddit r/${subreddit} - نشرة ${i + 1} نجحت في المحاولة ${attempts}`);
            } else {
              const errorData = await response.text();
              console.log(`Reddit r/${subreddit} - فشل النشر ${i + 1} في المحاولة ${attempts}: ${errorData}`);
              
              if (attempts === maxRetries) {
                result.failed++;
                result.errors.push(`Reddit r/${subreddit}: فشل النشر ${i + 1} بعد ${maxRetries} محاولات - ${errorData}`);
              }
            }
          } catch (error: any) {
            console.log(`Reddit r/${subreddit} - خطأ في النشر ${i + 1} محاولة ${attempts}: ${error.message}`);
            
            if (attempts === maxRetries) {
              result.failed++;
              result.errors.push(`Reddit r/${subreddit}: خطأ في النشر ${i + 1} بعد ${maxRetries} محاولات - ${error.message}`);
            }
          }
          
          // تأخير بين المحاولات (فقط إذا لم ينجح ولم نصل للحد الأقصى)
          if (!postSuccess && attempts < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
        
        // تأخير بين المنشورات
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      result.successRate = Math.round((result.successful / result.attempted) * 100);
    } catch (error) {
      result.errors.push(`Reddit API error: ${error}`);
      result.failed = result.attempted;
    }

    return result;
  }

  private async publishToFacebook(config: RealPublishingConfig): Promise<PublishingResult> {
    const result: PublishingResult = {
      siteName: 'Facebook',
      attempted: config.postsPerSite,
      successful: 0,
      failed: 0,
      successRate: 0,
      errors: []
    };

    try {
      console.log(`نشر على Facebook: ${config.videoUrl}`);
      
      const appId = process.env.FACEBOOK_APP_ID;
      const appSecret = process.env.FACEBOOK_APP_SECRET;

      if (!appId || !appSecret) {
        throw new Error('Facebook API keys not configured');
      }

      for (let i = 0; i < config.postsPerSite; i++) {
        let postSuccess = false;
        let attempts = 0;
        const maxRetries = 3;
        
        // إعادة المحاولة 3 مرات قبل الفشل النهائي
        while (!postSuccess && attempts < maxRetries) {
          attempts++;
          
          try {
            // استخدام Facebook Graph API الحقيقي
            const response = await fetch(`https://graph.facebook.com/v18.0/me/feed`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                message: `${config.title}\n\n${config.description}`,
                link: config.videoUrl,
                access_token: `${appId}|${appSecret}`
              })
            });

            if (response.ok) {
              result.successful++;
              postSuccess = true;
              console.log(`Facebook - نشرة ${i + 1}/${config.postsPerSite} نجحت في المحاولة ${attempts}`);
            } else {
              const errorData = await response.text();
              console.log(`Facebook - فشل النشر ${i + 1} في المحاولة ${attempts}: ${errorData}`);
              
              if (attempts === maxRetries) {
                result.failed++;
                result.errors.push(`Facebook: فشل النشر ${i + 1} بعد ${maxRetries} محاولات - ${errorData}`);
              }
            }
          } catch (error: any) {
            console.log(`Facebook - خطأ في النشر ${i + 1} محاولة ${attempts}: ${error.message}`);
            
            if (attempts === maxRetries) {
              result.failed++;
              result.errors.push(`Facebook: خطأ في النشر ${i + 1} بعد ${maxRetries} محاولات - ${error.message}`);
            }
          }
          
          // تأخير بين المحاولات
          if (!postSuccess && attempts < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
        
        // تأخير بين المنشورات
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      result.successRate = Math.round((result.successful / result.attempted) * 100);
    } catch (error) {
      result.errors.push(`Facebook API error: ${error}`);
      result.failed = result.attempted;
    }

    return result;
  }

  private async publishToTikTok(config: RealPublishingConfig): Promise<PublishingResult> {
    const result: PublishingResult = {
      siteName: 'TikTok',
      attempted: config.postsPerSite,
      successful: 0,
      failed: 0,
      successRate: 0,
      errors: []
    };

    try {
      console.log(`نشر على TikTok: ${config.videoUrl}`);
      
      // استخدام مفاتيح TikTok الخاصة بالنشر منفصلة عن المفاتيح الأخرى
      const publishingClientKey = process.env.TIKTOK_PUBLISHING_CLIENT_KEY;
      const publishingClientSecret = process.env.TIKTOK_PUBLISHING_CLIENT_SECRET;

      if (!publishingClientKey || !publishingClientSecret) {
        throw new Error('TikTok Publishing API keys not configured');
      }

      for (let i = 0; i < config.postsPerSite; i++) {
        let postSuccess = false;
        let attempts = 0;
        const maxRetries = 3;
        
        // إعادة المحاولة 3 مرات قبل الفشل النهائي
        while (!postSuccess && attempts < maxRetries) {
          attempts++;
          
          try {
            // استخدام TikTok Content Posting API الحقيقي
            const response = await fetch('https://open.tiktokapis.com/v2/post/publish/content/init/', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publishingClientKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                post_info: {
                  title: config.title,
                  description: config.description,
                  privacy_level: 'MUTUAL_FOLLOW_FRIENDS',
                  disable_duet: false,
                  disable_comment: false,
                  disable_stitch: false,
                  video_cover_timestamp_ms: 1000
                },
                source_info: {
                  source: 'PULL_FROM_URL',
                  video_url: config.videoUrl
                }
              })
            });

            if (response.ok) {
              const data = await response.json();
              result.successful++;
              postSuccess = true;
              console.log(`TikTok - نشرة ${i + 1}/${config.postsPerSite} نجحت في المحاولة ${attempts}: ${data.data?.publish_id || 'منشور'}`);
            } else {
              const errorData = await response.text();
              console.log(`TikTok - فشل النشر ${i + 1} في المحاولة ${attempts}: ${errorData}`);
              
              if (attempts === maxRetries) {
                result.failed++;
                result.errors.push(`TikTok: فشل النشر ${i + 1} بعد ${maxRetries} محاولات - ${errorData}`);
              }
            }
          } catch (error: any) {
            console.log(`TikTok - خطأ في النشر ${i + 1} محاولة ${attempts}: ${error.message}`);
            
            if (attempts === maxRetries) {
              result.failed++;
              result.errors.push(`TikTok: خطأ في النشر ${i + 1} بعد ${maxRetries} محاولات - ${error.message}`);
            }
          }
          
          // تأخير بين المحاولات
          if (!postSuccess && attempts < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 4000));
          }
        }
        
        // تأخير بين المنشورات
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      result.successRate = Math.round((result.successful / result.attempted) * 100);
    } catch (error) {
      result.errors.push(`TikTok API error: ${error}`);
      result.failed = result.attempted;
    }

    return result;
  }

  async publishToAllWebsites(config: RealPublishingConfig): Promise<PublishingResult[]> {
    const { comprehensivePublisher } = await import('./comprehensive-publisher');
    
    try {
      console.log('بدء النشر الشامل على جميع الـ 1,171 موقع ومنتدى...');
      
      const comprehensiveConfig = {
        videoUrl: config.videoUrl,
        title: config.title,
        description: config.description,
        postsPerSite: config.postsPerSite,
        userEmail: config.userEmail,
        userPassword: config.userPassword
      };

      const results = await comprehensivePublisher.publishToAllSites(comprehensiveConfig);
      
      // طباعة الإحصائيات الشاملة
      const stats = comprehensivePublisher.getOverallStats(results);
      console.log(`
========== إحصائيات النشر الشامل ==========
إجمالي المواقع: ${stats.totalSites}
إجمالي المحاولات: ${stats.totalAttempted}
المنشورات الناجحة: ${stats.totalSuccessful}
المنشورات الفاشلة: ${stats.totalFailed}
معدل النجاح الإجمالي: ${stats.overallSuccessRate}%
أفضل المواقع أداءً: ${stats.topPerformingSites.length}
المواقع الفاشلة: ${stats.failedSites.length}
=========================================
      `);
      
      return results;
      
    } catch (error: any) {
      console.error('خطأ في النشر الشامل:', error);
      
      return [{
        siteName: 'خطأ في النظام الشامل',
        attempted: 1,
        successful: 0,
        failed: 1,
        successRate: 0,
        errors: [error.message]
      }];
    }
  }

  private async publishToForum(forum: any, config: RealPublishingConfig): Promise<PublishingResult> {
    const result: PublishingResult = {
      siteName: forum.name,
      attempted: config.postsPerSite,
      successful: 0,
      failed: 0,
      successRate: 0,
      errors: []
    };

    try {
      if (!this.browser) return result;

      const page = await this.browser.newPage();
      
      // محاولة تسجيل الدخول
      await page.goto(forum.loginUrl);
      
      // ملء بيانات تسجيل الدخول
      await page.type('input[name="email"], input[name="username"]', config.userEmail);
      await page.type('input[name="password"]', config.userPassword);
      
      // النقر على زر تسجيل الدخول
      await page.click('button[type="submit"], input[type="submit"]');
      
      // انتظار تحميل الصفحة
      await page.waitForNavigation();

      // النشر المتعدد
      for (let i = 0; i < config.postsPerSite; i++) {
        try {
          await page.goto(forum.postUrl);
          
          // ملء نموذج النشر
          await page.type('input[name="title"], textarea[name="title"]', config.title);
          await page.type('textarea[name="content"], textarea[name="message"]', 
            `${config.description}\n\nرابط الفيديو: ${config.videoUrl}`);
          
          // إرسال المنشور
          await page.click('button[type="submit"], input[type="submit"]');
          
          // انتظار التأكيد
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          result.successful++;
          console.log(`${forum.name} - نشرة ${i + 1}/${config.postsPerSite} نجحت`);
          
        } catch (error) {
          result.failed++;
          result.errors.push(`Post ${i + 1}: ${error}`);
        }
      }

      result.successRate = Math.round((result.successful / result.attempted) * 100);
      await page.close();

    } catch (error) {
      result.errors.push(`Forum error: ${error}`);
      result.failed = result.attempted;
    }

    return result;
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const realPublishingService = new RealPublishingService();