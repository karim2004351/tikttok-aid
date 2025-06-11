import puppeteer, { Browser, Page } from 'puppeteer';

export interface TikTokVerificationResult {
  isFollowing: boolean;
  hasWatched: boolean;
  hasLiked: boolean;
  hasCommented: boolean;
  hasShared: boolean;
  allRequirementsMet: boolean;
}

export class TikTokVerificationService {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
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
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1366, height: 768 });
  }

  async verifyUserInteraction(targetVideoUrl: string, userAgent?: string): Promise<TikTokVerificationResult> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      // تعيين user agent إذا تم توفيره
      if (userAgent) {
        await this.page.setUserAgent(userAgent);
      }

      // الانتقال إلى الفيديو المستهدف
      await this.page.goto(targetVideoUrl, { waitUntil: 'networkidle0' });
      
      // انتظار تحميل الصفحة
      await this.page.waitForTimeout(3000);

      const verification: TikTokVerificationResult = {
        isFollowing: false,
        hasWatched: false,
        hasLiked: false,
        hasCommented: false,
        hasShared: false,
        allRequirementsMet: false
      };

      // التحقق من المتابعة
      try {
        const followButton = await this.page.$('[data-e2e="follow-button"]');
        if (followButton) {
          const followText = await this.page.evaluate(el => el?.textContent, followButton);
          verification.isFollowing = followText?.includes('Following') || followText?.includes('متابع') || false;
        }
      } catch (error) {
        console.log('Could not verify follow status:', error);
      }

      // التحقق من الإعجاب
      try {
        const likeButton = await this.page.$('[data-e2e="like-button"]');
        if (likeButton) {
          const isLiked = await this.page.evaluate(el => {
            return el?.classList.contains('liked') || el?.getAttribute('aria-pressed') === 'true';
          }, likeButton);
          verification.hasLiked = isLiked || false;
        }
      } catch (error) {
        console.log('Could not verify like status:', error);
      }

      // التحقق من المشاهدة (وجود الفيديو وتشغيله)
      try {
        const video = await this.page.$('video');
        if (video) {
          const videoCurrentTime = await this.page.evaluate(el => el.currentTime, video);
          const videoDuration = await this.page.evaluate(el => el.duration, video);
          verification.hasWatched = videoCurrentTime > 0 && videoCurrentTime / videoDuration > 0.5; // مشاهدة أكثر من 50%
        }
      } catch (error) {
        console.log('Could not verify watch status:', error);
      }

      // التحقق من التعليق (فحص وجود تعليقات من المستخدم)
      try {
        const commentSection = await this.page.$('[data-e2e="comment-level-1"]');
        verification.hasCommented = !!commentSection;
      } catch (error) {
        console.log('Could not verify comment status:', error);
      }

      // التحقق من المشاركة (فحص إذا تم النقر على زر المشاركة)
      try {
        const shareButton = await this.page.$('[data-e2e="share-button"]');
        if (shareButton) {
          const shareCount = await this.page.evaluate(el => {
            const countEl = el?.querySelector('[data-e2e="share-count"]');
            return countEl?.textContent || '0';
          }, shareButton);
          verification.hasShared = parseInt(shareCount) > 0;
        }
      } catch (error) {
        console.log('Could not verify share status:', error);
      }

      // التحقق من استيفاء جميع المتطلبات
      verification.allRequirementsMet = 
        verification.isFollowing &&
        verification.hasWatched &&
        verification.hasLiked &&
        verification.hasCommented &&
        verification.hasShared;

      return verification;

    } catch (error) {
      console.error('TikTok verification error:', error);
      throw new Error('فشل في التحقق من التفاعل مع تيك توك');
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

export const tiktokVerificationService = new TikTokVerificationService();