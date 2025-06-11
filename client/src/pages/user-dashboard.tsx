import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, 
  Play, 
  Pause, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Share2, 
  Calendar,
  ExternalLink,
  LogOut,
  User,
  History,
  Activity
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UserProfile {
  id: number;
  email: string;
  username: string;
  displayName: string;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string;
}

interface PublishingProcess {
  id: number;
  videoUrl: string;
  totalSites: number;
  completedSites: number;
  successfulSites: number;
  failedSites: number;
  status: string;
  progress: number;
  startedAt: string;
  details?: string;
}

export default function UserDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [publishingProcesses, setPublishingProcesses] = useState<PublishingProcess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishForm, setPublishForm] = useState({
    videoUrl: '',
    title: '',
    hashtags: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    loadUserData();
    loadUserProcesses();
    const interval = setInterval(loadUserProcesses, 5000); // تحديث كل 5 ثواني
    return () => clearInterval(interval);
  }, []);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLocation('/auth-login');
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('authToken');
        setLocation('/auth-login');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setLocation('/auth-login');
    }
  };

  const loadUserProcesses = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/user/publishing-processes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPublishingProcesses(data);
      }
    } catch (error) {
      console.error('Error loading processes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await apiRequest('POST', '/api/auth/logout');
      }
      localStorage.removeItem('authToken');
      toast({
        title: "تم تسجيل الخروج",
        description: "نراك قريباً!",
      });
      setLocation('/');
    } catch (error) {
      localStorage.removeItem('authToken');
      setLocation('/');
    }
  };

  const handleStartPublishing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);

    try {
      const token = localStorage.getItem('authToken');
      const data = await fetch('/api/user/start-publishing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          videoUrl: publishForm.videoUrl,
          title: publishForm.title,
          hashtags: publishForm.hashtags.split(' ').filter(tag => tag.trim())
        })
      });

      const result = await data.json();

      if (result.success) {
        toast({
          title: "تم بدء النشر",
          description: "سيتم تحديث التقدم تلقائياً",
        });
        
        setPublishForm({ videoUrl: '', title: '', hashtags: '' });
        loadUserProcesses(); // إعادة تحميل العمليات
      } else {
        toast({
          title: "خطأ في بدء النشر",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في بدء النشر",
        description: "حدث خطأ أثناء بدء عملية النشر",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAnalyzeVideo = async () => {
    if (!publishForm.videoUrl.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط الفيديو أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          videoUrl: publishForm.videoUrl
        })
      });

      const result = await response.json();

      if (result.success) {
        setAnalysisResult(result.data);
        
        // ملء العنوان والهاشتاغات المقترحة تلقائياً
        if (result.data.title && !publishForm.title) {
          setPublishForm(prev => ({ ...prev, title: result.data.title }));
        }
        if (result.data.hashtags && !publishForm.hashtags) {
          setPublishForm(prev => ({ ...prev, hashtags: result.data.hashtags.join(' ') }));
        }

        toast({
          title: "تم تحليل الفيديو",
          description: "تم الحصول على معلومات مفصلة عن الفيديو",
        });
      } else {
        toast({
          title: "خطأ في التحليل",
          description: result.message || "فشل في تحليل الفيديو",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في التحليل",
        description: "حدث خطأ أثناء تحليل الفيديو",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      running: { label: "قيد التشغيل", variant: "default" as const },
      completed: { label: "مكتمل", variant: "default" as const },
      paused: { label: "متوقف مؤقتاً", variant: "secondary" as const },
      failed: { label: "فشل", variant: "destructive" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold">لوحة التحكم الشخصية</h1>
                <p className="text-xs sm:text-sm text-gray-400">أهلاً بك {user?.displayName}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Button
                onClick={() => setLocation('/video-upload-analyzer')}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 touch-manipulation shadow-lg"
              >
                📱 رفع فيديو
              </Button>
              <Button
                onClick={() => setLocation('/optimal-posting-time')}
                size="sm"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 touch-manipulation shadow-lg"
              >
                ⏰ أفضل وقت للنشر
              </Button>
              <Button
                onClick={() => setLocation('/hashtag-generator')}
                size="sm"
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white border-0 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 touch-manipulation shadow-lg"
              >
                🏷️ مولد الهاشتاغات
              </Button>
              {user?.isAdmin && (
                <Button
                  onClick={() => setLocation('/admin-users-dashboard')}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 touch-manipulation shadow-lg"
                >
                  👑 لوحة الإدارة
                </Button>
              )}
              <Button
                onClick={handleLogout}
                size="sm"
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white border-0 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 touch-manipulation shadow-lg"
              >
                <LogOut className="h-4 w-4 mr-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-gray-800 h-auto">
            <TabsTrigger value="overview" className="text-white text-xs sm:text-sm py-2 sm:py-3">نظرة عامة</TabsTrigger>
            <TabsTrigger value="processes" className="text-white text-xs sm:text-sm py-2 sm:py-3">عمليات النشر</TabsTrigger>
            <TabsTrigger value="history" className="text-white text-xs sm:text-sm py-2 sm:py-3">السجل</TabsTrigger>
            <TabsTrigger value="profile" className="text-white text-xs sm:text-sm py-2 sm:py-3">الملف الشخصي</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Quick Publishing Form */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-white text-lg sm:text-xl">بدء عملية نشر جديدة</CardTitle>
                <CardDescription className="text-gray-400 text-sm sm:text-base">
                  انشر فيديوك على 1185+ منصة بنقرة واحدة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStartPublishing} className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      رابط الفيديو
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                      <input
                        type="url"
                        value={publishForm.videoUrl}
                        onChange={(e) => setPublishForm({ ...publishForm, videoUrl: e.target.value })}
                        className="flex-1 px-3 py-3 sm:py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                        placeholder="https://www.youtube.com/watch?v=..."
                        required
                      />
                      <Button
                        type="button"
                        onClick={handleAnalyzeVideo}
                        disabled={isAnalyzing || !publishForm.videoUrl.trim()}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-3 sm:py-2 h-12 sm:h-auto touch-manipulation shadow-lg"
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        <span className="text-sm sm:text-base">{isAnalyzing ? "تحليل..." : "تحليل"}</span>
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      عنوان الفيديو (اختياري)
                    </label>
                    <input
                      type="text"
                      value={publishForm.title}
                      onChange={(e) => setPublishForm({ ...publishForm, title: e.target.value })}
                      className="w-full px-3 py-3 sm:py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                      placeholder="عنوان رائع لفيديوك"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      الهاشتاغات (اختياري)
                    </label>
                    <input
                      type="text"
                      value={publishForm.hashtags}
                      onChange={(e) => setPublishForm({ ...publishForm, hashtags: e.target.value })}
                      className="w-full px-3 py-3 sm:py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                      placeholder="#تكنولوجيا #برمجة #تطوير"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                    <Button 
                      type="submit" 
                      disabled={isPublishing}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white h-12 sm:h-auto py-3 sm:py-2 touch-manipulation shadow-lg"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      <span className="text-sm sm:text-base">{isPublishing ? "جاري النشر..." : "بدء النشر"}</span>
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => setLocation('/video-upload-analyzer')}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 h-12 sm:h-auto py-3 sm:py-2 touch-manipulation shadow-lg"
                    >
                      <span className="text-sm sm:text-base">رفع فيديو</span>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Video Analysis Results */}
            {analysisResult && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    نتائج تحليل الفيديو بالذكاء الاصطناعي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-sm text-gray-400">المشاهدات</div>
                      <div className="text-lg font-bold text-white">
                        {analysisResult.views?.toLocaleString() || 'غير متوفر'}
                      </div>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-sm text-gray-400">الإعجابات</div>
                      <div className="text-lg font-bold text-white">
                        {analysisResult.likes?.toLocaleString() || 'غير متوفر'}
                      </div>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-sm text-gray-400">التعليقات</div>
                      <div className="text-lg font-bold text-white">
                        {analysisResult.comments?.toLocaleString() || 'غير متوفر'}
                      </div>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-sm text-gray-400">التقييم</div>
                      <div className="text-lg font-bold text-yellow-400">
                        {analysisResult.rating ? `${analysisResult.rating}/5 ⭐` : 'غير متوفر'}
                      </div>
                    </div>
                  </div>
                  
                  {analysisResult.title && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">العنوان المكتشف</div>
                      <div className="text-white bg-gray-700/50 p-3 rounded-lg">
                        {analysisResult.title}
                      </div>
                    </div>
                  )}
                  
                  {analysisResult.description && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">الوصف</div>
                      <div className="text-white bg-gray-700/50 p-3 rounded-lg max-h-20 overflow-y-auto">
                        {analysisResult.description}
                      </div>
                    </div>
                  )}
                  
                  {analysisResult.hashtags && analysisResult.hashtags.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">الهاشتاغات المقترحة</div>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.hashtags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {analysisResult.author && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">معلومات المؤلف</div>
                      <div className="text-white bg-gray-700/50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div>
                            <div className="font-bold">{analysisResult.author.displayName || analysisResult.author.username}</div>
                            <div className="text-sm text-gray-400">
                              {analysisResult.author.followers ? `${analysisResult.author.followers.toLocaleString()} متابع` : ''}
                              {analysisResult.author.verified && (
                                <span className="text-blue-400 mr-2">✓ موثق</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-gray-400">
                      المنصة: <span className="text-white">{analysisResult.platform}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      مصدر البيانات: <span className="text-white">{analysisResult.dataSource || 'API رسمي'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">إجمالي العمليات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{publishingProcesses.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">العمليات المكتملة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    {publishingProcesses.filter(p => p.status === 'completed').length}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">العمليات النشطة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">
                    {publishingProcesses.filter(p => p.status === 'running').length}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">معدل النجاح</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">
                    {publishingProcesses.length > 0
                      ? Math.round((publishingProcesses.filter(p => p.status === 'completed').length / publishingProcesses.length) * 100)
                      : 0}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Processes */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">العمليات الحديثة</CardTitle>
                <CardDescription className="text-gray-400">
                  آخر عمليات النشر التي قمت بها
                </CardDescription>
              </CardHeader>
              <CardContent>
                {publishingProcesses.slice(0, 5).map((process) => (
                  <div key={process.id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm text-white truncate max-w-64">{process.videoUrl}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(process.startedAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-300">
                        {process.successfulSites}/{process.totalSites} مواقع
                      </div>
                      {getStatusBadge(process.status)}
                    </div>
                  </div>
                ))}
                {publishingProcesses.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    لم تقم بأي عمليات نشر حتى الآن
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processes" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">جميع عمليات النشر</CardTitle>
                <CardDescription className="text-gray-400">
                  تتبع تقدم عمليات النشر الخاصة بك
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {publishingProcesses.map((process) => (
                  <div key={process.id} className="border border-gray-700 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium truncate">{process.videoUrl}</p>
                        <p className="text-sm text-gray-400">
                          بدأت في: {new Date(process.startedAt).toLocaleString('ar-SA')}
                        </p>
                      </div>
                      {getStatusBadge(process.status)}
                    </div>
                    
                    <Progress value={process.progress} className="w-full" />
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-400">إجمالي المواقع</p>
                        <p className="text-white font-medium">{process.totalSites}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400">نجح</p>
                        <p className="text-green-400 font-medium">{process.successfulSites}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400">فشل</p>
                        <p className="text-red-400 font-medium">{process.failedSites}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {publishingProcesses.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                    <p>لا توجد عمليات نشر</p>
                    <p className="text-sm">ابدأ بنشر أول فيديو لك!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">سجل النشاط</CardTitle>
                <CardDescription className="text-gray-400">
                  تاريخ جميع أنشطتك على المنصة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {publishingProcesses.map((process, index) => (
                    <div key={process.id} className="flex items-start space-x-3 pb-4 border-b border-gray-700 last:border-0">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-white">تم {process.status === 'completed' ? 'إكمال' : 'بدء'} عملية نشر</p>
                        <p className="text-sm text-gray-400 truncate">{process.videoUrl}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(process.startedAt).toLocaleString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {publishingProcesses.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <History className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                      <p>لا يوجد سجل نشاط</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">الملف الشخصي</CardTitle>
                <CardDescription className="text-gray-400">
                  معلومات حسابك الشخصي
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{user?.displayName}</h3>
                    <p className="text-gray-400">@{user?.username}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-300">البريد الإلكتروني</label>
                    <p className="text-white">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">تاريخ الانضمام</label>
                    <p className="text-white">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-SA') : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">نوع العضوية</label>
                    <p className="text-white">
                      {user?.isPremium ? (
                        <Badge className="bg-gold text-black">عضوية مميزة</Badge>
                      ) : (
                        <Badge variant="outline">عضوية مجانية</Badge>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}