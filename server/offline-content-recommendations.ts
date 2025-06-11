interface ContentRecommendation {
  title: string;
  description: string;
  category: string;
  tags: string[];
  targetAudience: string;
  estimatedViews: number;
  trendingScore: number;
  platformSuitability: {
    tiktok: number;
    youtube: number;
    instagram: number;
    facebook: number;
  };
  contentType: string;
  urgency: 'low' | 'medium' | 'high';
  seasonality: string;
  competitorAnalysis: string;
  keyHashtags: string[];
  optimalPostingTime: string;
  contentPillars: string[];
}

interface TrendAnalysis {
  trendingTopics: string[];
  emergingKeywords: string[];
  competitorContent: string[];
  seasonalOpportunities: string[];
  viralPotential: number;
}

export class OfflineContentRecommendations {
  private contentDatabase = {
    technology: {
      arabic: [
        {
          title: "أحدث تطبيقات الذكاء الاصطناعي في حياتنا اليومية",
          description: "استكشف كيف يغير الذكاء الاصطناعي طريقة عملنا وحياتنا من خلال التطبيقات العملية",
          category: "تكنولوجيا",
          tags: ["ذكاء اصطناعي", "تطبيقات", "تكنولوجيا"],
          keyHashtags: ["الذكاء_الاصطناعي", "تكنولوجيا", "ابتكار", "مستقبل"]
        },
        {
          title: "مراجعة أفضل الهواتف الذكية لعام 2024",
          description: "دليل شامل لأفضل الهواتف الذكية مع المقارنات والأسعار",
          category: "تكنولوجيا",
          tags: ["هواتف ذكية", "مراجعة", "تقنية"],
          keyHashtags: ["هواتف", "تقنية", "مراجعة", "جوال"]
        }
      ],
      english: [
        {
          title: "AI Revolution: How Machine Learning is Changing Industries",
          description: "Explore the transformative impact of AI across various sectors",
          category: "Technology",
          tags: ["AI", "machine learning", "innovation"],
          keyHashtags: ["AI", "MachineLearning", "Tech", "Innovation"]
        }
      ]
    },
    entertainment: {
      arabic: [
        {
          title: "أفضل الأفلام والمسلسلات لموسم 2024",
          description: "قائمة بأجدد الأعمال الفنية التي يجب مشاهدتها",
          category: "ترفيه",
          tags: ["أفلام", "مسلسلات", "ترفيه"],
          keyHashtags: ["أفلام", "مسلسلات", "ترفيه", "سينما"]
        },
        {
          title: "تحدي الطبخ: وصفات سريعة وسهلة",
          description: "تعلم طبخ أشهى الوجبات في دقائق معدودة",
          category: "طبخ",
          tags: ["طبخ", "وصفات", "طعام"],
          keyHashtags: ["طبخ", "وصفات", "طعام", "تحدي"]
        }
      ]
    },
    lifestyle: {
      arabic: [
        {
          title: "نصائح للحصول على نمط حياة صحي ومتوازن",
          description: "دليل شامل للعادات الصحية والتوازن بين العمل والحياة",
          category: "نمط حياة",
          tags: ["صحة", "نمط حياة", "توازن"],
          keyHashtags: ["صحة", "نمط_حياة", "رياضة", "صحي"]
        }
      ]
    },
    business: {
      arabic: [
        {
          title: "استراتيجيات نجاح المشاريع الصغيرة في العصر الرقمي",
          description: "كيفية بناء وتطوير مشروعك الصغير باستخدام الأدوات الرقمية",
          category: "أعمال",
          tags: ["ريادة أعمال", "مشاريع صغيرة", "تسويق رقمي"],
          keyHashtags: ["ريادة_أعمال", "مشاريع", "تسويق", "نجاح"]
        }
      ]
    }
  };

  private trendingTopics = {
    current: [
      "الذكاء الاصطناعي",
      "التجارة الإلكترونية", 
      "العملات الرقمية",
      "الصحة النفسية",
      "الاستدامة البيئية",
      "العمل عن بُعد",
      "المؤثرين الرقميين",
      "الطبخ المنزلي",
      "اللياقة البدنية",
      "التعليم الرقمي"
    ],
    seasonal: [
      "موسم العطلات",
      "العودة للمدارس", 
      "الصيف والسفر",
      "رمضان والعيد",
      "نهاية العام"
    ]
  };

  generateRecommendations(
    niche: string = "general",
    audience: string = "broad audience", 
    count: number = 5
  ): {
    recommendations: ContentRecommendation[];
    trendAnalysis: TrendAnalysis;
    competitorInsights: string[];
  } {
    const recommendations = this.createRecommendations(niche, audience, count);
    const trendAnalysis = this.generateTrendAnalysis();
    const competitorInsights = this.generateCompetitorInsights(niche);

    return {
      recommendations,
      trendAnalysis,
      competitorInsights
    };
  }

