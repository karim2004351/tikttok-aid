// نظام التحقق الذكي البديل للتفاعل مع الفيديو المستهدف
export class SmartVerificationSystem {
  private userSessions: Map<string, {
    targetVideoId: string;
    visitedTargetVideo: boolean;
    timeSpentOnVideo: number;
    interactionTimestamps: {
      videoOpened?: Date;
      followAction?: Date;
      likeAction?: Date;
      watchComplete?: Date;
    };
    browserFingerprint: string;
    verified: boolean;
  }> = new Map();

  constructor() {
    // تنظيف الجلسات القديمة كل ساعة
    setInterval(() => this.cleanupOldSessions(), 3600000);
  }

  // تسجيل زيارة المستخدم للفيديو المستهدف
  async recordVideoVisit(userIdentifier: string, videoUrl: string, browserFingerprint: string): Promise<{
    success: boolean;
    sessionId: string;
    message: string;
  }> {
    console.log(`📱 تسجيل زيارة المستخدم ${userIdentifier} للفيديو المستهدف`);
    
    const videoId = this.extractVideoId(videoUrl);
    const sessionId = `${userIdentifier}_${Date.now()}`;
    
    const session = {
      targetVideoId: videoId,
      visitedTargetVideo: true,
      timeSpentOnVideo: 0,
      interactionTimestamps: {
        videoOpened: new Date()
      },
      browserFingerprint,
      verified: false
    };
    
    this.userSessions.set(sessionId, session);
    
    return {
      success: true,
      sessionId,
      message: "تم تسجيل زيارة الفيديو المستهدف"
    };
  }

  // تسجيل وقت المشاهدة
  async recordWatchTime(sessionId: string, timeSpent: number): Promise<{
    success: boolean;
    isValidWatch: boolean;
    message: string;
  }> {
    const session = this.userSessions.get(sessionId);
    if (!session) {
      return {
        success: false,
        isValidWatch: false,
        message: "جلسة غير صالحة"
      };
    }

    session.timeSpentOnVideo = timeSpent;
    
    // اعتبار المشاهدة صالحة إذا تجاوزت 10 ثواني
    const isValidWatch = timeSpent >= 10;
    
    if (isValidWatch) {
      session.interactionTimestamps.watchComplete = new Date();
      console.log(`✅ مشاهدة صالحة: ${timeSpent} ثانية`);
    }
    
    return {
      success: true,
      isValidWatch,
      message: isValidWatch ? "مشاهدة صالحة" : "يحتاج مشاهدة أطول"
    };
  }

  // تأكيد المتابعة
  async confirmFollow(sessionId: string, followConfirmation: {
    userClaimsFollow: boolean;
    screenshotProvided?: boolean;
    followTimestamp: Date;
  }): Promise<{
    success: boolean;
    isValidFollow: boolean;
    message: string;
  }> {
    const session = this.userSessions.get(sessionId);
    if (!session) {
      return {
        success: false,
        isValidFollow: false,
        message: "جلسة غير صالحة"
      };
    }

    session.interactionTimestamps.followAction = followConfirmation.followTimestamp;
    
    // تحليل صحة المتابعة بناءً على النمط الزمني
    const isValidFollow = this.validateFollowAction(session, followConfirmation);
    
    if (isValidFollow) {
      console.log(`✅ تم تأكيد المتابعة للجلسة ${sessionId}`);
    }
    
    return {
      success: true,
      isValidFollow,
      message: isValidFollow ? "تم تأكيد المتابعة" : "المتابعة غير مؤكدة"
    };
  }

  // تأكيد الإعجاب
  async confirmLike(sessionId: string, likeConfirmation: {
    userClaimsLike: boolean;
    screenshotProvided?: boolean;
    likeTimestamp: Date;
  }): Promise<{
    success: boolean;
    isValidLike: boolean;
    message: string;
  }> {
    const session = this.userSessions.get(sessionId);
    if (!session) {
      return {
        success: false,
        isValidLike: false,
        message: "جلسة غير صالحة"
      };
    }

    session.interactionTimestamps.likeAction = likeConfirmation.likeTimestamp;
    
    // تحليل صحة الإعجاب بناءً على النمط الزمني
    const isValidLike = this.validateLikeAction(session, likeConfirmation);
    
    if (isValidLike) {
      console.log(`✅ تم تأكيد الإعجاب للجلسة ${sessionId}`);
    }
    
    return {
      success: true,
      isValidLike,
      message: isValidLike ? "تم تأكيد الإعجاب" : "الإعجاب غير مؤكد"
    };
  }

  // التحقق الشامل من جميع المتطلبات
  async verifyAllRequirements(sessionId: string): Promise<{
    success: boolean;
    verification: {
      hasWatched: boolean;
      hasFollowed: boolean;
      hasLiked: boolean;
      allRequirementsMet: boolean;
      verificationScore: number;
    };
    message: string;
  }> {
    const session = this.userSessions.get(sessionId);
    if (!session) {
      return {
        success: false,
        verification: {
          hasWatched: false,
          hasFollowed: false,
          hasLiked: false,
          allRequirementsMet: false,
          verificationScore: 0
        },
        message: "جلسة غير صالحة"
      };
    }

    const hasWatched = session.timeSpentOnVideo >= 10;
    const hasFollowed = !!session.interactionTimestamps.followAction;
    const hasLiked = !!session.interactionTimestamps.likeAction;
    const allRequirementsMet = hasWatched && hasFollowed && hasLiked;
    
    // حساب نقاط التحقق بناءً على جودة التفاعل
    let verificationScore = 0;
    if (hasWatched) verificationScore += 30;
    if (hasFollowed) verificationScore += 35;
    if (hasLiked) verificationScore += 35;
    
    // نقاط إضافية للنمط الطبيعي للتفاعل
    if (this.hasNaturalInteractionPattern(session)) {
      verificationScore += 20;
    }
    
    session.verified = allRequirementsMet;
    
    return {
      success: true,
      verification: {
        hasWatched,
        hasFollowed,
        hasLiked,
        allRequirementsMet,
        verificationScore
      },
      message: allRequirementsMet ? 
        "تم التحقق من جميع المتطلبات بنجاح" : 
        "بعض المتطلبات غير مكتملة"
    };
  }

