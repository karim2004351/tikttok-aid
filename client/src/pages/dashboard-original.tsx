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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, 
  Pause, 
  Settings, 
  Youtube, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  Share,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Key,
  RefreshCw,
  Monitor,
  Database,
  Cpu,
  Activity,
  Globe,
  Upload,
  Download,
  BarChart3,
  Zap
} from "lucide-react";

interface ApiKeys {
  youtubeApiKey: string;
  facebookAccessToken: string;
  twitterBearerToken: string;
  tiktokClientKey: string;
  rapidApiKey: string;
}

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

interface LiveStats {
  totalCommentsPosted: number;
  activeCommenting: boolean;
  liveResults: CommentingSession[];
}

export default function DashboardOriginal() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  
  // API Keys State
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    youtubeApiKey: '',
    facebookAccessToken: '',
    twitterBearerToken: '',
    tiktokClientKey: '',
    rapidApiKey: ''
  });

  // Comments System State
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['youtube']);
  const [commentTexts, setCommentTexts] = useState<string[]>(['رائع! 👍', 'محتوى مميز']);
  const [videosPerPlatform, setVideosPerPlatform] = useState(5);
  const [commentsPerVideo, setCommentsPerVideo] = useState(1);
  const [targetVideoUrl, setTargetVideoUrl] = useState('');
  const [includeTargetVideo, setIncludeTargetVideo] = useState(true);
  const [currentCommentInput, setCurrentCommentInput] = useState('');
  
  // Session State
  const [isCommenting, setIsCommenting] = useState(false);
  const [foundVideos, setFoundVideos] = useState<VideoTarget[]>([]);
  const [sessionResults, setSessionResults] = useState<CommentingSession[]>([]);

  const isRTL = language === 'ar';

  // Data Queries
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    refetchInterval: 5000,
  });

  const { data: serverStatus } = useQuery<{status: string; cpu: number; memory: number; uptime: number; activeConnections: number}>({
    queryKey: ["/api/server-status"],
    refetchInterval: 3000,
  });

  const { data: liveStats } = useQuery<LiveStats>({
    queryKey: ['/api/comments-live-stats'],
    refetchInterval: 2000,
  });

  const { data: publishingStatus } = useQuery({
    queryKey: ["/api/publishing-status"],
    refetchInterval: 3000,
  });

  // Mutations
  const findVideosMutation = useMutation({
    mutationFn: async ({ platform, count }: { platform: string; count: number }) => {
      const response = await apiRequest("POST", "/api/find-trending-videos", { platform, count });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setFoundVideos(prev => [...prev, ...data.videos]);
        toast({
          title: "تم العثور على فيديوهات",
          description: `تم العثور على ${data.videos.length} فيديو على ${data.platform}`,
        });
      }
    },
  });

  const startCommentingMutation = useMutation({
    mutationFn: async (params: any) => {
      const response = await apiRequest("POST", "/api/start-automated-commenting", {
        ...params,
        apiKeys: apiKeys
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setSessionResults(data.data);
        setIsCommenting(false);
        toast({
          title: "انتهت جلسة التعليقات",
          description: `تم نشر ${data.summary.totalCommentsPosted} تعليق على ${data.summary.totalPlatforms} منصة`,
        });
      }
    },
    onError: () => {
      setIsCommenting(false);
    }
  });

  const saveApiKeysMutation = useMutation({
    mutationFn: async (keys: ApiKeys) => {
      const response = await apiRequest("POST", "/api/save-api-keys", keys);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم حفظ المفاتيح",
        description: "تم حفظ مفاتيح API بنجاح",
      });
    },
  });

  // Actions
  const addCommentText = () => {
    if (currentCommentInput.trim()) {
      setCommentTexts([...commentTexts, currentCommentInput.trim()]);
      setCurrentCommentInput('');
    }
  };

  const removeCommentText = (index: number) => {
    setCommentTexts(commentTexts.filter((_, i) => i !== index));
  };

  const searchTrendingVideos = async () => {
    setFoundVideos([]);
    for (const platform of selectedPlatforms) {
      await findVideosMutation.mutateAsync({ platform, count: videosPerPlatform });
    }
  };

  const startAutomatedCommenting = async () => {
    if (commentTexts.length === 0 || selectedPlatforms.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة نصوص التعليقات واختيار المنصات",
        variant: "destructive"
      });
      return;
    }

    setIsCommenting(true);
    setSessionResults([]);

    await startCommentingMutation.mutateAsync({
      platforms: selectedPlatforms,
      commentTexts,
      videosPerPlatform,
      commentsPerVideo,
      targetVideoUrl: includeTargetVideo ? targetVideoUrl : '',
    });
  };

  const saveApiKeys = () => {
    saveApiKeysMutation.mutate(apiKeys);
  };

  const platformOptions = [
    { value: 'youtube', label: 'YouTube', icon: Youtube },
    { value: 'tiktok', label: 'TikTok', icon: TrendingUp },
    { value: 'facebook', label: 'Facebook', icon: Users },
    { value: 'instagram', label: 'Instagram', icon: Eye },
    { value: 'twitter', label: 'Twitter', icon: MessageSquare },
  ];

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <LanguageToggleHeader />
      
      <div className="flex min-h-screen">
        <CompactSidebar />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {language === 'ar' ? 'لوحة القيادة الشاملة' : 'Comprehensive Dashboard'}
                </h1>
                <p className="text-slate-400">
                  {language === 'ar' ? 'النشر التلقائي والتعليقات الذكية' : 'Automated Publishing & Smart Comments'}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge variant={serverStatus?.status === 'online' ? 'default' : 'destructive'} className="px-3 py-1">
                  <Activity className="w-3 h-3 mr-1" />
                  {serverStatus?.status === 'online' ? 
                    (language === 'ar' ? 'متصل' : 'Online') : 
                    (language === 'ar' ? 'غير متصل' : 'Offline')
                  }
                </Badge>
                
                <div className="text-sm text-slate-400">
                  {language === 'ar' ? 'المنشورات' : 'Posts'}: {(stats as any)?.totalPublications || 0}
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview">
                  {language === 'ar' ? 'نظرة عامة' : 'Overview'}
                </TabsTrigger>
                <TabsTrigger value="comments">
                  {language === 'ar' ? 'التعليقات التلقائية' : 'Auto Comments'}
                </TabsTrigger>
                <TabsTrigger value="keys">
                  {language === 'ar' ? 'مفاتيح API' : 'API Keys'}
                </TabsTrigger>
                <TabsTrigger value="monitoring">
                  {language === 'ar' ? 'المراقبة المباشرة' : 'Live Monitoring'}
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Stats Cards */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">
                            {language === 'ar' ? 'إجمالي المنشورات' : 'Total Posts'}
                          </p>
                          <p className="text-2xl font-bold text-green-400">
                            {(stats as any)?.totalPublications || 0}
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
                            {language === 'ar' ? 'النشر الناجح' : 'Successful Posts'}
                          </p>
                          <p className="text-2xl font-bold text-blue-400">
                            {(stats as any)?.successfulPublications || 0}
                          </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-blue-400" />
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
                            {(stats as any)?.averageSuccessRate || 0}%
                          </p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-yellow-400" />
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
                          <p className="text-2xl font-bold text-purple-400">
                            {liveStats?.totalCommentsPosted || 0}
                          </p>
                        </div>
                        <MessageSquare className="w-8 h-8 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Server Status */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="w-5 h-5" />
                      {language === 'ar' ? 'حالة الخادم' : 'Server Status'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Comments Tab */}
              <TabsContent value="comments" className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      {language === 'ar' ? 'نظام التعليقات التلقائية المتقدم' : 'Advanced Automated Comments System'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Platform Selection */}
                    <div>
                      <Label className="text-slate-300 mb-3 block">
                        {language === 'ar' ? 'اختر المنصات المستهدفة' : 'Select Target Platforms'}
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {platformOptions.map((platform) => (
                          <Button
                            key={platform.value}
                            variant={selectedPlatforms.includes(platform.value) ? "default" : "outline"}
                            className={`flex items-center gap-2 ${
                              selectedPlatforms.includes(platform.value) 
                                ? 'bg-blue-600 hover:bg-blue-700' 
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
                            <platform.icon className="w-4 h-4" />
                            {platform.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Comments Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-slate-300">
                          {language === 'ar' ? 'عدد الفيديوهات لكل منصة' : 'Videos per Platform'}
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="50"
                          value={videosPerPlatform}
                          onChange={(e) => setVideosPerPlatform(parseInt(e.target.value) || 1)}
                          className="bg-slate-700 border-slate-600 text-white mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-slate-300">
                          {language === 'ar' ? 'عدد التعليقات لكل فيديو' : 'Comments per Video'}
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={commentsPerVideo}
                          onChange={(e) => setCommentsPerVideo(parseInt(e.target.value) || 1)}
                          className="bg-slate-700 border-slate-600 text-white mt-2"
                        />
                      </div>
                    </div>

                    {/* Comment Texts */}
                    <div>
                      <Label className="text-slate-300 mb-3 block">
                        {language === 'ar' ? 'نصوص التعليقات' : 'Comment Texts'}
                      </Label>
                      <div className="space-y-2 mb-3">
                        {commentTexts.map((text, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-slate-700 rounded">
                            <span className="flex-1 text-sm">{text}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeCommentText(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={currentCommentInput}
                          onChange={(e) => setCurrentCommentInput(e.target.value)}
                          placeholder={language === 'ar' ? 'أضف نص تعليق جديد...' : 'Add new comment text...'}
                          className="bg-slate-700 border-slate-600 text-white"
                          onKeyPress={(e) => e.key === 'Enter' && addCommentText()}
                        />
                        <Button onClick={addCommentText} disabled={!currentCommentInput.trim()}>
                          {language === 'ar' ? 'إضافة' : 'Add'}
                        </Button>
                      </div>
                    </div>

                    {/* Target Video URL */}
                    <div className="flex items-center space-x-3">
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
                        placeholder={language === 'ar' ? 'رابط الفيديو المستهدف...' : 'Target video URL...'}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    )}

                    {/* Control Buttons */}
                    <div className="flex gap-4">
                      <Button
                        onClick={searchTrendingVideos}
                        disabled={findVideosMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {findVideosMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <TrendingUp className="w-4 h-4 mr-2" />
                        )}
                        {language === 'ar' ? 'البحث عن فيديوهات رائجة' : 'Find Trending Videos'}
                      </Button>
                      
                      <Button
                        onClick={startAutomatedCommenting}
                        disabled={isCommenting || selectedPlatforms.length === 0 || commentTexts.length === 0}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isCommenting ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4 mr-2" />
                        )}
                        {language === 'ar' ? 'بدء التعليقات التلقائية' : 'Start Automated Commenting'}
                      </Button>
                    </div>

                    {/* Found Videos */}
                    {foundVideos.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">
                          {language === 'ar' ? 'الفيديوهات الموجودة' : 'Found Videos'} ({foundVideos.length})
                        </h4>
                        <ScrollArea className="h-48">
                          <div className="space-y-2">
                            {foundVideos.map((video, index) => (
                              <div key={index} className="p-3 bg-slate-700 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="font-semibold text-white text-sm">{video.title}</p>
                                    <p className="text-slate-400 text-xs">{video.author} • {video.platform}</p>
                                  </div>
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
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}

                    {/* Session Results */}
                    {sessionResults.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">
                          {language === 'ar' ? 'نتائج الجلسة' : 'Session Results'}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {sessionResults.map((result, index) => (
                            <Card key={index} className="bg-slate-700 border-slate-600">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-semibold text-white">{result.platform}</h5>
                                  <Badge variant={result.commentsPosted > 0 ? "default" : "destructive"}>
                                    {result.commentsPosted > 0 ? 
                                      (language === 'ar' ? 'نجح' : 'Success') : 
                                      (language === 'ar' ? 'فشل' : 'Failed')
                                    }
                                  </Badge>
                                </div>
                                <div className="space-y-1 text-sm text-slate-300">
                                  <p>{language === 'ar' ? 'فيديوهات:' : 'Videos:'} {result.videosFound}</p>
                                  <p>{language === 'ar' ? 'تعليقات منشورة:' : 'Comments Posted:'} {result.commentsPosted}</p>
                                  <p>{language === 'ar' ? 'فشلت:' : 'Failed:'} {result.failed}</p>
                                  <p>{language === 'ar' ? 'المدة:' : 'Duration:'} {result.duration}s</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* API Keys Tab */}
              <TabsContent value="keys" className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      {language === 'ar' ? 'إعدادات مفاتيح API' : 'API Keys Configuration'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-slate-300">YouTube API Key</Label>
                        <Input
                          type="password"
                          value={apiKeys.youtubeApiKey}
                          onChange={(e) => setApiKeys({...apiKeys, youtubeApiKey: e.target.value})}
                          placeholder="AIza..."
                          className="bg-slate-700 border-slate-600 text-white mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-slate-300">Facebook Access Token</Label>
                        <Input
                          type="password"
                          value={apiKeys.facebookAccessToken}
                          onChange={(e) => setApiKeys({...apiKeys, facebookAccessToken: e.target.value})}
                          placeholder="EAAe..."
                          className="bg-slate-700 border-slate-600 text-white mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-slate-300">Twitter Bearer Token</Label>
                        <Input
                          type="password"
                          value={apiKeys.twitterBearerToken}
                          onChange={(e) => setApiKeys({...apiKeys, twitterBearerToken: e.target.value})}
                          placeholder="AAAAAAAAAAAAAAAAAAAAAMLheAAAAAAA..."
                          className="bg-slate-700 border-slate-600 text-white mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-slate-300">TikTok Client Key</Label>
                        <Input
                          type="password"
                          value={apiKeys.tiktokClientKey}
                          onChange={(e) => setApiKeys({...apiKeys, tiktokClientKey: e.target.value})}
                          placeholder="aw..."
                          className="bg-slate-700 border-slate-600 text-white mt-2"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label className="text-slate-300">RapidAPI Key</Label>
                        <Input
                          type="password"
                          value={apiKeys.rapidApiKey}
                          onChange={(e) => setApiKeys({...apiKeys, rapidApiKey: e.target.value})}
                          placeholder="..."
                          className="bg-slate-700 border-slate-600 text-white mt-2"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={saveApiKeys}
                      disabled={saveApiKeysMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {saveApiKeysMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      {language === 'ar' ? 'حفظ المفاتيح' : 'Save Keys'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Monitoring Tab */}
              <TabsContent value="monitoring" className="space-y-6">
                {/* Live Comments Activity */}
                {liveStats?.activeCommenting && (
                  <Card className="bg-slate-800 border-slate-700 border-green-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <Zap className="w-5 h-5 animate-pulse" />
                        {language === 'ar' ? 'التعليقات النشطة مباشرة' : 'Live Comments Activity'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">
                            {language === 'ar' ? 'إجمالي التعليقات المنشورة' : 'Total Comments Posted'}
                          </span>
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            {liveStats.totalCommentsPosted}
                          </Badge>
                        </div>
                        
                        {liveStats.liveResults?.map((result, index) => (
                          <div key={index} className="p-3 bg-slate-700 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-white">{result.platform}</span>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-green-400">{result.commentsPosted}</span>
                              </div>
                            </div>
                            <Progress 
                              value={(result.commentsPosted / (result.commentsPosted + result.failed)) * 100} 
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Publishing Status */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle>
                      {language === 'ar' ? 'حالة النشر المباشرة' : 'Live Publishing Status'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(publishingStatus as any)?.platforms?.map((platform: any, index: number) => (
                        <div key={index} className="p-3 bg-slate-700 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">{platform.name}</span>
                            <Badge variant={platform.status === 'success' ? 'default' : 'destructive'}>
                              {platform.status}
                            </Badge>
                          </div>
                          {platform.lastActivity && (
                            <p className="text-sm text-slate-400 mt-1">
                              {language === 'ar' ? 'آخر نشاط:' : 'Last activity:'} {platform.lastActivity}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}