  private createRecommendations(niche: string, audience: string, count: number): ContentRecommendation[] {
    const recommendations: ContentRecommendation[] = [];
    const nicheData = this.contentDatabase[niche as keyof typeof this.contentDatabase]?.arabic || this.contentDatabase.technology.arabic;

    for (let i = 0; i < count; i++) {
      const baseContent = nicheData[i % nicheData.length];
      const recommendation: ContentRecommendation = {
        ...baseContent,
        targetAudience: audience,
        estimatedViews: Math.floor(Math.random() * 500000) + 50000,
        trendingScore: Math.floor(Math.random() * 40) + 60,
        platformSuitability: {
          tiktok: Math.floor(Math.random() * 30) + 70,
          youtube: Math.floor(Math.random() * 30) + 65,
          instagram: Math.floor(Math.random() * 30) + 75,
          facebook: Math.floor(Math.random() * 30) + 60
        },
        contentType: this.getContentType(niche),
        urgency: this.getUrgency(),
        seasonality: this.getSeasonality(),
        competitorAnalysis: this.generateCompetitorAnalysis(niche),
        optimalPostingTime: this.getOptimalPostingTime(audience),
        contentPillars: this.getContentPillars(niche)
      };

      recommendations.push(recommendation);
    }

    return recommendations;
  }

  private generateTrendAnalysis(): TrendAnalysis {
    return {
      trendingTopics: this.trendingTopics.current.slice(0, 8),
      emergingKeywords: [
        "التحول الرقمي",
        "الواقع المعزز", 
        "البودكاست العربي",
        "التسوق الاجتماعي",
        "المحتوى القصير"
      ],
      competitorContent: [
        "الفيديوهات التعليمية قصيرة المدى",
        "المحتوى التفاعلي والاستطلاعات",
        "القصص الشخصية والتجارب",
        "المراجعات والمقارنات",
        "النصائح العملية والسريعة"
      ],
      seasonalOpportunities: this.trendingTopics.seasonal,
      viralPotential: 0.75 + Math.random() * 0.2
    };
  }

  private generateCompetitorInsights(niche: string): string[] {
    const insights = {
      technology: [
        "المنافسون يركزون على المحتوى التعليمي المبسط",
        "زيادة في محتوى المراجعات المرئية",
        "اتجاه نحو المحتوى التفاعلي والبث المباشر"
      ],
      entertainment: [
        "المحتوى الكوميدي قصير المدى يحقق أعلى تفاعل",
        "التعاون مع المؤثرين يزيد من الوصول",
        "المحتوى الموسمي يحقق نتائج ممتازة"
      ],
      lifestyle: [
        "النصائح العملية والسريعة تحقق انتشاراً واسعاً",
        "المحتوى الصحي والرياضي في نمو مستمر",
        "قصص التحول الشخصي تجذب الجمهور"
      ]
    };

    return insights[niche as keyof typeof insights] || insights.technology;
  }

  private getContentType(niche: string): string {
    const types = {
      technology: "فيديو تعليمي",
      entertainment: "محتوى ترفيهي", 
      lifestyle: "نصائح وإرشادات",
      business: "محتوى تعليمي"
    };
    return types[niche as keyof typeof types] || "محتوى متنوع";
  }

  private getUrgency(): 'low' | 'medium' | 'high' {
    const urgencies: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    return urgencies[Math.floor(Math.random() * urgencies.length)];
  }

  private getSeasonality(): string {
    const seasons = [
      "مناسب طوال العام",
      "موسمي - شتاء",
      "موسمي - صيف", 
      "المناسبات الخاصة",
      "بداية العام"
    ];
    return seasons[Math.floor(Math.random() * seasons.length)];
  }

  private generateCompetitorAnalysis(niche: string): string {
    const analyses = {
      technology: "المنافسون يركزون على المحتوى التقني المتقدم، فرصة للمحتوى المبسط",
      entertainment: "السوق مشبع بالمحتوى الكوميدي، فرصة للمحتوى التعليمي الممتع",
      lifestyle: "تركيز عالي على النصائح الصحية، فرصة للمحتوى النفسي والاجتماعي"
    };
    return analyses[niche as keyof typeof analyses] || "تحليل السوق يظهر فرص نمو جيدة";
  }

  private getOptimalPostingTime(audience: string): string {
    const times = {
      teenagers: "بعد الظهر (3-6 مساءً)",
      "young adults": "المساء (7-10 مساءً)",
      adults: "الصباح (8-11 صباحاً)",
      professionals: "أوقات الراحة (12-2 ظهراً)"
    };
    return times[audience as keyof typeof times] || "أوقات الذروة (6-9 مساءً)";
  }

  private getContentPillars(niche: string): string[] {
    const pillars = {
      technology: ["تعليم", "مراجعات", "أخبار تقنية", "نصائح"],
      entertainment: ["كوميديا", "مراجعات", "تحديات", "موسيقى"],
      lifestyle: ["صحة", "جمال", "رياضة", "تطوير شخصي"],
      business: ["ريادة أعمال", "تسويق", "مبيعات", "قيادة"]
    };
    return pillars[niche as keyof typeof pillars] || ["محتوى عام", "تعليم", "ترفيه"];
  }
}

export const offlineContentRecommendations = new OfflineContentRecommendations();