import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CompactSidebar } from "@/components/compact-sidebar";
import { LanguageToggleHeader } from "@/components/language-toggle-header";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Pause,
  Square,
  Settings, 
  Youtube, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart,
  Clock,
  CheckCircle,
  XCircle,
  Key,
  RefreshCw,
  Monitor,
  Database,
  Cpu,
  Activity,
  Globe,
  Upload,
  BarChart3,
  Zap,
  ArrowUp,
  Video,
  Search,
  Target,
  BookOpen,
  Send,
  Plus,
  Trash2,
  Save,
  AlertTriangle
} from "lucide-react";

interface ApiKeys {
  youtubeApiKey: string;
  youtubeApiV3Key: string;
  facebookAccessToken: string;
  twitterApiKey: string;
  twitterApiSecret: string;
  tiktokClientKey: string;
  tiktokClientSecret: string;
  rapidApiKey: string;
  rapidApiTikTokKey: string;
}

interface VideoTarget {
  id: string;
  platform: string;
  url: string;
  title: string;
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
  };
  publishedAt: string;
  duration: number;
  thumbnailUrl: string;
  hashtags: string[];
}

interface CommentingSession {
  id: string;
  platform: string;
  videosFound: number;
  commentsAttempted: number;
  commentsSuccessful: number;
  commentsFailed: number;
  avgResponseTime: number;
  errors: string[];
  status: 'running' | 'completed' | 'stopped' | 'error';
  startTime: Date;
  endTime?: Date;
}

interface LiveCommentingStats {
  totalCommentsPosted: number;
  activeCommenting: boolean;
  currentSession?: CommentingSession;
  recentResults: CommentingSession[];
  platformStats: {
    [platform: string]: {
      successRate: number;
      avgResponseTime: number;
      totalComments: number;
    };
  };
}

interface ServerHealth {
  status: 'online' | 'offline' | 'degraded';
  cpu: number;
  memory: number;
  uptime: number;
  activeConnections: number;
  lastHealthCheck: Date;
}

