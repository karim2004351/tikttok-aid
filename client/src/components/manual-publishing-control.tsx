import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, 
  Play, 
  Pause, 
  Square,
  Clock,
  TrendingUp,
  Activity,
  AlertTriangle,
  Globe,
  Users,
  MessageSquare,
  Settings,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ManualPublishingConfig {
  videoUrl: string;
  title: string;
  description: string;
  selectedPlatforms: string[];
  targetSites: string[];
  postsPerSite: number;
  userEmail: string;
  userPassword: string;
  publishingMode: 'immediate' | 'scheduled' | 'batch';
  scheduledTime?: string;
  batchSize?: number;
}

interface PublishingSession {
  id: string;
  startTime: string;
  config: ManualPublishingConfig;
  status: 'running' | 'paused' | 'completed' | 'failed';
  currentSite: string;
  sitesCompleted: number;
  totalSites: number;
  postsPublished: number;
  postsTarget: number;
  progress: number;
  errors: string[];
  successfulSites: string[];
}

const availablePlatforms = [
  { id: 'youtube', name: 'YouTube', category: 'فيديو' },
  { id: 'tiktok', name: 'TikTok', category: 'فيديو' },
  { id: 'instagram', name: 'Instagram', category: 'اجتماعي' },
  { id: 'facebook', name: 'Facebook', category: 'اجتماعي' },
  { id: 'twitter', name: 'Twitter/X', category: 'اجتماعي' },
  { id: 'linkedin', name: 'LinkedIn', category: 'مهني' },
  { id: 'reddit', name: 'Reddit', category: 'منتديات' },
  { id: 'telegram', name: 'Telegram', category: 'رسائل' },
  { id: 'whatsapp', name: 'WhatsApp', category: 'رسائل' },
  { id: 'pinterest', name: 'Pinterest', category: 'صور' }
];

const targetSiteCategories = [
  { id: 'forums', name: 'المنتديات', count: 450 },
  { id: 'blogs', name: 'المدونات', count: 320 },
  { id: 'news', name: 'مواقع الأخبار', count: 280 },
  { id: 'social', name: 'الشبكات الاجتماعية', count: 135 }
];