  // التحقق من النمط الطبيعي للتفاعل
  private hasNaturalInteractionPattern(session: any): boolean {
    const timestamps = session.interactionTimestamps;
    
    // التحقق من التسلسل الزمني المنطقي
    if (!timestamps.videoOpened) return false;
    
    const videoOpenTime = timestamps.videoOpened.getTime();
    
    // يجب أن تحدث الإجراءات بعد فتح الفيديو
    if (timestamps.followAction && timestamps.followAction.getTime() < videoOpenTime) {
      return false;
    }
    
    if (timestamps.likeAction && timestamps.likeAction.getTime() < videoOpenTime) {
      return false;
    }
    
    // فترة زمنية منطقية بين الإجراءات (لا تقل عن 5 ثواني)
    if (timestamps.followAction && timestamps.likeAction) {
      const timeDiff = Math.abs(timestamps.followAction.getTime() - timestamps.likeAction.getTime());
      if (timeDiff < 5000) { // أقل من 5 ثواني قد يكون غير طبيعي
        return false;
      }
    }
    
    return true;
  }

  // التحقق من صحة المتابعة
  private validateFollowAction(session: any, followConfirmation: any): boolean {
    // تحليل الوقت المستغرق منذ فتح الفيديو
    const videoOpenTime = session.interactionTimestamps.videoOpened?.getTime() || 0;
    const followTime = followConfirmation.followTimestamp.getTime();
    const timeDiff = followTime - videoOpenTime;
    
    // يجب أن تتم المتابعة خلال فترة معقولة (5 ثواني إلى 5 دقائق)
    if (timeDiff < 5000 || timeDiff > 300000) {
      return false;
    }
    
    return followConfirmation.userClaimsFollow;
  }

  // التحقق من صحة الإعجاب
  private validateLikeAction(session: any, likeConfirmation: any): boolean {
    // تحليل الوقت المستغرق منذ فتح الفيديو
    const videoOpenTime = session.interactionTimestamps.videoOpened?.getTime() || 0;
    const likeTime = likeConfirmation.likeTimestamp.getTime();
    const timeDiff = likeTime - videoOpenTime;
    
    // يجب أن يتم الإعجاب خلال فترة معقولة (3 ثواني إلى 5 دقائق)
    if (timeDiff < 3000 || timeDiff > 300000) {
      return false;
    }
    
    return likeConfirmation.userClaimsLike;
  }

  // استخراج معرف الفيديو من الرابط
  private extractVideoId(videoUrl: string): string {
    // محاولة استخراج ID من URL
    const patterns = [
      /tiktok\.com\/.*\/video\/(\d+)/,
      /vm\.tiktok\.com\/([A-Za-z0-9]+)/,
      /youtube\.com\/watch\?v=([A-Za-z0-9_-]+)/,
      /youtu\.be\/([A-Za-z0-9_-]+)/
    ];
    
    for (const pattern of patterns) {
      const match = videoUrl.match(pattern);
      if (match) return match[1];
    }
    
    // استخدام hash للعناوين غير المعروفة
    return videoUrl.substring(videoUrl.length - 10);
  }

  // تنظيف الجلسات القديمة (أكثر من 24 ساعة)
  private cleanupOldSessions(): void {
    const oneDayAgo = Date.now() - 86400000;
    
    const sessionsToDelete: string[] = [];
    this.userSessions.forEach((session, sessionId) => {
      const sessionTime = session.interactionTimestamps.videoOpened?.getTime() || 0;
      if (sessionTime < oneDayAgo) {
        sessionsToDelete.push(sessionId);
      }
    });
    
    sessionsToDelete.forEach(sessionId => this.userSessions.delete(sessionId));
    
    console.log(`🧹 تم تنظيف الجلسات القديمة، الجلسات الحالية: ${this.userSessions.size}`);
  }

  // الحصول على إحصائيات النظام
  getSystemStats(): {
    activeSessions: number;
    verifiedSessions: number;
    totalInteractions: number;
  } {
    let verifiedCount = 0;
    let totalInteractions = 0;
    
    this.userSessions.forEach((session) => {
      if (session.verified) verifiedCount++;
      
      // حساب التفاعلات
      if (session.interactionTimestamps.followAction) totalInteractions++;
      if (session.interactionTimestamps.likeAction) totalInteractions++;
      if (session.timeSpentOnVideo >= 10) totalInteractions++;
    });
    
    return {
      activeSessions: this.userSessions.size,
      verifiedSessions: verifiedCount,
      totalInteractions
    };
  }
}

export const smartVerificationSystem = new SmartVerificationSystem();