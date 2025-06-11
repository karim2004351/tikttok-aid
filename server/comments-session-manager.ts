interface ActiveSession {
  id: string;
  startTime: Date;
  platforms: string[];
  status: 'running' | 'paused' | 'stopped';
  currentPlatform: string;
  currentVideo: number;
  totalVideos: number;
  commentsPosted: number;
  commentsTarget: number;
  progress: number;
}

export class CommentsSessionManager {
  private static instance: CommentsSessionManager;
  private activeSessions: Map<string, ActiveSession> = new Map();

  static getInstance(): CommentsSessionManager {
    if (!CommentsSessionManager.instance) {
      CommentsSessionManager.instance = new CommentsSessionManager();
    }
    return CommentsSessionManager.instance;
  }

  createSession(platforms: string[], totalVideos: number, commentsPerVideo: number): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: ActiveSession = {
      id: sessionId,
      startTime: new Date(),
      platforms,
      status: 'running',
      currentPlatform: platforms[0] || '',
      currentVideo: 0,
      totalVideos,
      commentsPosted: 0,
      commentsTarget: platforms.length * totalVideos * commentsPerVideo,
      progress: 0
    };

    this.activeSessions.set(sessionId, session);
    return sessionId;
  }

  updateSession(sessionId: string, updates: Partial<ActiveSession>): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      Object.assign(session, updates);
      
      // Calculate progress
      if (session.commentsTarget > 0) {
        session.progress = Math.round((session.commentsPosted / session.commentsTarget) * 100);
        
        // Auto-stop when completed
        if (session.progress >= 100) {
          session.status = 'stopped';
        }
      }
      
      // Auto-stop sessions running for more than 5 minutes
      const runTime = Date.now() - session.startTime.getTime();
      if (runTime > 5 * 60 * 1000) { // 5 minutes
        session.status = 'stopped';
      }
    }
  }

  stopSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'stopped';
      return true;
    }
    return false;
  }

  pauseSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'paused';
      return true;
    }
    return false;
  }

  resumeSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'running';
      return true;
    }
    return false;
  }

  getSession(sessionId: string): ActiveSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  getAllActiveSessions(): ActiveSession[] {
    // تنظيف الجلسات المنتهية قبل الإرجاع
    this.cleanupCompletedSessions();
    return Array.from(this.activeSessions.values()).filter(s => s.status !== 'stopped');
  }

  cleanupCompletedSessions(): void {
    const sessionsToDelete: string[] = [];
    this.activeSessions.forEach((session, sessionId) => {
      // حذف الجلسات المكتملة أو المتوقفة لأكثر من دقيقة
      if (session.status === 'stopped' || session.progress >= 100) {
        const timeSinceUpdate = Date.now() - session.startTime.getTime();
        if (timeSinceUpdate > 60 * 1000) { // دقيقة واحدة
          sessionsToDelete.push(sessionId);
        }
      }
    });
    
    sessionsToDelete.forEach(sessionId => {
      this.activeSessions.delete(sessionId);
    });
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
      session.status = 'stopped';
    });
  }
}

export const commentsSessionManager = CommentsSessionManager.getInstance();