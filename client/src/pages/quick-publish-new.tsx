import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Zap, 
  Upload, 
  Play, 
  Pause, 
  Settings, 
  Globe,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Video,
  Brain,
  Hash,
  Type,
  Loader2,
  Eye,
  Edit3,
  Repeat,
  Target,
  BarChart3,
  Share2,
  RefreshCw,
  X,
  Plus,
  ExternalLink,
  Search
} from "lucide-react";

interface PublishingStats {
  totalSites: number;
  activeSites: number;
  successRate: number;
  estimatedTime: string;
}

interface VideoAnalysis {
  title: string;
  description: string;
  hashtags: string[];
  category: string;
  rating: number;
  analyzing: boolean;
}

interface SiteConfig {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
  postsCount: number;
  maxPosts: number;
  attempts: number;
  status: 'pending' | 'publishing' | 'success' | 'failed' | 'retrying';
  lastAttempt?: string;
  error?: string;
}

interface PublishingSession {
  isActive: boolean;
  currentSite?: string;
  completedSites: number;
  failedSites: number;
  totalAttempts: number;
  successfulPosts: number;
  startTime?: Date;
  logs: PublishingLog[];
}

interface PublishingLog {
  id: string;
  timestamp: Date;
  siteId: string;
  siteName: string;
  attempt: number;
  status: 'success' | 'failed' | 'retrying';
  message: string;
}

