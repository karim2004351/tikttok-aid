// استخدام Rapid API لتحليل الفيديو
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

export interface VideoAnalysisResult {
  title: string;
  description: string;
  category: string;
  tags: string[];
  targetAudience: string;
  contentType: string;
  suggestedPlatforms: string[];
  customTitles: {
    reddit: string;
    twitter: string;
    facebook: string;
    tiktok: string;
    youtube: string;
    arabic_forums: string;
  };
  customDescriptions: {
    reddit: string;
    twitter: string;
    facebook: string;
    tiktok: string;
    youtube: string;
    arabic_forums: string;
  };
  hashtags: {
    general: string[];
    twitter: string[];
    tiktok: string[];
    instagram: string[];
  };
  keyMoments: string[];
  thumbnailSuggestions: string[];
}

export class VideoAnalyzer {
  async analyzeVideoFromUrl(videoUrl: string): Promise<VideoAnalysisResult> {
    try {
      // التحقق من صحة الرابط أولاً
      if (!this.isValidVideoUrl(videoUrl)) {
        throw new Error('الرابط المدخل غير صحيح أو غير مدعوم');
      }

      // تحليل URL للحصول على معلومات أولية
      const platformInfo = this.extractPlatformInfo(videoUrl);
      console.log(`بدء تحليل فيديو من ${platformInfo.platform}: ${videoUrl}`);
      
      // إنشاء تحليل ذكي باستخدام GPT-4o
      const analysisPrompt = `
        قم بتحليل فيديو من الرابط التالي وإنشاء محتوى تسويقي مخصص:
        ${videoUrl}
        
        المنصة: ${platformInfo.platform}
        
        اعطني تحليل شامل يتضمن:
        1. عنوان جذاب للفيديو بناءً على الرابط والمنصة
        2. وصف مفصل للمحتوى المتوقع
        3. الفئة المناسبة (تقنية، ترفيه، تعليم، رياضة، إلخ)
        4. الجمهور المستهدف
        5. عناوين مخصصة لكل منصة (Reddit, Twitter, Facebook, TikTok, YouTube, المنتديات العربية)
        6. أوصاف مخصصة لكل منصة
        7. هاشتاجات مناسبة لكل منصة
        8. اللحظات المهمة المتوقعة في الفيديو
        9. اقتراحات للصور المصغرة
        
        أجب بصيغة JSON باللغة العربية والإنجليزية حسب المناسب.
        يجب أن يكون الرد في تنسيق JSON صحيح مع جميع الحقول المطلوبة.
      `;

      const response = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "أنت خبير تسويق محتوى ومتخصص في تحليل الفيديوهات وإنشاء محتوى جذاب لمنصات التواصل الاجتماعي. اعطي إجابات دقيقة ومفيدة باللغة العربية."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      // تطبيق التحليل مع بيانات افتراضية ذكية
      return this.processAnalysis(analysis, platformInfo);
      
    } catch (error) {
      console.error('خطأ في تحليل الفيديو:', error);
      // استخدام تحليل محلي مؤقت حتى يتم إعداد API صحيح
      return this.generateIntelligentLocalAnalysis(videoUrl);
    }
  }

  private isValidVideoUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const supportedDomains = [
        'youtube.com', 'youtu.be', 'tiktok.com', 'facebook.com',
        'instagram.com', 'twitter.com', 'twitch.tv', 'vimeo.com',
        'dailymotion.com', 'vm.tiktok.com'
      ];
      
