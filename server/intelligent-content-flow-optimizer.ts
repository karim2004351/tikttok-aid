// محسن تدفق المحتوى الذكي
export interface ContentFlow {
  id: string;
  userId: string;
  contentItems: ContentItem[];
  optimizationSettings: OptimizationSettings;
  performanceMetrics: FlowMetrics;
  status: 'active' | 'paused' | 'optimizing' | 'completed';
  createdAt: Date;
  lastOptimized: Date;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  platform: string;
  contentType: 'video' | 'image' | 'text' | 'audio';
  scheduledTime: Date;
  priority: number;
  tags: string[];
  targetAudience: string;
  estimatedEngagement: number;
  actualEngagement?: number;
  publishStatus: 'pending' | 'published' | 'failed';
}

export interface OptimizationSettings {
  optimizeForEngagement: boolean;
  optimizeForReach: boolean;
  optimizeForConversions: boolean;
  respectTimeZones: boolean;
  platformSpecificOptimization: boolean;
  audienceSegmentation: boolean;
  contentSpacing: number; // minutes between posts
  maxPostsPerDay: number;
}

export interface FlowMetrics {
  totalItems: number;
  publishedItems: number;
  pendingItems: number;
  failedItems: number;
  averageEngagement: number;
  bestPerformingTime: string;
  bestPerformingPlatform: string;
  optimizationScore: number;
}

export class IntelligentContentFlowOptimizer {
  private activeFlows: Map<string, ContentFlow> = new Map();

  async createOptimizedFlow(
    userId: string,
    contentItems: ContentItem[],
    settings: OptimizationSettings
  ): Promise<ContentFlow> {
    const flowId = this.generateFlowId();
    
    // تحليل المحتوى وتحسين التوقيتات
    const optimizedItems = await this.optimizeContentScheduling(contentItems, settings);
    
    const flow: ContentFlow = {
      id: flowId,
      userId,
      contentItems: optimizedItems,
      optimizationSettings: settings,
      performanceMetrics: this.initializeMetrics(optimizedItems),
      status: 'active',
      createdAt: new Date(),
      lastOptimized: new Date()
    };

    this.activeFlows.set(flowId, flow);
    return flow;
  }

  private async optimizeContentScheduling(
    items: ContentItem[],
    settings: OptimizationSettings
  ): Promise<ContentItem[]> {
    // ترتيب المحتوى حسب الأولوية والأداء المتوقع
    let sortedItems = [...items].sort((a, b) => {
      if (settings.optimizeForEngagement) {
        return b.estimatedEngagement - a.estimatedEngagement;
      }
      return b.priority - a.priority;
    });

    // تحسين التوقيتات
    const optimizedItems: ContentItem[] = [];
    let currentTime = new Date();

    for (let i = 0; i < sortedItems.length; i++) {
      const item = { ...sortedItems[i] };
      
      // حساب أفضل وقت للنشر
      const optimalTime = await this.calculateOptimalPostingTime(
        item,
        currentTime,
        settings
      );
      
      item.scheduledTime = optimalTime;
      optimizedItems.push(item);
      
      // إضافة المسافة الزمنية المطلوبة
      currentTime = new Date(optimalTime.getTime() + (settings.contentSpacing * 60000));
    }

    return optimizedItems;
  }

  private async calculateOptimalPostingTime(
    item: ContentItem,
    baseTime: Date,
    settings: OptimizationSettings
  ): Promise<Date> {
    // أوقات الذروة حسب المنصة
    const peakHours = this.getPlatformPeakHours(item.platform);
    
    // أوقات الذروة حسب الجمهور المستهدف
    const audiencePeakHours = this.getAudiencePeakHours(item.targetAudience);
    
    // دمج التوقيتات للحصول على أفضل وقت
    const optimalHour = this.findOptimalHour(peakHours, audiencePeakHours);
    
    // تطبيق التوقيت على التاريخ الأساسي
    const optimizedTime = new Date(baseTime);
    optimizedTime.setHours(optimalHour, 0, 0, 0);
    
    // إذا كان الوقت المحسن في الماضي، انقل إلى اليوم التالي
    if (optimizedTime <= baseTime) {
      optimizedTime.setDate(optimizedTime.getDate() + 1);
    }
    
    return optimizedTime;
  }

