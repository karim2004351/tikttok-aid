import puppeteer, { Browser, Page } from 'puppeteer';

export interface TikTokInteractionConfig {
  url: string;
  action: 'follow' | 'watch' | 'repost' | 'comment' | 'share';
  comment?: string;
  shareTargets?: number;
}

export interface TikTokCredentials {
  username: string;
  password: string;
}

export class TikTokAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: false, // للمراقبة المباشرة
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1366, height: 768 });
    
    // تعيين User Agent طبيعي
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  }

  async login(credentials: TikTokCredentials): Promise<boolean> {
    if (!this.page) throw new Error('المتصفح غير مهيأ');

    try {
      // الانتقال لصفحة تسجيل الدخول
      await this.page.goto('https://www.tiktok.com/login', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // انتظار تحميل الصفحة
      await this.page.waitForTimeout(3000);

      // البحث عن حقول تسجيل الدخول
      const usernameSelector = 'input[name="username"], input[placeholder*="email"], input[placeholder*="phone"]';
      const passwordSelector = 'input[name="password"], input[type="password"]';

      await this.page.waitForSelector(usernameSelector, { timeout: 10000 });
      
      // إدخال بيانات تسجيل الدخول
      await this.page.type(usernameSelector, credentials.username, { delay: 100 });
      await this.page.waitForTimeout(1000);
      
      await this.page.type(passwordSelector, credentials.password, { delay: 100 });
      await this.page.waitForTimeout(1000);

      // الضغط على زر تسجيل الدخول
      const loginButton = await this.page.$('button[type="submit"], button[data-e2e="login-button"]');
      if (loginButton) {
        await loginButton.click();
      }

      // انتظار تسجيل الدخول
      await this.page.waitForTimeout(5000);

      // التحقق من نجاح تسجيل الدخول
      const currentUrl = this.page.url();
      return !currentUrl.includes('/login');

    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      return false;
    }
  }

  async navigateToProfile(profileUrl: string): Promise<boolean> {
    if (!this.page) throw new Error('المتصفح غير مهيأ');

    try {
      await this.page.goto(profileUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // انتظار تحميل الصفحة
      await this.page.waitForTimeout(3000);
      
      return true;
    } catch (error) {
      console.error('خطأ في التنقل للملف الشخصي:', error);
      return false;
    }
  }

  async followUser(): Promise<boolean> {
    if (!this.page) throw new Error('المتصفح غير مهيأ');

    try {
      // البحث عن زر المتابعة
      const followSelectors = [
        'button[data-e2e="follow-button"]',
        'button:contains("Follow")',
        'button:contains("متابعة")',
        '[data-e2e="profile-follow-button"]'
      ];

      for (const selector of followSelectors) {
        try {
          const button = await this.page.$(selector);
          if (button) {
            const buttonText = await button.evaluate(el => el.textContent?.toLowerCase());
            if (buttonText?.includes('follow') || buttonText?.includes('متابعة')) {
              await button.click();
              await this.page.waitForTimeout(2000);
              return true;
            }
          }
        } catch (e) {
          continue;
        }
      }

      return false;
    } catch (error) {
      console.error('خطأ في المتابعة:', error);
      return false;
    }
  }

  async watchVideo(): Promise<boolean> {
    if (!this.page) throw new Error('المتصفح غير مهيأ');

    try {
      // البحث عن أول فيديو في الصفحة
      const videoSelectors = [
        'video',
        '[data-e2e="video-player"]',
        '.video-feed-item video'
      ];

      for (const selector of videoSelectors) {
        try {
          const video = await this.page.$(selector);
          if (video) {
            // تشغيل الفيديو
            await video.click();
            await this.page.waitForTimeout(1000);

            // الانتظار لمدة 10 ثواني (مشاهدة كاملة)
            await this.page.waitForTimeout(10000);

            return true;
          }
        } catch (e) {
          continue;
        }
      }

      return false;
    } catch (error) {
      console.error('خطأ في مشاهدة الفيديو:', error);
      return false;
    }
  }

  async repostVideo(): Promise<boolean> {
    if (!this.page) throw new Error('المتصفح غير مهيأ');

    try {
      // البحث عن زر المشاركة/إعادة النشر
      const shareSelectors = [
        'button[data-e2e="share-button"]',
        'button:contains("Share")',
        'button:contains("مشاركة")',
        '[aria-label*="share"]'
      ];

      for (const selector of shareSelectors) {
        try {
          const button = await this.page.$(selector);
          if (button) {
            await button.click();
            await this.page.waitForTimeout(2000);

            // البحث عن زر إعادة النشر
            const repostButton = await this.page.$('button:contains("Repost"), button:contains("إعادة نشر")');
            if (repostButton) {
              await repostButton.click();
              await this.page.waitForTimeout(2000);
            }

            return true;
          }
        } catch (e) {
          continue;
        }
      }

      return false;
    } catch (error) {
      console.error('خطأ في إعادة النشر:', error);
      return false;
    }
  }

  async commentOnVideo(comment: string = "رائع! 👍"): Promise<boolean> {
    if (!this.page) throw new Error('المتصفح غير مهيأ');

    try {
      // البحث عن حقل التعليق
      const commentSelectors = [
        'div[data-e2e="comment-input"]',
        'input[placeholder*="comment"]',
        'textarea[placeholder*="comment"]',
        '[data-e2e="comment-box"]'
      ];

      for (const selector of commentSelectors) {
        try {
          const commentBox = await this.page.$(selector);
          if (commentBox) {
            await commentBox.click();
            await this.page.waitForTimeout(1000);
            
            await commentBox.type(comment, { delay: 100 });
            await this.page.waitForTimeout(1000);

            // الضغط على زر الإرسال
            const sendButton = await this.page.$('button[data-e2e="comment-post"], button:contains("Post"), button:contains("إرسال")');
            if (sendButton) {
              await sendButton.click();
              await this.page.waitForTimeout(2000);
            }

            return true;
          }
        } catch (e) {
          continue;
        }
      }

      return false;
    } catch (error) {
      console.error('خطأ في التعليق:', error);
      return false;
    }
  }

  async shareWithFriends(targetCount: number = 10): Promise<boolean> {
    if (!this.page) throw new Error('المتصفح غير مهيأ');

    try {
      // فتح نافذة المشاركة
      const shareButton = await this.page.$('button[data-e2e="share-button"]');
      if (!shareButton) return false;

      await shareButton.click();
      await this.page.waitForTimeout(2000);

      // البحث عن خيار المشاركة مع الأصدقاء
      const sendToFriendsButton = await this.page.$('button:contains("Send to friends"), button:contains("إرسال للأصدقاء")');
      if (sendToFriendsButton) {
        await sendToFriendsButton.click();
        await this.page.waitForTimeout(2000);

        // اختيار الأصدقاء (محاكاة اختيار أول 10)
        const friendsList = await this.page.$$('.friend-item, [data-e2e="friend-item"]');
        const selectedCount = Math.min(friendsList.length, targetCount);

        for (let i = 0; i < selectedCount; i++) {
          await friendsList[i].click();
          await this.page.waitForTimeout(500);
        }

        // إرسال
        const sendButton = await this.page.$('button:contains("Send"), button:contains("إرسال")');
        if (sendButton) {
          await sendButton.click();
          await this.page.waitForTimeout(2000);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('خطأ في المشاركة مع الأصدقاء:', error);
      return false;
    }
  }

  async performInteraction(config: TikTokInteractionConfig): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.page) {
        await this.initialize();
      }

      // الانتقال للصفحة المطلوبة
      const navigated = await this.navigateToProfile(config.url);
      if (!navigated) {
        return { success: false, message: 'فشل في الوصول للصفحة' };
      }

      let result = false;
      let message = '';

      switch (config.action) {
        case 'follow':
          result = await this.followUser();
          message = result ? 'تم متابعة الصفحة بنجاح' : 'فشل في متابعة الصفحة';
          break;

        case 'watch':
          result = await this.watchVideo();
          message = result ? 'تم مشاهدة الفيديو بنجاح' : 'فشل في مشاهدة الفيديو';
          break;

        case 'repost':
          result = await this.repostVideo();
          message = result ? 'تم إعادة نشر الفيديو بنجاح' : 'فشل في إعادة النشر';
          break;

        case 'comment':
          result = await this.commentOnVideo(config.comment);
          message = result ? 'تم إضافة التعليق بنجاح' : 'فشل في إضافة التعليق';
          break;

        case 'share':
          result = await this.shareWithFriends(config.shareTargets || 10);
          message = result ? 'تم مشاركة الفيديو مع الأصدقاء بنجاح' : 'فشل في المشاركة';
          break;

        default:
          return { success: false, message: 'نوع التفاعل غير مدعوم' };
      }

      return { success: result, message };

    } catch (error) {
      return { success: false, message: `خطأ في التفاعل: ${error.message}` };
    }
  }

  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}

export const tiktokAutomation = new TikTokAutomation();