export function ManualPublishingControl() {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<ManualPublishingConfig>({
    videoUrl: '',
    title: '',
    description: '',
    selectedPlatforms: [],
    targetSites: [],
    postsPerSite: 3,
    userEmail: '',
    userPassword: '',
    publishingMode: 'immediate',
    batchSize: 10
  });

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['/api/manual-publishing-sessions'],
    refetchInterval: 3000,
  });

  const { data: sitesData } = useQuery({
    queryKey: ['/api/publishing-sites'],
  });

  const startPublishingMutation = useMutation({
    mutationFn: async (publishingConfig: ManualPublishingConfig) => {
      const response = await apiRequest("POST", "/api/start-manual-publishing", publishingConfig);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manual-publishing-sessions'] });
    }
  });

  const controlSessionMutation = useMutation({
    mutationFn: async ({ sessionId, action }: { sessionId: string, action: string }) => {
      const response = await apiRequest("POST", `/api/manual-publishing-sessions/${sessionId}/${action}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manual-publishing-sessions'] });
    }
  });

  const sessions: PublishingSession[] = (sessionsData as any)?.sessions || [];
  const activeSessions = sessions.filter(s => s.status === 'running' || s.status === 'paused');

  const handlePlatformToggle = (platformId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.includes(platformId)
        ? prev.selectedPlatforms.filter(p => p !== platformId)
        : [...prev.selectedPlatforms, platformId]
    }));
  };

  const handleSiteToggle = (siteCategory: string) => {
    setConfig(prev => ({
      ...prev,
      targetSites: prev.targetSites.includes(siteCategory)
        ? prev.targetSites.filter(s => s !== siteCategory)
        : [...prev.targetSites, siteCategory]
    }));
  };

  const handleStartPublishing = () => {
    if (!config.videoUrl || !config.title || config.selectedPlatforms.length === 0) {
      return;
    }
    startPublishingMutation.mutate(config);
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `${diffMins} دقيقة`;
    return `${Math.floor(diffMins / 60)} ساعة`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500/20 text-green-400';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'جاري النشر';
      case 'paused': return 'متوقف مؤقتاً';
      case 'completed': return 'مكتمل';
      case 'failed': return 'فشل';
      default: return 'غير معروف';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">نظام النشر اليدوي المتقدم</h1>
            <p className="text-slate-300">تحكم كامل في عمليات النشر عبر المنصات المتعددة</p>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Badge variant="secondary" className="bg-slate-700 text-slate-200">
              {activeSessions.length} جلسة نشطة
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="setup" className="text-white">إعداد النشر</TabsTrigger>
            <TabsTrigger value="monitor" className="text-white">المراقبة المباشرة</TabsTrigger>
            <TabsTrigger value="history" className="text-white">سجل النشر</TabsTrigger>
            <TabsTrigger value="analytics" className="text-white">التحليلات</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Content Configuration */}
              <Card className="bg-slate-800/70 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Settings className="h-5 w-5 ml-2" />
                    إعداد المحتوى
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="videoUrl" className="text-slate-300">رابط الفيديو</Label>
                    <Input
                      id="videoUrl"
                      value={config.videoUrl}
                      onChange={(e) => setConfig(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title" className="text-slate-300">عنوان المنشور</Label>
                    <Input
                      id="title"
                      value={config.title}
                      onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="اكتب عنوان جذاب للفيديو"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-slate-300">الوصف</Label>
                    <Textarea
                      id="description"
                      value={config.description}
                      onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="اكتب وصفاً شاملاً للفيديو..."
                      rows={4}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">وضع النشر</Label>
                    <Select
                      value={config.publishingMode}
                      onValueChange={(value: any) => setConfig(prev => ({ ...prev, publishingMode: value }))}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">نشر فوري</SelectItem>
                        <SelectItem value="scheduled">نشر مجدول</SelectItem>
                        <SelectItem value="batch">نشر دفعي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Publishing Settings */}
              <Card className="bg-slate-800/70 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Globe className="h-5 w-5 ml-2" />
                    إعدادات النشر
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="postsPerSite" className="text-slate-300">عدد المنشورات لكل موقع</Label>
                    <Input
                      id="postsPerSite"
                      type="number"
                      min="1"
                      max="10"
                      value={config.postsPerSite}
                      onChange={(e) => setConfig(prev => ({ ...prev, postsPerSite: parseInt(e.target.value) || 1 }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userEmail" className="text-slate-300">البريد الإلكتروني</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={config.userEmail}
                      onChange={(e) => setConfig(prev => ({ ...prev, userEmail: e.target.value }))}
                      placeholder="your-email@example.com"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userPassword" className="text-slate-300">كلمة المرور</Label>
                    <Input
                      id="userPassword"
                      type="password"
                      value={config.userPassword}
                      onChange={(e) => setConfig(prev => ({ ...prev, userPassword: e.target.value }))}
                      placeholder="كلمة مرور قوية"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  {config.publishingMode === 'batch' && (
                    <div>
                      <Label htmlFor="batchSize" className="text-slate-300">حجم الدفعة</Label>
                      <Input
                        id="batchSize"
                        type="number"
                        min="5"
                        max="50"
                        value={config.batchSize}
                        onChange={(e) => setConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 10 }))}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Platform Selection */}
            <Card className="bg-slate-800/70 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 ml-2" />
                  اختيار المنصات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {availablePlatforms.map((platform) => (
                    <motion.div
                      key={platform.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        onClick={() => handlePlatformToggle(platform.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          config.selectedPlatforms.includes(platform.id)
                            ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                            : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-600/30'
                        }`}
                      >
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Checkbox
                            checked={config.selectedPlatforms.includes(platform.id)}
                            onChange={() => {}}
                          />
                          <div>
                            <div className="font-medium">{platform.name}</div>
                            <div className="text-xs opacity-70">{platform.category}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Target Sites */}
            <Card className="bg-slate-800/70 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Globe className="h-5 w-5 ml-2" />
                  المواقع المستهدفة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {targetSiteCategories.map((category) => (
                    <motion.div
                      key={category.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        onClick={() => handleSiteToggle(category.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          config.targetSites.includes(category.id)
                            ? 'bg-green-500/20 border-green-500 text-green-400'
                            : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-600/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Checkbox
                            checked={config.targetSites.includes(category.id)}
                            onChange={() => {}}
                          />
                          <Badge variant="secondary" className="bg-slate-600 text-slate-200 text-xs">
                            {category.count}
                          </Badge>
                        </div>
                        <div className="font-medium">{category.name}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Start Publishing Button */}
            <Card className="bg-slate-800/70 border-slate-600">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center">
                  <Button
                    onClick={handleStartPublishing}
                    disabled={startPublishingMutation.isPending || !config.videoUrl || !config.title || config.selectedPlatforms.length === 0}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3"
                  >
                    {startPublishingMutation.isPending ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full ml-2"></div>
                        جاري بدء النشر...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 ml-2" />
                        بدء النشر اليدوي
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitor" className="space-y-6">
            {activeSessions.length === 0 ? (
              <Alert className="bg-slate-700/30 border-slate-600">
                <TrendingUp className="h-4 w-4 text-slate-400" />
                <AlertDescription className="text-slate-300">
                  لا توجد جلسات نشر نشطة حالياً. ابدأ جلسة جديدة من علامة تبويب "إعداد النشر".
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {activeSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="p-6 bg-slate-700/30 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <Badge className={getStatusColor(session.status)}>
                            {getStatusText(session.status)}
                          </Badge>
                          <span className="text-sm text-slate-400 flex items-center">
                            <Clock className="h-4 w-4 ml-1" />
                            بدأت منذ {formatTime(session.startTime)}
                          </span>
                        </div>
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          {session.status === 'running' && (
                            <Button
                              onClick={() => controlSessionMutation.mutate({ sessionId: session.id, action: 'pause' })}
                              disabled={controlSessionMutation.isPending}
                              variant="outline"
                              size="sm"
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          {session.status === 'paused' && (
                            <Button
                              onClick={() => controlSessionMutation.mutate({ sessionId: session.id, action: 'resume' })}
                              disabled={controlSessionMutation.isPending}
                              variant="outline"
                              size="sm"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            onClick={() => controlSessionMutation.mutate({ sessionId: session.id, action: 'stop' })}
                            disabled={controlSessionMutation.isPending}
                            variant="destructive"
                            size="sm"
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">الموقع الحالي:</span>
                            <span className="text-white mr-2">{session.currentSite}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">المواقع المكتملة:</span>
                            <span className="text-white mr-2">{session.sitesCompleted}/{session.totalSites}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">المنشورات المنجزة:</span>
                            <span className="text-green-400 mr-2">{session.postsPublished}/{session.postsTarget}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">معدل النجاح:</span>
                            <span className="text-blue-400 mr-2">
                              {session.totalSites > 0 ? Math.round((session.successfulSites.length / session.totalSites) * 100) : 0}%
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">التقدم الإجمالي</span>
                            <span className="text-white">{session.progress}%</span>
                          </div>
                          <Progress value={session.progress} className="h-2" />
                        </div>

                        {session.errors.length > 0 && (
                          <Alert className="bg-red-500/10 border-red-500/20">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <AlertDescription className="text-red-300">
                              {session.errors.length} خطأ حدث أثناء النشر. اضغط لعرض التفاصيل.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Alert className="bg-slate-700/30 border-slate-600">
              <Eye className="h-4 w-4 text-slate-400" />
              <AlertDescription className="text-slate-300">
                سيتم عرض سجل جلسات النشر السابقة هنا مع إحصائيات مفصلة.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Alert className="bg-slate-700/30 border-slate-600">
              <Activity className="h-4 w-4 text-slate-400" />
              <AlertDescription className="text-slate-300">
                ستتوفر تحليلات شاملة لأداء النشر والإحصائيات التفصيلية قريباً.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}