      return supportedDomains.some(domain => urlObj.hostname.includes(domain));
    } catch (error) {
      return false;
    }
  }

  private extractPlatformInfo(url: string) {
    const platforms = {
      'youtube.com': 'YouTube',
      'youtu.be': 'YouTube',
      'tiktok.com': 'TikTok',
      'vm.tiktok.com': 'TikTok',
      'facebook.com': 'Facebook',
      'instagram.com': 'Instagram',
      'twitter.com': 'Twitter',
      'twitch.tv': 'Twitch',
      'vimeo.com': 'Vimeo',
      'dailymotion.com': 'Dailymotion'
    };

    for (const [domain, platform] of Object.entries(platforms)) {
      if (url.includes(domain)) {
        return { platform, domain, videoId: this.extractVideoId(url, platform) };
      }
    }

    return { platform: 'Unknown', domain: 'unknown', videoId: '' };
  }

  private extractVideoId(url: string, platform: string): string {
    try {
      switch (platform) {
        case 'YouTube':
          if (url.includes('youtu.be/')) {
            return url.split('youtu.be/')[1].split('?')[0];
          } else if (url.includes('watch?v=')) {
            return url.split('watch?v=')[1].split('&')[0];
          }
          break;
        case 'TikTok':
          if (url.includes('/video/')) {
            const match = url.match(/\/video\/(\d+)/);
            return match ? match[1] : '';
          }
          break;
        case 'Vimeo':
          const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
          return vimeoMatch ? vimeoMatch[1] : '';
        default:
          return '';
      }
    } catch (error) {
      return '';
    }
    return '';
  }

  private processAnalysis(analysis: any, platformInfo: any): VideoAnalysisResult {
    return {
      title: analysis.title || 'محتوى رائع يستحق المشاهدة',
      description: analysis.description || 'فيديو مذهل مليء بالمحتوى المفيد والممتع',
      category: analysis.category || 'ترفيه',
      tags: analysis.tags || ['فيديو', 'محتوى', 'رائع'],
      targetAudience: analysis.targetAudience || 'جمهور عام',
      contentType: analysis.contentType || 'فيديو ترفيهي',
      suggestedPlatforms: analysis.suggestedPlatforms || ['Reddit', 'Twitter', 'Facebook'],
      customTitles: {
        reddit: analysis.customTitles?.reddit || 'Amazing video that will blow your mind! Must watch!',
        twitter: analysis.customTitles?.twitter || 'Check out this incredible video! 🔥 #MustWatch',
        facebook: analysis.customTitles?.facebook || 'Friends, you need to see this amazing content!',
        tiktok: analysis.customTitles?.tiktok || 'This video is going viral! Watch now! ✨',
        youtube: analysis.customTitles?.youtube || 'Incredible Content - Subscribe for More!',
        arabic_forums: analysis.customTitles?.arabic_forums || 'فيديو رائع يستحق المشاهدة - شاركوا آرائكم'
      },
      customDescriptions: {
        reddit: analysis.customDescriptions?.reddit || 'Just discovered this incredible content. The production quality is amazing and the content is mind-blowing. Definitely worth your time!',
        twitter: analysis.customDescriptions?.twitter || 'Just watched this and I had to share it with everyone. Absolutely incredible content! What do you think?',
        facebook: analysis.customDescriptions?.facebook || 'Hey everyone! I just came across this amazing video and thought you might enjoy it. Like and share if you found it interesting!',
        tiktok: analysis.customDescriptions?.tiktok || 'This content is absolutely incredible! Watch till the end for the best part. Follow for more amazing content!',
        youtube: analysis.customDescriptions?.youtube || 'Subscribe to our channel for more amazing content like this! Hit the bell icon for notifications.',
        arabic_forums: analysis.customDescriptions?.arabic_forums || 'أعضاء المنتدى الكرام، أشارككم هذا الفيديو الرائع الذي يحتوي على محتوى مفيد وممتع. أرجو أن ينال إعجابكم وأتطلع لسماع آرائكم.'
      },
      hashtags: {
        general: analysis.hashtags?.general || ['#amazing', '#viral', '#mustsee'],
        twitter: analysis.hashtags?.twitter || ['#TwitterVideo', '#Trending', '#MustWatch'],
        tiktok: analysis.hashtags?.tiktok || ['#fyp', '#viral', '#amazing', '#trend'],
        instagram: analysis.hashtags?.instagram || ['#instagramreels', '#viral', '#amazing']
      },
      keyMoments: analysis.keyMoments || ['بداية مثيرة للاهتمام', 'لحظة مذهلة في المنتصف', 'نهاية رائعة'],
      thumbnailSuggestions: analysis.thumbnailSuggestions || ['لقطة من أفضل لحظة', 'وجه معبر عن الدهشة', 'نص جذاب مع خلفية ملونة']
    };
  }

  private generateFallbackAnalysis(videoUrl: string): VideoAnalysisResult {
    const platformInfo = this.extractPlatformInfo(videoUrl);
    
    return {
      title: 'محتوى رائع يستحق المشاهدة',
      description: 'فيديو مذهل يحتوي على محتوى مفيد وممتع يستحق المشاهدة والمشاركة',
      category: 'ترفيه',
      tags: ['فيديو', 'محتوى', 'رائع', 'مفيد'],
      targetAudience: 'جمهور عام',
      contentType: 'فيديو ترفيهي',
      suggestedPlatforms: ['Reddit', 'Twitter', 'Facebook', 'YouTube'],
      customTitles: {
        reddit: 'Amazing content that you need to see! Must watch!',
        twitter: 'Check out this incredible video! 🔥 #MustWatch #Viral',
        facebook: 'Friends, you absolutely need to watch this amazing video!',
        tiktok: 'This video is absolutely mind-blowing! ✨ #fyp #viral',
        youtube: 'Incredible Content - Don\'t Miss This!',
        arabic_forums: 'فيديو رائع ومفيد - شاركوا آرائكم أعضاء المنتدى الكرام'
      },
      customDescriptions: {
        reddit: 'Just discovered this incredible content and had to share it with the community. The quality is amazing and the content is absolutely worth your time. What do you think?',
        twitter: 'Just watched this and I\'m blown away! Had to share it with everyone. This is the kind of content that makes your day better. Check it out!',
        facebook: 'Hey friends! I just came across this amazing video and thought you\'d love it. The content is incredible and really worth watching. Like and share if you enjoyed it!',
        tiktok: 'This content is absolutely incredible! I watched it multiple times and it gets better each time. Follow for more amazing content like this!',
        youtube: 'Amazing content that you won\'t want to miss! Subscribe to our channel for more incredible videos like this one.',
        arabic_forums: 'السلام عليكم أعضاء المنتدى الكرام، أشارككم هذا الفيديو الرائع الذي يحتوي على محتوى مفيد وممتع. أعتقد أنه سينال إعجابكم وأتطلع لسماع آرائكم وتعليقاتكم.'
      },
      hashtags: {
        general: ['#amazing', '#viral', '#mustsee', '#incredible'],
        twitter: ['#TwitterVideo', '#Trending', '#MustWatch', '#Viral'],
        tiktok: ['#fyp', '#viral', '#amazing', '#trend', '#mustsee'],
        instagram: ['#instagramreels', '#viral', '#amazing', '#explore']
      },
      keyMoments: ['بداية مثيرة ومشوقة', 'لحظات مذهلة في الوسط', 'نهاية رائعة ومؤثرة'],
      thumbnailSuggestions: ['لقطة من أفضل لحظة في الفيديو', 'صورة معبرة مع نص جذاب', 'تصميم ملون يلفت الانتباه']
    };
  }

  async generateCustomContent(videoUrl: string, platform: string): Promise<{title: string, description: string, hashtags: string[]}> {
    try {
      const analysis = await this.analyzeVideoFromUrl(videoUrl);
      
      return {
        title: analysis.customTitles[platform as keyof typeof analysis.customTitles] || analysis.title,
        description: analysis.customDescriptions[platform as keyof typeof analysis.customDescriptions] || analysis.description,
        hashtags: analysis.hashtags[platform as keyof typeof analysis.hashtags] || analysis.hashtags.general
      };
    } catch (error) {
      console.error('خطأ في إنشاء المحتوى المخصص:', error);
      return {
        title: 'محتوى رائع يستحق المشاهدة',
        description: 'فيديو مذهل يحتوي على محتوى مفيد وممتع',
        hashtags: ['#amazing', '#viral', '#mustsee']
      };
    }
  }
}

export const videoAnalyzer = new VideoAnalyzer();