  private getPlatformPeakHours(platform: string): number[] {
    const peakTimes: { [key: string]: number[] } = {
      'tiktok': [19, 20, 21, 22], // 7-10 مساء
      'youtube': [20, 21, 22], // 8-10 مساء
      'instagram': [18, 19, 20, 21], // 6-9 مساء
      'facebook': [15, 18, 19, 20], // 3-8 مساء
      'twitter': [9, 12, 17, 18], // 9ص، 12ظ، 5-6م
      'linkedin': [8, 9, 17, 18] // 8-9ص، 5-6م
    };
    
    return peakTimes[platform.toLowerCase()] || [19, 20, 21];
  }

  private getAudiencePeakHours(audience: string): number[] {
    const audienceTimes: { [key: string]: number[] } = {
      'teenagers': [16, 17, 18, 20, 21], // بعد المدرسة والمساء
      'young_adults': [19, 20, 21, 22], // المساء
      'professionals': [8, 12, 17, 18], // الصباح، الغداء، بعد العمل
      'parents': [21, 22, 23], // بعد نوم الأطفال
      'seniors': [10, 11, 14, 15], // الصباح والعصر
      'broad_audience': [19, 20, 21] // عام
    };
    
    return audienceTimes[audience] || audienceTimes['broad_audience'];
  }

  private findOptimalHour(platformHours: number[], audienceHours: number[]): number {
    // البحث عن التقاطع بين أوقات المنصة والجمهور
    const intersection = platformHours.filter(hour => audienceHours.includes(hour));
    
    if (intersection.length > 0) {
      // اختيار الوقت الأوسط من التقاطع
      return intersection[Math.floor(intersection.length / 2)];
    }
    
    // إذا لم يوجد تقاطع، اختر من أوقات المنصة
    return platformHours[Math.floor(platformHours.length / 2)];
  }

  async analyzeFlowPerformance(flowId: string): Promise<FlowMetrics> {
    const flow = this.activeFlows.get(flowId);
    if (!flow) {
      throw new Error('تدفق المحتوى غير موجود');
    }

    const publishedItems = flow.contentItems.filter(item => item.publishStatus === 'published');
    const totalEngagement = publishedItems.reduce((sum, item) => sum + (item.actualEngagement || 0), 0);
    
    // تحليل أفضل الأوقات والمنصات
    const timePerformance = this.analyzeTimePerformance(publishedItems);
    const platformPerformance = this.analyzePlatformPerformance(publishedItems);
    
    const metrics: FlowMetrics = {
      totalItems: flow.contentItems.length,
      publishedItems: publishedItems.length,
      pendingItems: flow.contentItems.filter(item => item.publishStatus === 'pending').length,
      failedItems: flow.contentItems.filter(item => item.publishStatus === 'failed').length,
      averageEngagement: publishedItems.length > 0 ? totalEngagement / publishedItems.length : 0,
      bestPerformingTime: timePerformance.bestTime,
      bestPerformingPlatform: platformPerformance.bestPlatform,
      optimizationScore: this.calculateOptimizationScore(flow)
    };

    // تحديث المقاييس في التدفق
    flow.performanceMetrics = metrics;
    return metrics;
  }

  private analyzeTimePerformance(items: ContentItem[]): { bestTime: string } {
    const timeStats: { [hour: string]: { count: number, totalEngagement: number } } = {};
    
    items.forEach(item => {
      if (item.actualEngagement) {
        const hour = item.scheduledTime.getHours().toString();
        if (!timeStats[hour]) {
          timeStats[hour] = { count: 0, totalEngagement: 0 };
        }
        timeStats[hour].count++;
        timeStats[hour].totalEngagement += item.actualEngagement;
      }
    });

    let bestHour = '20'; // افتراضي
    let bestAverage = 0;

    Object.entries(timeStats).forEach(([hour, stats]) => {
      const average = stats.totalEngagement / stats.count;
      if (average > bestAverage) {
        bestAverage = average;
        bestHour = hour;
      }
    });

    return { bestTime: `${bestHour}:00` };
  }

