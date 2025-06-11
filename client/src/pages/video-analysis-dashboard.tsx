import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Video, TrendingUp, Users, Eye, Heart, MessageCircle, Share2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface VideoAnalysisData {
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
  processingTime: number;
  apiStatus: {
    youtube_official: 'success' | 'failed' | 'no_key' | 'not_tested';
    rapidapi_services: 'success' | 'failed' | 'no_key' | 'not_tested';
    web_scraping: 'success' | 'failed' | 'not_tested';
    oembed: 'success' | 'failed' | 'not_tested';
  };
  extractionDetails: {
    attemptedMethods: string[];
    successfulMethod: string;
    failureReasons: string[];
    recommendedActions: string[];
    authenticationStatus: string;
  };
}

export default function VideoAnalysisDashboard() {
  const [videoUrl, setVideoUrl] = useState('');
  const [analysisData, setAnalysisData] = useState<VideoAnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const analyzeVideo = async () => {
    if (!videoUrl.trim()) {
      setError('يرجى إدخال رابط الفيديو');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysisData(null);

    try {
      const response = await apiRequest('POST', '/api/analyze-video-real', {
        videoUrl: videoUrl.trim()
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAnalysisData(result.data);
        } else {
          setError(result.message || 'فشل في تحليل الفيديو');
        }
      } else {
        setError('خطأ في الاتصال بالخادم');
      }
    } catch (err) {
      setError('خطأ في تحليل الفيديو');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'no_key':
        return <XCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'no_key':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            لوحة تحليل الفيديوهات المتقدمة
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            تحليل شامل للفيديوهات من TikTok و YouTube باستخدام APIs أصلية
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              إدخال رابط الفيديو
            </CardTitle>
            <CardDescription>
              أدخل رابط فيديو من TikTok أو YouTube للحصول على تحليل مفصل
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="videoUrl">رابط الفيديو</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  placeholder="https://vm.tiktok.com/... أو https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="self-end">
                <Button 
                  onClick={analyzeVideo} 
                  disabled={isAnalyzing}
                  className="px-8"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جارٍ التحليل...
                    </>
                  ) : (
                    'تحليل الفيديو'
                  )}
                </Button>
              </div>
            </div>
            {error && (
              <Alert className="mt-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {analysisData && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="metrics">الإحصائيات</TabsTrigger>
              <TabsTrigger value="author">المؤلف</TabsTrigger>
              <TabsTrigger value="technical">التفاصيل التقنية</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{analysisData.title}</span>
                      <Badge variant="outline" className={getStatusColor('success')}>
                        {analysisData.platform}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {analysisData.description || 'لا يوجد وصف متاح'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-yellow-500" />
                        <span>التقييم: {analysisData.rating}/5</span>
                        <Progress value={analysisData.rating * 20} className="flex-1 max-w-32" />
                      </div>
                      
                      {analysisData.hashtags.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium">الهاشتاجات:</span>
                          <div className="flex flex-wrap gap-2">
                            {analysisData.hashtags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>وقت المعالجة: {analysisData.processingTime}ms</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>مصدر البيانات: {analysisData.dataSource}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {analysisData.thumbnailUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle>صورة مصغرة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img 
                        src={analysisData.thumbnailUrl} 
                        alt="صورة مصغرة للفيديو"
                        className="w-full rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Eye className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">{formatNumber(analysisData.views)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">مشاهدة</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Heart className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-2xl font-bold">{formatNumber(analysisData.likes)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">إعجاب</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <MessageCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold">{formatNumber(analysisData.comments)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">تعليق</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Share2 className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-2xl font-bold">{formatNumber(analysisData.shares)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">مشاركة</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="author" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    معلومات المؤلف
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      {analysisData.author.profilePicture && (
                        <img 
                          src={analysisData.author.profilePicture}
                          alt="صورة المؤلف"
                          className="w-16 h-16 rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          {analysisData.author.displayName}
                          {analysisData.author.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">@{analysisData.author.username}</p>
                        <p className="text-sm text-gray-500">{formatNumber(analysisData.author.followers)} متابع</p>
                      </div>
                    </div>
                    {analysisData.author.bio && (
                      <div>
                        <h4 className="font-medium mb-2">السيرة الذاتية:</h4>
                        <p className="text-gray-600 dark:text-gray-400">{analysisData.author.bio}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technical" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>حالة APIs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analysisData.apiStatus).map(([api, status]) => (
                        <div key={api} className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {api.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(status)}
                            <Badge variant="outline" className={getStatusColor(status)}>
                              {status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>تفاصيل الاستخراج</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">الطريقة الناجحة:</h4>
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {analysisData.extractionDetails.successfulMethod}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">الطرق المجربة:</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisData.extractionDetails.attemptedMethods.map((method, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">حالة المصادقة:</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {analysisData.extractionDetails.authenticationStatus}
                        </p>
                      </div>

                      {analysisData.extractionDetails.recommendedActions.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">الإجراءات الموصى بها:</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {analysisData.extractionDetails.recommendedActions.map((action, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}