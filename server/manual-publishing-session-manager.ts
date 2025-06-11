interface ManualPublishingConfig {
  videoUrl: string;
  title: string;
  description: string;
  selectedPlatforms: string[];
  targetSites: string[];
  postsPerSite: number;
  userEmail: string;
  userPassword: string;
  publishingMode: 'immediate' | 'scheduled' | 'batch';
  scheduledTime?: string;
  batchSize?: number;
}

interface ManualPublishingSession {
  id: string;
  startTime: Date;
  config: ManualPublishingConfig;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'stopped';
  currentSite: string;
  sitesCompleted: number;
  totalSites: number;
  postsPublished: number;
  postsTarget: number;
  progress: number;
  errors: string[];
  successfulSites: string[];
}

export class ManualPublishingSessionManager {
  private static instance: ManualPublishingSessionManager;
  private activeSessions: Map<string, ManualPublishingSession> = new Map();

  static getInstance(): ManualPublishingSessionManager {
    if (!ManualPublishingSessionManager.instance) {
      ManualPublishingSessionManager.instance = new ManualPublishingSessionManager();
    }
    return ManualPublishingSessionManager.instance;
  }

  createSession(config: ManualPublishingConfig): string {
    const sessionId = `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const totalSites = this.calculateTotalSites(config);
    
    const session: ManualPublishingSession = {
      id: sessionId,
      startTime: new Date(),
      config,
      status: 'running',
      currentSite: '',
      sitesCompleted: 0,
      totalSites,
      postsPublished: 0,
      postsTarget: totalSites * config.postsPerSite,
      progress: 0,
      errors: [],
      successfulSites: []
    };

    this.activeSessions.set(sessionId, session);
    this.startPublishingProcess(sessionId);
    return sessionId;
  }

  private calculateTotalSites(config: ManualPublishingConfig): number {
    let total = 0;
    config.targetSites.forEach(category => {
      switch (category) {
        case 'forums': total += 450; break;
        case 'blogs': total += 320; break;
        case 'news': total += 280; break;
        case 'social': total += 135; break;
      }
    });
    return total;
  }

  private async startPublishingProcess(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    try {
      // محاكاة عملية النشر
      for (let i = 0; i < session.totalSites && session.status === 'running'; i++) {
        while (session.status === 'paused') {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (session.status === 'stopped') break;

        const siteName = this.generateSiteName(i);
        session.currentSite = siteName;
        
        // محاكاة النشر على الموقع
        await this.simulatePublishingToSite(session, siteName);
        
        session.sitesCompleted = i + 1;
        session.progress = Math.round((session.sitesCompleted / session.totalSites) * 100);
        
        // تأخير بين المواقع
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (session.status === 'running') {
        session.status = 'completed';
      }
    } catch (error: any) {
      session.status = 'failed';
      session.errors.push(`خطأ في عملية النشر: ${error.message}`);
    }
  }

  private async simulatePublishingToSite(session: ManualPublishingSession, siteName: string): Promise<void> {
    const successRate = Math.random();
    
    if (successRate > 0.15) { // 85% نسبة نجاح
      const postsPublished = Math.floor(Math.random() * session.config.postsPerSite) + 1;
      session.postsPublished += postsPublished;
      session.successfulSites.push(siteName);
    } else {
      session.errors.push(`فشل النشر على موقع ${siteName}`);
    }
  }

  private generateSiteName(index: number): string {
    const siteNames = [
      'منتدى التقنية العربي',
      'مدونة الابتكار',
      'موقع الأخبار الرقمية',
      'شبكة المحتوى العربي',
      'منصة المعرفة',
      'مجتمع التطوير',
      'مركز الإعلام الرقمي',
      'منتدى الإبداع',
      'شبكة التواصل المحترف',
      'موقع الثقافة الرقمية'
    ];
    
    return siteNames[index % siteNames.length] + ` #${Math.floor(index / siteNames.length) + 1}`;
  }

  updateSession(sessionId: string, updates: Partial<ManualPublishingSession>): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      Object.assign(session, updates);
    }
  }

  stopSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (session && (session.status === 'running' || session.status === 'paused')) {
      session.status = 'stopped' as any;
      return true;
    }
    return false;
  }

  pauseSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (session && session.status === 'running') {
      session.status = 'paused';
      return true;
    }
    return false;
  }

  resumeSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (session && session.status === 'paused') {
      session.status = 'running';
      return true;
    }
    return false;
  }

  getSession(sessionId: string): ManualPublishingSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  getAllActiveSessions(): ManualPublishingSession[] {
    return Array.from(this.activeSessions.values()).filter(s => s.status !== 'stopped');
  }

  cleanupOldSessions(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const sessionsToDelete: string[] = [];
    this.activeSessions.forEach((session, sessionId) => {
      if (session.startTime < oneDayAgo) {
        sessionsToDelete.push(sessionId);
      }
    });
    
    sessionsToDelete.forEach(sessionId => {
      this.activeSessions.delete(sessionId);
    });
  }

  stopAllSessions(): void {
    this.activeSessions.forEach(session => {
      session.status = 'stopped' as any;
    });
  }
}

export const manualPublishingSessionManager = ManualPublishingSessionManager.getInstance();