  private analyzePlatformPerformance(items: ContentItem[]): { bestPlatform: string } {
    const platformStats: { [platform: string]: { count: number, totalEngagement: number } } = {};
    
    items.forEach(item => {
      if (item.actualEngagement) {
        if (!platformStats[item.platform]) {
          platformStats[item.platform] = { count: 0, totalEngagement: 0 };
        }
        platformStats[item.platform].count++;
        platformStats[item.platform].totalEngagement += item.actualEngagement;
      }
    });

    let bestPlatform = 'tiktok'; // افتراضي
    let bestAverage = 0;

    Object.entries(platformStats).forEach(([platform, stats]) => {
      const average = stats.totalEngagement / stats.count;
      if (average > bestAverage) {
        bestAverage = average;
        bestPlatform = platform;
      }
    });

    return { bestPlatform };
  }

  private calculateOptimizationScore(flow: ContentFlow): number {
    const { performanceMetrics } = flow;
    
    // حساب النقاط بناء على مختلف المعايير
    let score = 0;
    
    // نسبة النجاح في النشر (40%)
    const publishSuccessRate = performanceMetrics.publishedItems / performanceMetrics.totalItems;
    score += publishSuccessRate * 40;
    
    // متوسط التفاعل (30%)
    const engagementScore = Math.min(performanceMetrics.averageEngagement / 1000, 1); // تطبيع إلى 1
    score += engagementScore * 30;
    
    // كفاءة التوقيت (20%)
    const timingScore = this.calculateTimingEfficiency(flow);
    score += timingScore * 20;
    
    // توزيع المنصات (10%)
    const platformScore = this.calculatePlatformDistribution(flow);
    score += platformScore * 10;
    
    return Math.round(score);
  }

  private calculateTimingEfficiency(flow: ContentFlow): number {
    // حساب كفاءة توزيع الأوقات
    const timeDistribution = new Map<number, number>();
    
    flow.contentItems.forEach(item => {
      const hour = item.scheduledTime.getHours();
      timeDistribution.set(hour, (timeDistribution.get(hour) || 0) + 1);
    });
    
    // كلما كان التوزيع أكثر تنوعاً، كانت الكفاءة أعلى
    const uniqueHours = timeDistribution.size;
    const maxPossibleHours = 24;
    
    return uniqueHours / maxPossibleHours;
  }

  private calculatePlatformDistribution(flow: ContentFlow): number {
    // حساب تنوع المنصات
    const platformSet = new Set(flow.contentItems.map(item => item.platform));
    const uniquePlatforms = platformSet.size;
    const maxRecommendedPlatforms = 5; // عدد المنصات الموصى بها
    
    return Math.min(uniquePlatforms / maxRecommendedPlatforms, 1);
  }

  private initializeMetrics(items: ContentItem[]): FlowMetrics {
    return {
      totalItems: items.length,
      publishedItems: 0,
      pendingItems: items.length,
      failedItems: 0,
      averageEngagement: 0,
      bestPerformingTime: '20:00',
      bestPerformingPlatform: 'tiktok',
      optimizationScore: 0
    };
  }

  private generateFlowId(): string {
    return `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getActiveFlows(userId: string): Promise<ContentFlow[]> {
    return Array.from(this.activeFlows.values())
      .filter(flow => flow.userId === userId && flow.status === 'active');
  }

  async reoptimizeFlow(flowId: string): Promise<ContentFlow> {
    const flow = this.activeFlows.get(flowId);
    if (!flow) {
      throw new Error('تدفق المحتوى غير موجود');
    }

    // إعادة تحسين العناصر المعلقة
    const pendingItems = flow.contentItems.filter(item => item.publishStatus === 'pending');
    const optimizedItems = await this.optimizeContentScheduling(pendingItems, flow.optimizationSettings);
    
    // تحديث العناصر في التدفق
    flow.contentItems = [
      ...flow.contentItems.filter(item => item.publishStatus !== 'pending'),
      ...optimizedItems
    ];
    
    flow.lastOptimized = new Date();
    flow.status = 'optimizing';
    
    return flow;
  }
}

export const intelligentContentFlowOptimizer = new IntelligentContentFlowOptimizer();