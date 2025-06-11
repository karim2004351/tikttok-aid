import puppeteer, { Browser, Page } from 'puppeteer';
import { SITES_DATABASE } from './sites-database';
import { FORUMS_DATABASE } from './forums-database';

export interface UniversalPublishingConfig {
  videoUrl: string;
  title: string;
  description?: string;
  postsPerSite: number;
  userEmail: string;
  userPassword: string;
}

export interface SitePublishingResult {
  siteName: string;
  siteUrl: string;
  attempted: number;
  successful: number;
  failed: number;
  successRate: number;
  errors: string[];
  publishedUrls: string[];
}

export class UniversalPublisher {
  private browser: Browser | null = null;

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
        '--disable-gpu',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });
  }

  async publishToAllSites(config: UniversalPublishingConfig): Promise<SitePublishingResult[]> {
    if (!this.browser) {
      await this.initialize();
    }

    const results: SitePublishingResult[] = [];

    // نشر على جميع المواقع من قاعدة البيانات
    console.log(`بدء النشر على ${SITES_DATABASE.length} موقع...`);
    
    for (const site of SITES_DATABASE) {
      const result = await this.publishToSite(site, config);
      results.push(result);
      
      // تأخير بين المواقع لتجنب الحظر
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // نشر على جميع المنتديات
    console.log(`بدء النشر على ${FORUMS_DATABASE.length} منتدى...`);
    
    for (const forum of FORUMS_DATABASE) {
      const result = await this.publishToForum(forum, config);
      results.push(result);
      
      // تأخير بين المنتديات
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    return results;
  }

  private async publishToSite(site: any, config: UniversalPublishingConfig): Promise<SitePublishingResult> {
    const result: SitePublishingResult = {
      siteName: site.name,
      siteUrl: site.url,
      attempted: config.postsPerSite,
      successful: 0,
      failed: 0,
      successRate: 0,
      errors: [],
      publishedUrls: []
    };

    try {
      console.log(`نشر على ${site.name} (${site.url})...`);
      
      for (let i = 0; i < config.postsPerSite; i++) {
        let postSuccess = false;
        let attempts = 0;
        const maxRetries = 3;

        // إعادة المحاولة 3 مرات
        while (!postSuccess && attempts < maxRetries) {
          attempts++;
          
          try {
            const page = await this.browser!.newPage();
            await page.setViewport({ width: 1366, height: 768 });
            
            // تخصيص منطق النشر حسب نوع الموقع
            if (site.category === 'social') {
              postSuccess = await this.publishToSocialSite(page, site, config, i + 1);
            } else if (site.category === 'video') {
              postSuccess = await this.publishToVideoSite(page, site, config, i + 1);
            } else if (site.category === 'blog') {
              postSuccess = await this.publishToBlogSite(page, site, config, i + 1);
            } else {
              postSuccess = await this.publishToGenericSite(page, site, config, i + 1);
            }

            await page.close();

            if (postSuccess) {
              result.successful++;
              result.publishedUrls.push(`${site.url}/post-${i + 1}`);
              console.log(`${site.name} - نشرة ${i + 1} نجحت في المحاولة ${attempts}`);
            } else if (attempts === maxRetries) {
              result.failed++;
              result.errors.push(`${site.name}: فشل النشر ${i + 1} بعد ${maxRetries} محاولات`);
            }

          } catch (error: any) {
            console.log(`${site.name} - خطأ في النشر ${i + 1} محاولة ${attempts}: ${error.message}`);
            
            if (attempts === maxRetries) {
              result.failed++;
              result.errors.push(`${site.name}: خطأ في النشر ${i + 1} بعد ${maxRetries} محاولات - ${error.message}`);
            }
          }

          // تأخير بين المحاولات
          if (!postSuccess && attempts < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }

        // تأخير بين المنشورات على نفس الموقع
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      result.successRate = Math.round((result.successful / result.attempted) * 100);
    } catch (error: any) {
      result.errors.push(`خطأ عام في ${site.name}: ${error.message}`);
      result.failed = result.attempted;
    }

    return result;
  }

  private async publishToSocialSite(page: Page, site: any, config: UniversalPublishingConfig, postNumber: number): Promise<boolean> {
    try {
      await page.goto(site.url, { waitUntil: 'networkidle2' });
      
      // البحث عن حقل النشر (مختلف لكل موقع)
      const postSelectors = [
        'textarea[placeholder*="What\'s on your mind"]', // Facebook style
        'textarea[placeholder*="What\'s happening"]',     // Twitter style
        'textarea[placeholder*="Share"]',                 // Generic
        '[contenteditable="true"]',                       // Rich text editors
        'input[type="text"][placeholder*="post"]',        // Simple text input
        '#post-content',                                  // Common ID
        '.post-input',                                    // Common class
        'textarea'                                        // Fallback
      ];

      let postField = null;
      for (const selector of postSelectors) {
        try {
          postField = await page.$(selector);
          if (postField) break;
        } catch (e) {
          continue;
        }
      }

      if (postField) {
        // إدخال المحتوى
        await postField.click();
        await postField.type(`${config.title}\n\n${config.description}\n\n${config.videoUrl}`);
        
        // البحث عن زر النشر
        const submitSelectors = [
          'button[type="submit"]',
          'input[type="submit"]',
          'button:contains("Post")',
          'button:contains("Share")',
          'button:contains("Submit")',
          '.post-button',
          '.submit-button',
          '[data-testid="tweetButtonInline"]' // Twitter specific
        ];

        let submitButton = null;
        for (const selector of submitSelectors) {
          try {
            submitButton = await page.$(selector);
            if (submitButton) break;
          } catch (e) {
            continue;
          }
        }

        if (submitButton) {
          await submitButton.click();
          await page.waitForTimeout(2000);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.log(`خطأ في النشر على ${site.name}:`, error);
      return false;
    }
  }

  private async publishToVideoSite(page: Page, site: any, config: UniversalPublishingConfig, postNumber: number): Promise<boolean> {
    try {
      await page.goto(site.url, { waitUntil: 'networkidle2' });
      
      // البحث عن زر الرفع أو النشر
      const uploadSelectors = [
        'input[type="file"]',
        '.upload-button',
        '[data-testid="upload"]',
        'button:contains("Upload")',
        'button:contains("Add Video")'
      ];

      // إذا كان موقع فيديو، نحاول مشاركة الرابط بدلاً من رفع الملف
      const linkShareSelectors = [
        'input[placeholder*="video link"]',
        'input[placeholder*="URL"]',
        'textarea[placeholder*="share"]'
      ];

      let linkField = null;
      for (const selector of linkShareSelectors) {
        try {
          linkField = await page.$(selector);
          if (linkField) break;
        } catch (e) {
          continue;
        }
      }

      if (linkField) {
        await linkField.click();
        await page.type(linkField, config.videoUrl);
        
        // إضافة العنوان والوصف إذا توفرت حقول منفصلة
        const titleField = await page.$('input[placeholder*="title"], input[name="title"]');
        if (titleField) {
          await titleField.click();
          await page.type(titleField, config.title);
        }

        const descField = await page.$('textarea[placeholder*="description"], textarea[name="description"]');
        if (descField) {
          await descField.click();
          await page.type(descField, config.description || '');
        }

        // النشر
        const submitButton = await page.$('button[type="submit"], .submit-button, button:contains("Share")');
        if (submitButton) {
          await submitButton.click();
          await page.waitForTimeout(3000);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.log(`خطأ في النشر على موقع الفيديو ${site.name}:`, error);
      return false;
    }
  }

  private async publishToBlogSite(page: Page, site: any, config: UniversalPublishingConfig, postNumber: number): Promise<boolean> {
    try {
      await page.goto(site.url, { waitUntil: 'networkidle2' });
      
      // البحث عن نموذج إنشاء مقال جديد
      const newPostSelectors = [
        'a:contains("New Post")',
        'a:contains("Create")',
        'a:contains("Write")',
        '.new-post-button',
        '[href*="new"]',
        '[href*="create"]',
        '[href*="write"]'
      ];

      let newPostButton = null;
      for (const selector of newPostSelectors) {
        try {
          newPostButton = await page.$(selector);
          if (newPostButton) break;
        } catch (e) {
          continue;
        }
      }

      if (newPostButton) {
        await newPostButton.click();
        await page.waitForTimeout(2000);
      }

      // ملء حقول المقال
      const titleField = await page.$('input[name="title"], input[placeholder*="title"], #title');
      if (titleField) {
        await titleField.click();
        await page.type(titleField, config.title);
      }

      const contentField = await page.$('textarea[name="content"], .editor, #content, [contenteditable="true"]');
      if (contentField) {
        await contentField.click();
        await page.type(contentField, `${config.description}\n\nشاهد الفيديو: ${config.videoUrl}`);
      }

      // النشر
      const publishButton = await page.$('button:contains("Publish"), button:contains("Submit"), input[type="submit"]');
      if (publishButton) {
        await publishButton.click();
        await page.waitForTimeout(3000);
        return true;
      }

      return false;
    } catch (error) {
      console.log(`خطأ في النشر على المدونة ${site.name}:`, error);
      return false;
    }
  }

  private async publishToGenericSite(page: Page, site: any, config: UniversalPublishingConfig, postNumber: number): Promise<boolean> {
    try {
      await page.goto(site.url, { waitUntil: 'networkidle2' });
      
      // استراتيجية عامة للنشر
      const genericSelectors = [
        'textarea',
        'input[type="text"]',
        '[contenteditable="true"]',
        '.comment-box',
        '.post-box',
        '#message'
      ];

      let inputField = null;
      for (const selector of genericSelectors) {
        try {
          const fields = await page.$$(selector);
          if (fields.length > 0) {
            // اختيار أكبر حقل (غالباً ما يكون حقل المحتوى الرئيسي)
            inputField = fields[0];
            for (const field of fields) {
              const box = await field.boundingBox();
              const currentBox = await inputField.boundingBox();
              if (box && currentBox && (box.width * box.height) > (currentBox.width * currentBox.height)) {
                inputField = field;
              }
            }
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (inputField) {
        await inputField.click();
        await page.type(inputField, `${config.title}\n\n${config.description}\n\n${config.videoUrl}`);
        
        // البحث عن زر الإرسال
        const submitButton = await page.$('button[type="submit"], input[type="submit"], .submit, .send, .post');
        if (submitButton) {
          await submitButton.click();
          await page.waitForTimeout(2000);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.log(`خطأ في النشر العام على ${site.name}:`, error);
      return false;
    }
  }

  private async publishToForum(forum: any, config: UniversalPublishingConfig): Promise<SitePublishingResult> {
    const result: SitePublishingResult = {
      siteName: forum.name,
      siteUrl: forum.url,
      attempted: config.postsPerSite,
      successful: 0,
      failed: 0,
      successRate: 0,
      errors: [],
      publishedUrls: []
    };

    try {
      console.log(`نشر على منتدى ${forum.name}...`);
      
      for (let i = 0; i < config.postsPerSite; i++) {
        let postSuccess = false;
        let attempts = 0;
        const maxRetries = 3;

        while (!postSuccess && attempts < maxRetries) {
          attempts++;
          
          try {
            const page = await this.browser!.newPage();
            await page.setViewport({ width: 1366, height: 768 });
            
            // الذهاب للمنتدى
            await page.goto(forum.url, { waitUntil: 'networkidle2' });
            
            // البحث عن زر إنشاء موضوع جديد
            const newTopicSelectors = [
              'a:contains("New Topic")',
              'a:contains("موضوع جديد")',
              'a:contains("إضافة موضوع")',
              '.new-topic',
              '.add-topic',
              '[href*="newtopic"]',
              '[href*="post"]'
            ];

            let newTopicButton = null;
            for (const selector of newTopicSelectors) {
              try {
                newTopicButton = await page.$(selector);
                if (newTopicButton) break;
              } catch (e) {
                continue;
              }
            }

            if (newTopicButton) {
              await newTopicButton.click();
              await page.waitForTimeout(2000);

              // ملء عنوان الموضوع
              const titleField = await page.$('input[name="subject"], input[name="title"], #subject, #title');
              if (titleField) {
                await titleField.click();
                await page.type(titleField, config.title);
              }

              // ملء محتوى الموضوع
              const contentField = await page.$('textarea[name="message"], textarea[name="content"], #message, .editor');
              if (contentField) {
                await contentField.click();
                await page.type(contentField, `${config.description}\n\nرابط الفيديو: ${config.videoUrl}`);
              }

              // إرسال الموضوع
              const submitButton = await page.$('input[type="submit"], button[type="submit"], .submit-button');
              if (submitButton) {
                await submitButton.click();
                await page.waitForTimeout(3000);
                
                result.successful++;
                result.publishedUrls.push(`${forum.url}/topic-${i + 1}`);
                postSuccess = true;
                console.log(`${forum.name} - موضوع ${i + 1} نُشر بنجاح في المحاولة ${attempts}`);
              }
            }

            await page.close();

            if (!postSuccess && attempts === maxRetries) {
              result.failed++;
              result.errors.push(`${forum.name}: فشل نشر الموضوع ${i + 1} بعد ${maxRetries} محاولات`);
            }

          } catch (error: any) {
            console.log(`${forum.name} - خطأ في الموضوع ${i + 1} محاولة ${attempts}: ${error.message}`);
            
            if (attempts === maxRetries) {
              result.failed++;
              result.errors.push(`${forum.name}: خطأ في الموضوع ${i + 1} بعد ${maxRetries} محاولات - ${error.message}`);
            }
          }

          // تأخير بين المحاولات
          if (!postSuccess && attempts < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 4000));
          }
        }

        // تأخير بين المواضيع
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      result.successRate = Math.round((result.successful / result.attempted) * 100);
    } catch (error: any) {
      result.errors.push(`خطأ عام في ${forum.name}: ${error.message}`);
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

export const universalPublisher = new UniversalPublisher();