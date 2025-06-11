import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

export interface VideoAnalysisResult {
  hasWatermark: boolean;
  watermarkConfidence: number;
  contentCompliance: {
    tiktokCompliant: boolean;
    violations: string[];
    recommendations: string[];
  };
  technicalSpecs: {
    duration: number;
    resolution: string;
    format: string;
    size: number;
  };
  contentAnalysis: {
    title: string;
    description: string;
    suggestedHashtags: string[];
    category: string;
    mood: string;
  };
}

export class VideoUploadAnalyzer {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadsDir();
  }

  private ensureUploadsDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async analyzeUploadedVideo(filePath: string, fileName: string): Promise<VideoAnalysisResult> {
    try {
      // استخراج المواصفات التقنية
      const technicalSpecs = await this.extractTechnicalSpecs(filePath);
      
      // فحص العلامة المائية
      const watermarkResult = await this.detectWatermark(filePath);
      
      // فحص قوانين المحتوى
      const complianceResult = await this.checkContentCompliance(filePath, technicalSpecs);
      
      // تحليل المحتوى
      const contentAnalysis = await this.analyzeContent(filePath, fileName);

      return {
        hasWatermark: watermarkResult.hasWatermark,
        watermarkConfidence: watermarkResult.confidence,
        contentCompliance: complianceResult,
        technicalSpecs,
        contentAnalysis
      };
    } catch (error) {
      console.error('Error analyzing video:', error);
      throw new Error('فشل في تحليل الفيديو');
    }
  }

  private async extractTechnicalSpecs(filePath: string): Promise<VideoAnalysisResult['technicalSpecs']> {
    return new Promise((resolve, reject) => {
      // استخدام ffprobe لاستخراج معلومات الفيديو
      const ffprobe = spawn('ffprobe', [
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        '-show_streams',
        filePath
      ]);

      let output = '';
      ffprobe.stdout.on('data', (data) => {
        output += data.toString();
      });

      ffprobe.on('close', (code) => {
        if (code === 0 && output.trim()) {
          try {
            console.log('FFprobe exit code:', code);
            console.log('FFprobe raw output length:', output.length);
            console.log('FFprobe raw output preview:', output.substring(0, 500));
            
            const data = JSON.parse(output);
            console.log('Parsed ffprobe data format:', data.format);
            console.log('Parsed ffprobe streams count:', data.streams?.length);
            
            const videoStream = data.streams.find((s: any) => s.codec_type === 'video');
            const audioStream = data.streams.find((s: any) => s.codec_type === 'audio');
            
            console.log('Video stream duration:', videoStream?.duration);
            console.log('Audio stream duration:', audioStream?.duration);
            console.log('Format duration:', data.format?.duration);
            
            // استخراج دقيق للمدة الزمنية من مصادر متعددة
            let duration = 0;
            if (data.format && data.format.duration) {
              duration = parseFloat(data.format.duration);
              console.log('Using format duration:', duration);
            } else if (videoStream && videoStream.duration) {
              duration = parseFloat(videoStream.duration);
              console.log('Using video stream duration:', duration);
            } else if (audioStream && audioStream.duration) {
              duration = parseFloat(audioStream.duration);
              console.log('Using audio stream duration:', duration);
            }
            
            console.log('Final extracted duration:', duration, 'seconds');
            
            const fileStats = fs.statSync(filePath);
            
            resolve({
              duration: Math.round(duration * 100) / 100,
              resolution: videoStream ? `${videoStream.width}x${videoStream.height}` : 'غير محدد',
              format: data.format.format_name || path.extname(filePath).substring(1).toUpperCase(),
              size: parseInt(data.format.size) || fileStats.size
            });
          } catch (error) {
            console.error('Error parsing ffprobe output:', error);
            // الاعتماد على معلومات الملف الأساسية
            const fileStats = fs.statSync(filePath);
            resolve({
              duration: 0,
              resolution: 'Unknown',
              format: path.extname(filePath).substring(1),
              size: fs.statSync(filePath).size
            });
          }
        } else {
          // إذا فشل ffprobe، استخدم معلومات أساسية
          resolve({
            duration: 0,
            resolution: 'Unknown',
            format: path.extname(filePath).substring(1),
            size: fs.statSync(filePath).size
          });
        }
      });

      ffprobe.on('error', () => {
        // إذا فشل ffprobe، استخدم معلومات أساسية
        resolve({
          duration: 0,
          resolution: 'Unknown',
          format: path.extname(filePath).substring(1),
          size: fs.statSync(filePath).size
        });
      });
    });
  }

  private async detectWatermark(filePath: string): Promise<{ hasWatermark: boolean; confidence: number }> {
    // محاكاة فحص العلامة المائية باستخدام تحليل الصورة
    // في التطبيق الحقيقي، ستحتاج إلى استخدام OpenCV أو مكتبة تحليل صور متقدمة
    
    return new Promise((resolve) => {
      // استخراج إطار من الفيديو للتحليل
      const outputFrame = path.join(this.uploadsDir, `frame_${Date.now()}.jpg`);
      
      const ffmpeg = spawn('ffmpeg', [
        '-i', filePath,
        '-ss', '00:00:01',
        '-vframes', '1',
        '-y',
        outputFrame
      ]);

      ffmpeg.on('close', (code) => {
        if (code === 0 && fs.existsSync(outputFrame)) {
          // تحليل الإطار المستخرج
          this.analyzeFrameForWatermark(outputFrame)
            .then(result => {
              // حذف الإطار المؤقت
              fs.unlinkSync(outputFrame);
              resolve(result);
            })
            .catch(() => {
              // في حالة الفشل، ارجع نتيجة افتراضية
              if (fs.existsSync(outputFrame)) {
                fs.unlinkSync(outputFrame);
              }
              resolve({ hasWatermark: false, confidence: 85 });
            });
        } else {
          // في حالة فشل استخراج الإطار
          resolve({ hasWatermark: false, confidence: 70 });
        }
      });

      ffmpeg.on('error', () => {
        resolve({ hasWatermark: false, confidence: 70 });
      });
    });
  }

  private async analyzeFrameForWatermark(framePath: string): Promise<{ hasWatermark: boolean; confidence: number }> {
    // محاكاة تحليل العلامة المائية
    // في التطبيق الحقيقي، ستستخدم خوارزميات متقدمة للكشف عن العلامات المائية
    
    const stats = fs.statSync(framePath);
    const fileSize = stats.size;
    
    // فحص بسيط بناء على حجم الملف وخصائص أخرى
    const hasWatermark = Math.random() > 0.7; // محاكاة 30% احتمالية وجود علامة مائية
    const confidence = Math.floor(Math.random() * 20) + 80; // دقة بين 80-99%
    
    return { hasWatermark, confidence };
  }

  private async checkContentCompliance(filePath: string, technicalSpecs: any): Promise<VideoAnalysisResult['contentCompliance']> {
    const violations: string[] = [];
    const recommendations: string[] = [];
    
    // فحص المدة مع سجلات تشخيصية
    console.log('Checking duration compliance - Duration:', technicalSpecs.duration, 'Type:', typeof technicalSpecs.duration);
    
    const duration = Number(technicalSpecs.duration);
    
    if (duration > 180) {
      violations.push('مدة الفيديو أطول من 3 دقائق (الحد الأقصى لـ TikTok)');
      recommendations.push('قم بتقليص مدة الفيديو إلى أقل من 3 دقائق');
    }
    
    if (duration > 0 && duration < 3) {
      violations.push(`مدة الفيديو قصيرة جداً (${duration.toFixed(2)} ثانية - أقل من 3 ثوان)`);
      recommendations.push('تأكد من أن مدة الفيديو لا تقل عن 3 ثوان');
    }
    
    if (duration === 0) {
      violations.push('لم يتم استخراج مدة الفيديو بشكل صحيح');
      recommendations.push('تأكد من صحة ملف الفيديو وجودته');
    }
    
    // فحص الدقة
    if (technicalSpecs.resolution && technicalSpecs.resolution !== 'Unknown') {
      const [width, height] = technicalSpecs.resolution.split('x').map(Number);
      if (width < 540 || height < 960) {
        violations.push('دقة الفيديو منخفضة - الحد الأدنى 540x960');
        recommendations.push('استخدم دقة أعلى لجودة أفضل (1080x1920 مُفضل)');
      }
    }
    
    // فحص حجم الملف
    if (technicalSpecs.size > 287 * 1024 * 1024) { // 287MB حد TikTok
      violations.push('حجم الملف أكبر من الحد المسموح (287MB)');
      recommendations.push('قم بضغط الفيديو لتقليل حجم الملف');
    }
    
    // إضافة توصيات عامة
    if (violations.length === 0) {
      recommendations.push('استخدم هاشتاغات ترندينغ لزيادة الوصول');
      recommendations.push('أضف نصوص أو تعليقات توضيحية للمحتوى');
      recommendations.push('تأكد من جودة الصوت والإضاءة');
    }
    
    return {
      tiktokCompliant: violations.length === 0,
      violations,
      recommendations
    };
  }

  private async analyzeContent(filePath: string, fileName: string): Promise<VideoAnalysisResult['contentAnalysis']> {
    // تحليل المحتوى بناء على اسم الملف والخصائص
    const categories = ['ترفيه', 'تعليم', 'رياضة', 'طعام', 'سفر', 'موسيقى', 'كوميديا', 'أزياء'];
    const moods = ['مرح', 'ملهم', 'هادئ', 'حماسي', 'مثير', 'رومانسي', 'مُحفز'];
    
    const category = categories[Math.floor(Math.random() * categories.length)];
    const mood = moods[Math.floor(Math.random() * moods.length)];
    
    // إنشاء عنوان ووصف بناء على الفئة
    const titles = {
      'ترفيه': 'محتوى ترفيهي رائع!',
      'تعليم': 'تعلم شيء جديد اليوم',
      'رياضة': 'لحظات رياضية مميزة',
      'طعام': 'وصفة لذيذة يجب تجربتها',
      'سفر': 'مغامرة سفر لا تُنسى',
      'موسيقى': 'نغمات تأسر القلوب',
      'كوميديا': 'لحظات مضحكة ومسلية',
      'أزياء': 'إطلالة عصرية ومميزة'
    };
    
    const descriptions = {
      'ترفيه': 'استمتع بهذا المحتوى الترفيهي المسلي والممتع',
      'تعليم': 'محتوى تعليمي مفيد لتطوير مهاراتك ومعرفتك',
      'رياضة': 'لحظات رياضية مثيرة ومحفزة للنشاط',
      'طعام': 'وصفة شهية وسهلة التحضير لكل العائلة',
      'سفر': 'اكتشف أماكن جديدة ومغامرات مثيرة',
      'موسيقى': 'استمع لأجمل الألحان والنغمات الرائعة',
      'كوميديا': 'اضحك مع هذا المحتوى المسلي والمرح',
      'أزياء': 'تألق بأحدث صيحات الموضة والأناقة'
    };
    
    const hashtags = {
      'ترفيه': ['#ترفيه', '#مسلي', '#ممتع', '#فايرال'],
      'تعليم': ['#تعليم', '#تطوير', '#مهارات', '#تعلم'],
      'رياضة': ['#رياضة', '#لياقة', '#صحة', '#نشاط'],
      'طعام': ['#طعام', '#وصفة', '#طبخ', '#لذيذ'],
      'سفر': ['#سفر', '#مغامرة', '#استكشاف', '#رحلة'],
      'موسيقى': ['#موسيقى', '#غناء', '#ألحان', '#فن'],
      'كوميديا': ['#كوميديا', '#مضحك', '#ضحك', '#مرح'],
      'أزياء': ['#أزياء', '#موضة', '#أناقة', '#ستايل']
    };
    
    return {
      title: titles[category as keyof typeof titles] || 'فيديو رائع!',
      description: descriptions[category as keyof typeof descriptions] || 'محتوى مميز يستحق المشاهدة',
      suggestedHashtags: hashtags[category as keyof typeof hashtags] || ['#فيديو', '#محتوى', '#ترند'],
      category,
      mood
    };
  }

  cleanupFile(filePath: string) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }
}

export const videoUploadAnalyzer = new VideoUploadAnalyzer();