export default function QuickPublishNew() {
  const [videoUrl, setVideoUrl] = useState("");
  const [userCredentials, setUserCredentials] = useState({ email: "", password: "" });
  const [apiKeys, setApiKeys] = useState({
    facebook_access_token: "EAAeOZCmiUlmkBO5wz41b4EH8jPTgbWZAmeaDGi3DcilwmZAqDHZClZA1hvVOyhOTBLNp0OX6PlwxZCA2dpUyljRTl1xajAmSIp5ySmUAquvRZAeZBLJ2AphGK9Mq6mURuxzzdl5lowAoQlFL33JlZCCSitoO1qa4tNm05GtyoXCD3R9VgZBDmpoqet6mfcii9wwJtyAAZDZD",
    facebook_page_id: "",
    twitter_bearer_token: "",
    linkedin_access_token: "",
    linkedin_person_urn: "",
    instagram_access_token: "",
    instagram_account_id: ""
  });
  const [videoAnalysis, setVideoAnalysis] = useState<VideoAnalysis>({
    title: "",
    description: "",
    hashtags: [],
    category: "",
    rating: 0,
    analyzing: false
  });
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [customHashtag, setCustomHashtag] = useState("");
  const [sites, setSites] = useState<SiteConfig[]>([]);
  const [publishingSession, setPublishingSession] = useState<PublishingSession>({
    isActive: false,
    completedSites: 0,
    failedSites: 0,
    totalAttempts: 0,
    successfulPosts: 0,
    logs: []
  });
  const [globalPostsCount, setGlobalPostsCount] = useState(3);
  const [enableAllSites, setEnableAllSites] = useState(true);
  const [stats, setStats] = useState<PublishingStats>({
    totalSites: 1173,
    activeSites: 1089,
    successRate: 87,
    estimatedTime: "2-4 دقائق"
  });
  const [verificationResults, setVerificationResults] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const { toast } = useToast();

  // تحميل المواقع عند بدء التطبيق
  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const response = await fetch('/api/admin/sites-detailed');
      if (response.ok) {
        const data = await response.json();
        const formattedSites = data.sites.slice(0, 50).map((site: any) => ({
          id: site.id,
          name: site.name,
          category: site.category,
          enabled: site.enabled,
          postsCount: 0,
          maxPosts: globalPostsCount,
          attempts: 0,
          status: 'pending' as const
        }));
        setSites(formattedSites);
      }
    } catch (error) {
      console.error('خطأ في تحميل المواقع:', error);
    }
  };

  // تحليل الفيديو بالذكاء الاصطناعي
  const analyzeVideo = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط الفيديو أولاً",
        variant: "destructive",
      });
      return;
    }

    setVideoAnalysis(prev => ({ ...prev, analyzing: true }));

    try {
      const response = await fetch('/api/analyze-video-real', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success && data.data) {
          const analysis = data.data;
          setVideoAnalysis({
            title: analysis.title || 'عنوان محلل',
            description: analysis.description || '',
            hashtags: Array.isArray(analysis.hashtags) ? analysis.hashtags : [],
            category: analysis.category || 'عام',
            rating: analysis.rating || 0,
            analyzing: false
          });
          setSelectedTitle(analysis.title || 'عنوان محلل');
          setSelectedHashtags(Array.isArray(analysis.hashtags) ? analysis.hashtags.slice(0, 5) : []);
          
          toast({
            title: "تم التحليل بنجاح!",
            description: `تم استخراج ${Array.isArray(analysis.hashtags) ? analysis.hashtags.length : 0} هاشتاغ و عنوان مقترح`,
          });
        } else {
          throw new Error(data.message || 'فشل في تحليل البيانات');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'خطأ في الخادم');
      }
    } catch (error) {
      toast({
        title: "خطأ في التحليل",
        description: "تعذر تحليل الفيديو، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setVideoAnalysis(prev => ({ ...prev, analyzing: false }));
    }
  };

  // إضافة هاشتاغ مخصص
  const addCustomHashtag = () => {
    if (customHashtag.trim() && !selectedHashtags.includes(customHashtag.trim())) {
      setSelectedHashtags(prev => [...prev, customHashtag.trim()]);
      setCustomHashtag("");
    }
  };

  // إزالة هاشتاغ
  const removeHashtag = (hashtag: string) => {
    setSelectedHashtags(prev => prev.filter(h => h !== hashtag));
  };

  // تحديث عدد المنشورات لموقع معين
  const updateSitePostsCount = (siteId: string, count: number) => {
    setSites(prev => prev.map(site => 
      site.id === siteId 
        ? { ...site, maxPosts: Math.min(count, 100) }
        : site
    ));
  };

  // تفعيل/إلغاء تفعيل موقع
  const toggleSite = (siteId: string, enabled: boolean) => {
    setSites(prev => prev.map(site => 
      site.id === siteId 
        ? { ...site, enabled }
        : site
    ));
  };

  // تفعيل/إلغاء تفعيل جميع المواقع
  const toggleAllSites = (enabled: boolean) => {
    setEnableAllSites(enabled);
    setSites(prev => prev.map(site => ({ ...site, enabled })));
  };

  // تحديث عدد المنشورات العام
  const updateGlobalPostsCount = (count: number) => {
    setGlobalPostsCount(count);
    setSites(prev => prev.map(site => ({ ...site, maxPosts: count })));
  };

  // التحقق من النشر
  const verifyPublishing = async () => {
    if (!selectedTitle) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال عنوان للتحقق من نشره",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResults(null);
    
    try {
      const response = await fetch('/api/verify-publishing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedTitle,
          videoUrl: videoUrl
        })
      });

      if (response.ok) {
        const data = await response.json();
        setVerificationResults(data.results);
        
        toast({
          title: "تم التحقق بنجاح",
          description: `تم العثور على ${data.results.verified} منشور من أصل ${data.results.totalChecked} منصة`,
        });
      } else {
        throw new Error('فشل في التحقق من النشر');
      }
    } catch (error: any) {
      toast({
        title: "خطأ في التحقق",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // إضافة سجل نشر
  const addPublishingLog = (siteId: string, siteName: string, attempt: number, status: 'success' | 'failed' | 'retrying', message: string) => {
    const newLog: PublishingLog = {
      id: `${siteId}_${Date.now()}_${attempt}`,
      timestamp: new Date(),
      siteId,
      siteName,
      attempt,
      status,
      message
    };

    setPublishingSession(prev => ({
      ...prev,
      logs: [newLog, ...prev.logs.slice(0, 99)]
    }));
  };

  // محاكاة النشر لموقع واحد مع المحاولات
  const publishToSite = async (site: SiteConfig): Promise<boolean> => {
    const maxAttempts = 3;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      setSites(prev => prev.map(s => 
        s.id === site.id 
          ? { ...s, status: attempt === 1 ? 'publishing' : 'retrying', attempts: attempt }
          : s
      ));

      setPublishingSession(prev => ({
        ...prev,
        currentSite: site.name,
        totalAttempts: prev.totalAttempts + 1
      }));

      addPublishingLog(
        site.id, 
        site.name, 
        attempt, 
        attempt > 1 ? 'retrying' : 'success',
        `المحاولة ${attempt} من ${maxAttempts}`
      );

      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

      const success = Math.random() > 0.15;

      if (success) {
        setSites(prev => prev.map(s => 
          s.id === site.id 
            ? { ...s, status: 'success', postsCount: s.maxPosts }
            : s
        ));

        addPublishingLog(
          site.id, 
          site.name, 
          attempt, 
          'success',
          `تم النشر بنجاح - ${site.maxPosts} منشور`
        );

        setPublishingSession(prev => ({
          ...prev,
          completedSites: prev.completedSites + 1,
          successfulPosts: prev.successfulPosts + site.maxPosts
        }));

        return true;
      } else if (attempt === maxAttempts) {
        setSites(prev => prev.map(s => 
          s.id === site.id 
            ? { ...s, status: 'failed', error: 'فشل بعد 3 محاولات' }
            : s
        ));

        addPublishingLog(
          site.id, 
          site.name, 
          attempt, 
          'failed',
          'فشل نهائي بعد 3 محاولات'
        );

        setPublishingSession(prev => ({
          ...prev,
          failedSites: prev.failedSites + 1
        }));

        return false;
      }
      
      addPublishingLog(
        site.id, 
        site.name, 
        attempt, 
        'failed',
        `فشلت المحاولة ${attempt}، سيعيد المحاولة...`
      );
    }

    return false;
  };

  const handleQuickPublish = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط الفيديو",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTitle.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال عنوان للمنشور",
        variant: "destructive",
      });
      return;
    }

    const enabledSites = sites.filter(site => site.enabled);
    if (enabledSites.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى تفعيل موقع واحد على الأقل للنشر",
        variant: "destructive",
      });
      return;
    }

    setPublishingSession({
      isActive: true,
      currentSite: "",
      completedSites: 0,
      failedSites: 0,
      totalAttempts: 0,
      successfulPosts: 0,
      startTime: new Date(),
      logs: []
    });

    setSites(prev => prev.map(site => ({
      ...site,
      status: site.enabled ? 'pending' : site.status,
      attempts: 0,
      postsCount: 0,
      error: undefined
    })));

    toast({
      title: "بدء النشر",
      description: `سيتم النشر على ${enabledSites.length} موقع`,
    });

    for (const site of enabledSites) {
      if (!publishingSession.isActive) break;
      
      await publishToSite(site);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setPublishingSession(prev => ({
      ...prev,
      isActive: false,
      currentSite: undefined
    }));

    const successfulSites = sites.filter(site => site.status === 'success').length;
    const failedSites = sites.filter(site => site.status === 'failed').length;

    toast({
      title: "انتهت عملية النشر",
      description: `نجح: ${successfulSites} | فشل: ${failedSites}`,
    });
  };

  // النشر الحقيقي باستخدام بيانات الاعتماد الحقيقية
  const handleRealPublish = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط الفيديو",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTitle.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال عنوان للمنشور",
        variant: "destructive",
      });
      return;
    }

    setPublishingSession({
      isActive: true,
      currentSite: "جاري النشر الحقيقي...",
      completedSites: 0,
      failedSites: 0,
      totalAttempts: 0,
      successfulPosts: 0,
      startTime: new Date(),
      logs: []
    });

    try {
      const response = await fetch('/api/real-publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl,
          title: selectedTitle,
          description: selectedHashtags.join(' '),
          userCredentials: userCredentials
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPublishingSession(prev => ({
          ...prev,
          isActive: false,
          completedSites: data.results.length,
          successfulPosts: data.totalPublished || data.results.reduce((sum: number, r: any) => sum + r.successful, 0)
        }));

        toast({
          title: "تم النشر الحقيقي بنجاح!",
          description: data.message,
        });

        // تحديث السجلات
        data.results.forEach((result: any, index: number) => {
          addPublishingLog(
            `real_${index}`,
            result.siteName,
            1,
            result.successful > 0 ? 'success' : 'failed',
            `${result.successful}/${result.attempted} posts published`
          );
        });
      } else {
        throw new Error(data.message || 'فشل النشر الحقيقي');
      }
    } catch (error) {
      setPublishingSession(prev => ({
        ...prev,
        isActive: false
      }));

      toast({
        title: "خطأ في النشر الحقيقي",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    }
  };

  const handleFreePublish = async () => {
    if (!videoUrl.trim() || !selectedTitle.trim()) {
      toast({
        title: "بيانات مفقودة",
        description: "يرجى إدخال رابط الفيديو والعنوان",
        variant: "destructive",
      });
      return;
    }

    setPublishingSession({
      isActive: true,
      currentSite: "جاري النشر المجاني...",
      completedSites: 0,
      failedSites: 0,
      totalAttempts: 0,
      successfulPosts: 0,
      startTime: new Date(),
      logs: []
    });

    try {
      const response = await fetch('/api/free-publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl,
          title: selectedTitle,
          hashtags: selectedHashtags.join(' ')
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPublishingSession(prev => ({
          ...prev,
          isActive: false,
          completedSites: data.results.length,
          successfulPosts: data.results.filter((r: any) => r.success).length
        }));

        toast({
          title: "تم النشر المجاني بنجاح!",
          description: data.message,
        });

        data.results.forEach((result: any, index: number) => {
          addPublishingLog(
            `free_${index}`,
            result.platform,
            1,
            result.success ? 'success' : 'failed',
            result.success ? 'تم النشر بنجاح' : result.error || 'فشل النشر'
          );
        });
      } else {
        throw new Error(data.message || 'فشل النشر المجاني');
      }
    } catch (error) {
      setPublishingSession(prev => ({
        ...prev,
        isActive: false
      }));

      toast({
        title: "خطأ في النشر المجاني",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    }
  };

  const handlePremiumPublish = async () => {
    if (!videoUrl.trim() || !selectedTitle.trim()) {
      toast({
        title: "بيانات مفقودة",
        description: "يرجى إدخال رابط الفيديو والعنوان",
        variant: "destructive",
      });
      return;
    }

    setPublishingSession({
      isActive: true,
      currentSite: "جاري النشر بالمفاتيح...",
      completedSites: 0,
      failedSites: 0,
      totalAttempts: 0,
      successfulPosts: 0,
      startTime: new Date(),
      logs: []
    });

    try {
      const selectedPlatforms = ['facebook'];
      
      const response = await fetch('/api/premium-publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl,
          title: selectedTitle,
          hashtags: selectedHashtags.join(' '),
          apiKeys: apiKeys
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPublishingSession(prev => ({
          ...prev,
          isActive: false,
          completedSites: data.results.length,
          successfulPosts: data.results.filter((r: any) => r.success).length
        }));

        toast({
          title: "تم النشر بالمفاتيح بنجاح!",
          description: data.message,
        });

        data.results.forEach((result: any, index: number) => {
          addPublishingLog(
            `premium_${index}`,
            result.platform,
            1,
            result.success ? 'success' : 'failed',
            result.success ? 'تم النشر بنجاح' : result.error || 'فشل النشر'
          );
        });
      } else {
        throw new Error(data.error || 'فشل النشر بالمفاتيح');
      }
    } catch (error) {
      setPublishingSession(prev => ({
        ...prev,
        isActive: false
      }));

      toast({
        title: "خطأ في النشر بالمفاتيح",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    }
  };

  const stopPublishing = () => {
    setPublishingSession(prev => ({
      ...prev,
      isActive: false
    }));
    
    toast({
      title: "تم إيقاف النشر",
      description: "سيتم إيقاف النشر بعد انتهاء الموقع الحالي",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Zap className="text-yellow-500" />
            ⚡ النشر السريع المتقدم
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            نشر متقدم مع تحليل ذكي للفيديو واستخراج العناوين والهاشتاغات
          </p>
        </div>

        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              تحليل الفيديو
            </TabsTrigger>
            <TabsTrigger value="sites" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              إدارة المواقع
            </TabsTrigger>
            <TabsTrigger value="publishing" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              حالة النشر
            </TabsTrigger>
          </TabsList>

          {/* تبويب تحليل الفيديو */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* إدخال رابط الفيديو */}
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="text-blue-500" />
                    🎬 رابط الفيديو
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>رابط الفيديو (TikTok, YouTube, Instagram)</Label>
                    <Input
                      placeholder="https://www.tiktok.com/@username/video/..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="text-left"
                    />
                  </div>
                  <Button 
                    onClick={analyzeVideo} 
                    disabled={videoAnalysis.analyzing || !videoUrl.trim()}
                    className="w-full"
                  >
                    {videoAnalysis.analyzing ? (
                      <>
                        <Loader2 className="animate-spin ml-2" />
                        جاري التحليل...
                      </>
                    ) : (
                      <>
                        <Brain className="ml-2" />
                        تحليل بالذكاء الاصطناعي
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* نتائج التحليل */}
              <Card className="border-2 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="text-green-500" />
                    📊 نتائج التحليل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {videoAnalysis.title ? (
                    <>
                      <div>
                        <Label>العنوان المقترح</Label>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          {videoAnalysis.title}
                        </div>
                      </div>
                      <div>
                        <Label>التصنيف: {videoAnalysis.category}</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <span>التقييم:</span>
                          <Badge variant="secondary">{videoAnalysis.rating}/5</Badge>
                        </div>
                      </div>
                      <div>
                        <Label>الهاشتاغات المستخرجة ({videoAnalysis.hashtags.length})</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {videoAnalysis.hashtags.slice(0, 8).map((hashtag, index) => (
                            <Badge key={index} variant="outline">
                              #{hashtag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      قم بتحليل الفيديو لعرض النتائج
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* تحرير العنوان والهاشتاغات */}
            {videoAnalysis.title && (
              <Card className="border-2 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="text-purple-500" />
                    ✏️ تحرير المحتوى
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>عنوان المنشور</Label>
                    <Textarea
                      placeholder="أدخل عنوان المنشور..."
                      value={selectedTitle}
                      onChange={(e) => setSelectedTitle(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>الهاشتاغات المحددة</Label>
                    <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px] bg-gray-50 dark:bg-gray-800">
                      {selectedHashtags.map((hashtag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          #{hashtag}
                          <X 
                            className="w-3 h-3 cursor-pointer hover:text-red-500" 
                            onClick={() => removeHashtag(hashtag)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="إضافة هاشتاغ جديد"
                        value={customHashtag}
                        onChange={(e) => setCustomHashtag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomHashtag()}
                      />
                      <Button onClick={addCustomHashtag} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* تبويب إدارة المواقع */}
          <TabsContent value="sites" className="space-y-6">
            <Card className="border-2 border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="text-orange-500" />
                    ⚙️ إعدادات النشر العامة
                  </div>
                  <Badge variant="secondary">{sites.filter(s => s.enabled).length} مفعل</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>عدد المنشورات لكل موقع</Label>
                    <Slider
                      value={[globalPostsCount]}
                      onValueChange={(value) => updateGlobalPostsCount(value[0])}
                      max={100}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <div className="text-center mt-1 text-sm text-gray-600">
                      {globalPostsCount} منشور
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-all"
                      checked={enableAllSites}
                      onCheckedChange={toggleAllSites}
                    />
                    <Label htmlFor="enable-all">تفعيل جميع المواقع</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={loadSites} variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 ml-1" />
                      تحديث القائمة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* قائمة المواقع */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="text-blue-500" />
                  🌐 المواقع والمنصات ({sites.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {sites.map((site) => (
                    <div key={site.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm truncate">{site.name}</div>
                        <Switch
                          checked={site.enabled}
                          onCheckedChange={(enabled) => toggleSite(site.id, enabled)}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <Badge variant="outline" className="text-xs">{site.category}</Badge>
                        <div className="flex items-center gap-1">
                          {site.status === 'success' && <CheckCircle className="w-3 h-3 text-green-500" />}
                          {site.status === 'failed' && <AlertCircle className="w-3 h-3 text-red-500" />}
                          {site.status === 'publishing' && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                          {site.status === 'retrying' && <Repeat className="w-3 h-3 text-yellow-500" />}
                          <span>{site.attempts > 0 && `${site.attempts}/3`}</span>
                        </div>
                      </div>
                      {site.enabled && (
                        <div>
                          <Label className="text-xs">عدد المنشورات</Label>
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            value={site.maxPosts}
                            onChange={(e) => updateSitePostsCount(site.id, parseInt(e.target.value) || 1)}
                            className="text-xs h-7"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* أزرار النشر */}
            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  {!publishingSession.isActive ? (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button 
                        onClick={handleQuickPublish} 
                        size="lg" 
                        className="px-8"
                        disabled={!selectedTitle.trim() || sites.filter(s => s.enabled).length === 0}
                      >
                        <Zap className="ml-2" />
                        🚀 النشر السريع
                      </Button>
                      
                      <Button 
                        onClick={handleRealPublish} 
                        size="lg" 
                        variant="outline"
                        className="px-8 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-400 dark:hover:bg-orange-950"
                        disabled={!selectedTitle.trim()}
                      >
                        <Target className="ml-2" />
                        ⚡ النشر الحقيقي
                      </Button>

                      <Button 
                        onClick={handleFreePublish} 
                        size="lg" 
                        variant="outline"
                        className="px-8 border-2 border-green-500 text-green-600 hover:bg-green-50 dark:text-green-400 dark:border-green-400 dark:hover:bg-green-950"
                        disabled={!selectedTitle.trim()}
                      >
                        <Zap className="ml-2" />
                        🆓 الطريقة المجانية
                      </Button>

                      <Button 
                        onClick={handlePremiumPublish} 
                        size="lg" 
                        variant="outline"
                        className="px-8 border-2 border-purple-500 text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-400 dark:hover:bg-purple-950"
                        disabled={!selectedTitle.trim()}
                      >
                        <Target className="ml-2" />
                        💎 النشر بالمفاتيح
                      </Button>

                      <Button 
                        onClick={verifyPublishing} 
                        size="lg" 
                        variant="outline"
                        className="px-8 border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:text-cyan-400 dark:border-cyan-400 dark:hover:bg-cyan-950"
                        disabled={!selectedTitle.trim() || isVerifying}
                      >
                        {isVerifying ? (
                          <Loader2 className="ml-2 animate-spin" />
                        ) : (
                          <Search className="ml-2" />
                        )}
                        🔍 التحقق من النشر
                      </Button>

                      {/* نتائج التحقق من النشر */}
                      {verificationResults && (
                        <Card className="mt-6 border-2 border-cyan-200 dark:border-cyan-800">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
                              <Search className="w-5 h-5" />
                              🔍 نتائج التحقق من النشر
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* إحصائيات التحقق */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{verificationResults.verified}</div>
                                <div className="text-sm text-green-700 dark:text-green-300">تم العثور عليها</div>
                              </div>
                              <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">{verificationResults.notFound}</div>
                                <div className="text-sm text-red-700 dark:text-red-300">غير موجودة</div>
                              </div>
                              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">{verificationResults.errors}</div>
                                <div className="text-sm text-yellow-700 dark:text-yellow-300">أخطاء</div>
                              </div>
                              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{verificationResults.successRate}%</div>
                                <div className="text-sm text-blue-700 dark:text-blue-300">معدل النجاح</div>
                              </div>
                            </div>

                            {/* قائمة المنصات */}
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {verificationResults.platforms.map((platform: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    {platform.status === 'verified' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                    {platform.status === 'not_found' && <X className="w-5 h-5 text-red-500" />}
                                    {platform.status === 'error' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                                    <span className="font-medium">{platform.platform}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {platform.url && (
                                      <a 
                                        href={platform.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </a>
                                    )}
                                    {platform.engagement && (
                                      <div className="text-xs text-gray-600">
                                        {platform.engagement.views && `👁️ ${platform.engagement.views}`}
                                        {platform.engagement.likes && ` ❤️ ${platform.engagement.likes}`}
                                        {platform.engagement.comments && ` 💬 ${platform.engagement.comments}`}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* التوصيات */}
                            {verificationResults.recommendations && verificationResults.recommendations.length > 0 && (
                              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📋 التوصيات:</h4>
                                <ul className="space-y-1">
                                  {verificationResults.recommendations.map((rec: string, index: number) => (
                                    <li key={index} className="text-sm text-blue-700 dark:text-blue-300">• {rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                          📋 متطلبات النشر على Facebook:
                        </h4>
                        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                          <p><strong>للنشر على الصفحات:</strong> Page Access Token مع صلاحيات pages_manage_posts</p>
                          <p><strong>للنشر الشخصي:</strong> User Access Token مع صلاحية publish_to_groups</p>
                          <p><strong>الحصول على التوكن:</strong></p>
                          <ul className="list-disc list-inside mr-4 space-y-1">
                            <li>انتقل إلى <a href="https://developers.facebook.com/tools/explorer/" target="_blank" className="underline">Graph API Explorer</a></li>
                            <li>اختر التطبيق الخاص بك أو أنشئ تطبيق جديد</li>
                            <li>اطلب الصلاحيات المطلوبة (pages_manage_posts للصفحات)</li>
                            <li>انسخ التوكن واستخدمه في النظام</li>
                          </ul>
                          <div className="mt-3">
                            <a 
                              href="/facebook-token-guide" 
                              target="_blank"
                              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            >
                              📚 دليل شامل لأنواع مفاتيح Facebook
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={stopPublishing} 
                      size="lg" 
                      variant="destructive"
                      className="w-full md:w-auto px-8"
                    >
                      <Pause className="ml-2" />
                      ⏸️ إيقاف النشر
                    </Button>
                  )}
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>النشر السريع:</strong> محاكاة النشر على المواقع المحددة</p>
                    <p><strong>النشر الحقيقي:</strong> نشر فعلي باستخدام APIs حقيقية مع Puppeteer</p>
                    <p><strong>الطريقة المجانية:</strong> نشر مجاني على Reddit وTelegram وDiscord</p>
                    <p><strong>النشر بالمفاتيح:</strong> نشر على Facebook وTwitter وLinkedIn باستخدام مفاتيح API</p>
                  </div>
                  
                  {publishingSession.isActive && (
                    <div className="text-sm text-gray-600">
                      {publishingSession.currentSite && (
                        <p>جاري النشر في: {publishingSession.currentSite}</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب حالة النشر */}
          <TabsContent value="publishing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {publishingSession.completedSites}
                    </div>
                    <div className="text-sm text-gray-600">مواقع نجحت</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {publishingSession.failedSites}
                    </div>
                    <div className="text-sm text-gray-600">مواقع فشلت</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {publishingSession.totalAttempts}
                    </div>
                    <div className="text-sm text-gray-600">إجمالي المحاولات</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {publishingSession.successfulPosts}
                    </div>
                    <div className="text-sm text-gray-600">منشورات نجحت</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* سجل النشر */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="text-blue-500" />
                  📝 سجل عمليات النشر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {publishingSession.logs.length > 0 ? (
                    publishingSession.logs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex items-center gap-2">
                          {log.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {log.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-500" />}
                          {log.status === 'retrying' && <Repeat className="w-4 h-4 text-yellow-500" />}
                          <span className="font-medium text-sm">{log.siteName}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {log.message} - {log.timestamp.toLocaleTimeString('en-US')}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد عمليات نشر حتى الآن
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}