export default function Dashboard() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  
  // API Keys State
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    youtubeApiKey: '',
    youtubeApiV3Key: '',
    facebookAccessToken: '',
    twitterApiKey: '',
    twitterApiSecret: '',
    tiktokClientKey: '',
    tiktokClientSecret: '',
    rapidApiKey: '',
    rapidApiTikTokKey: ''
  });

  // Comments System State
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['youtube']);
  const [commentTexts, setCommentTexts] = useState<string[]>([
    'محتوى رائع! 👍',
    'مفيد جداً، شكراً لك',
    'أعجبني هذا الفيديو',
    'استمر في هذا العمل الممتاز',
    'معلومات قيمة'
  ]);
  const [videosPerPlatform, setVideosPerPlatform] = useState(10);
  const [commentsPerVideo, setCommentsPerVideo] = useState(2);
  const [targetVideoUrl, setTargetVideoUrl] = useState('');
  const [includeTargetVideo, setIncludeTargetVideo] = useState(false);
  const [currentCommentInput, setCurrentCommentInput] = useState('');
  const [randomPublishing, setRandomPublishing] = useState(false);
  const [maxTargetVideos, setMaxTargetVideos] = useState(50);
  const [commentDelay, setCommentDelay] = useState(3);
  
  // Session State
  const [isCommenting, setIsCommenting] = useState(false);
  const [foundVideos, setFoundVideos] = useState<VideoTarget[]>([]);
  const [sessionResults, setSessionResults] = useState<CommentingSession[]>([]);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);

  const isRTL = language === 'ar';

  // Data Queries with proper error handling
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["/api/stats"],
    refetchInterval: 5000,
    retry: 2,
    staleTime: 30000,
  });

  const { data: serverStatus, isLoading: serverLoading } = useQuery<ServerHealth>({
    queryKey: ["/api/server-status"],
    refetchInterval: 3000,
    retry: 1,
    staleTime: 10000,
  });

  const { data: liveStats, isLoading: liveStatsLoading } = useQuery<LiveCommentingStats>({
    queryKey: ['/api/comments-live-stats'],
    refetchInterval: 2000,
    retry: 1,
    staleTime: 5000,
  });

  const { data: publishingStatus } = useQuery({
    queryKey: ["/api/publishing-status"],
    refetchInterval: 5000,
    retry: 2,
  });

  // Enhanced Mutations with proper error handling
  const findVideosMutation = useMutation({
    mutationFn: async ({ platform, count, random }: { 
      platform: string; 
      count: number; 
      random?: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/find-trending-videos", { 
        platform, 
        count,
        randomized: random,
        apiKeys: apiKeys
      });
      if (!response.ok) {
        throw new Error(`فشل في البحث عن فيديوهات ${platform}`);
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      if (data.success && data.videos?.length > 0) {
        setFoundVideos(prev => [...prev, ...data.videos]);
        toast({
          title: "تم العثور على فيديوهات",
          description: `تم العثور على ${data.videos.length} فيديو على ${variables.platform}`,
        });
      } else {
        toast({
          title: "لم يتم العثور على فيديوهات",
          description: `لا توجد فيديوهات متاحة على ${variables.platform} حالياً`,
          variant: "destructive"
        });
      }
    },
    onError: (error, variables) => {
      toast({
        title: "خطأ في البحث",
        description: `فشل البحث عن فيديوهات ${variables.platform}: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const startCommentingMutation = useMutation({
    mutationFn: async (params: any) => {
      const response = await apiRequest("POST", "/api/start-automated-commenting", {
        ...params,
        apiKeys: apiKeys,
        selectedVideos: selectedVideos.length > 0 ? selectedVideos : undefined
      });
      if (!response.ok) {
        throw new Error('فشل في بدء جلسة التعليقات');
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setSessionResults(prev => [...prev, ...data.sessions]);
        setIsCommenting(false);
        queryClient.invalidateQueries({ queryKey: ['/api/comments-live-stats'] });
        
        const totalComments = data.summary?.totalCommentsSuccessful || 0;
        const totalPlatforms = data.summary?.totalPlatforms || 0;
        
        toast({
          title: "انتهت جلسة التعليقات بنجاح",
          description: `تم نشر ${totalComments} تعليق على ${totalPlatforms} منصة`,
        });
      }
    },
    onError: (error) => {
      setIsCommenting(false);
      toast({
        title: "خطأ في جلسة التعليقات",
        description: `فشل في تنفيذ جلسة التعليقات: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const stopCommentingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/stop-automated-commenting", {});
      return response.json();
    },
    onSuccess: () => {
      setIsCommenting(false);
      queryClient.invalidateQueries({ queryKey: ['/api/comments-live-stats'] });
      toast({
        title: "تم إيقاف التعليقات",
        description: "تم إيقاف جلسة التعليقات التلقائية",
      });
    }
  });

  const saveApiKeysMutation = useMutation({
    mutationFn: async (keys: ApiKeys) => {
      const response = await apiRequest("POST", "/api/save-api-keys", keys);
      if (!response.ok) {
        throw new Error('فشل في حفظ مفاتيح API');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم حفظ المفاتيح بنجاح",
        description: "تم حفظ جميع مفاتيح API وسيتم استخدامها للتعليقات الحقيقية",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في حفظ المفاتيح",
        description: `فشل في حفظ مفاتيح API: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const testApiKeysMutation = useMutation({
    mutationFn: async (keys: ApiKeys) => {
      const response = await apiRequest("POST", "/api/test-api-keys", keys);
      return response.json();
    },
    onSuccess: (data) => {
      const workingKeys = Object.entries(data.results)
        .filter(([_, result]: [string, any]) => result.working)
        .map(([key, _]) => key);
      
      toast({
        title: "نتائج اختبار المفاتيح",
        description: `${workingKeys.length} مفتاح يعمل بشكل صحيح`,
      });
    }
  });

  // Action Functions
  const addCommentText = () => {
    if (currentCommentInput.trim() && !commentTexts.includes(currentCommentInput.trim())) {
      setCommentTexts([...commentTexts, currentCommentInput.trim()]);
      setCurrentCommentInput('');
    }
  };

  const removeCommentText = (index: number) => {
    setCommentTexts(commentTexts.filter((_, i) => i !== index));
  };

  const searchTrendingVideos = async () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار منصة واحدة على الأقل",
        variant: "destructive"
      });
      return;
    }

    setFoundVideos([]);
    setSelectedVideos([]);
    
    const searchCount = randomPublishing ? maxTargetVideos : videosPerPlatform;
    
    for (const platform of selectedPlatforms) {
      await findVideosMutation.mutateAsync({ 
        platform, 
        count: searchCount,
        random: randomPublishing
      });
    }
  };

  const startAutomatedCommenting = async () => {
    if (commentTexts.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة نصوص التعليقات",
        variant: "destructive"
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار المنصات المستهدفة",
        variant: "destructive"
      });
      return;
    }

    setIsCommenting(true);
    
    await startCommentingMutation.mutateAsync({
      platforms: selectedPlatforms,
      commentTexts,
      videosPerPlatform: randomPublishing ? maxTargetVideos : videosPerPlatform,
      commentsPerVideo,
      targetVideoUrl: includeTargetVideo ? targetVideoUrl : '',
      randomPublishing,
      commentDelay,
      foundVideos: foundVideos.length > 0 ? foundVideos : undefined
    });
  };

  const stopAutomatedCommenting = async () => {
    await stopCommentingMutation.mutateAsync();
  };

  const saveApiKeys = () => {
    const hasValidKeys = Object.values(apiKeys).some(key => key.trim().length > 0);
    if (!hasValidKeys) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال مفتاح API واحد على الأقل",
        variant: "destructive"
      });
      return;
    }
    saveApiKeysMutation.mutate(apiKeys);
  };

  const testApiKeys = () => {
    testApiKeysMutation.mutate(apiKeys);
  };

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const selectAllVideos = () => {
    setSelectedVideos(foundVideos.map(v => v.id));
  };

  const clearVideoSelection = () => {
    setSelectedVideos([]);
  };

  const platformOptions = [
    { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'bg-red-500' },
    { value: 'tiktok', label: 'TikTok', icon: TrendingUp, color: 'bg-black' },
    { value: 'facebook', label: 'Facebook', icon: Users, color: 'bg-blue-600' },
    { value: 'instagram', label: 'Instagram', icon: Eye, color: 'bg-pink-500' },
    { value: 'twitter', label: 'Twitter/X', icon: MessageSquare, color: 'bg-slate-900' },
  ];

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auto-save API keys
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasKeys = Object.values(apiKeys).some(key => key.trim().length > 0);
      if (hasKeys && !saveApiKeysMutation.isPending) {
        localStorage.setItem('dashboard_api_keys', JSON.stringify(apiKeys));
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [apiKeys]);

  // Load saved API keys
  useEffect(() => {
    const savedKeys = localStorage.getItem('dashboard_api_keys');
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys));
      } catch (error) {
        console.error('خطأ في تحميل المفاتيح المحفوظة:', error);
      }
    }
  }, []);

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <LanguageToggleHeader />
      
      <div className="flex min-h-screen">
        <CompactSidebar />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Enhanced Header */}
          <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {language === 'ar' ? 'لوحة القيادة الشاملة' : 'Comprehensive Dashboard'}
                </h1>
                <p className="text-slate-400">
                  {language === 'ar' ? 
                    'النشر التلقائي والتعليقات الذكية مع مفاتيح API الحقيقية' : 
                    'Automated Publishing & Smart Comments with Real API Keys'
                  }
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Live Status Indicator */}
                <Badge 
                  variant={liveStats?.activeCommenting ? 'default' : 
                           serverStatus?.status === 'online' ? 'secondary' : 'destructive'} 
                  className="px-3 py-1"
                >
                  <Activity className="w-3 h-3 mr-1" />
                  {liveStats?.activeCommenting ? 
                    (language === 'ar' ? 'تعليقات نشطة' : 'Commenting Active') :
                    serverStatus?.status === 'online' ? 
                      (language === 'ar' ? 'متصل' : 'Online') : 
                      (language === 'ar' ? 'غير متصل' : 'Offline')
                  }
                </Badge>
                
                {/* Stats Summary */}
                <div className="text-sm text-slate-400">
                  {language === 'ar' ? 'المنشورات' : 'Posts'}: {(stats as any)?.totalPublications || 0}
                </div>
                
                <div className="text-sm text-slate-400">
                  {language === 'ar' ? 'التعليقات' : 'Comments'}: {liveStats?.totalCommentsPosted || 0}
                </div>
              </div>
            </div>
          </header>

          {/* Main Content with Enhanced Tabs */}
          <div className="flex-1 overflow-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {language === 'ar' ? 'نظرة عامة' : 'Overview'}
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {language === 'ar' ? 'التعليقات التلقائية' : 'Auto Comments'}
                </TabsTrigger>
                <TabsTrigger value="keys" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  {language === 'ar' ? 'مفاتيح API' : 'API Keys'}
                </TabsTrigger>
                <TabsTrigger value="videos" className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  {language === 'ar' ? 'إدارة الفيديوهات' : 'Video Manager'}
                </TabsTrigger>
                <TabsTrigger value="monitoring" className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  {language === 'ar' ? 'المراقبة المباشرة' : 'Live Monitoring'}
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab - Enhanced */}
              <TabsContent value="overview" className="space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">
                            {language === 'ar' ? 'إجمالي المنشورات' : 'Total Posts'}
                          </p>
                          <p className="text-2xl font-bold text-green-400">
                            {statsLoading ? '...' : (stats as any)?.totalPublications || 0}
                          </p>
                        </div>
                        <Upload className="w-8 h-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">
                            {language === 'ar' ? 'التعليقات المنشورة' : 'Comments Posted'}
                          </p>
                          <p className="text-2xl font-bold text-blue-400">
                            {liveStatsLoading ? '...' : liveStats?.totalCommentsPosted || 0}
                          </p>
                        </div>
                        <MessageSquare className="w-8 h-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">
                            {language === 'ar' ? 'معدل النجاح' : 'Success Rate'}
                          </p>
                          <p className="text-2xl font-bold text-yellow-400">
                            {statsLoading ? '...' : (stats as any)?.averageSuccessRate || 0}%
                          </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-yellow-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">
                            {language === 'ar' ? 'المنصات النشطة' : 'Active Platforms'}
                          </p>
                          <p className="text-2xl font-bold text-purple-400">
                            {selectedPlatforms.length}
                          </p>
                        </div>
                        <Globe className="w-8 h-8 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Server Health Dashboard */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="w-5 h-5" />
                      {language === 'ar' ? 'صحة الخادم' : 'Server Health'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {serverLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                          <Cpu className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-400">
                            {language === 'ar' ? 'المعالج' : 'CPU'}
                          </p>
                          <p className="text-xl font-bold text-white">
                            {serverStatus?.cpu || 0}%
                          </p>
                        </div>
                        
                        <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                          <Database className="w-6 h-6 text-green-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-400">
                            {language === 'ar' ? 'الذاكرة' : 'Memory'}
                          </p>
                          <p className="text-xl font-bold text-white">
                            {serverStatus?.memory || 0}%
                          </p>
                        </div>
                        
                        <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                          <Globe className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-400">
                            {language === 'ar' ? 'الاتصالات' : 'Connections'}
                          </p>
                          <p className="text-xl font-bold text-white">
                            {serverStatus?.activeConnections || 0}
                          </p>
                        </div>
                        
                        <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                          <Clock className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-400">
                            {language === 'ar' ? 'وقت التشغيل' : 'Uptime'}
                          </p>
                          <p className="text-xl font-bold text-white">
                            {Math.floor((serverStatus?.uptime || 0) / 3600)}h
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      {language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sessionResults.slice(-5).map((session, index) => (
                        <div key={session.id || index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant={session.status === 'completed' ? 'default' : 'destructive'}>
                              {session.platform}
                            </Badge>
                            <span className="text-sm text-slate-300">
                              {session.commentsSuccessful} {language === 'ar' ? 'تعليق ناجح' : 'successful comments'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">
                            {session.startTime ? new Date(session.startTime).toLocaleTimeString() : 'Unknown'}
                          </span>
                        </div>
                      ))}
                      {sessionResults.length === 0 && (
                        <p className="text-center text-slate-400 py-4">
                          {language === 'ar' ? 'لا توجد جلسات تعليقات حتى الآن' : 'No commenting sessions yet'}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Enhanced Comments Tab */}
              <TabsContent value="comments" className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      {language === 'ar' ? 'نظام التعليقات التلقائية المتقدم' : 'Advanced Automated Comments System'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Platform Selection with Enhanced UI */}
                    <div>
                      <Label className="text-slate-300 mb-3 block">
                        {language === 'ar' ? 'اختر المنصات المستهدفة' : 'Select Target Platforms'}
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        {platformOptions.map((platform) => (
                          <Button
                            key={platform.value}
                            variant={selectedPlatforms.includes(platform.value) ? "default" : "outline"}
                            className={`flex items-center gap-2 h-auto p-4 ${
                              selectedPlatforms.includes(platform.value) 
                                ? `${platform.color} hover:opacity-90` 
                                : 'border-slate-600 hover:bg-slate-700'
                            }`}
                            onClick={() => {
                              setSelectedPlatforms(prev => 
                                prev.includes(platform.value)
                                  ? prev.filter(p => p !== platform.value)
                                  : [...prev, platform.value]
                              );
                            }}
                          >
                            <platform.icon className="w-5 h-5" />
                            <div className="text-left">
                              <div className="font-semibold">{platform.label}</div>
                              <div className="text-xs opacity-70">
                                {selectedPlatforms.includes(platform.value) ? 
                                  (language === 'ar' ? 'مُحدد' : 'Selected') : 
                                  (language === 'ar' ? 'انقر للتحديد' : 'Click to select')
                                }
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label className="text-slate-300">
                          {language === 'ar' ? 'عدد الفيديوهات لكل منصة' : 'Videos per Platform'}
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max={randomPublishing ? "300" : "50"}
                          value={randomPublishing ? maxTargetVideos : videosPerPlatform}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            if (randomPublishing) {
                              setMaxTargetVideos(Math.min(value, 300));
                            } else {
                              setVideosPerPlatform(Math.min(value, 50));
                            }
                          }}
                          className="bg-slate-700 border-slate-600 text-white mt-2"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          {randomPublishing ? 
                            (language === 'ar' ? 'حتى 300 فيديو' : 'Up to 300 videos') : 
                            (language === 'ar' ? 'حتى 50 فيديو' : 'Up to 50 videos')
                          }
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-slate-300">
                          {language === 'ar' ? 'عدد التعليقات لكل فيديو' : 'Comments per Video'}
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={commentsPerVideo}
                          onChange={(e) => setCommentsPerVideo(parseInt(e.target.value) || 1)}
                          className="bg-slate-700 border-slate-600 text-white mt-2"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          {language === 'ar' ? 'تعليقات مختلفة لكل فيديو' : 'Different comments per video'}
                        </p>
                      </div>

                      <div>
                        <Label className="text-slate-300">
                          {language === 'ar' ? 'التأخير بين التعليقات (ثانية)' : 'Delay Between Comments (sec)'}
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={commentDelay}
                          onChange={(e) => setCommentDelay(parseInt(e.target.value) || 3)}
                          className="bg-slate-700 border-slate-600 text-white mt-2"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          {language === 'ar' ? 'لتجنب الحظر' : 'To avoid blocking'}
                        </p>
                      </div>
                    </div>

                    {/* Publishing Mode Toggle */}
                    <div className="border-t border-slate-600 pt-4">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <Switch
                          checked={randomPublishing}
                          onCheckedChange={setRandomPublishing}
                        />
                        <div>
                          <Label className="text-slate-300">
                            {language === 'ar' ? 'النشر العشوائي المتقدم' : 'Advanced Random Publishing'}
                          </Label>
                          <p className="text-xs text-slate-400 mt-1">
                            {language === 'ar' ? 
                              'البحث في فيديوهات متنوعة بدلاً من الرائجة فقط' : 
                              'Search diverse videos instead of trending only'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Comment Texts Management */}
                    <div>
                      <Label className="text-slate-300 mb-3 block">
                        {language === 'ar' ? 'نصوص التعليقات المخصصة' : 'Custom Comment Texts'}
                        <Badge variant="outline" className="ml-2">
                          {commentTexts.length}
                        </Badge>
                      </Label>
                      
                      <ScrollArea className="h-32 mb-3">
                        <div className="space-y-2">
                          {commentTexts.map((text, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-slate-700 rounded group">
                              <span className="flex-1 text-sm">{text}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeCommentText(index)}
                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      
                      <div className="flex gap-2">
                        <Input
                          value={currentCommentInput}
                          onChange={(e) => setCurrentCommentInput(e.target.value)}
                          placeholder={language === 'ar' ? 'أضف نص تعليق جديد...' : 'Add new comment text...'}
                          className="bg-slate-700 border-slate-600 text-white"
                          onKeyPress={(e) => e.key === 'Enter' && addCommentText()}
                          maxLength={100}
                        />
                        <Button 
                          onClick={addCommentText} 
                          disabled={!currentCommentInput.trim() || commentTexts.includes(currentCommentInput.trim())}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {language === 'ar' ? 'إضافة' : 'Add'}
                        </Button>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCommentTexts([
                            'محتوى رائع! 👍',
                            'مفيد جداً، شكراً لك',
                            'أعجبني هذا الفيديو',
                            'استمر في هذا العمل الممتاز',
                            'معلومات قيمة'
                          ])}
                          className="border-slate-600"
                        >
                          {language === 'ar' ? 'إعادة تعيين افتراضي' : 'Reset Default'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCommentTexts([])}
                          className="border-slate-600 text-red-400"
                        >
                          {language === 'ar' ? 'مسح الكل' : 'Clear All'}
                        </Button>
                      </div>
                    </div>

                    {/* Target Video URL */}
                    <div className="border-t border-slate-600 pt-4">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
                        <Switch
                          checked={includeTargetVideo}
                          onCheckedChange={setIncludeTargetVideo}
                        />
                        <Label className="text-slate-300">
                          {language === 'ar' ? 'تضمين فيديو مستهدف محدد' : 'Include specific target video'}
                        </Label>
                      </div>
                      
                      {includeTargetVideo && (
                        <Input
                          value={targetVideoUrl}
                          onChange={(e) => setTargetVideoUrl(e.target.value)}
                          placeholder={language === 'ar' ? 'https://youtube.com/watch?v=...' : 'https://youtube.com/watch?v=...'}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-600">
                      <Button
                        onClick={searchTrendingVideos}
                        disabled={findVideosMutation.isPending || selectedPlatforms.length === 0}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {findVideosMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4 mr-2" />
                        )}
                        {language === 'ar' ? 'البحث عن فيديوهات' : 'Find Videos'}
                      </Button>
                      
                      <Button
                        onClick={startAutomatedCommenting}
                        disabled={
                          isCommenting || 
                          selectedPlatforms.length === 0 || 
                          commentTexts.length === 0 ||
                          startCommentingMutation.isPending
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isCommenting || startCommentingMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4 mr-2" />
                        )}
                        {language === 'ar' ? 'بدء التعليقات التلقائية' : 'Start Automated Commenting'}
                      </Button>

                      {(isCommenting || liveStats?.activeCommenting) && (
                        <Button
                          onClick={stopAutomatedCommenting}
                          disabled={stopCommentingMutation.isPending}
                          variant="destructive"
                        >
                          {stopCommentingMutation.isPending ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Square className="w-4 h-4 mr-2" />
                          )}
                          {language === 'ar' ? 'إيقاف التعليقات' : 'Stop Commenting'}
                        </Button>
                      )}
                    </div>

                    {/* Live Progress */}
                    {(isCommenting || liveStats?.activeCommenting) && (
                      <Card className="bg-green-900/20 border-green-500/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Zap className="w-5 h-5 text-green-400 animate-pulse" />
                            <span className="font-semibold text-green-400">
                              {language === 'ar' ? 'جلسة التعليقات نشطة' : 'Commenting Session Active'}
                            </span>
                          </div>
                          
                          {liveStats?.currentSession && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>{language === 'ar' ? 'المنصة' : 'Platform'}: {liveStats.currentSession.platform}</span>
                                <span>{language === 'ar' ? 'التقدم' : 'Progress'}: {liveStats.currentSession.commentsSuccessful}/{liveStats.currentSession.commentsAttempted}</span>
                              </div>
                              <Progress 
                                value={liveStats.currentSession.commentsAttempted > 0 ? 
                                  (liveStats.currentSession.commentsSuccessful / liveStats.currentSession.commentsAttempted) * 100 : 0
                                } 
                                className="h-2"
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Enhanced API Keys Tab */}
              <TabsContent value="keys" className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      {language === 'ar' ? 'إعدادات مفاتيح API للتعليقات الحقيقية' : 'API Keys Configuration for Real Comments'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Important Notice */}
                    <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-300 mb-1">
                            {language === 'ar' ? 'مهم: مفاتيح API الحقيقية' : 'Important: Real API Keys'}
                          </h4>
                          <p className="text-blue-200 text-sm">
                            {language === 'ar' ? 
                              'هذه المفاتيح ضرورية لنشر التعليقات الحقيقية على المنصات. بدونها سيتم استخدام بيانات وهمية فقط.' :
                              'These keys are essential for posting real comments on platforms. Without them, only mock data will be used.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* YouTube API Keys */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Youtube className="w-5 h-5 text-red-500" />
                        YouTube API Configuration
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-slate-300">
                            YouTube Data API v3 Key
                          </Label>
                          <Input
                            type="password"
                            value={apiKeys.youtubeApiKey}
                            onChange={(e) => setApiKeys({...apiKeys, youtubeApiKey: e.target.value})}
                            placeholder="AIzaSy... (Required for real YouTube comments)"
                            className="bg-slate-700 border-slate-600 text-white mt-2"
                          />
                          <p className="text-xs text-slate-400 mt-1">
                            {language === 'ar' ? 'مطلوب لنشر التعليقات على YouTube' : 'Required for posting YouTube comments'}
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-slate-300">
                            YouTube API v3 Key (Alternative)
                          </Label>
                          <Input
                            type="password"
                            value={apiKeys.youtubeApiV3Key}
                            onChange={(e) => setApiKeys({...apiKeys, youtubeApiV3Key: e.target.value})}
                            placeholder="AIzaSy... (Backup key)"
                            className="bg-slate-700 border-slate-600 text-white mt-2"
                          />
                          <p className="text-xs text-slate-400 mt-1">
                            {language === 'ar' ? 'مفتاح احتياطي' : 'Backup key'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-slate-600" />

                    {/* Social Media APIs */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">
                        {language === 'ar' ? 'مفاتيح وسائل التواصل الاجتماعي' : 'Social Media API Keys'}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-slate-300 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            Facebook Access Token
                          </Label>
                          <Input
                            type="password"
                            value={apiKeys.facebookAccessToken}
                            onChange={(e) => setApiKeys({...apiKeys, facebookAccessToken: e.target.value})}
                            placeholder="EAAe... (For Facebook comments)"
                            className="bg-slate-700 border-slate-600 text-white mt-2"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-slate-300 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-slate-900" />
                            Twitter/X API Key
                          </Label>
                          <Input
                            type="password"
                            value={apiKeys.twitterApiKey}
                            onChange={(e) => setApiKeys({...apiKeys, twitterApiKey: e.target.value})}
                            placeholder="Twitter API Key"
                            className="bg-slate-700 border-slate-600 text-white mt-2"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-slate-300">
                            Twitter/X API Secret
                          </Label>
                          <Input
                            type="password"
                            value={apiKeys.twitterApiSecret}
                            onChange={(e) => setApiKeys({...apiKeys, twitterApiSecret: e.target.value})}
                            placeholder="Twitter API Secret"
                            className="bg-slate-700 border-slate-600 text-white mt-2"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-slate-300 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-black" />
                            TikTok Client Key
                          </Label>
                          <Input
                            type="password"
                            value={apiKeys.tiktokClientKey}
                            onChange={(e) => setApiKeys({...apiKeys, tiktokClientKey: e.target.value})}
                            placeholder="TikTok Client Key"
                            className="bg-slate-700 border-slate-600 text-white mt-2"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-slate-300">
                            TikTok Client Secret
                          </Label>
                          <Input
                            type="password"
                            value={apiKeys.tiktokClientSecret}
                            onChange={(e) => setApiKeys({...apiKeys, tiktokClientSecret: e.target.value})}
                            placeholder="TikTok Client Secret"
                            className="bg-slate-700 border-slate-600 text-white mt-2"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-slate-600" />

                    {/* RapidAPI Keys */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">
                        {language === 'ar' ? 'مفاتيح RapidAPI' : 'RapidAPI Keys'}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-slate-300 flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            RapidAPI Key (General)
                          </Label>
                          <Input
                            type="password"
                            value={apiKeys.rapidApiKey}
                            onChange={(e) => setApiKeys({...apiKeys, rapidApiKey: e.target.value})}
                            placeholder="RapidAPI Key for data extraction"
                            className="bg-slate-700 border-slate-600 text-white mt-2"
                          />
                          <p className="text-xs text-slate-400 mt-1">
                            {language === 'ar' ? 'لاستخراج بيانات الفيديوهات' : 'For video data extraction'}
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-slate-300">
                            RapidAPI TikTok Key
                          </Label>
                          <Input
                            type="password"
                            value={apiKeys.rapidApiTikTokKey}
                            onChange={(e) => setApiKeys({...apiKeys, rapidApiTikTokKey: e.target.value})}
                            placeholder="Specialized TikTok RapidAPI Key"
                            className="bg-slate-700 border-slate-600 text-white mt-2"
                          />
                          <p className="text-xs text-slate-400 mt-1">
                            {language === 'ar' ? 'مخصص لـ TikTok' : 'Specialized for TikTok'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4 border-t border-slate-600">
                      <Button 
                        onClick={saveApiKeys}
                        disabled={saveApiKeysMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {saveApiKeysMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {language === 'ar' ? 'حفظ المفاتيح' : 'Save Keys'}
                      </Button>

                      <Button 
                        onClick={testApiKeys}
                        disabled={testApiKeysMutation.isPending}
                        variant="outline"
                        className="border-slate-600"
                      >
                        {testApiKeysMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        {language === 'ar' ? 'اختبار المفاتيح' : 'Test Keys'}
                      </Button>
                    </div>
                    
                    {/* Security Notice */}
                    <div className="bg-amber-900/20 border border-amber-500/50 rounded-lg p-4">
                      <p className="text-amber-300 text-sm flex items-start gap-2">
                        <Key className="w-4 h-4 mt-0.5" />
                        {language === 'ar' ? 
                          'ملاحظة أمنية: مفاتيح API يتم حفظها بشكل آمن ومشفر محلياً. لن تظهر في أي سجلات أو إحصائيات.' :
                          'Security Note: API keys are saved securely and encrypted locally. They will not appear in any logs or statistics.'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Video Manager Tab */}
              <TabsContent value="videos" className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="w-5 h-5" />
                        {language === 'ar' ? 'إدارة الفيديوهات المكتشفة' : 'Discovered Videos Manager'}
                      </div>
                      {foundVideos.length > 0 && (
                        <Badge variant="outline">
                          {foundVideos.length} {language === 'ar' ? 'فيديو' : 'videos'}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {foundVideos.length > 0 ? (
                      <div className="space-y-4">
                        {/* Selection Controls */}
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={selectAllVideos}
                            className="border-slate-600"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {language === 'ar' ? 'تحديد الكل' : 'Select All'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={clearVideoSelection}
                            className="border-slate-600"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            {language === 'ar' ? 'إلغاء التحديد' : 'Clear Selection'}
                          </Button>
                          <Badge variant="secondary">
                            {selectedVideos.length} {language === 'ar' ? 'محدد' : 'selected'}
                          </Badge>
                        </div>

                        {/* Videos Grid */}
                        <ScrollArea className="h-96">
                          <div className="grid gap-4">
                            {foundVideos.map((video) => (
                              <Card 
                                key={video.id} 
                                className={`cursor-pointer transition-colors ${
                                  selectedVideos.includes(video.id) 
                                    ? 'bg-blue-900/30 border-blue-500' 
                                    : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                                }`}
                                onClick={() => toggleVideoSelection(video.id)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex gap-4">
                                    {/* Thumbnail */}
                                    <div className="w-24 h-16 bg-slate-600 rounded flex items-center justify-center flex-shrink-0">
                                      {video.thumbnailUrl ? (
                                        <img 
                                          src={video.thumbnailUrl} 
                                          alt={video.title}
                                          className="w-full h-full object-cover rounded"
                                        />
                                      ) : (
                                        <Video className="w-6 h-6 text-slate-400" />
                                      )}
                                    </div>
                                    
                                    {/* Video Info */}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                                        {video.title}
                                      </h4>
                                      <p className="text-slate-400 text-xs mb-2">
                                        {video.author.displayName} • {video.platform}
                                      </p>
                                      
                                      {/* Metrics */}
                                      <div className="flex items-center gap-4 text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                          <Eye className="w-3 h-3" />
                                          {video.views.toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Heart className="w-3 h-3" />
                                          {video.likes.toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <MessageSquare className="w-3 h-3" />
                                          {video.comments.toLocaleString()}
                                        </span>
                                        {video.duration > 0 && (
                                          <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                          </span>
                                        )}
                                      </div>
                                      
                                      {/* Hashtags */}
                                      {video.hashtags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {video.hashtags.slice(0, 3).map((tag, i) => (
                                            <Badge key={i} variant="secondary" className="text-xs">
                                              #{tag}
                                            </Badge>
                                          ))}
                                          {video.hashtags.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                              +{video.hashtags.length - 3}
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Selection Indicator */}
                                    <div className="flex items-center">
                                      {selectedVideos.includes(video.id) ? (
                                        <CheckCircle className="w-5 h-5 text-blue-400" />
                                      ) : (
                                        <div className="w-5 h-5 border-2 border-slate-500 rounded-full" />
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Video className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-300 mb-2">
                          {language === 'ar' ? 'لا توجد فيديوهات مكتشفة' : 'No Videos Discovered'}
                        </h3>
                        <p className="text-slate-400 mb-4">
                          {language === 'ar' ? 
                            'استخدم تبويب "التعليقات التلقائية" للبحث عن فيديوهات' : 
                            'Use the "Auto Comments" tab to search for videos'
                          }
                        </p>
                        <Button
                          onClick={() => setActiveTab('comments')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Search className="w-4 h-4 mr-2" />
                          {language === 'ar' ? 'البحث عن فيديوهات' : 'Search Videos'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Enhanced Monitoring Tab */}
              <TabsContent value="monitoring" className="space-y-6">
                {/* Live Activity Monitor */}
                {liveStats?.activeCommenting && (
                  <Card className="bg-slate-800 border-green-500 border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <Zap className="w-5 h-5 animate-pulse" />
                        {language === 'ar' ? 'مراقبة النشاط المباشر' : 'Live Activity Monitor'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-green-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-green-400">
                              {liveStats.totalCommentsPosted}
                            </p>
                            <p className="text-sm text-green-300">
                              {language === 'ar' ? 'إجمالي التعليقات' : 'Total Comments'}
                            </p>
                          </div>
                          
                          {liveStats.currentSession && (
                            <>
                              <div className="text-center p-4 bg-blue-900/20 rounded-lg">
                                <p className="text-2xl font-bold text-blue-400">
                                  {liveStats.currentSession.commentsSuccessful}
                                </p>
                                <p className="text-sm text-blue-300">
                                  {language === 'ar' ? 'تعليقات ناجحة' : 'Successful Comments'}
                                </p>
                              </div>
                              
                              <div className="text-center p-4 bg-purple-900/20 rounded-lg">
                                <p className="text-2xl font-bold text-purple-400">
                                  {liveStats.currentSession.platform}
                                </p>
                                <p className="text-sm text-purple-300">
                                  {language === 'ar' ? 'المنصة الحالية' : 'Current Platform'}
                                </p>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Platform Progress */}
                        {Object.entries(liveStats.platformStats).map(([platform, stats]) => (
                          <div key={platform} className="p-3 bg-slate-700 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-white capitalize">{platform}</span>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-green-400">
                                  {stats.successRate.toFixed(1)}% {language === 'ar' ? 'نجاح' : 'success'}
                                </span>
                                <span className="text-blue-400">
                                  {stats.totalComments} {language === 'ar' ? 'تعليق' : 'comments'}
                                </span>
                              </div>
                            </div>
                            <Progress value={stats.successRate} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Session History */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      {language === 'ar' ? 'سجل الجلسات' : 'Session History'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sessionResults.length > 0 ? (
                      <ScrollArea className="h-64">
                        <div className="space-y-3">
                          {sessionResults.slice().reverse().map((session, index) => (
                            <Card key={session.id || index} className="bg-slate-700 border-slate-600">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant={session.status === 'completed' ? 'default' : 
                                              session.status === 'error' ? 'destructive' : 'secondary'}
                                    >
                                      {session.platform}
                                    </Badge>
                                    <span className="text-sm text-slate-300">
                                      {session.status === 'completed' ? 
                                        (language === 'ar' ? 'مكتملة' : 'Completed') :
                                        session.status === 'error' ?
                                        (language === 'ar' ? 'خطأ' : 'Error') :
                                        (language === 'ar' ? 'قيد التشغيل' : 'Running')
                                      }
                                    </span>
                                  </div>
                                  <span className="text-xs text-slate-400">
                                    {new Date(session.startTime).toLocaleString()}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-slate-400">{language === 'ar' ? 'فيديوهات' : 'Videos'}</p>
                                    <p className="font-semibold text-white">{session.videosFound}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400">{language === 'ar' ? 'نجحت' : 'Successful'}</p>
                                    <p className="font-semibold text-green-400">{session.commentsSuccessful}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400">{language === 'ar' ? 'فشلت' : 'Failed'}</p>
                                    <p className="font-semibold text-red-400">{session.commentsFailed}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400">{language === 'ar' ? 'زمن الاستجابة' : 'Avg Response'}</p>
                                    <p className="font-semibold text-blue-400">{session.avgResponseTime}ms</p>
                                  </div>
                                </div>

                                {session.errors.length > 0 && (
                                  <div className="mt-3 p-2 bg-red-900/20 rounded">
                                    <p className="text-red-400 text-xs">
                                      {language === 'ar' ? 'أخطاء:' : 'Errors:'} {session.errors.join(', ')}
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400">
                          {language === 'ar' ? 'لا توجد جلسات تعليقات حتى الآن' : 'No commenting sessions yet'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Real-time Publishing Status */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      {language === 'ar' ? 'حالة النشر المباشرة' : 'Live Publishing Status'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(publishingStatus as any)?.platforms?.length > 0 ? (
                        (publishingStatus as any).platforms.map((platform: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant={platform.status === 'success' ? 'default' : 'destructive'}>
                                {platform.name}
                              </Badge>
                              <span className="text-sm text-slate-300">
                                {platform.status === 'success' ? 
                                  (language === 'ar' ? 'نشط' : 'Active') : 
                                  (language === 'ar' ? 'معطل' : 'Inactive')
                                }
                              </span>
                            </div>
                            {platform.lastActivity && (
                              <span className="text-xs text-slate-400">
                                {language === 'ar' ? 'آخر نشاط:' : 'Last:'} {platform.lastActivity}
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-slate-400 py-4">
                          {language === 'ar' ? 'لا توجد منصات نشر نشطة حالياً' : 'No active publishing platforms currently'}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Floating Scroll to Top Button */}
      {showScrollToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-300"
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}