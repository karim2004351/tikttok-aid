// موصي المحتوى الذكي حسب وقت اليوم
export interface TimeBasedRecommendation {
  id: string;
  title: string;
  description: string;
  contentType: 'video' | 'image' | 'text' | 'story' | 'live';
  platform: string;
  timeSlot: TimeSlot;
  targetAudience: string;
  expectedEngagement: number;
  contentThemes: string[];
  hashtagSuggestions: string[];
  colorPalette: string[];
  toneOfVoice: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  culturalConsiderations: string[];
}

export interface TimeSlot {
  start: string; // HH:MM format
  end: string;
  name: string;
  characteristics: string[];
  audienceBehavior: string;
  platformActivity: PlatformActivity[];
}

export interface PlatformActivity {
  platform: string;
  activityLevel: number; // 1-10
  demographics: string[];
  contentPreferences: string[];
}

export interface UserTimeProfile {
  timezone: string;
  workingHours: { start: string, end: string };
  preferredLanguage: string;
  culturalRegion: string;
  contentPreferences: string[];
  engagementHistory: EngagementData[];
}

export interface EngagementData {
  timeSlot: string;
  platform: string;
  engagementRate: number;
  contentType: string;
  timestamp: Date;
}

export class SmartTimeContentRecommender {
  private timeSlots: TimeSlot[] = [
    {
      start: '06:00',
      end: '09:00',
      name: 'الصباح الباكر',
      characteristics: ['نشاط', 'حيوية', 'بداية جديدة'],
      audienceBehavior: 'تصفح سريع، بحث عن الإلهام والأخبار',
      platformActivity: [
        {
          platform: 'twitter',
          activityLevel: 9,
          demographics: ['مهنيون', 'طلاب'],
          contentPreferences: ['أخبار', 'نصائح', 'اقتباسات ملهمة']
        },
        {
          platform: 'instagram',
          activityLevel: 7,
          demographics: ['شباب', 'مؤثرون'],
          contentPreferences: ['صور صباحية', 'قصص يومية', 'تمارين']
        }
      ]
    },
    {
      start: '09:00',
      end: '12:00',
      name: 'ساعات العمل الصباحية',
      characteristics: ['تركيز', 'إنتاجية', 'مهنية'],
      audienceBehavior: 'تصفح محدود، محتوى مهني وتعليمي',
      platformActivity: [
        {
          platform: 'linkedin',
          activityLevel: 10,
          demographics: ['مهنيون', 'أصحاب أعمال'],
          contentPreferences: ['محتوى مهني', 'نصائح عمل', 'أخبار صناعة']
        },
        {
          platform: 'youtube',
          activityLevel: 6,
          demographics: ['متعلمون', 'طلاب'],
          contentPreferences: ['دروس تعليمية', 'محاضرات', 'ورش عمل']
        }
      ]
    },
    {
      start: '12:00',
      end: '14:00',
      name: 'وقت الغداء',
      characteristics: ['استراحة', 'ترفيه خفيف', 'تواصل'],
      audienceBehavior: 'تصفح نشط، بحث عن الترفيه والأخبار',
      platformActivity: [
        {
          platform: 'facebook',
          activityLevel: 8,
          demographics: ['عائلات', 'أصدقاء'],
          contentPreferences: ['محتوى ترفيهي', 'وصفات', 'نكت خفيفة']
        },
        {
          platform: 'tiktok',
          activityLevel: 9,
          demographics: ['شباب', 'مراهقون'],
          contentPreferences: ['فيديوهات قصيرة', 'ترفيه', 'تحديات']
        }
      ]
    },
    {
      start: '14:00',
      end: '17:00',
      name: 'بعد الظهر',
      characteristics: ['هدوء نسبي', 'تأمل', 'تخطيط'],
      audienceBehavior: 'تصفح متوسط، محتوى معلوماتي',
      platformActivity: [
        {
          platform: 'youtube',
          activityLevel: 8,
          demographics: ['كل الأعمار'],
          contentPreferences: ['محتوى تعليمي', 'وثائقيات', 'مراجعات']
        },
        {
          platform: 'instagram',
          activityLevel: 7,
          demographics: ['مبدعون', 'مصورون'],
          contentPreferences: ['محتوى بصري', 'فن', 'تصميم']
        }
      ]
    },
    {
      start: '17:00',
      end: '20:00',
      name: 'المساء المبكر',
      characteristics: ['نشاط عائلي', 'تواصل', 'ترفيه'],
      audienceBehavior: 'ذروة النشاط، تفاعل عالي',
      platformActivity: [
        {
          platform: 'facebook',
          activityLevel: 10,
          demographics: ['عائلات', 'أصدقاء'],
          contentPreferences: ['قصص شخصية', 'أحداث', 'صور عائلية']
        },
        {
          platform: 'instagram',
          activityLevel: 10,
          demographics: ['كل الأعمار'],
          contentPreferences: ['قصص', 'بث مباشر', 'محتوى تفاعلي']
        }
      ]
    },
    {
      start: '20:00',
      end: '23:00',
      name: 'المساء المتأخر',
      characteristics: ['استرخاء', 'ترفيه', 'تسلية'],
      audienceBehavior: 'وقت الترفيه الرئيسي، مشاهدة مطولة',
      platformActivity: [
        {
          platform: 'youtube',
          activityLevel: 10,
          demographics: ['كل الأعمار'],
          contentPreferences: ['فيديوهات طويلة', 'ترفيه', 'مراجعات']
        },
        {
          platform: 'netflix',
          activityLevel: 9,
          demographics: ['بالغون'],
          contentPreferences: ['أفلام', 'مسلسلات', 'وثائقيات']
        }
      ]
    },
    {
      start: '23:00',
      end: '06:00',
      name: 'الليل المتأخر',
      characteristics: ['هدوء', 'تأمل', 'محتوى خفيف'],
      audienceBehavior: 'تصفح خفيف قبل النوم',
      platformActivity: [
        {
          platform: 'twitter',
          activityLevel: 5,
          demographics: ['سهارى', 'مبدعون'],
          contentPreferences: ['أفكار عميقة', 'شعر', 'تأملات']
        },
        {
          platform: 'spotify',
          activityLevel: 8,
          demographics: ['محبو الموسيقى'],
          contentPreferences: ['موسيقى هادئة', 'بودكاست', 'تأمل']
        }
      ]
    }
  ];

