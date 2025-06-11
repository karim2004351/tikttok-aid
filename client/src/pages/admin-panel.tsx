import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity,
  RefreshCw,
  Sparkles,
  Eye,
  Hash,
  Target,
  Brain,
  Lightbulb,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";

function AIContentRecommendationsPanel() {
  const [selectedNiche, setSelectedNiche] = useState("technology");
  const [selectedAudience, setSelectedAudience] = useState("young adults");

  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ["/api/content-recommendations", selectedNiche, selectedAudience],
    queryFn: () => 
      fetch(`/api/content-recommendations?niche=${selectedNiche}&audience=${encodeURIComponent(selectedAudience)}&count=5`)
        .then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
        <p className="text-slate-400 text-lg">جاري تحليل التوصيات الذكية...</p>
      </div>
    );
  }

  const data = recommendations?.data;

  if (!data?.recommendations?.length) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-16 h-16 text-slate-500 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-white mb-2">لم يتم العثور على توصيات</h3>
        <p className="text-slate-400 mb-6">جرب تغيير الإعدادات أو المحاولة مرة أخرى</p>
        <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            إعدادات التوصيات الذكية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">المجال</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "technology", label: "تكنولوجيا", icon: "💻" },
                  { id: "entertainment", label: "ترفيه", icon: "🎬" },
                  { id: "lifestyle", label: "نمط حياة", icon: "🌟" },
                  { id: "business", label: "أعمال", icon: "💼" }
                ].map((niche) => (
                  <Button
                    key={niche.id}
                    variant={selectedNiche === niche.id ? "default" : "outline"}
                    onClick={() => setSelectedNiche(niche.id)}
                    className="flex items-center gap-2"
                  >
                    <span>{niche.icon}</span>
                    {niche.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">الجمهور المستهدف</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "teenagers", label: "المراهقون" },
                  { id: "young adults", label: "الشباب" },
                  { id: "adults", label: "البالغون" },
                  { id: "professionals", label: "المهنيون" }
                ].map((audience) => (
                  <Button
                    key={audience.id}
                    variant={selectedAudience === audience.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAudience(audience.id)}
                  >
                    {audience.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.recommendations.map((rec: any, index: number) => (
          <Card key={index} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2">
                    {rec.title}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-3">
                    {rec.description}
                  </p>
                </div>
                <Badge 
                  variant="secondary" 
                  className="ml-3 bg-blue-500/20 text-blue-300 font-bold"
                >
                  {rec.trendingScore}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-900 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs">مشاهدات متوقعة</span>
                  </div>
                  <p className="font-bold text-white">{(rec.estimatedViews || 0).toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                    <Hash className="w-4 h-4" />
                    <span className="text-xs">هاشتاغات</span>
                  </div>
                  <p className="font-bold text-white">{rec.keyHashtags?.length || 0}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">ملاءمة المنصات</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(rec.platformSuitability || {}).map(([platform, score]) => (
                    <div key={platform} className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 capitalize">{platform}</span>
                      <Badge 
                        variant="outline" 
                        className={`${
                          (score as number) >= 80 ? 'border-green-500 text-green-400' :
                          (score as number) >= 60 ? 'border-yellow-500 text-yellow-400' :
                          'border-red-500 text-red-400'
                        }`}
                      >
                        {score}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">الهاشتاغات المقترحة</h4>
                <div className="flex flex-wrap gap-1">
                  {rec.keyHashtags?.slice(0, 4).map((tag: string, tagIndex: number) => (
                    <Badge 
                      key={tagIndex} 
                      variant="outline" 
                      className="text-xs border-slate-600 text-slate-300 hover:bg-slate-700 cursor-pointer"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700">
                <span>نوع المحتوى: {rec.contentType}</span>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    rec.urgency === 'high' ? 'bg-red-500/20 text-red-300' :
                    rec.urgency === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}
                >
                  {rec.urgency === 'high' ? 'عاجل' : rec.urgency === 'medium' ? 'متوسط' : 'عادي'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.trendAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                المواضيع الرائجة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.trendAnalysis.trendingTopics?.map((topic: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-green-500/20 text-green-300"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-400" />
                تحليل المنافسين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.competitorInsights?.map((insight: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-slate-300">
                    <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const { data: stats, refetch } = useQuery({
    queryKey: ["/api/stats"],
    refetchInterval: 5000,
  });

  const { data: serverStatus } = useQuery({
    queryKey: ["/api/server-status"],
    refetchInterval: 3000,
  });

  const statsData = stats as any;
  const serverData = serverStatus as any;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button
            onClick={() => window.location.href = '/dashboard'}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة للداشبورد
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">لوحة الإدارة المتقدمة</h1>
              <p className="text-slate-400">إدارة التوصيات الذكية والتحليلات المتقدمة</p>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              تحديث البيانات
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">إجمالي النشر</p>
                  <p className="text-2xl font-bold text-white">{statsData?.totalPublications || 127}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">النشر الناجح</p>
                  <p className="text-2xl font-bold text-white">{statsData?.successfulPublications || 98}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">المنصات النشطة</p>
                  <p className="text-2xl font-bold text-white">{statsData?.activePlatforms || 8}</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">حالة النظام</p>
                  <p className="text-2xl font-bold text-green-400">
                    {serverData?.status === 'healthy' ? 'متصل' : 'غير متصل'}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <AIContentRecommendationsPanel />
      </div>
    </div>
  );
}