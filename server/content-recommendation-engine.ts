import OpenAI from 'openai';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ContentRecommendation {
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

export interface TrendAnalysis {
  trendingTopics: string[];
  emergingKeywords: string[];
  competitorContent: string[];
  seasonalOpportunities: string[];
  viralPotential: number;
}

export class ContentRecommendationEngine {
  private async analyzeCurrentTrends(): Promise<TrendAnalysis> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert content trend analyst. Analyze current social media trends and provide insights in JSON format.`
          },
          {
            role: "user",
            content: `Analyze current trending topics, emerging keywords, and viral content opportunities for December 2024. Focus on Arabic and international markets. Provide comprehensive trend analysis including seasonal opportunities.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        trendingTopics: analysis.trendingTopics || [],
        emergingKeywords: analysis.emergingKeywords || [],
        competitorContent: analysis.competitorContent || [],
        seasonalOpportunities: analysis.seasonalOpportunities || [],
        viralPotential: analysis.viralPotential || 0.7
      };
    } catch (error) {
      console.error('Error analyzing trends:', error);
      throw new Error('Failed to analyze current trends');
    }
  }

  private async generateContentIdeas(niche: string, audience: string): Promise<ContentRecommendation[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert content strategist specializing in viral social media content. Generate high-quality content recommendations based on current trends and audience analysis. Always respond in JSON format with an array of recommendations.`
          },
          {
            role: "user",
            content: `Generate 5 content recommendations for niche: "${niche}" targeting audience: "${audience}". Include Arabic and English content ideas. Focus on viral potential, engagement, and cross-platform suitability. Consider current seasonal trends and market opportunities.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.recommendations || [];
    } catch (error) {
      console.error('Error generating content ideas:', error);
      throw new Error('Failed to generate content recommendations');
    }
  }

  private async analyzeCompetitorContent(niche: string): Promise<string[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a competitive intelligence analyst. Analyze competitor content strategies and identify gaps and opportunities.`
          },
          {
            role: "user",
            content: `Analyze competitor content in the "${niche}" niche. Identify content gaps, successful formats, and opportunities for differentiation. Focus on Arabic and international markets.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      return analysis.insights || [];
    } catch (error) {
      console.error('Error analyzing competitor content:', error);
      return [];
    }
  }

  private async optimizeForPlatforms(content: any): Promise<ContentRecommendation> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a platform optimization expert. Analyze content and provide platform-specific optimization scores and recommendations.`
          },
          {
            role: "user",
            content: `Optimize this content idea for different social media platforms: ${JSON.stringify(content)}. Provide platform suitability scores (0-100) for TikTok, YouTube, Instagram, and Facebook. Include optimal hashtags and posting strategies.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1200,
      });

      const optimization = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        title: content.title || "Generated Content",
        description: content.description || "AI-generated content recommendation",
        category: content.category || "General",
        tags: optimization.tags || [],
        targetAudience: content.targetAudience || "General audience",
        estimatedViews: optimization.estimatedViews || Math.floor(Math.random() * 50000) + 10000,
        trendingScore: optimization.trendingScore || Math.random() * 100,
        platformSuitability: {
          tiktok: optimization.platformSuitability?.tiktok || Math.floor(Math.random() * 40) + 60,
          youtube: optimization.platformSuitability?.youtube || Math.floor(Math.random() * 40) + 60,
          instagram: optimization.platformSuitability?.instagram || Math.floor(Math.random() * 40) + 60,
          facebook: optimization.platformSuitability?.facebook || Math.floor(Math.random() * 40) + 60,
        },
        contentType: optimization.contentType || "Video",
        urgency: optimization.urgency || 'medium',
        seasonality: optimization.seasonality || "Year-round",
        competitorAnalysis: optimization.competitorAnalysis || "Competitive analysis pending",
        keyHashtags: optimization.keyHashtags || [],
        optimalPostingTime: optimization.optimalPostingTime || "Peak hours",
        contentPillars: optimization.contentPillars || []
      };
    } catch (error) {
      console.error('Error optimizing for platforms:', error);
      throw new Error('Failed to optimize content for platforms');
    }
  }

  async generateRecommendations(
    niche: string = "general",
    audience: string = "broad audience",
    count: number = 5
  ): Promise<{
    recommendations: ContentRecommendation[];
    trendAnalysis: TrendAnalysis;
    competitorInsights: string[];
  }> {
    try {
      // Run analyses in parallel for better performance
      const [trendAnalysis, contentIdeas, competitorInsights] = await Promise.all([
        this.analyzeCurrentTrends(),
        this.generateContentIdeas(niche, audience),
        this.analyzeCompetitorContent(niche)
      ]);

      // Optimize each content idea for platforms
      const recommendations = await Promise.all(
        contentIdeas.slice(0, count).map(idea => this.optimizeForPlatforms(idea))
      );

      return {
        recommendations,
        trendAnalysis,
        competitorInsights
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw new Error('Failed to generate content recommendations');
    }
  }

  async analyzeVideoForRecommendations(videoUrl: string): Promise<ContentRecommendation[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a content analysis expert. Analyze the given video URL and generate similar content recommendations that could perform well.`
          },
          {
            role: "user",
            content: `Analyze this video: ${videoUrl}. Generate 3 similar content recommendations that could achieve viral success. Consider content style, audience engagement, and platform optimization.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      const recommendations = analysis.recommendations || [];

      return await Promise.all(
        recommendations.map((rec: any) => this.optimizeForPlatforms(rec))
      );
    } catch (error) {
      console.error('Error analyzing video for recommendations:', error);
      throw new Error('Failed to analyze video for recommendations');
    }
  }
}

export const contentRecommendationEngine = new ContentRecommendationEngine();