  async generateTimeBasedRecommendations(
    userProfile: UserTimeProfile,
    currentTime?: Date
  ): Promise<TimeBasedRecommendation[]> {
    const now = currentTime || new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    // تحديد الفترة الزمنية الحالية
    const currentTimeSlot = this.getCurrentTimeSlot(currentTimeString);
    
    // إنشاء توصيات للفترة الحالية
    const currentRecommendations = await this.generateRecommendationsForTimeSlot(
      currentTimeSlot,
      userProfile,
      'current'
    );

    // إنشاء توصيات للفترات القادمة
    const upcomingTimeSlots = this.getUpcomingTimeSlots(currentTimeString, 3);
    const upcomingRecommendations = await Promise.all(
      upcomingTimeSlots.map(slot => 
        this.generateRecommendationsForTimeSlot(slot, userProfile, 'upcoming')
      )
    );

    return [
      ...currentRecommendations,
      ...upcomingRecommendations.flat()
    ];
  }

  private getCurrentTimeSlot(timeString: string): TimeSlot {
    return this.timeSlots.find(slot => {
      const [startHour, startMin] = slot.start.split(':').map(Number);
      const [endHour, endMin] = slot.end.split(':').map(Number);
      const [currentHour, currentMin] = timeString.split(':').map(Number);

      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;
      const currentTime = currentHour * 60 + currentMin;

      // التعامل مع الأوقات التي تمتد لليوم التالي
      if (startTime > endTime) {
        return currentTime >= startTime || currentTime <= endTime;
      }
      return currentTime >= startTime && currentTime <= endTime;
    }) || this.timeSlots[0];
  }

