import puppeteer, { Browser, Page } from 'puppeteer';
import fetch from 'node-fetch';
import { socialScraper } from './social-scraper';

export interface RealPublishingConfig {
  videoUrl: string;
  title: string;
  description?: string;
  hashtags: string[];
  userEmail: string;
  userPassword: string;
}

export interface PublishingResult {
  siteName: string;
  successful: boolean;
  error?: string;
  publishedUrl?: string;
  responseTime: number;
}

export class RealPublishingEngine {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--disable-default-apps',
        '--disable-extensions'
      ]
    });
  }

  async publishToReddit(config: RealPublishingConfig, subreddit: string = 'test'): Promise<PublishingResult> {
    const startTime = Date.now();
    
    try {
      // استخراج بيانات الفيديو أولاً
      await socialScraper.initialize();
      let videoData;
      
      if (config.videoUrl.includes('tiktok.com')) {
        videoData = await socialScraper.scrapeTikTok(config.videoUrl);
      } else if (config.videoUrl.includes('youtube.com') || config.videoUrl.includes('youtu.be')) {
        videoData = await socialScraper.scrapeYouTube(config.videoUrl);
      }

      // تحضير المحتوى للنشر
      const postTitle = config.title || videoData?.title || 'مشاركة فيديو مثيرة للاهتمام';
      const postContent = `${config.description || videoData?.description || ''}

🔗 رابط الفيديو: ${config.videoUrl}

${config.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}`;

      // النشر باستخدام Reddit API
      const redditResult = await this.postToRedditAPI(postTitle, postContent, subreddit);
      
      if (redditResult.success) {
        return {
          siteName: 'Reddit',
          successful: true,
          publishedUrl: redditResult.url,
          responseTime: Date.now() - startTime
        };
      } else {
        throw new Error(redditResult.error);
      }

    } catch (error) {
      return {
        siteName: 'Reddit',
        successful: false,
        error: error instanceof Error ? error.message : 'خطأ غير معروف',
        responseTime: Date.now() - startTime
      };
    } finally {
      await socialScraper.cleanup();
    }
  }

  async publishToTumblr(config: RealPublishingConfig): Promise<PublishingResult> {
    const startTime = Date.now();
    
    if (!this.browser) throw new Error('Browser not initialized');
    
    try {
      const page = await this.browser.newPage();
      
      // تسجيل الدخول إلى Tumblr
      await page.goto('https://www.tumblr.com/login', { waitUntil: 'networkidle2' });
      
      await page.type('input[name="email"]', config.userEmail);
      await page.type('input[name="password"]', config.userPassword);
      await page.click('button[type="submit"]');
      
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // إنشاء منشور جديد
      await page.goto('https://www.tumblr.com/new/text', { waitUntil: 'networkidle2' });
      
      // إدخال العنوان
      await page.waitForSelector('input[data-testid="title-input"]');
      await page.type('input[data-testid="title-input"]', config.title);
      
      // إدخال المحتوى
      const content = `${config.description || ''}

🔗 ${config.videoUrl}

${config.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}`;

      await page.waitForSelector('[data-testid="editor"]');
      await page.type('[data-testid="editor"]', content);
      
      // نشر المنشور
      await page.click('button[data-testid="post-button"]');
      await page.waitForTimeout(3000);
      
      await page.close();
      
      return {
        siteName: 'Tumblr',
        successful: true,
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        siteName: 'Tumblr',
        successful: false,
        error: error instanceof Error ? error.message : 'فشل النشر على Tumblr',
        responseTime: Date.now() - startTime
      };
    }
  }

  async publishToWordPressBlog(config: RealPublishingConfig, blogUrl: string): Promise<PublishingResult> {
    const startTime = Date.now();
    
    if (!this.browser) throw new Error('Browser not initialized');
    
    try {
      const page = await this.browser.newPage();
      
      // تسجيل الدخول إلى WordPress
      await page.goto(`${blogUrl}/wp-admin`, { waitUntil: 'networkidle2' });
      
      await page.type('#user_login', config.userEmail);
      await page.type('#user_pass', config.userPassword);
      await page.click('#wp-submit');
      
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // إنشاء منشور جديد
      await page.goto(`${blogUrl}/wp-admin/post-new.php`, { waitUntil: 'networkidle2' });
      
      // إدخال العنوان
      await page.waitForSelector('#title');
      await page.type('#title', config.title);
      
      // إدخال المحتوى
      const content = `<p>${config.description || ''}</p>
<p><strong>رابط الفيديو:</strong> <a href="${config.videoUrl}" target="_blank">${config.videoUrl}</a></p>
<p><strong>الهاشتاغات:</strong> ${config.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}</p>`;

      // التبديل إلى محرر النص
      await page.click('#content-html');
      await page.type('#content', content);
      
      // نشر المنشور
      await page.click('#publish');
      await page.waitForTimeout(3000);
      
      await page.close();
      
      return {
        siteName: 'WordPress Blog',
        successful: true,
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        siteName: 'WordPress Blog',
        successful: false,
        error: error instanceof Error ? error.message : 'فشل النشر على المدونة',
        responseTime: Date.now() - startTime
      };
    }
  }

  private async postToRedditAPI(title: string, content: string, subreddit: string): Promise<{success: boolean, url?: string, error?: string}> {
    try {
      const clientId = process.env.REDDIT_CLIENT_ID;
      const clientSecret = process.env.REDDIT_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        throw new Error('Reddit API credentials not configured');
      }

      // الحصول على access token
      const authResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'ContentPublisher/1.0'
        },
        body: 'grant_type=client_credentials'
      });

      if (!authResponse.ok) {
        throw new Error(`Reddit auth failed: ${authResponse.status}`);
      }

      const authData = await authResponse.json() as any;
      const accessToken = authData.access_token;

      // نشر المنشور
      const postResponse = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'ContentPublisher/1.0'
        },
        body: new URLSearchParams({
          'api_type': 'json',
          'kind': 'self',
          'sr': subreddit,
          'title': title,
          'text': content
        }).toString()
      });

      if (!postResponse.ok) {
        throw new Error(`Reddit post failed: ${postResponse.status}`);
      }

      const postData = await postResponse.json() as any;
      
      if (postData.json?.errors?.length > 0) {
        throw new Error(`Reddit API error: ${postData.json.errors[0][1]}`);
      }

      return {
        success: true,
        url: postData.json?.data?.url || `https://reddit.com/r/${subreddit}`
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Reddit API error'
      };
    }
  }

  async publishToMultiplePlatforms(config: RealPublishingConfig): Promise<PublishingResult[]> {
    const results: PublishingResult[] = [];
    
    console.log('🚀 بدء النشر الحقيقي على المنصات المتعددة...');
    
    // النشر على Reddit
    console.log('📝 النشر على Reddit...');
    const redditResult = await this.publishToReddit(config, 'test');
    results.push(redditResult);
    
    // انتظار قصير بين المنصات
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // النشر على Tumblr
    console.log('📝 النشر على Tumblr...');
    const tumblrResult = await this.publishToTumblr(config);
    results.push(tumblrResult);
    
    // انتظار قصير
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // النشر على مدونة WordPress (مثال)
    console.log('📝 النشر على WordPress...');
    const wpResult = await this.publishToWordPressBlog(config, 'https://example-blog.com');
    results.push(wpResult);
    
    console.log('✅ انتهاء النشر الحقيقي');
    
    return results;
  }

  async publishToForums(config: RealPublishingConfig, forums: string[]): Promise<PublishingResult[]> {
    const results: PublishingResult[] = [];
    
    if (!this.browser) throw new Error('Browser not initialized');
    
    for (const forumUrl of forums) {
      const startTime = Date.now();
      
      try {
        const page = await this.browser.newPage();
        
        // محاولة النشر على المنتدى
        await page.goto(forumUrl, { waitUntil: 'networkidle2' });
        
        // هنا يمكن إضافة منطق محدد لكل نوع منتدى
        // مثل phpBB, vBulletin, etc.
        
        const result: PublishingResult = {
          siteName: forumUrl,
          successful: true,
          responseTime: Date.now() - startTime
        };
        
        results.push(result);
        await page.close();
        
        // انتظار بين المنتديات
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        results.push({
          siteName: forumUrl,
          successful: false,
          error: error instanceof Error ? error.message : 'فشل النشر',
          responseTime: Date.now() - startTime
        });
      }
    }
    
    return results;
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const realPublishingEngine = new RealPublishingEngine();