import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export interface MusicRecognitionResult {
  isProtected: boolean;
  confidence: number;
  trackInfo?: {
    title: string;
    artist: string;
    album?: string;
    label?: string;
    releaseDate?: string;
    duration?: number;
    genres?: string[];
  };
  copyrightInfo?: {
    hasContentID: boolean;
    copyrightOwner?: string;
    usage: 'commercial' | 'non-commercial' | 'unknown';
    requiresLicense: boolean;
  };
  analysisDetails: {
    method: string;
    audioSampleDuration: number;
    recognitionScore: number;
    errors: string[];
  };
}

export class MusicRecognitionSystem {
  private acrcloudHost: string;
  private accessKey: string;
  private accessSecret: string;

  constructor() {
    this.acrcloudHost = process.env.ACRCLOUD_HOST || '';
    this.accessKey = process.env.ACRCLOUD_ACCESS_KEY || '';
    this.accessSecret = process.env.ACRCLOUD_ACCESS_SECRET || '';
  }

  async analyzeAudio(videoFilePath: string): Promise<MusicRecognitionResult> {
    console.log('Starting audio analysis for:', videoFilePath);
    
    const result: MusicRecognitionResult = {
      isProtected: false,
      confidence: 0,
      analysisDetails: {
        method: 'ACRCloud Recognition',
        audioSampleDuration: 0,
        recognitionScore: 0,
        errors: []
      }
    };

    try {
      // استخراج عينة صوتية من الفيديو
      const audioSample = await this.extractAudioSample(videoFilePath);
      result.analysisDetails.audioSampleDuration = 10; // 10 seconds sample

      if (!audioSample) {
        result.analysisDetails.errors.push('فشل في استخراج العينة الصوتية');
        return result;
      }

      // التعرف على الموسيقى باستخدام ACRCloud
      const recognitionData = await this.recognizeWithACRCloud(audioSample);
      
      if (recognitionData) {
        result.trackInfo = recognitionData.trackInfo;
        result.copyrightInfo = recognitionData.copyrightInfo;
        result.isProtected = recognitionData.isProtected;
        result.confidence = recognitionData.confidence;
        result.analysisDetails.recognitionScore = recognitionData.confidence;
      }

      // تنظيف الملف المؤقت
      try {
        fs.unlinkSync(audioSample);
      } catch (e) {
        // تجاهل خطأ حذف الملف المؤقت
      }

    } catch (error: any) {
      console.error('Error in audio analysis:', error);
      result.analysisDetails.errors.push(`خطأ في التحليل: ${error.message}`);
    }

    return result;
  }

