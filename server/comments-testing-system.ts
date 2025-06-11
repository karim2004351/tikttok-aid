interface VideoTarget {
  platform: string;
  url: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  author: string;
  duration: string;
}

interface CommentingSession {
  platform: string;
  videosFound: number;
  commentsPosted: number;
  failed: number;
  errors: string[];
  duration: number;
}

export class CommentsTestingSystem {
  async generateMockTrendingVideos(platform: string, count: number, isRandom: boolean = false): Promise<VideoTarget[]> {
    const videos: VideoTarget[] = [];
    const platforms = {
      youtube: {
        titles: isRandom ? [
          'مراجعة منتج جديد',
          'قصة نجاح ملهمة',
          'تجربة مطعم شعبي',
          'نصائح للحياة العملية',
          'ألعاب فيديو جديدة',
          'رحلة سفر قصيرة',
          'تقنيات حديثة',
          'موسيقى عربية أصيلة',
          'تعلم لغة جديدة',
          'رياضة وصحة',
          'فنون وثقافة',
          'طبخ تقليدي',
          'تصوير فوتوغرافي',
          'تصميم جرافيك',
          'برمجة وتطوير'
        ] : [
          'أفضل نصائح للنجاح في 2025',
          'طبخة سريعة ولذيذة',
          'تعلم البرمجة من الصفر',
          'رحلة مذهلة حول العالم',
          'فن الرسم الرقمي'
        ],
        authors: isRandom ? [
          'مراجع_تقني', 'قصص_النجاح', 'عاشق_الطعام', 'خبير_حياة', 'جيمر_عربي',
          'مسافر_شغوف', 'تقني_محترف', 'موسيقي_عربي', 'معلم_لغات', 'مدرب_صحة',
          'فنان_مبدع', 'شيف_تراثي', 'مصور_محترف', 'مصمم_إبداعي', 'مطور_ذكي'
        ] : ['قناة المعرفة', 'شيف أحمد', 'مبرمج عربي', 'مسافر العالم', 'فنان رقمي']
      },
      tiktok: {
        titles: isRandom ? [
          'رقصة عفوية',
          'نكتة يومية',
          'تحدي جديد',
          'لحظة مضحكة',
          'موقف طريف',
          'تقليد مشهور',
          'مشهد كوميدي',
          'رقصة شبابية',
          'تجربة طعام',
          'حيل ذكية',
          'لحظات عائلية',
          'تحدي رقص',
          'موقف مدرسي',
          'مقالب بريئة',
          'لحظات الصداقة'
        ] : [
          'رقصة شعبية جديدة',
          'نصيحة يومية سريعة',
          'طبخة في دقيقة',
          'تحدي الإبداع',
          'كوميديا الشارع'
        ],
        authors: isRandom ? [
          'راقص_عفوي', 'كوميدي_صغير', 'محبي_التحديات', 'ضحكة_يوم', 'موقف_طريف',
          'مقلد_مشهور', 'كوميدي_شاب', 'راقصة_موهوبة', 'عاشق_الطعام', 'حيل_ذكية',
          'عائلة_مرحة', 'تحدي_رقص', 'طالب_مرح', 'مقالب_بريئة', 'أصدقاء_مرح'
        ] : ['راقصة_عربية', 'نصائح_يومية', 'شيف_سريع', 'مبدع_شاب', 'كوميدي_عربي']
      },
      instagram: {
        titles: isRandom ? [
          'صورة طبيعية خلابة',
          'لوك اليوم',
          'وجبة صحية',
          'تمرين رياضي',
          'لحظة استرخاء',
          'إطلالة عصرية',
          'مناظر طبيعية',
          'تصميم ديكور',
          'صورة سيلفي',
          'لحظة سعادة',
          'تجربة مكياج',
          'مشهد غروب',
          'صورة فنية',
          'لحظة تأمل',
          'إطلالة مميزة'
        ] : [
          'لحظة غروب ساحرة',
          'وصفة صحية سريعة',
          'تصميم إبداعي جديد',
          'رياضة صباحية',
          'موضة وأناقة'
        ],
        authors: isRandom ? [
          'عاشق_الطبيعة', 'فاشونيستا_عربية', 'صحة_ولياقة', 'رياضي_نشيط', 'استرخاء_يومي',
          'أناقة_عصرية', 'مصور_طبيعة', 'ديكور_منزلي', 'سيلفي_يومي', 'سعادة_دائمة',
          'خبيرة_مكياج', 'عاشق_الغروب', 'فنان_تشكيلي', 'تأمل_يومي', 'إطلالة_مميزة'
        ] : ['مصور_طبيعة', 'صحة_وجمال', 'مصمم_جرافيك', 'مدرب_رياضي', 'خبيرة_موضة']
      },
      facebook: {
        titles: isRandom ? [
          'منشور شخصي',
          'مشاركة صورة عائلية',
          'تحديث حالة',
          'مشاركة مقال',
          'صورة من الذكريات',
          'منشور تحفيزي',
          'مشاركة فيديو',
          'تهنئة بمناسبة',
          'صورة من العمل',
          'مشاركة خبر'
        ] : [
          'منشور اجتماعي مميز',
          'مشاركة عائلية دافئة',
          'تحديث شخصي',
          'محتوى تفاعلي',
          'لحظات جميلة'
        ],
        authors: isRandom ? [
          'شخص_اجتماعي', 'عائلة_سعيدة', 'محدث_نشط', 'مشارك_مقالات', 'ذكريات_جميلة',
          'محفز_يومي', 'مشارك_فيديو', 'مهنئ_دائم', 'موظف_نشيط', 'ناقل_أخبار'
        ] : ['مستخدم_فيسبوك', 'عائلة_عربية', 'شخص_نشيط', 'مشارك_محتوى', 'مستخدم_اجتماعي']
      },
      twitter: {
        titles: isRandom ? [
          'تغريدة سريعة',
          'رأي شخصي',
          'خبر عاجل',
          'تعليق على حدث',
          'اقتباس ملهم',
          'سؤال للمتابعين',
          'مشاركة رابط',
          'تحديث يومي',
          'رد على تغريدة',
          'موضوع ترند'
        ] : [
          'تغريدة مؤثرة',
          'محتوى قصير',
          'رأي سريع',
          'تفاعل اجتماعي',
          'موضوع رائج'
        ],
        authors: isRandom ? [
          'مغرد_سريع', 'صاحب_رأي', 'ناقل_أخبار', 'معلق_أحداث', 'ملهم_يومي',
          'سائل_فضولي', 'مشارك_روابط', 'محدث_يومي', 'مجيب_نشيط', 'متابع_ترند'
        ] : ['مغرد_عربي', 'صاحب_رأي', 'متفاعل_اجتماعي', 'ناشر_محتوى', 'شخصية_عامة']
      },
      linkedin: {
        titles: isRandom ? [
          'منشور مهني',
          'نصيحة مهنية',
          'تحديث وظيفي',
          'مشاركة إنجاز',
          'مقال تخصصي',
          'فرصة عمل',
          'تطوير مهني',
          'خبرة عملية',
          'نصيحة للباحثين عن عمل',
          'إعلان عن مشروع'
        ] : [
          'محتوى مهني متخصص',
          'نصائح التطوير المهني',
          'مشاركة خبرات العمل',
          'فرص مهنية جديدة',
          'إنجازات مهنية'
        ],
        authors: isRandom ? [
          'محترف_مهني', 'مستشار_مهني', 'مطور_وظيفي', 'محقق_إنجازات', 'كاتب_مقالات',
          'مقدم_فرص', 'مطور_ذاتي', 'صاحب_خبرة', 'مستشار_توظيف', 'رائد_مشاريع'
        ] : ['محترف_عربي', 'خبير_مهني', 'مستشار_أعمال', 'رائد_أعمال', 'مطور_مهني']
      },
      reddit: {
        titles: isRandom ? [
          'سؤال في منتدى',
          'مشاركة تجربة',
          'نقاش مفتوح',
          'طلب نصيحة',
          'مشاركة رابط مفيد',
          'قصة شخصية',
          'استفسار تقني',
          'مراجعة منتج',
          'موضوع للنقاش',
          'مشاركة اكتشاف'
        ] : [
          'نقاش مجتمعي هادف',
          'مشاركة معرفة مفيدة',
          'سؤال للمجتمع',
          'تجربة شخصية',
          'موضوع للحوار'
        ],
        authors: isRandom ? [
          'عضو_منتدى', 'مشارك_تجارب', 'محب_نقاش', 'طالب_نصائح', 'مشارك_روابط',
          'راوي_قصص', 'مستفسر_تقني', 'مراجع_منتجات', 'محرك_نقاش', 'مكتشف_جديد'
        ] : ['مستخدم_ريديت', 'عضو_مجتمع', 'مشارك_نشط', 'محب_النقاش', 'باحث_معرفة']
      },
      telegram: {
        titles: isRandom ? [
          'رسالة في قناة',
          'مشاركة في مجموعة',
          'إعلان مهم',
          'رابط مفيد',
          'صورة أو فيديو',
          'استطلاع رأي',
          'تحديث إخباري',
          'معلومة مفيدة',
          'دعوة لحدث',
          'مشاركة ملف'
        ] : [
          'رسالة قناة مهمة',
          'تحديث إخباري عاجل',
          'محتوى مفيد للمجموعة',
          'معلومة قيمة',
          'إعلان مهم'
        ],
        authors: isRandom ? [
          'مدير_قناة', 'عضو_مجموعة', 'مرسل_إعلانات', 'مشارك_روابط', 'ناشر_محتوى',
          'منظم_استطلاعات', 'مراسل_أخبار', 'مقدم_معلومات', 'منظم_أحداث', 'مشارك_ملفات'
        ] : ['مدير_قناة', 'عضو_نشيط', 'مشارك_محتوى', 'مراسل_أخبار', 'منظم_مجتمع']
      },
      snapchat: {
        titles: isRandom ? [
          'قصة يومية',
          'لحظة سريعة',
          'سناب من اليوم',
          'لحظة مضحكة',
          'مشهد عفوي',
          'تحديث سريع',
          'لحظة جميلة',
          'موقف طريف',
          'سناب الأصدقاء',
          'لحظة استمتاع'
        ] : [
          'قصة مميزة',
          'لحظة خاصة',
          'سناب يومي',
          'مشاركة سريعة',
          'محتوى عفوي'
        ],
        authors: isRandom ? [
          'صانع_قصص', 'لاقط_لحظات', 'سنابر_يومي', 'محب_مرح', 'مصور_عفوي',
          'محدث_سريع', 'جامع_ذكريات', 'راوي_مواقف', 'صديق_سناب', 'عاشق_متعة'
        ] : ['مستخدم_سناب', 'صانع_قصص', 'مشارك_لحظات', 'محب_التصوير', 'شاب_عصري']
      },
      pinterest: {
        titles: isRandom ? [
          'لوحة إلهام',
          'فكرة إبداعية',
          'تصميم جميل',
          'وصفة مميزة',
          'ديكور منزلي',
          'موضة وأناقة',
          'حرفة يدوية',
          'فن وإبداع',
          'نصيحة منزلية',
          'فكرة مشروع'
        ] : [
          'أفكار إبداعية ملهمة',
          'تصاميم منزلية رائعة',
          'وصفات لذيذة ومبتكرة',
          'أزياء عصرية أنيقة',
          'حرف وفنون يدوية'
        ],
        authors: isRandom ? [
          'ملهم_إبداعي', 'مبدع_أفكار', 'مصمم_جمال', 'شيف_وصفات', 'خبير_ديكور',
          'خبيرة_موضة', 'صانع_حرف', 'فنان_مبدع', 'خبير_منزل', 'رائد_مشاريع'
        ] : ['مبدع_أفكار', 'خبير_تصميم', 'شيف_منزلي', 'خبيرة_ديكور', 'فنان_حرفي']
      }
    };

    const platformData = platforms[platform.toLowerCase() as keyof typeof platforms];
    if (!platformData) return videos;

    for (let i = 0; i < count; i++) {
      const titleIndex = isRandom ? Math.floor(Math.random() * platformData.titles.length) : i % platformData.titles.length;
      const authorIndex = isRandom ? Math.floor(Math.random() * platformData.authors.length) : titleIndex;
      
      videos.push({
        platform,
        url: `https://${platform}.com/watch?v=${isRandom ? 'random' : 'test'}${i + 1}`,
        title: platformData.titles[titleIndex],
        views: isRandom ? Math.floor(Math.random() * 500000) + 500 : Math.floor(Math.random() * 100000) + 1000,
        likes: isRandom ? Math.floor(Math.random() * 25000) + 50 : Math.floor(Math.random() * 5000) + 100,
        comments: isRandom ? Math.floor(Math.random() * 5000) + 20 : Math.floor(Math.random() * 1000) + 50,
        author: platformData.authors[authorIndex],
        duration: `${Math.floor(Math.random() * 15) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
      });
    }

    return videos;
  }

  async simulateCommentPosting(
    videoUrl: string, 
    commentText: string, 
    platform: string
  ): Promise<{success: boolean, error?: string}> {
    // Realistic network delay based on platform
    const delays = {
      youtube: 2000,
      tiktok: 1500,
      instagram: 1800,
      facebook: 2200,
      twitter: 1000,
      linkedin: 2500,
      snapchat: 1200,
      telegram: 800,
      reddit: 1600,
      pinterest: 2000
    };
    
    const delay = delays[platform.toLowerCase() as keyof typeof delays] || 2000;
    await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 1000));
    
    // Higher success rate for realistic simulation
    const successRate = 0.92; // 92% success rate
    const isSuccess = Math.random() < successRate;
    
    if (isSuccess) {
      console.log(`✅ تم نشر التعليق بنجاح على ${platform}: "${commentText.substring(0, 30)}..."`);
      return { success: true };
    } else {
      const errors = [
        'تم الوصول للحد الأقصى للتعليقات اليومية',
        'التعليق يحتوي على محتوى محظور',
        'خطأ في الاتصال بالخادم',
        'المحتوى غير متاح حالياً',
        'تم رفض التعليق بواسطة فلاتر المنصة'
      ];
      const randomError = errors[Math.floor(Math.random() * errors.length)];
      console.log(`❌ فشل نشر التعليق على ${platform}: ${randomError}`);
      return { success: false, error: randomError };
    }
  }

  async startTestingSession(
    platforms: string[], 
    commentTexts: string[], 
    videosPerPlatform: number = 5,
    targetVideoUrl: string = '',
    commentsPerVideo: number = 1,
    randomPublishing: boolean = false
  ): Promise<CommentingSession[]> {
    const sessions: CommentingSession[] = [];
    
    for (const platform of platforms) {
      const session: CommentingSession = {
        platform,
        videosFound: 0,
        commentsPosted: 0,
        failed: 0,
        errors: [],
        duration: 0
      };

      const startTime = Date.now();

      try {
        // Generate mock trending videos
        const videos = await this.generateMockTrendingVideos(platform, videosPerPlatform, randomPublishing);
        session.videosFound = videos.length;

        // Simulate posting comments on found videos with time limit
        const maxDuration = 30000; // 30 seconds maximum
        for (const video of videos) {
          // Check if we've exceeded the time limit
          if (Date.now() - startTime > maxDuration) {
            console.log(`⏰ إيقاف المحاكاة بعد ${maxDuration/1000} ثانية`);
            break;
          }
          
          // Post multiple comments per video if specified
          for (let commentIndex = 0; commentIndex < commentsPerVideo; commentIndex++) {
            // Select a different comment each time or repeat if not enough
            const commentTextIndex = commentIndex % commentTexts.length;
            const selectedComment = commentTexts[commentTextIndex];
            
            // Add target video URL to the comment if provided
            let finalComment = selectedComment;
            if (targetVideoUrl) {
              finalComment = `${selectedComment}\n\nشاهد هذا الفيديو المميز: ${targetVideoUrl}`;
            }
            
            const result = await this.simulateCommentPosting(video.url, finalComment, platform);

            if (result.success) {
              session.commentsPosted++;
            } else {
              session.failed++;
              session.errors.push(`فشل في نشر التعليق على ${video.title}: ${result.error}`);
            }

            // Add delay between comments on the same video
            if (commentIndex < commentsPerVideo - 1) {
              await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
            }
          }

          // Add delay between videos
          if (videos.indexOf(video) < videos.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
          }
        }
      } catch (error: any) {
        session.errors.push(`خطأ في منصة ${platform}: ${error.message}`);
      }

      session.duration = Date.now() - startTime;
      sessions.push(session);
    }

    return sessions;
  }
}

export const commentsTestingSystem = new CommentsTestingSystem();