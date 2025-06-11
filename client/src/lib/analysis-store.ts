// مخزن مشترك لبيانات تحليل الفيديو
interface VideoAnalysisData {
  title: string;
  description: string;
  hashtags: string[];
  category: string;
  rating: number;
  videoUrl: string;
  isAnalyzed: boolean;
  lastUpdated: Date;
}

class AnalysisStore {
  private data: VideoAnalysisData | null = null;
  private listeners: Set<() => void> = new Set();

  // حفظ بيانات التحليل
  setAnalysis(analysis: Omit<VideoAnalysisData, 'lastUpdated'>) {
    this.data = {
      ...analysis,
      lastUpdated: new Date()
    };
    this.notifyListeners();
  }

  // جلب بيانات التحليل
  getAnalysis(): VideoAnalysisData | null {
    return this.data;
  }

  // تحديث جزء من البيانات
  updateField(field: keyof VideoAnalysisData, value: any) {
    if (this.data) {
      this.data = {
        ...this.data,
        [field]: value,
        lastUpdated: new Date()
      };
      this.notifyListeners();
    }
  }

  // مسح البيانات
  clear() {
    this.data = null;
    this.notifyListeners();
  }

  // الاشتراك في التغييرات
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // إشعار المستمعين
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // جلب البيانات للنشر
  getPublishingData() {
    if (!this.data) {
      return null;
    }

    return {
      videoUrl: this.data.videoUrl,
      title: this.data.title,
      description: this.data.description,
      hashtags: this.data.hashtags,
      category: this.data.category
    };
  }

  // التحقق من وجود بيانات محللة
  hasAnalysisData(): boolean {
    return this.data?.isAnalyzed === true;
  }
}

export const analysisStore = new AnalysisStore();