  private async extractAudioSample(videoPath: string): Promise<string | null> {
    try {
      const tempDir = path.join(process.cwd(), 'uploads', 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const tempAudioPath = path.join(tempDir, `audio_sample_${Date.now()}.wav`);
      
      // استخراج 10 ثوان من بداية الفيديو كعينة صوتية
      const command = `ffmpeg -i "${videoPath}" -t 10 -vn -acodec pcm_s16le -ar 44100 -ac 1 "${tempAudioPath}" -y`;
      
      console.log('Extracting audio sample with command:', command);
      await execAsync(command);
      
      if (fs.existsSync(tempAudioPath)) {
        console.log('Audio sample extracted successfully:', tempAudioPath);
        return tempAudioPath;
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting audio sample:', error);
      return null;
    }
  }

  private async recognizeWithACRCloud(audioFilePath: string): Promise<{
    trackInfo: any;
    copyrightInfo: any;
    isProtected: boolean;
    confidence: number;
  } | null> {
    try {
      if (!this.accessKey || !this.accessSecret || !this.acrcloudHost) {
        console.log('ACRCloud credentials not available, using fallback analysis');
        return this.performFallbackAnalysis(audioFilePath);
      }

      // قراءة الملف الصوتي
      const audioData = fs.readFileSync(audioFilePath);
      
      // إنشاء التوقيع المطلوب لـ ACRCloud
      const timestamp = Math.floor(Date.now() / 1000);
      const stringToSign = `POST\n/v1/identify\n${this.accessKey}\naudio\n1\n${timestamp}`;
      const signature = crypto.createHmac('sha1', this.accessSecret).update(stringToSign).digest().toString('base64');

      // إرسال الطلب إلى ACRCloud
      const formData = new FormData();
      formData.append('sample', new Blob([audioData]), 'sample.wav');
      formData.append('sample_bytes', audioData.length.toString());
      formData.append('access_key', this.accessKey);
      formData.append('data_type', 'audio');
      formData.append('signature_version', '1');
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());

      const response = await fetch(`https://${this.acrcloudHost}/v1/identify`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log('ACRCloud response:', JSON.stringify(data, null, 2));

      if (data.status.code === 0 && data.metadata?.music?.length > 0) {
        const music = data.metadata.music[0];
        
        return {
          trackInfo: {
            title: music.title || 'غير معروف',
            artist: music.artists?.[0]?.name || 'غير معروف',
            album: music.album?.name,
            label: music.label,
            releaseDate: music.release_date,
            duration: music.duration_ms ? Math.round(music.duration_ms / 1000) : undefined,
            genres: music.genres?.map((g: any) => g.name) || []
          },
          copyrightInfo: {
            hasContentID: true,
            copyrightOwner: music.label || music.artists?.[0]?.name,
            usage: this.determineCopyrightUsage(music),
            requiresLicense: true
          },
          isProtected: true,
          confidence: Math.round((music.score || 0) * 100)
        };
      } else {
        // لم يتم التعرف على الموسيقى
        return {
          trackInfo: {
            title: 'غير معروف',
            artist: 'غير معروف'
          },
          copyrightInfo: {
            hasContentID: false,
            usage: 'unknown' as const,
            requiresLicense: false
          },
          isProtected: false,
          confidence: 0
        };
      }

    } catch (error) {
      console.error('Error with ACRCloud recognition:', error);
      return this.performFallbackAnalysis(audioFilePath);
    }
  }

  private async performFallbackAnalysis(audioFilePath: string): Promise<{
    trackInfo: any;
    copyrightInfo: any;
    isProtected: boolean;
    confidence: number;
  }> {
    // تحليل احتياطي بسيط بناء على خصائص الملف الصوتي
    try {
      const stats = fs.statSync(audioFilePath);
      const fileSize = stats.size;
      
      // تحليل بسيط بناء على حجم الملف وخصائص أخرى
      const hasComplexAudio = fileSize > 500000; // أكبر من 500KB لـ 10 ثوان يشير لجودة عالية
      
      return {
        trackInfo: {
          title: 'تحليل محلي - غير معروف',
          artist: 'غير محدد'
        },
        copyrightInfo: {
          hasContentID: false,
          usage: 'unknown' as const,
          requiresLicense: hasComplexAudio // إذا كان الصوت معقد، قد يكون محمي
        },
        isProtected: hasComplexAudio,
        confidence: hasComplexAudio ? 30 : 10 // ثقة منخفضة للتحليل المحلي
      };
    } catch (error) {
      return {
        trackInfo: {
          title: 'خطأ في التحليل',
          artist: 'غير متاح'
        },
        copyrightInfo: {
          hasContentID: false,
          usage: 'unknown' as const,
          requiresLicense: false
        },
        isProtected: false,
        confidence: 0
      };
    }
  }

  private determineCopyrightUsage(musicData: any): 'commercial' | 'non-commercial' | 'unknown' {
    // تحديد نوع الاستخدام بناء على بيانات الموسيقى
    if (musicData.label && (
      musicData.label.toLowerCase().includes('universal') ||
      musicData.label.toLowerCase().includes('sony') ||
      musicData.label.toLowerCase().includes('warner') ||
      musicData.label.toLowerCase().includes('emi')
    )) {
      return 'commercial'; // شركات الإنتاج الكبرى تتطلب ترخيص تجاري
    }
    
    return 'unknown';
  }

  async getDiagnosticInfo(): Promise<{
    acrcloudAvailable: boolean;
    configurationStatus: string;
    lastError?: string;
  }> {
    return {
      acrcloudAvailable: !!(this.accessKey && this.accessSecret && this.acrcloudHost),
      configurationStatus: this.getConfigurationStatus(),
    };
  }

  private getConfigurationStatus(): string {
    if (!this.accessKey) return 'مفتاح الوصول غير متاح';
    if (!this.accessSecret) return 'مفتاح السر غير متاح';
    if (!this.acrcloudHost) return 'عنوان الخادم غير متاح';
    return 'الإعدادات مكتملة';
  }
}

export const musicRecognitionSystem = new MusicRecognitionSystem();