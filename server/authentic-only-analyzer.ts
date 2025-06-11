// نظام التحليل الحقيقي فقط - بدون بيانات محاكاة
import { intelligentTargetInspector } from "./intelligent-target-inspector";

export interface AuthenticVideoData {
  title: string;
  description: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  author: {
    username: string;
    displayName: string;
    followers: number;
    verified: boolean;
    profilePicture: string;
    bio: string;
  };
  hashtags: string[];
  platform: string;
  rating: number;
  publishedAt: string;
  duration: number;
  videoUrl: string;
  thumbnailUrl: string;
  isAuthentic: boolean;
  dataSource: string;
  extractionMethod: string;
}

export class AuthenticOnlyAnalyzer {
  
  async analyzeVideoFromUrl(videoUrl: string): Promise<AuthenticVideoData> {
    console.log(`🔍 بدء التحليل الحقيقي للفيديو: ${videoUrl}`);
    
    const platform = this.detectPlatform(videoUrl);
    
    try {
      // استخدام النظام الذكي للفحص الحقيقي
      const result = await intelligentTargetInspector.inspectTargetVideo(videoUrl);
      
      if (result.success && result.videoData) {
        console.log(`✓ تم الحصول على بيانات حقيقية من ${platform}`);
        
        return {
          title: result.videoData.title,
          description: result.videoData.description,
          views: result.interactionStats.views,
          likes: result.interactionStats.likes,
          comments: result.interactionStats.comments,
          shares: result.interactionStats.shares || 0,
          author: {
            username: result.authorData.username,
            displayName: result.authorData.displayName,
            followers: result.authorData.followers,
            verified: result.authorData.verified,
            profilePicture: result.authorData.profilePicture,
            bio: result.authorData.bio
          },
          hashtags: result.videoData.hashtags,
          platform: result.platformAnalysis.platform,
          rating: result.videoData.rating,
          publishedAt: result.videoData.publishedAt,
          duration: result.videoData.duration,
          videoUrl: result.videoData.videoUrl,
          thumbnailUrl: result.videoData.thumbnailUrl,
          isAuthentic: result.isAuthentic,
          dataSource: 'intelligent_inspector',
          extractionMethod: result.extractionMethod
        };
      } else {
        throw new Error(result.error || 'فشل في استخراج البيانات الحقيقية');
      }
      
    } catch (error: any) {
      console.error(`❌ فشل في الحصول على بيانات حقيقية من ${platform}:`, error.message);
      throw new Error(`غير قادر على استخراج بيانات حقيقية من ${platform}. ${error.message}`);
    }
  }
  
  private detectPlatform(url: string): string {
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter';
    if (url.includes('facebook.com')) return 'Facebook';
    return 'غير محدد';
  }
  
  // التحقق من صحة الرابط
  isValidVideoUrl(url: string): boolean {
    const validPlatforms = [
      'tiktok.com',
      'youtube.com',
      'youtu.be',
      'instagram.com',
      'twitter.com',
      'x.com',
      'facebook.com'
    ];
    
    return validPlatforms.some(platform => url.includes(platform));
  }
  
  // الحصول على معلومات الأخطاء التفصيلية
  async getDiagnosticInfo(): Promise<{
    supportedPlatforms: string[];
    currentStatus: string;
    recommendations: string[];
  }> {
    return {
      supportedPlatforms: ['TikTok', 'YouTube', 'Instagram', 'Twitter', 'Facebook'],
      currentStatus: 'يستخدم البيانات الحقيقية فقط - لا توجد بيانات محاكاة',
      recommendations: [
        'تأكد من صحة رابط الفيديو',
        'تحقق من توفر مفاتيح API للمنصات المطلوبة',
        'استخدم الروابط المباشرة للفيديوهات فقط'
      ]
    };
  }
}

export const authenticOnlyAnalyzer = new AuthenticOnlyAnalyzer();