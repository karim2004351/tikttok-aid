import fetch from 'node-fetch';

export interface HashtagSuggestion {
  hashtag: string;
  popularity: number;
  trend: 'rising' | 'stable' | 'declining';
  category: string;
  relatedTopics: string[];
  estimatedReach: number;
  competitiveness: 'low' | 'medium' | 'high';
  platforms: string[];
  language: 'ar' | 'en' | 'mixed';
}

export interface HashtagAnalysis {
  videoContent: string;
  contentType: string;
  targetAudience: string;
  country: string;
  suggestedHashtags: HashtagSuggestion[];
  trendingNow: HashtagSuggestion[];
  nicheTags: HashtagSuggestion[];
  broadTags: HashtagSuggestion[];
  confidence: number;
  lastUpdated: string;
}

export interface TrendingTopic {
  topic: string;
  volume: number;
  growth: number;
  category: string;
  relatedHashtags: string[];
  platforms: string[];
  geographic: string[];
}

export class TrendingHashtagGenerator {
  private openaiApiKey: string;
  private rapidApiKey: string;
  private twitterBearerToken: string;
  private twitterApiKey: string;
  private twitterApiSecret: string;
  private twitterAccessToken: string;
  private twitterAccessTokenSecret: string;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    this.rapidApiKey = process.env.RAPIDAPI_KEY || '';
    this.twitterBearerToken = process.env.TWITTER_BEARER_TOKEN || '';
    this.twitterApiKey = process.env.TWITTER_API_KEY_NEW || process.env.TWITTER_API_KEY || '';
    this.twitterApiSecret = process.env.TWITTER_API_SECRET_NEW || process.env.TWITTER_API_SECRET || '';
    this.twitterAccessToken = process.env.TWITTER_ACCESS_TOKEN || '';
    this.twitterAccessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET || '';
  }

  async generateHashtags(
    videoContent: string,
    contentType: string,
    targetAudience: string,
    country: string
  ): Promise<HashtagAnalysis> {
    console.log(`🏷️ توليد هاشتاغات للمحتوى: ${contentType} في ${country}`);

    // تحليل المحتوى بالذكاء الاصطناعي
    const contentAnalysis = await this.analyzeContentWithAI(videoContent, contentType);
    
    // جلب الاتجاهات الرائجة
    const trendingTopics = await this.fetchTrendingTopics(country);
    
    // توليد هاشتاغات مخصصة
    const customHashtags = await this.generateCustomHashtags(contentAnalysis, targetAudience, country);
    
    // تحليل الهاشتاغات الرائجة
    const trendingHashtags = await this.analyzeTrendingHashtags(trendingTopics, contentType);
    
    // هاشتاغات المتخصصة والعامة
    const nicheHashtags = await this.generateNicheHashtags(contentAnalysis, contentType);
    const broadHashtags = await this.generateBroadHashtags(contentType, country);

    // دمج وترتيب النتائج
    const allHashtags = [...customHashtags, ...trendingHashtags, ...nicheHashtags, ...broadHashtags];
    const uniqueHashtags = this.removeDuplicateHashtags(allHashtags);
    const rankedHashtags = this.rankHashtags(uniqueHashtags, contentAnalysis);

    return {
      videoContent,
      contentType,
      targetAudience,
      country,
      suggestedHashtags: rankedHashtags.slice(0, 15),
      trendingNow: trendingHashtags.slice(0, 8),
      nicheTags: nicheHashtags.slice(0, 6),
      broadTags: broadHashtags.slice(0, 5),
      confidence: this.calculateConfidence(rankedHashtags),
      lastUpdated: new Date().toISOString()
    };
  }

  private async analyzeContentWithAI(videoContent: string, contentType: string): Promise<any> {
    if (!this.openaiApiKey) {
      console.log('استخدام التحليل المحلي لعدم توفر مفتاح OpenAI');
      return this.getFallbackContentAnalysis(videoContent, contentType);
    }

    try {
      console.log('🤖 تحليل المحتوى باستخدام OpenAI GPT-4...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{
            role: 'system',
            content: 'أنت خبير في تحليل المحتوى وتوليد الهاشتاغات. قم بالتحليل باللغة العربية وأجب بصيغة JSON صحيحة فقط.'
          }, {
            role: 'user',
            content: `حلل هذا المحتوى واستخرج البيانات التالية:

المحتوى: "${videoContent}"
النوع: ${contentType}

المطلوب (بصيغة JSON):
{
  "keywords": ["كلمة1", "كلمة2"],
  "themes": ["موضوع1", "موضوع2"],
  "emotions": ["مشاعر1", "مشاعر2"],
  "energy": "عالية/متوسطة/هادئة",
  "audience": "الجمهور المستهدف",
  "categories": ["تصنيف1", "تصنيف2"],
  "tone": "النبرة",
  "style": "الأسلوب"
}`
          }],
          max_tokens: 800,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as any;
      const content = data.choices[0].message.content;
      
      console.log('✅ تم التحليل بنجاح باستخدام OpenAI');
      
      try {
        const parsed = JSON.parse(content);
        return parsed;
      } catch (parseError) {
        console.warn('فشل في تحليل استجابة OpenAI، استخدام التحليل المحلي');
        return this.getFallbackContentAnalysis(videoContent, contentType);
      }
    } catch (error) {
      console.error('خطأ في تحليل المحتوى بـ OpenAI:', error);
      return this.getFallbackContentAnalysis(videoContent, contentType);
    }
  }

  private async fetchTrendingTopics(country: string): Promise<TrendingTopic[]> {
    // محاولة جلب البيانات من Twitter API
    const twitterTrends = await this.fetchTwitterTrends(country);
    
    // محاولة جلب البيانات من RapidAPI
    const rapidApiTrends = await this.fetchRapidAPITrends(country);
    
    // دمج النتائج
    return [...twitterTrends, ...rapidApiTrends];
  }

  private async fetchTwitterTrends(country: string): Promise<TrendingTopic[]> {
    if (!this.twitterBearerToken && !this.twitterApiKey) {
      throw new Error('Twitter API credentials not available');
    }

    try {
      console.log(`جارٍ جلب ترندات Twitter للدولة ${country}...`);
      
      const locationIds: { [key: string]: string } = {
        'SA': '23424938', 'AE': '23424738', 'EG': '23424802',
        'DZ': '23424740', 'MA': '23424893', 'TN': '23424967',
        'LB': '23424873', 'JO': '23424860', 'IQ': '23424855',
        'SY': '23424956', 'YE': '23425002', 'KW': '23424870',
        'QA': '23424930', 'BH': '23424753', 'OM': '23424898',
        'US': '23424977', 'UK': '23424975', 'FR': '23424819',
        'DE': '23424829', 'IT': '23424853', 'ES': '23424950'
      };

      const woeid = locationIds[country] || '1';
      
      // استخدام Bearer Token الجديد
      const authHeader = this.twitterBearerToken 
        ? `Bearer ${this.twitterBearerToken}`
        : `Bearer ${this.twitterApiKey}`;

      const response = await fetch(`https://api.twitter.com/1.1/trends/place.json?id=${woeid}`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'User-Agent': 'HashtagGeneratorBot/1.0',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Twitter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as any;
      
      if (!data || !data[0] || !data[0].trends) {
        console.log(`No Twitter trends found for country ${country}`);
        return [];
      }

      const trends = data[0].trends.slice(0, 15).map((trend: any) => ({
        topic: trend.name.replace('#', ''),
        volume: trend.tweet_volume || Math.random() * 75000 + 25000,
        growth: Math.random() * 60 + 20,
        category: this.categorizeHashtag(trend.name),
        relatedHashtags: [trend.name],
        platforms: ['twitter', 'tiktok'],
        geographic: [country]
      }));

      console.log(`تم جلب ${trends.length} ترند من Twitter`);
      return trends;
      
    } catch (error) {
      throw new Error(`Twitter API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async fetchRapidAPITrends(country: string): Promise<TrendingTopic[]> {
    if (!this.rapidApiKey) {
      throw new Error('RapidAPI key not available');
    }

    const apis = [
      {
        url: `https://tiktok-scraper7.p.rapidapi.com/trend/hashtag?country=${country}`,
        host: 'tiktok-scraper7.p.rapidapi.com'
      },
      {
        url: `https://google-trends12.p.rapidapi.com/trending?geo=${country}&hl=ar`,
        host: 'google-trends12.p.rapidapi.com'
      },
      {
        url: `https://hashtag-generator1.p.rapidapi.com/trending?country=${country}`,
        host: 'hashtag-generator1.p.rapidapi.com'
      }
    ];

    for (const api of apis) {
      try {
        console.log(`🔍 جارٍ جلب البيانات من ${api.host}...`);
        
        const response = await fetch(api.url, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': this.rapidApiKey,
            'X-RapidAPI-Host': api.host,
            'Accept': 'application/json',
            'User-Agent': 'HashtagGenerator/1.0'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const topics = this.parseRapidAPIResponse(data, country, api.host);
          if (topics.length > 0) {
            console.log(`✅ تم جلب ${topics.length} ترند من ${api.host}`);
            return topics;
          }
        } else {
          console.log(`❌ ${api.host} returned ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.log(`❌ ${api.host} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        continue;
      }
    }

    throw new Error('All RapidAPI endpoints failed - please check your RapidAPI key and subscription');
  }

  private parseRapidAPIResponse(data: any, country: string, source: string): TrendingTopic[] {
    const topics: TrendingTopic[] = [];
    
    try {
      // TikTok Scraper format
      if (data.hashtags && Array.isArray(data.hashtags)) {
        topics.push(...data.hashtags.slice(0, 15).map((hashtag: any) => ({
          topic: hashtag.name || hashtag.title || hashtag.hashtag,
          volume: hashtag.count || hashtag.posts || Math.random() * 50000,
          growth: hashtag.growth || Math.random() * 50,
          category: this.categorizeHashtag(hashtag.name || hashtag.title || hashtag.hashtag),
          relatedHashtags: [],
          platforms: ['tiktok'],
          geographic: [country]
        })));
      }
      
      // Google Trends format
      if (data.trending_searches && Array.isArray(data.trending_searches)) {
        topics.push(...data.trending_searches.slice(0, 10).map((item: any) => ({
          topic: item.query || item.title,
          volume: item.formattedTraffic ? parseInt(item.formattedTraffic.replace(/[^0-9]/g, '')) || 0 : Math.random() * 100000,
          growth: Math.random() * 40,
          category: this.categorizeHashtag(item.query || item.title),
          relatedHashtags: [],
          platforms: ['google'],
          geographic: [country]
        })));
      }
      
      // Generic trends format
      if (data.trends && Array.isArray(data.trends)) {
        topics.push(...data.trends.slice(0, 12).map((trend: any) => ({
          topic: trend.title || trend.name || trend.keyword,
          volume: trend.volume || trend.searches || Math.random() * 75000,
          growth: trend.growth || trend.change || Math.random() * 35,
          category: this.categorizeHashtag(trend.title || trend.name || trend.keyword),
          relatedHashtags: [],
          platforms: ['general'],
          geographic: [country]
        })));
      }
      
    } catch (parseError) {
      console.error(`Error parsing ${source} response:`, parseError);
    }
    
    return topics.filter(topic => topic.topic && topic.topic.trim().length > 0);
  }

  private async generateCustomHashtags(
    contentAnalysis: any,
    targetAudience: string,
    country: string
  ): Promise<HashtagSuggestion[]> {
    const hashtags: HashtagSuggestion[] = [];
    const contentType = contentAnalysis.categories?.[0] || 'general';
    
    // توليد هاشتاغات من الكلمات المفتاحية بالعربية والإنجليزية
    const keywords = contentAnalysis.keywords || [];
    keywords.forEach((keyword: string) => {
      // الهاشتاغ العربي
      hashtags.push({
        hashtag: `#${keyword.replace(/\s+/g, '')}`,
        popularity: Math.random() * 100,
        trend: Math.random() > 0.5 ? 'rising' : 'stable',
        category: 'custom',
        relatedTopics: contentAnalysis.themes || [],
        estimatedReach: Math.floor(Math.random() * 50000) + 10000,
        competitiveness: Math.random() > 0.6 ? 'medium' : 'low',
        platforms: ['tiktok', 'instagram', 'twitter'],
        language: this.detectLanguage(keyword)
      });

      // الهاشتاغ الإنجليزي المترجم
      const englishEquivalent = this.translateToEnglish(keyword, contentType);
      if (englishEquivalent && englishEquivalent !== keyword) {
        hashtags.push({
          hashtag: `#${englishEquivalent.replace(/\s+/g, '')}`,
          popularity: Math.random() * 85 + 15,
          trend: Math.random() > 0.4 ? 'rising' : 'stable',
          category: 'custom',
          relatedTopics: contentAnalysis.themes || [],
          estimatedReach: Math.floor(Math.random() * 75000) + 15000,
          competitiveness: 'medium',
          platforms: ['tiktok', 'instagram', 'youtube'],
          language: 'en'
        });
      }
    });

    // توليد هاشتاغات من المواضيع
    const themes = contentAnalysis.themes || [];
    themes.forEach((theme: string) => {
      hashtags.push({
        hashtag: `#${theme.replace(/\s+/g, '')}`,
        popularity: Math.random() * 80 + 20,
        trend: Math.random() > 0.3 ? 'rising' : 'stable',
        category: 'thematic',
        relatedTopics: keywords,
        estimatedReach: Math.floor(Math.random() * 100000) + 20000,
        competitiveness: Math.random() > 0.4 ? 'high' : 'medium',
        platforms: ['tiktok', 'instagram'],
        language: this.detectLanguage(theme)
      });
    });

    // إضافة هاشتاغات إسلامية مخصصة
    if (contentType === 'islamic') {
      const islamicHashtags = this.generateIslamicHashtags();
      hashtags.push(...islamicHashtags);
    }

    return hashtags;
  }

  private translateToEnglish(arabicWord: string, contentType: string): string {
    const translations: { [key: string]: string } = {
      // عام
      'فيديو': 'video', 'محتوى': 'content', 'ترفيه': 'entertainment',
      'تعليم': 'education', 'معرفة': 'knowledge', 'نصائح': 'tips',
      
      // إسلامي
      'إسلام': 'islam', 'قرآن': 'quran', 'حديث': 'hadith',
      'دعوة': 'dawah', 'تذكير': 'reminder', 'آية': 'ayah',
      'سنة': 'sunnah', 'دين': 'religion', 'صلاة': 'prayer',
      
      // باقي التصنيفات
      'طعام': 'food', 'طبخ': 'cooking', 'رياضة': 'sports',
      'سفر': 'travel', 'تقنية': 'technology', 'موضة': 'fashion',
      'كوميديا': 'comedy', 'صحة': 'health', 'أعمال': 'business'
    };
    
    return translations[arabicWord] || arabicWord;
  }

  private generateIslamicHashtags(): HashtagSuggestion[] {
    const islamicHashtags = [
      // عربي وإنجليزي
      { ar: 'إسلام', en: 'Islam' }, { ar: 'قرآن', en: 'Quran' },
      { ar: 'حديث', en: 'Hadith' }, { ar: 'دعوة', en: 'Dawah' },
      { ar: 'تذكير', en: 'Reminder' }, { ar: 'آية_اليوم', en: 'DailyVerse' },
      { ar: 'سنة_نبوية', en: 'Sunnah' }, { ar: 'الله_أكبر', en: 'AllahuAkbar' },
      { ar: 'استغفر_الله', en: 'Astaghfirullah' }, { ar: 'سبحان_الله', en: 'SubhanAllah' }
    ];

    const hashtags: HashtagSuggestion[] = [];
    
    islamicHashtags.forEach(item => {
      // العربي
      hashtags.push({
        hashtag: `#${item.ar}`,
        popularity: Math.random() * 30 + 70,
        trend: 'stable',
        category: 'islamic',
        relatedTopics: ['islam', 'religion'],
        estimatedReach: Math.floor(Math.random() * 100000) + 50000,
        competitiveness: 'low',
        platforms: ['tiktok', 'instagram', 'youtube'],
        language: 'ar'
      });
      
      // الإنجليزي
      hashtags.push({
        hashtag: `#${item.en}`,
        popularity: Math.random() * 25 + 65,
        trend: 'stable',
        category: 'islamic',
        relatedTopics: ['islam', 'religion'],
        estimatedReach: Math.floor(Math.random() * 150000) + 75000,
        competitiveness: 'medium',
        platforms: ['tiktok', 'instagram', 'youtube'],
        language: 'en'
      });
    });
    
    return hashtags;
  }

  private async analyzeTrendingHashtags(
    trendingTopics: TrendingTopic[],
    contentType: string
  ): Promise<HashtagSuggestion[]> {
    return trendingTopics.map(topic => ({
      hashtag: topic.topic.startsWith('#') ? topic.topic : `#${topic.topic}`,
      popularity: Math.min(topic.volume / 1000, 100),
      trend: topic.growth > 50 ? 'rising' : topic.growth > 0 ? 'stable' : 'declining',
      category: 'trending',
      relatedTopics: topic.relatedHashtags,
      estimatedReach: topic.volume,
      competitiveness: topic.volume > 10000 ? 'high' : topic.volume > 1000 ? 'medium' : 'low',
      platforms: topic.platforms,
      language: this.detectLanguage(topic.topic)
    }));
  }

  private async generateNicheHashtags(
    contentAnalysis: any,
    contentType: string
  ): Promise<HashtagSuggestion[]> {
    const nicheHashtagsMap: { [key: string]: string[] } = {
      comedy: ['كوميديا', 'ضحك', 'فكاهة', 'مقالب', 'تمثيل'],
      educational: ['تعليم', 'معلومات', 'ثقافة', 'نصائح', 'تطوير'],
      music: ['موسيقى', 'غناء', 'إيقاع', 'لحن', 'فن'],
      dance: ['رقص', 'حركة', 'إيقاع', 'تحدي_رقص', 'أداء'],
      food: ['طبخ', 'وصفات', 'أكل', 'مطبخ', 'حلويات'],
      travel: ['سفر', 'رحلة', 'استكشاف', 'سياحة', 'مغامرة'],
      fashion: ['موضة', 'أزياء', 'ستايل', 'ملابس', 'اكسسوارات'],
      beauty: ['جمال', 'مكياج', 'عناية', 'بشرة', 'تجميل'],
      sports: ['رياضة', 'تمارين', 'لياقة', 'كرة_قدم', 'تحدي'],
      technology: ['تقنية', 'تكنولوجيا', 'ذكي', 'ابتكار', 'رقمي']
    };

    const keywords = nicheHashtagsMap[contentType] || [];
    
    return keywords.map(keyword => ({
      hashtag: `#${keyword}`,
      popularity: Math.random() * 60 + 20,
      trend: 'stable' as const,
      category: 'niche',
      relatedTopics: [contentType],
      estimatedReach: Math.floor(Math.random() * 30000) + 5000,
      competitiveness: 'low' as const,
      platforms: ['tiktok', 'instagram'],
      language: 'ar' as const
    }));
  }

  private async generateBroadHashtags(
    contentType: string,
    country: string
  ): Promise<HashtagSuggestion[]> {
    const broadHashtags = [
      'فيديو', 'ترند', 'فيروسي', 'اكسبلور', 'لايك',
      'تحدي', 'ترفيه', 'مشاركة', 'متابعة', 'انتشار'
    ];

    // إضافة هاشتاغات خاصة بالدولة
    const countryHashtags: { [key: string]: string[] } = {
      // الدول العربية
      'SA': ['السعودية', 'الرياض', 'جدة', 'الخليج', 'المملكة'],
      'AE': ['الإمارات', 'دبي', 'أبوظبي', 'الخليج', 'الشارقة'],
      'EG': ['مصر', 'القاهرة', 'الإسكندرية', 'المحروسة', 'النيل'],
      'MA': ['المغرب', 'الرباط', 'الدار_البيضاء', 'المغاربة', 'المغرب_العربي'],
      'JO': ['الأردن', 'عمان', 'البتراء', 'الأردنيون', 'الهاشمية'],
      'LB': ['لبنان', 'بيروت', 'اللبنانيون', 'الأرز', 'بلاد_الأرز'],
      'SY': ['سوريا', 'دمشق', 'حلب', 'السوريون', 'الشام'],
      'IQ': ['العراق', 'بغداد', 'البصرة', 'العراقيون', 'الرافدين'],
      'KW': ['الكويت', 'الكويت_سيتي', 'الكويتيون', 'الخليج', 'البترول'],
      'QA': ['قطر', 'الدوحة', 'القطريون', 'الخليج', 'كأس_العالم'],
      'BH': ['البحرين', 'المنامة', 'البحرينيون', 'الخليج', 'اللؤلؤ'],
      'OM': ['عمان', 'مسقط', 'العمانيون', 'الخليج', 'سلطنة_عمان'],
      'YE': ['اليمن', 'صنعاء', 'عدن', 'اليمنيون', 'السعيد'],
      'DZ': ['الجزائر', 'الجزائر_العاصمة', 'وهران', 'الجزائريون', 'المليون_شهيد'],
      'TN': ['تونس', 'تونس_العاصمة', 'التونسيون', 'الخضراء', 'قرطاج'],
      'LY': ['ليبيا', 'طرابلس', 'بنغازي', 'الليبيون', 'الصحراء'],
      'SD': ['السودان', 'الخرطوم', 'السودانيون', 'النيل', 'أم_درمان'],
      'SO': ['الصومال', 'مقديشو', 'الصوماليون', 'القرن_الأفريقي', 'الصومال_الكبير'],
      'DJ': ['جيبوتي', 'جيبوتي_سيتي', 'الجيبوتيون', 'القرن_الأفريقي', 'البحر_الأحمر'],
      'KM': ['جزر_القمر', 'موروني', 'القمريون', 'المحيط_الهندي', 'الجزر'],
      'MR': ['موريتانيا', 'نواكشوط', 'الموريتانيون', 'الصحراء', 'شنقيط'],
      'PS': ['فلسطين', 'القدس', 'غزة', 'الفلسطينيون', 'الأقصى'],
      
      // أوروبا
      'UK': ['uk', 'london', 'british', 'england', 'scotland'],
      'FR': ['france', 'paris', 'french', 'eiffel', 'bordeaux'],
      'DE': ['germany', 'berlin', 'german', 'munich', 'hamburg'],
      'IT': ['italy', 'rome', 'italian', 'milan', 'venice'],
      'ES': ['spain', 'madrid', 'spanish', 'barcelona', 'valencia'],
      'NL': ['netherlands', 'amsterdam', 'dutch', 'holland', 'rotterdam'],
      'BE': ['belgium', 'brussels', 'belgian', 'antwerp', 'ghent'],
      'CH': ['switzerland', 'zurich', 'swiss', 'geneva', 'bern'],
      'AT': ['austria', 'vienna', 'austrian', 'salzburg', 'innsbruck'],
      'SE': ['sweden', 'stockholm', 'swedish', 'gothenburg', 'malmö'],
      'NO': ['norway', 'oslo', 'norwegian', 'bergen', 'trondheim'],
      'DK': ['denmark', 'copenhagen', 'danish', 'aarhus', 'odense'],
      'FI': ['finland', 'helsinki', 'finnish', 'tampere', 'turku'],
      'PL': ['poland', 'warsaw', 'polish', 'krakow', 'gdansk'],
      'CZ': ['czech', 'prague', 'bohemia', 'brno', 'ostrava'],
      'HU': ['hungary', 'budapest', 'hungarian', 'debrecen', 'szeged'],
      'RO': ['romania', 'bucharest', 'romanian', 'cluj', 'timisoara'],
      'BG': ['bulgaria', 'sofia', 'bulgarian', 'plovdiv', 'varna'],
      'GR': ['greece', 'athens', 'greek', 'thessaloniki', 'patras'],
      'PT': ['portugal', 'lisbon', 'portuguese', 'porto', 'braga'],
      'IE': ['ireland', 'dublin', 'irish', 'cork', 'galway'],
      'HR': ['croatia', 'zagreb', 'croatian', 'split', 'rijeka'],
      'SI': ['slovenia', 'ljubljana', 'slovenian', 'maribor', 'celje'],
      'SK': ['slovakia', 'bratislava', 'slovak', 'kosice', 'presov'],
      'EE': ['estonia', 'tallinn', 'estonian', 'tartu', 'narva'],
      'LV': ['latvia', 'riga', 'latvian', 'daugavpils', 'liepaja'],
      'LT': ['lithuania', 'vilnius', 'lithuanian', 'kaunas', 'klaipeda'],
      'LU': ['luxembourg', 'luxembourgish', 'differdange', 'esch'],
      'MT': ['malta', 'valletta', 'maltese', 'birkirkara', 'mosta'],
      'CY': ['cyprus', 'nicosia', 'cypriot', 'limassol', 'larnaca'],
      
      // آسيا
      'CN': ['china', 'beijing', 'chinese', 'shanghai', 'guangzhou'],
      'JP': ['japan', 'tokyo', 'japanese', 'osaka', 'kyoto'],
      'KR': ['korea', 'seoul', 'korean', 'busan', 'incheon'],
      'IN': ['india', 'delhi', 'indian', 'mumbai', 'bangalore'],
      'ID': ['indonesia', 'jakarta', 'indonesian', 'surabaya', 'medan'],
      'MY': ['malaysia', 'kuala_lumpur', 'malaysian', 'penang', 'johor'],
      'SG': ['singapore', 'singaporean', 'marina_bay', 'sentosa', 'orchard'],
      'TH': ['thailand', 'bangkok', 'thai', 'phuket', 'chiang_mai'],
      'VN': ['vietnam', 'hanoi', 'vietnamese', 'ho_chi_minh', 'da_nang'],
      'PH': ['philippines', 'manila', 'filipino', 'cebu', 'davao'],
      'BD': ['bangladesh', 'dhaka', 'bangladeshi', 'chittagong', 'sylhet'],
      'PK': ['pakistan', 'islamabad', 'pakistani', 'karachi', 'lahore'],
      'LK': ['sri_lanka', 'colombo', 'sri_lankan', 'kandy', 'galle'],
      'MM': ['myanmar', 'yangon', 'burmese', 'mandalay', 'naypyidaw'],
      'KH': ['cambodia', 'phnom_penh', 'cambodian', 'siem_reap', 'battambang'],
      'LA': ['laos', 'vientiane', 'lao', 'luang_prabang', 'savannakhet'],
      'NP': ['nepal', 'kathmandu', 'nepali', 'pokhara', 'lalitpur'],
      'BT': ['bhutan', 'thimphu', 'bhutanese', 'paro', 'punakha'],
      'MN': ['mongolia', 'ulaanbaatar', 'mongolian', 'erdenet', 'darkhan'],
      'KZ': ['kazakhstan', 'nur_sultan', 'kazakh', 'almaty', 'shymkent'],
      'UZ': ['uzbekistan', 'tashkent', 'uzbek', 'samarkand', 'bukhara'],
      'TM': ['turkmenistan', 'ashgabat', 'turkmen', 'turkmenbashi', 'mary'],
      'KG': ['kyrgyzstan', 'bishkek', 'kyrgyz', 'osh', 'jalal_abad'],
      'TJ': ['tajikistan', 'dushanbe', 'tajik', 'khujand', 'kulob'],
      'AF': ['afghanistan', 'kabul', 'afghan', 'kandahar', 'herat'],
      'IR': ['iran', 'tehran', 'iranian', 'mashhad', 'isfahan'],
      'TR': ['turkey', 'ankara', 'turkish', 'istanbul', 'izmir'],
      'IL': ['israel', 'jerusalem', 'israeli', 'tel_aviv', 'haifa'],
      'GE': ['georgia', 'tbilisi', 'georgian', 'batumi', 'kutaisi'],
      'AM': ['armenia', 'yerevan', 'armenian', 'gyumri', 'vanadzor'],
      'AZ': ['azerbaijan', 'baku', 'azerbaijani', 'ganja', 'sumqayit'],
      
      // أمريكا
      'US': ['america', 'usa', 'trending', 'viral', 'newyork'],
      'CA': ['canada', 'toronto', 'canadian', 'vancouver', 'montreal'],
      'MX': ['mexico', 'mexico_city', 'mexican', 'guadalajara', 'monterrey'],
      'BR': ['brazil', 'brasilia', 'brazilian', 'sao_paulo', 'rio'],
      'AR': ['argentina', 'buenos_aires', 'argentinian', 'cordoba', 'rosario'],
      'CL': ['chile', 'santiago', 'chilean', 'valparaiso', 'concepcion'],
      'PE': ['peru', 'lima', 'peruvian', 'arequipa', 'trujillo'],
      'CO': ['colombia', 'bogota', 'colombian', 'medellin', 'cali'],
      'VE': ['venezuela', 'caracas', 'venezuelan', 'maracaibo', 'valencia'],
      'EC': ['ecuador', 'quito', 'ecuadorian', 'guayaquil', 'cuenca'],
      'BO': ['bolivia', 'la_paz', 'bolivian', 'santa_cruz', 'cochabamba'],
      'PY': ['paraguay', 'asuncion', 'paraguayan', 'ciudad_del_este', 'san_lorenzo'],
      'UY': ['uruguay', 'montevideo', 'uruguayan', 'salto', 'paysandu'],
      'GY': ['guyana', 'georgetown', 'guyanese', 'linden', 'new_amsterdam'],
      'SR': ['suriname', 'paramaribo', 'surinamese', 'lelydorp', 'nieuw_nickerie'],
      
      // أفريقيا
      'ZA': ['south_africa', 'cape_town', 'south_african', 'johannesburg', 'durban'],
      'NG': ['nigeria', 'abuja', 'nigerian', 'lagos', 'kano'],
      'KE': ['kenya', 'nairobi', 'kenyan', 'mombasa', 'kisumu'],
      'GH': ['ghana', 'accra', 'ghanaian', 'kumasi', 'tamale'],
      'ET': ['ethiopia', 'addis_ababa', 'ethiopian', 'dire_dawa', 'mekelle'],
      'TZ': ['tanzania', 'dodoma', 'tanzanian', 'dar_es_salaam', 'mwanza'],
      'UG': ['uganda', 'kampala', 'ugandan', 'gulu', 'lira'],
      'RW': ['rwanda', 'kigali', 'rwandan', 'butare', 'gitarama'],
      'MW': ['malawi', 'lilongwe', 'malawian', 'blantyre', 'mzuzu'],
      'ZM': ['zambia', 'lusaka', 'zambian', 'kitwe', 'ndola'],
      'ZW': ['zimbabwe', 'harare', 'zimbabwean', 'bulawayo', 'chitungwiza'],
      'BW': ['botswana', 'gaborone', 'botswanan', 'francistown', 'molepolole'],
      'NA': ['namibia', 'windhoek', 'namibian', 'swakopmund', 'rundu'],
      'SZ': ['eswatini', 'mbabane', 'swazi', 'manzini', 'lobamba'],
      'LS': ['lesotho', 'maseru', 'basotho', 'teyateyaneng', 'mafeteng'],
      'MZ': ['mozambique', 'maputo', 'mozambican', 'beira', 'nampula'],
      'MG': ['madagascar', 'antananarivo', 'malagasy', 'toamasina', 'antsirabe'],
      'MU': ['mauritius', 'port_louis', 'mauritian', 'beau_bassin', 'vacoas'],
      'SC': ['seychelles', 'victoria', 'seychellois', 'anse_boileau', 'beau_vallon'],
      
      // أوقيانوسيا
      'AU': ['australia', 'canberra', 'australian', 'sydney', 'melbourne'],
      'NZ': ['new_zealand', 'wellington', 'kiwi', 'auckland', 'christchurch'],
      'FJ': ['fiji', 'suva', 'fijian', 'lautoka', 'nadi'],
      'PG': ['papua_new_guinea', 'port_moresby', 'papua', 'lae', 'mount_hagen'],
      'SB': ['solomon_islands', 'honiara', 'solomon', 'gizo', 'auki'],
      'VU': ['vanuatu', 'port_vila', 'ni_vanuatu', 'luganville', 'isangel'],
      'NC': ['new_caledonia', 'noumea', 'caledonian', 'mont_dore', 'dumbea'],
      'PF': ['french_polynesia', 'papeete', 'tahitian', 'faaa', 'punaauia']
    };

    const countrySpecific = countryHashtags[country] || [];
    const allBroadHashtags = [...broadHashtags, ...countrySpecific];

    return allBroadHashtags.map(hashtag => ({
      hashtag: `#${hashtag}`,
      popularity: Math.random() * 90 + 10,
      trend: 'stable' as const,
      category: 'broad',
      relatedTopics: [contentType, country],
      estimatedReach: Math.floor(Math.random() * 200000) + 50000,
      competitiveness: 'high' as const,
      platforms: ['tiktok', 'instagram', 'twitter'],
      language: this.detectLanguage(hashtag)
    }));
  }

  private removeDuplicateHashtags(hashtags: HashtagSuggestion[]): HashtagSuggestion[] {
    const seen = new Set<string>();
    return hashtags.filter(hashtag => {
      const key = hashtag.hashtag.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private rankHashtags(hashtags: HashtagSuggestion[], contentAnalysis: any): HashtagSuggestion[] {
    return hashtags.sort((a, b) => {
      // نقاط الترتيب بناء على عوامل متعددة
      const scoreA = this.calculateHashtagScore(a, contentAnalysis);
      const scoreB = this.calculateHashtagScore(b, contentAnalysis);
      return scoreB - scoreA;
    });
  }

  private calculateHashtagScore(hashtag: HashtagSuggestion, contentAnalysis: any): number {
    let score = hashtag.popularity;
    
    // زيادة النقاط للهاشتاغات الرائجة
    if (hashtag.trend === 'rising') score += 20;
    else if (hashtag.trend === 'stable') score += 10;
    
    // تقليل النقاط للمنافسة العالية
    if (hashtag.competitiveness === 'high') score -= 15;
    else if (hashtag.competitiveness === 'medium') score -= 5;
    
    // زيادة النقاط للهاشتاغات المخصصة والمتخصصة
    if (hashtag.category === 'custom') score += 25;
    else if (hashtag.category === 'niche') score += 15;
    else if (hashtag.category === 'trending') score += 30;
    
    // تفضيل الهاشتاغات العربية في المحتوى العربي
    if (hashtag.language === 'ar') score += 10;
    
    return score;
  }

  private calculateConfidence(hashtags: HashtagSuggestion[]): number {
    if (hashtags.length === 0) return 0;
    
    const avgPopularity = hashtags.reduce((sum, h) => sum + h.popularity, 0) / hashtags.length;
    const trendingCount = hashtags.filter(h => h.trend === 'rising').length;
    const customCount = hashtags.filter(h => h.category === 'custom').length;
    
    const confidence = (avgPopularity * 0.4) + (trendingCount * 5) + (customCount * 3);
    return Math.min(confidence, 100);
  }

  private categorizeHashtag(hashtag: string): string {
    const categories = {
      entertainment: ['fun', 'funny', 'laugh', 'comedy', 'entertainment'],
      sports: ['sport', 'football', 'soccer', 'basketball', 'tennis'],
      music: ['music', 'song', 'beat', 'dance', 'rhythm'],
      food: ['food', 'recipe', 'cooking', 'eat', 'delicious'],
      fashion: ['fashion', 'style', 'outfit', 'clothes', 'wear'],
      technology: ['tech', 'technology', 'ai', 'smart', 'digital']
    };
    
    const lowerHashtag = hashtag.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerHashtag.includes(keyword))) {
        return category;
      }
    }
    
    return 'general';
  }

  private detectLanguage(text: string): 'ar' | 'en' | 'mixed' {
    const arabicPattern = /[\u0600-\u06FF]/;
    const englishPattern = /[a-zA-Z]/;
    
    const hasArabic = arabicPattern.test(text);
    const hasEnglish = englishPattern.test(text);
    
    if (hasArabic && hasEnglish) return 'mixed';
    if (hasArabic) return 'ar';
    if (hasEnglish) return 'en';
    return 'mixed';
  }

  private getFallbackContentAnalysis(videoContent: string, contentType: string): any {
    console.log('📊 استخدام التحليل المحلي المتقدم...');
    
    // تحليل النص والكلمات المفتاحية
    const arabicWords = videoContent.match(/[\u0600-\u06FF]+/g) || [];
    const englishWords = videoContent.match(/[a-zA-Z]+/g) || [];
    const allWords = [...arabicWords, ...englishWords].filter(word => word.length > 2);
    
    const keywords = allWords.slice(0, 8);
    
    const themeMap: { [key: string]: string[] } = {
      comedy: ['فكاهة', 'ضحك', 'كوميديا', 'مرح', 'تسلية'],
      educational: ['تعليم', 'معرفة', 'نصائح', 'شرح', 'دروس'],
      islamic: ['إسلام', 'دين', 'قرآن', 'سنة', 'دعوة', 'تذكير', 'حديث', 'آية'],
      music: ['موسيقى', 'غناء', 'فن', 'إيقاع', 'لحن'],
      food: ['طعام', 'طبخ', 'وصفات', 'أكل', 'مطبخ'],
      travel: ['سفر', 'رحلة', 'استكشاف', 'سياحة', 'مغامرة'],
      sports: ['رياضة', 'تمارين', 'لياقة', 'كرة', 'بطولة'],
      fashion: ['موضة', 'أزياء', 'ستايل', 'ملابس', 'جمال'],
      technology: ['تقنية', 'تكنولوجيا', 'ذكي', 'رقمي', 'ابتكار'],
      health: ['صحة', 'طب', 'علاج', 'وقاية', 'لياقة'],
      business: ['أعمال', 'تجارة', 'ريادة', 'استثمار', 'نجاح'],
      art: ['فن', 'إبداع', 'رسم', 'تصميم', 'جمال']
    };
    
    const themes = themeMap[contentType] || ['عام', 'محتوى', 'فيديو'];
    
    // تحليل المشاعر بناءً على الكلمات
    const positiveWords = ['جميل', 'رائع', 'ممتاز', 'مذهل', 'good', 'amazing', 'great'];
    const negativeWords = ['سيء', 'فظيع', 'bad', 'terrible', 'awful'];
    
    const hasPositive = positiveWords.some(word => videoContent.toLowerCase().includes(word));
    const hasNegative = negativeWords.some(word => videoContent.toLowerCase().includes(word));
    
    let emotions = ['محايد'];
    if (hasPositive) emotions = ['إيجابي', 'سعيد', 'متحمس'];
    if (hasNegative) emotions = ['سلبي', 'حزين', 'غاضب'];
    
    // تحديد الطاقة بناءً على طول النص ونوع المحتوى
    let energy = 'متوسطة';
    if (contentType === 'dance' || contentType === 'comedy') energy = 'عالية';
    if (contentType === 'educational' || videoContent.length > 200) energy = 'هادئة';
    
    return {
      keywords,
      themes,
      emotions,
      energy,
      audience: this.determineAudience(contentType, videoContent),
      categories: [contentType, 'ترفيه', 'محتوى'],
      tone: hasPositive ? 'إيجابية' : hasNegative ? 'سلبية' : 'محايدة',
      style: this.determineStyle(contentType, videoContent)
    };
  }

  private determineAudience(contentType: string, videoContent: string): string {
    const audienceMap: { [key: string]: string } = {
      comedy: 'جمهور عام - محبي الكوميديا',
      educational: 'طلاب ومهتمين بالتعلم',
      music: 'محبي الموسيقى والفن',
      food: 'محبي الطعام والطبخ',
      travel: 'عشاق السفر والمغامرة',
      sports: 'محبي الرياضة واللياقة',
      fashion: 'مهتمين بالموضة والجمال',
      technology: 'مهتمين بالتكنولوجيا'
    };
    
    return audienceMap[contentType] || 'جمهور عام';
  }

  private determineStyle(contentType: string, videoContent: string): string {
    if (videoContent.includes('نصيحة') || videoContent.includes('tip')) return 'تعليمي';
    if (videoContent.includes('مرح') || videoContent.includes('fun')) return 'ترفيهي';
    if (videoContent.includes('جديد') || videoContent.includes('new')) return 'إخباري';
    
    const styleMap: { [key: string]: string } = {
      comedy: 'فكاهي',
      educational: 'تعليمي',
      music: 'فني',
      food: 'عملي',
      travel: 'استكشافي',
      sports: 'تحفيزي',
      fashion: 'أنيق',
      technology: 'تقني'
    };
    
    return styleMap[contentType] || 'عام';
  }

  private parseAIResponse(content: string): any {
    const keywords: string[] = [];
    const themes: string[] = [];
    
    const keywordMatch = content.match(/keywords?[:\-\s]*(.*?)(?:\n|$)/i);
    if (keywordMatch) {
      keywords.push(...keywordMatch[1].split(/[,،]/));
    }
    
    const themeMatch = content.match(/themes?[:\-\s]*(.*?)(?:\n|$)/i);
    if (themeMatch) {
      themes.push(...themeMatch[1].split(/[,،]/));
    }
    
    return {
      keywords: keywords.map(k => k.trim()).filter(k => k),
      themes: themes.map(t => t.trim()).filter(t => t),
      emotions: ['متوسط'],
      energy: 'متوسط',
      audience: 'عام',
      categories: ['عام']
    };
  }

  async checkAPIStatus(): Promise<{
    openai: boolean;
    rapidapi: boolean;
    twitter: boolean;
    summary: string;
  }> {
    const openai = !!this.openaiApiKey;
    const rapidapi = !!this.rapidApiKey;
    const twitter = !!(this.twitterBearerToken || this.twitterApiKey);
    
    const availableApis = [openai, rapidapi, twitter].filter(Boolean).length;
    const summary = `${availableApis}/3 APIs متاحة - Twitter Bearer Token: ${this.twitterBearerToken ? 'متصل' : 'غير متصل'}`;
    
    return { openai, rapidapi, twitter, summary };
  }
}

export const trendingHashtagGenerator = new TrendingHashtagGenerator();