import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Users, Clock, ExternalLink, RefreshCw } from "lucide-react";

interface ContentRecommendation {
  id: string;
  title: string;
  description: string;
  platform: string;
  category: string;
  trendScore: number;
  engagementPotential: number;
  estimatedViews: number;
  tags: string[];
  recommendedTime: string;
  sourceUrl?: string;
}

export function AIContentRecommendations() {
  const { data: recommendations, isLoading, refetch } = useQuery<ContentRecommendation[]>({
    queryKey: ["/api/ai-recommendations"],
    refetchInterval: 30000,
  });

  const getTrendColor = (score: number) => {
    if (score >= 80) return "text-red-400";
    if (score >= 60) return "text-orange-400";
    if (score >= 40) return "text-yellow-400";
    return "text-green-400";
  };

  const getEngagementColor = (potential: number) => {
    if (potential >= 80) return "bg-green-500/10 text-green-400 border-green-500/20";
    if (potential >= 60) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    return "bg-red-500/10 text-red-400 border-red-500/20";
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
            <span className="mr-2 text-slate-400">جاري تحليل التوصيات...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2 text-white">
          <Brain className="w-5 h-5" />
          <span>التوصيات الذكية للمحتوى</span>
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="border-slate-600 text-slate-300 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {!recommendations || recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">لا توجد توصيات متاحة حالياً</p>
            <p className="text-xs text-slate-500 mt-2">
              سيتم تحديث التوصيات تلقائياً كل 30 ثانية
            </p>
          </div>
        ) : (
          <>
            {/* عداد التوصيات */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                <p className="text-2xl font-bold text-blue-400">{recommendations.length}</p>
                <p className="text-xs text-slate-400">إجمالي التوصيات</p>
              </div>
              <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                <p className="text-2xl font-bold text-green-400">
                  {recommendations.filter(r => r.trendScore >= 70).length}
                </p>
                <p className="text-xs text-slate-400">عالية الترند</p>
              </div>
              <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                <p className="text-2xl font-bold text-purple-400">
                  {recommendations.filter(r => r.engagementPotential >= 80).length}
                </p>
                <p className="text-xs text-slate-400">عالية التفاعل</p>
              </div>
            </div>

            {/* قائمة التوصيات */}
            <div className="space-y-4">
              {recommendations.map((recommendation) => (
                <div
                  key={recommendation.id}
                  className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">
                        {recommendation.title}
                      </h4>
                      <p className="text-sm text-slate-400 mb-2">
                        {recommendation.description}
                      </p>
                    </div>
                    {recommendation.sourceUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(recommendation.sourceUrl, '_blank')}
                        className="border-slate-600 text-slate-300 hover:text-white ml-3"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* المقاييس */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className={`w-4 h-4 ${getTrendColor(recommendation.trendScore)}`} />
                      <span className="text-sm text-slate-400">ترند:</span>
                      <span className={`text-sm font-medium ${getTrendColor(recommendation.trendScore)}`}>
                        {recommendation.trendScore}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-slate-400">متوقع:</span>
                      <span className="text-sm font-medium text-white">
                        {formatNumber(recommendation.estimatedViews)} مشاهدة
                      </span>
                    </div>
                  </div>

                  {/* التصنيفات والوقت */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                        {recommendation.platform}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                        {recommendation.category}
                      </Badge>
                      <Badge className={`text-xs ${getEngagementColor(recommendation.engagementPotential)} border`}>
                        {recommendation.engagementPotential}% تفاعل
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{recommendation.recommendedTime}</span>
                    </div>
                  </div>

                  {/* الهاشتاجات */}
                  {recommendation.tags.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-600">
                      <div className="flex flex-wrap gap-1">
                        {recommendation.tags.slice(0, 5).map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-slate-600/50 text-slate-300 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                        {recommendation.tags.length > 5 && (
                          <span className="text-xs px-2 py-1 bg-slate-600/50 text-slate-400 rounded">
                            +{recommendation.tags.length - 5} المزيد
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}