  private getUpcomingTimeSlots(currentTime: string, count: number): TimeSlot[] {
    const currentIndex = this.timeSlots.findIndex(slot => 
      this.getCurrentTimeSlot(currentTime) === slot
    );
    
    const upcoming: TimeSlot[] = [];
    for (let i = 1; i <= count; i++) {
      const nextIndex = (currentIndex + i) % this.timeSlots.length;
      upcoming.push(this.timeSlots[nextIndex]);
    }
    
    return upcoming;
  }

  private async generateRecommendationsForTimeSlot(
    timeSlot: TimeSlot,
    userProfile: UserTimeProfile,
    timing: 'current' | 'upcoming'
  ): Promise<TimeBasedRecommendation[]> {
    const recommendations: TimeBasedRecommendation[] = [];

    for (const platformActivity of timeSlot.platformActivity) {
      // تخصيص التوصية حسب المنصة والوقت
      const recommendation = await this.createRecommendationForPlatform(
        platformActivity,
        timeSlot,
        userProfile,
        timing
      );
      
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    return recommendations.sort((a, b) => b.expectedEngagement - a.expectedEngagement);
  }

  private async createRecommendationForPlatform(
    platformActivity: PlatformActivity,
    timeSlot: TimeSlot,
    userProfile: UserTimeProfile,
    timing: 'current' | 'upcoming'
  ): Promise<TimeBasedRecommendation | null> {
    // تحليل الأداء التاريخي للمستخدم في هذا الوقت
    const historicalPerformance = this.analyzeHistoricalPerformance(
      userProfile.engagementHistory,
      timeSlot.name,
      platformActivity.platform
    );

    // إذا كان الأداء التاريخي ضعيف، قلل من الأولوية
    if (historicalPerformance < 3) {
      return null;
    }

    const contentThemes = this.generateContentThemes(timeSlot, platformActivity, userProfile);
    const hashtagSuggestions = this.generateHashtagSuggestions(timeSlot, platformActivity);
    const colorPalette = this.generateColorPalette(timeSlot);
    const toneOfVoice = this.determineToneOfVoice(timeSlot, platformActivity);

    return {
      id: `${platformActivity.platform}_${timeSlot.name}_${Date.now()}`,
      title: this.generateRecommendationTitle(timeSlot, platformActivity),
      description: this.generateRecommendationDescription(timeSlot, platformActivity),
      contentType: this.selectOptimalContentType(platformActivity, timeSlot),
      platform: platformActivity.platform,
      timeSlot,
      targetAudience: platformActivity.demographics.join(', '),
      expectedEngagement: this.calculateExpectedEngagement(
        platformActivity.activityLevel,
        historicalPerformance,
        timing
      ),
      contentThemes,
      hashtagSuggestions,
      colorPalette,
      toneOfVoice,
      urgencyLevel: timing === 'current' ? 'high' : 'medium',
      culturalConsiderations: this.getCulturalConsiderations(userProfile.culturalRegion, timeSlot)
    };
  }

  private analyzeHistoricalPerformance(
    history: EngagementData[],
    timeSlotName: string,
    platform: string
  ): number {
    const relevantData = history.filter(
      data => data.platform === platform && data.timeSlot === timeSlotName
    );

    if (relevantData.length === 0) return 5; // افتراضي متوسط

    const averageEngagement = relevantData.reduce(
      (sum, data) => sum + data.engagementRate, 0
    ) / relevantData.length;

    return Math.min(Math.max(averageEngagement * 10, 1), 10);
  }

  private generateContentThemes(
    timeSlot: TimeSlot,
    platformActivity: PlatformActivity,
    userProfile: UserTimeProfile
  ): string[] {
    const baseThemes = [...platformActivity.contentPreferences];
    const timeBasedThemes = this.getTimeBasedThemes(timeSlot.name);
    const culturalThemes = this.getCulturalThemes(userProfile.culturalRegion);

    return [...new Set([...baseThemes, ...timeBasedThemes, ...culturalThemes])];
  }

  private getTimeBasedThemes(timeSlotName: string): string[] {
    const themeMap: { [key: string]: string[] } = {
      'الصباح الباكر': ['إلهام', 'طاقة إيجابية', 'بداية جديدة', 'صحة'],
      'ساعات العمل الصباحية': ['إنتاجية', 'تطوير مهني', 'تعلم', 'تحفيز'],
      'وقت الغداء': ['طعام', 'استراحة', 'تسلية خفيفة', 'نصائح سريعة'],
      'بعد الظهر': ['معلومات', 'تحليل', 'ثقافة', 'فن'],
      'المساء المبكر': ['عائلة', 'أصدقاء', 'مشاركة', 'أحداث'],
      'المساء المتأخر': ['ترفيه', 'استرخاء', 'مراجعات', 'قصص'],
      'الليل المتأخر': ['تأمل', 'هدوء', 'موسيقى', 'أدب']
    };

    return themeMap[timeSlotName] || [];
  }

  private getCulturalThemes(culturalRegion: string): string[] {
    const culturalMap: { [key: string]: string[] } = {
      'arabic': ['تراث', 'قيم', 'عائلة', 'ضيافة', 'روحانية'],
      'western': ['فردانية', 'ابتكار', 'كفاءة', 'تنوع'],
      'asian': ['احترام', 'تقاليد', 'انسجام', 'صبر']
    };

    return culturalMap[culturalRegion] || [];
  }

  private generateHashtagSuggestions(
    timeSlot: TimeSlot,
    platformActivity: PlatformActivity
  ): string[] {
    const timeBasedTags = this.getTimeBasedHashtags(timeSlot.name);
    const platformTags = this.getPlatformSpecificHashtags(platformActivity.platform);
    
    return [...timeBasedTags, ...platformTags];
  }

  private getTimeBasedHashtags(timeSlotName: string): string[] {
    const hashtagMap: { [key: string]: string[] } = {
      'الصباح الباكر': ['#صباح_الخير', '#طاقة_إيجابية', '#بداية_جديدة'],
      'ساعات العمل الصباحية': ['#عمل', '#إنتاجية', '#تطوير_مهني'],
      'وقت الغداء': ['#غداء', '#استراحة', '#طعام'],
      'بعد الظهر': ['#بعد_الظهر', '#معلومات', '#ثقافة'],
      'المساء المبكر': ['#مساء_الخير', '#عائلة', '#أصدقاء'],
      'المساء المتأخر': ['#ترفيه', '#استرخاء', '#وقت_ممتع'],
      'الليل المتأخر': ['#ليلة_هادئة', '#تأمل', '#سكون']
    };

    return hashtagMap[timeSlotName] || [];
  }

  private getPlatformSpecificHashtags(platform: string): string[] {
    const platformMap: { [key: string]: string[] } = {
      'tiktok': ['#fyp', '#viral', '#trending'],
      'instagram': ['#instagood', '#photooftheday', '#instadaily'],
      'twitter': ['#تويتر', '#حديث_الساعة', '#رأي'],
      'youtube': ['#يوتيوب', '#فيديو', '#محتوى'],
      'facebook': ['#فيسبوك', '#مشاركة', '#أصدقاء']
    };

    return platformMap[platform] || [];
  }

  private generateColorPalette(timeSlot: TimeSlot): string[] {
    const colorMap: { [key: string]: string[] } = {
      'الصباح الباكر': ['#FFE135', '#87CEEB', '#FFA500', '#98FB98'],
      'ساعات العمل الصباحية': ['#4169E1', '#2F4F4F', '#708090', '#FFFFFF'],
      'وقت الغداء': ['#FF6347', '#32CD32', '#FFD700', '#F0E68C'],
      'بعد الظهر': ['#CD853F', '#DEB887', '#F5DEB3', '#D2691E'],
      'المساء المبكر': ['#FF4500', '#FF69B4', '#FFB6C1', '#FFA07A'],
      'المساء المتأخر': ['#4B0082', '#8A2BE2', '#9932CC', '#BA55D3'],
      'الليل المتأخر': ['#191970', '#000080', '#483D8B', '#2F2F2F']
    };

    return colorMap[timeSlot.name] || ['#FFFFFF', '#000000'];
  }

  private determineToneOfVoice(timeSlot: TimeSlot, platformActivity: PlatformActivity): string {
    const characteristics = timeSlot.characteristics;
    
    if (characteristics.includes('نشاط') || characteristics.includes('حيوية')) {
      return 'حماسي ومحفز';
    } else if (characteristics.includes('مهنية') || characteristics.includes('تركيز')) {
      return 'مهني ومعلوماتي';
    } else if (characteristics.includes('استرخاء') || characteristics.includes('هدوء')) {
      return 'هادئ ومريح';
    } else if (characteristics.includes('ترفيه')) {
      return 'مرح وودود';
    }

    return 'متوازن وطبيعي';
  }

  private selectOptimalContentType(
    platformActivity: PlatformActivity,
    timeSlot: TimeSlot
  ): 'video' | 'image' | 'text' | 'story' | 'live' {
    const platform = platformActivity.platform;
    const timeCharacteristics = timeSlot.characteristics;

    if (platform === 'tiktok') return 'video';
    if (platform === 'instagram' && timeCharacteristics.includes('تواصل')) return 'story';
    if (platform === 'twitter') return 'text';
    if (platform === 'youtube') return 'video';
    if (timeCharacteristics.includes('ترفيه')) return 'video';
    if (timeCharacteristics.includes('مهنية')) return 'text';

    return 'image';
  }

  private calculateExpectedEngagement(
    activityLevel: number,
    historicalPerformance: number,
    timing: 'current' | 'upcoming'
  ): number {
    const baseEngagement = (activityLevel * historicalPerformance) / 10;
    const timingMultiplier = timing === 'current' ? 1.2 : 0.8;
    
    return Math.round(baseEngagement * timingMultiplier * 100);
  }

  private getCulturalConsiderations(culturalRegion: string, timeSlot: TimeSlot): string[] {
    const considerations: string[] = [];

    if (culturalRegion === 'arabic') {
      if (timeSlot.name.includes('صباح')) {
        considerations.push('تجنب المحتوى المثير للجدل في الصباح');
        considerations.push('ركز على الإيجابية والأمل');
      }
      if (timeSlot.name.includes('مساء')) {
        considerations.push('وقت مناسب للمحتوى العائلي');
        considerations.push('احترم أوقات الصلاة');
      }
    }

    return considerations;
  }

  private generateRecommendationTitle(timeSlot: TimeSlot, platformActivity: PlatformActivity): string {
    return `محتوى محسن لـ ${timeSlot.name} على ${platformActivity.platform}`;
  }

  private generateRecommendationDescription(timeSlot: TimeSlot, platformActivity: PlatformActivity): string {
    return `توصية مخصصة للنشر في ${timeSlot.name} لاستهداف ${platformActivity.demographics.join(' و ')} على منصة ${platformActivity.platform}`;
  }

  async getOptimalPostingSchedule(userProfile: UserTimeProfile): Promise<{
    platform: string,
    timeSlot: string,
    expectedEngagement: number,
    confidence: number
  }[]> {
    const schedule = [];
    
    for (const timeSlot of this.timeSlots) {
      for (const platformActivity of timeSlot.platformActivity) {
        const historicalPerformance = this.analyzeHistoricalPerformance(
          userProfile.engagementHistory,
          timeSlot.name,
          platformActivity.platform
        );

        const expectedEngagement = this.calculateExpectedEngagement(
          platformActivity.activityLevel,
          historicalPerformance,
          'upcoming'
        );

        schedule.push({
          platform: platformActivity.platform,
          timeSlot: timeSlot.name,
          expectedEngagement,
          confidence: Math.round((platformActivity.activityLevel + historicalPerformance) / 2 * 10)
        });
      }
    }

    return schedule.sort((a, b) => b.expectedEngagement - a.expectedEngagement);
  }
}

export const smartTimeContentRecommender = new SmartTimeContentRecommender();