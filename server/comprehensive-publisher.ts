import { SITES_DATABASE } from './sites-database';
import { FORUMS_DATABASE } from './forums-database';

export interface ComprehensivePublishingConfig {
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

export class ComprehensivePublisher {
  async publishToAllSites(config: ComprehensivePublishingConfig): Promise<PublishingResult[]> {
    const results: PublishingResult[] = [];

    console.log(`بدء النشر الشامل على ${SITES_DATABASE.length + FORUMS_DATABASE.length} موقع ومنتدى...`);

    // محاكاة النشر على جميع المواقع
    for (const site of SITES_DATABASE) {
      const result = await this.simulatePublishingToSite(site, config);
      results.push(result);
    }

    // محاكاة النشر على جميع المنتديات
    for (const forum of FORUMS_DATABASE) {
      const result = await this.simulatePublishingToForum(forum, config);
      results.push(result);
    }

    return results;
  }

  private async simulatePublishingToSite(site: any, config: ComprehensivePublishingConfig): Promise<PublishingResult> {
    const result: PublishingResult = {
      siteName: site.name,
      attempted: config.postsPerSite,
      successful: 0,
      failed: 0,
      successRate: 0,
      errors: []
    };

    console.log(`نشر على ${site.name || site.url || 'موقع رقم ' + Math.random().toString(36).substr(2, 5)}...`);

    for (let i = 0; i < config.postsPerSite; i++) {
      let postSuccess = false;
      let attempts = 0;
      const maxRetries = 3;

      // إعادة المحاولة 3 مرات
      while (!postSuccess && attempts < maxRetries) {
        attempts++;

        try {
          // محاكاة عملية النشر بناءً على نوع الموقع
          const successRate = this.getSiteSuccessRate(site);
          const isSuccessful = Math.random() < successRate;

          if (isSuccessful) {
            result.successful++;
            postSuccess = true;
            console.log(`${site.name} - نشرة ${i + 1} نجحت في المحاولة ${attempts}`);
          } else if (attempts === maxRetries) {
            result.failed++;
            result.errors.push(`${site.name}: فشل النشر ${i + 1} بعد ${maxRetries} محاولات`);
            console.log(`${site.name} - فشل النشر ${i + 1} نهائياً بعد ${maxRetries} محاولات`);
          } else {
            console.log(`${site.name} - فشل النشر ${i + 1} في المحاولة ${attempts}, سيتم إعادة المحاولة...`);
          }

          // تأخير بين المحاولات
          if (!postSuccess && attempts < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

        } catch (error: any) {
          console.log(`${site.name} - خطأ في النشر ${i + 1} محاولة ${attempts}: ${error.message}`);
          
          if (attempts === maxRetries) {
            result.failed++;
            result.errors.push(`${site.name}: خطأ في النشر ${i + 1} بعد ${maxRetries} محاولات - ${error.message}`);
          }
        }
      }

      // تأخير قصير بين المنشورات
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    result.successRate = Math.round((result.successful / result.attempted) * 100);
    return result;
  }

  private async simulatePublishingToForum(forum: any, config: ComprehensivePublishingConfig): Promise<PublishingResult> {
    const result: PublishingResult = {
      siteName: forum.name,
      attempted: config.postsPerSite,
      successful: 0,
      failed: 0,
      successRate: 0,
      errors: []
    };

    console.log(`نشر على منتدى ${forum.name}...`);

    for (let i = 0; i < config.postsPerSite; i++) {
      let postSuccess = false;
      let attempts = 0;
      const maxRetries = 3;

      while (!postSuccess && attempts < maxRetries) {
        attempts++;

        try {
          // محاكاة عملية النشر على المنتدى
          const successRate = this.getForumSuccessRate(forum);
          const isSuccessful = Math.random() < successRate;

          if (isSuccessful) {
            result.successful++;
            postSuccess = true;
            console.log(`${forum.name} - موضوع ${i + 1} نُشر بنجاح في المحاولة ${attempts}`);
          } else if (attempts === maxRetries) {
            result.failed++;
            result.errors.push(`${forum.name}: فشل نشر الموضوع ${i + 1} بعد ${maxRetries} محاولات`);
            console.log(`${forum.name} - فشل النشر ${i + 1} نهائياً بعد ${maxRetries} محاولات`);
          } else {
            console.log(`${forum.name} - فشل النشر ${i + 1} في المحاولة ${attempts}, سيتم إعادة المحاولة...`);
          }

          // تأخير بين المحاولات
          if (!postSuccess && attempts < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }

        } catch (error: any) {
          console.log(`${forum.name} - خطأ في الموضوع ${i + 1} محاولة ${attempts}: ${error.message}`);
          
          if (attempts === maxRetries) {
            result.failed++;
            result.errors.push(`${forum.name}: خطأ في الموضوع ${i + 1} بعد ${maxRetries} محاولات - ${error.message}`);
          }
        }
      }

      // تأخير بين المواضيع
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    result.successRate = Math.round((result.successful / result.attempted) * 100);
    return result;
  }

  private getSiteSuccessRate(site: any): number {
    // معدلات النجاح المختلفة حسب نوع الموقع
    switch (site.category) {
      case 'social':
        return 0.85; // 85% نجاح لمواقع التواصل
      case 'video':
        return 0.75; // 75% نجاح لمواقع الفيديو
      case 'blog':
        return 0.90; // 90% نجاح للمدونات
      case 'news':
        return 0.70; // 70% نجاح لمواقع الأخبار
      case 'tech':
        return 0.80; // 80% نجاح للمواقع التقنية
      default:
        return 0.75; // 75% نجاح افتراضي
    }
  }

  private getForumSuccessRate(forum: any): number {
    // معدلات النجاح المختلفة حسب نوع المنتدى
    switch (forum.category) {
      case 'arabic_forums':
        return 0.88; // 88% نجاح للمنتديات العربية
      case 'tech_forums':
        return 0.82; // 82% نجاح للمنتديات التقنية
      case 'gaming_forums':
        return 0.85; // 85% نجاح لمنتديات الألعاب
      case 'regional_forums':
        return 0.90; // 90% نجاح للمنتديات الإقليمية
      case 'specialized_forums':
        return 0.87; // 87% نجاح للمنتديات المتخصصة
      default:
        return 0.85; // 85% نجاح افتراضي
    }
  }

  // إحصائيات شاملة
  getOverallStats(results: PublishingResult[]): {
    totalSites: number;
    totalAttempted: number;
    totalSuccessful: number;
    totalFailed: number;
    overallSuccessRate: number;
    topPerformingSites: PublishingResult[];
    failedSites: PublishingResult[];
  } {
    const totalSites = results.length;
    const totalAttempted = results.reduce((sum, r) => sum + r.attempted, 0);
    const totalSuccessful = results.reduce((sum, r) => sum + r.successful, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
    const overallSuccessRate = Math.round((totalSuccessful / totalAttempted) * 100);

    // أفضل المواقع أداءً (معدل نجاح أعلى من 90%)
    const topPerformingSites = results
      .filter(r => r.successRate >= 90)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 10);

    // المواقع التي فشلت تماماً
    const failedSites = results
      .filter(r => r.successful === 0)
      .slice(0, 10);

    return {
      totalSites,
      totalAttempted,
      totalSuccessful,
      totalFailed,
      overallSuccessRate,
      topPerformingSites,
      failedSites
    };
  }
}

export const comprehensivePublisher = new ComprehensivePublisher();