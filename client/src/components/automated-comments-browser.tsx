import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Bot, 
  Search, 
  Play, 
  Eye,
  MessageCircle,
  ThumbsUp,
  Clock,
  User,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  RefreshCw,
  Video
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ActiveSessionsMonitor } from "./active-sessions-monitor";
import { LiveCommentsMonitor } from "./live-comments-monitor";

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

export function AutomatedCommentsBrowser() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['youtube']);
  const [commentTexts, setCommentTexts] = useState<string[]>(['رائع! 👍', 'محتوى مميز', 'شكراً على المشاركة']);
  const [videosPerPlatform, setVideosPerPlatform] = useState(5);
  const [currentCommentInput, setCurrentCommentInput] = useState('');
  const [foundVideos, setFoundVideos] = useState<VideoTarget[]>([]);
  const [sessionResults, setSessionResults] = useState<CommentingSession[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [includeTargetVideo, setIncludeTargetVideo] = useState(true);
  const [targetVideoUrl, setTargetVideoUrl] = useState('');
  const [commentsPerVideo, setCommentsPerVideo] = useState(1);
  const [maxTargetVideos, setMaxTargetVideos] = useState(10);
  const [randomPublishing, setRandomPublishing] = useState(false);
  const [randomVideoCount, setRandomVideoCount] = useState(50);

  const availablePlatforms = [
    { id: 'youtube', name: 'YouTube', arabicName: 'يوتيوب', icon: '📺' },
    { id: 'tiktok', name: 'TikTok', arabicName: 'تيك توك', icon: '🎵' },
    { id: 'instagram', name: 'Instagram', arabicName: 'انستغرام', icon: '📸' },
    { id: 'facebook', name: 'Facebook', arabicName: 'فيسبوك', icon: '📘' },
    { id: 'twitter', name: 'Twitter/X', arabicName: 'تويتر', icon: '🐦' },
    { id: 'linkedin', name: 'LinkedIn', arabicName: 'لينكد إن', icon: '💼' },
    { id: 'snapchat', name: 'Snapchat', arabicName: 'سناب شات', icon: '👻' },
    { id: 'telegram', name: 'Telegram', arabicName: 'تيليجرام', icon: '📨' },
    { id: 'reddit', name: 'Reddit', arabicName: 'ريديت', icon: '🔴' },
    { id: 'pinterest', name: 'Pinterest', arabicName: 'بينتريست', icon: '📌' }
  ];

  const findVideosMutation = useMutation({
    mutationFn: async ({ platform, count }: { platform: string; count: number }) => {
      const response = await apiRequest("GET", `/api/find-trending-videos?platform=${platform}&count=${count}`);
      return response.json();
    },
    onSuccess: (data) => {
      setFoundVideos(prev => [...prev, ...data.data]);
      setIsSearching(false);
    },
    onError: () => {
      setIsSearching(false);
    }
  });

  const startCommentingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/start-automated-commenting", data);
      return response.json();
    },
    onSuccess: (data) => {
      setSessionResults(data.data);
      setIsCommenting(false);
    },
    onError: () => {
      setIsCommenting(false);
    }
  });

  const testCommentingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/test-commenting-system", data);
      return response.json();
    },
    onSuccess: (data) => {
      setSessionResults(data.data);
      setIsCommenting(false);
    },
    onError: () => {
      setIsCommenting(false);
    }
  });

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const addCommentText = () => {
    if (currentCommentInput.trim() && !commentTexts.includes(currentCommentInput.trim())) {
      setCommentTexts(prev => [...prev, currentCommentInput.trim()]);
      setCurrentCommentInput('');
    }
  };

  const removeCommentText = (index: number) => {
    setCommentTexts(prev => prev.filter((_, i) => i !== index));
  };

  const searchTrendingVideos = async () => {
    setIsSearching(true);
    setFoundVideos([]);

    for (const platform of selectedPlatforms) {
      try {
        await findVideosMutation.mutateAsync({ platform, count: videosPerPlatform });
      } catch (error) {
        console.error(`Error searching ${platform}:`, error);
      }
    }
  };

  const startAutomatedCommenting = async () => {
    if (commentTexts.length === 0 || selectedPlatforms.length === 0) {
      return;
    }

    setIsCommenting(true);
    setSessionResults([]);

    try {
      await startCommentingMutation.mutateAsync({
        platforms: selectedPlatforms,
        commentTexts,
        videosPerPlatform: randomPublishing ? randomVideoCount : maxTargetVideos,
        commentsPerVideo,
        targetVideoUrl: includeTargetVideo ? targetVideoUrl : '',
        randomPublishing
      });
    } catch (error) {
      console.error('Error starting automated commenting:', error);
    }
  };

  const testAutomatedCommenting = async () => {
    if (commentTexts.length === 0 || selectedPlatforms.length === 0) {
      return;
    }

    setIsCommenting(true);
    setSessionResults([]);

    try {
      await testCommentingMutation.mutateAsync({
        platforms: selectedPlatforms,
        commentTexts,
        videosPerPlatform: randomPublishing ? randomVideoCount : maxTargetVideos,
        commentsPerVideo,
        targetVideoUrl: includeTargetVideo ? targetVideoUrl : '',
        randomPublishing
      });
    } catch (error) {
      console.error('Error testing automated commenting:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse mb-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">النشر التلقائي في التعليقات</h2>
            <p className="text-slate-400">تصفح وانشر تعليقات على الفيديوهات الأكثر مشاهدة تلقائياً</p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800">
          <TabsTrigger value="setup" className="text-white">الإعداد</TabsTrigger>
          <TabsTrigger value="monitor" className="text-white">المراقبة المباشرة</TabsTrigger>
          <TabsTrigger value="search" className="text-white">البحث</TabsTrigger>
          <TabsTrigger value="videos" className="text-white">الفيديوهات</TabsTrigger>
          <TabsTrigger value="results" className="text-white">النتائج</TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-6">
          <LiveCommentsMonitor />
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          {/* Platform Selection */}
          <Card className="bg-slate-800/70 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 ml-2" />
                اختيار المنصات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium text-slate-300">اختر المنصات للنشر عليها:</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPlatforms(availablePlatforms.map(p => p.id))}
                    className="text-xs"
                  >
                    اختيار الكل
                  </Button>
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedPlatforms([])}
                    className="text-xs"
                  >
                    إلغاء الكل
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {availablePlatforms.map((platform) => (
                  <div key={platform.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Checkbox
                        id={platform.id}
                        checked={selectedPlatforms.includes(platform.id)}
                        onCheckedChange={() => handlePlatformToggle(platform.id)}
                      />
                      <Label htmlFor={platform.id} className="text-white font-medium cursor-pointer text-sm">
                        <span className="ml-2">{platform.icon}</span>
                        {platform.arabicName}
                      </Label>
                    </div>
                    {selectedPlatforms.includes(platform.id) && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                        نشط
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="text-center text-sm text-slate-400 border-t border-slate-600 pt-3">
                تم اختيار {selectedPlatforms.length} من {availablePlatforms.length} منصة
              </div>
            </CardContent>
          </Card>

          {/* Target Video URL */}
          <Card className="bg-slate-800/70 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Video className="h-5 w-5 ml-2" />
                الفيديو المستهدف للترويج
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Switch
                  checked={includeTargetVideo}
                  onCheckedChange={setIncludeTargetVideo}
                  className="data-[state=checked]:bg-green-600"
                />
                <Label className="text-slate-300">
                  إضافة رابط الفيديو المستهدف مع التعليقات
                </Label>
              </div>
              
              {includeTargetVideo && (
                <div className="space-y-2">
                  <Input
                    value={targetVideoUrl}
                    onChange={(e) => setTargetVideoUrl(e.target.value)}
                    placeholder="أدخل رابط الفيديو للترويج له..."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <p className="text-xs text-slate-400">
                    سيتم إضافة هذا الرابط تلقائياً مع كل تعليق لترويج فيديوك
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comment Texts Management */}
          <Card className="bg-slate-800/70 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MessageCircle className="h-5 w-5 ml-2" />
                نصوص التعليقات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2 rtl:space-x-reverse">
                <Input
                  value={currentCommentInput}
                  onChange={(e) => setCurrentCommentInput(e.target.value)}
                  placeholder="أضف نص تعليق جديد..."
                  className="bg-slate-700 border-slate-600 text-white flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && addCommentText()}
                />
                <Button onClick={addCommentText} className="bg-blue-600 hover:bg-blue-700">
                  إضافة
                </Button>
              </div>
              
              <div className="space-y-2">
                {commentTexts.map((text, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                  >
                    <span className="text-slate-300">{text}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCommentText(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      حذف
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="bg-slate-800/70 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="h-5 w-5 ml-2" />
                إعدادات النشر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">العدد الأقصى للفيديوهات المستهدفة</Label>
                  <Input
                    type="number"
                    min="1"
                    max={randomPublishing ? "300" : "50"}
                    value={randomPublishing ? randomVideoCount : maxTargetVideos}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 10;
                      if (randomPublishing) {
                        setRandomVideoCount(value);
                      } else {
                        setMaxTargetVideos(value);
                      }
                    }}
                    className="bg-slate-700 border-slate-600 text-white mt-2"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    {randomPublishing ? 'عدد الفيديوهات العشوائية (حتى 300)' : 'عدد الفيديوهات الترندينج (حتى 50)'}
                  </p>
                </div>
                
                <div>
                  <Label className="text-slate-300">عدد التعليقات لكل فيديو</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={commentsPerVideo}
                    onChange={(e) => setCommentsPerVideo(parseInt(e.target.value) || 1)}
                    className="bg-slate-700 border-slate-600 text-white mt-2"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    عدد التعليقات المختلفة لكل فيديو مستهدف
                  </p>
                </div>
              </div>
              
              {/* Random Publishing Toggle */}
              <div className="border-t border-slate-600 pt-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Switch
                    checked={randomPublishing}
                    onCheckedChange={setRandomPublishing}
                    className="data-[state=checked]:bg-orange-600"
                  />
                  <div>
                    <Label className="text-slate-300 font-medium">
                      النشر العشوائي (بدون استهداف محدد)
                    </Label>
                    <p className="text-xs text-slate-400">
                      البحث في فيديوهات عشوائية بدلاً من الترندينج المحدد
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-700/30 p-3 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">إجمالي التعليقات المتوقعة:</span>
                  <span className="text-green-400 font-bold">
                    {selectedPlatforms.length * (randomPublishing ? randomVideoCount : maxTargetVideos) * commentsPerVideo}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                  <span>المنصات المختارة × الفيديوهات × التعليقات</span>
                  <span>{selectedPlatforms.length} × {randomPublishing ? randomVideoCount : maxTargetVideos} × {commentsPerVideo}</span>
                </div>
                {randomPublishing && (
                  <div className="mt-2 text-xs text-orange-400">
                    ⚡ وضع النشر العشوائي نشط - سيتم اختيار فيديوهات عشوائية
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-6">
          <ActiveSessionsMonitor />
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card className="bg-slate-800/70 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">البحث عن الفيديوهات الرائجة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Button
                  onClick={searchTrendingVideos}
                  disabled={isSearching || selectedPlatforms.length === 0}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3"
                >
                  {isSearching ? (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>جاري البحث...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Search className="h-4 w-4" />
                      <span>ابحث عن الفيديوهات الرائجة</span>
                    </div>
                  )}
                </Button>
              </div>
              
              {isSearching && (
                <div className="space-y-2">
                  <div className="text-center text-slate-400">
                    جاري البحث في {selectedPlatforms.length} منصة...
                  </div>
                  <Progress value={65} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          {foundVideos.length > 0 && (
            <Card className="bg-slate-800/70 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">
                  الفيديوهات المكتشفة ({foundVideos.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {foundVideos.map((video, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-2 line-clamp-2">
                          {video.title}
                        </h3>
                        <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-slate-400">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 ml-1" />
                            {formatNumber(video.views)}
                          </div>
                          <div className="flex items-center">
                            <ThumbsUp className="h-4 w-4 ml-1" />
                            {formatNumber(video.likes)}
                          </div>
                          <div className="flex items-center">
                            <MessageCircle className="h-4 w-4 ml-1" />
                            {formatNumber(video.comments)}
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 ml-1" />
                            {video.author}
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-purple-500/20 text-purple-400">
                        {video.platform}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          )}

          {foundVideos.length > 0 && (
            <div className="text-center">
              <Button
                onClick={startAutomatedCommenting}
                disabled={isCommenting || commentTexts.length === 0}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3"
              >
                {isCommenting ? (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>جاري النشر...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Play className="h-4 w-4" />
                    <span>ابدأ النشر التلقائي</span>
                  </div>
                )}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {sessionResults.length > 0 && (
            <Card className="bg-slate-800/70 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">نتائج جلسة النشر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessionResults.map((session, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-slate-700/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">{session.platform}</h3>
                      <Badge variant={session.commentsPosted > 0 ? "default" : "destructive"}>
                        {session.commentsPosted > 0 ? "نجح" : "فشل"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-slate-400">فيديوهات مكتشفة</div>
                        <div className="text-white font-medium">{session.videosFound}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-400">تعليقات منشورة</div>
                        <div className="text-green-400 font-medium">{session.commentsPosted}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-400">فشل</div>
                        <div className="text-red-400 font-medium">{session.failed}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-400">المدة</div>
                        <div className="text-white font-medium">{Math.round(session.duration / 1000)}ث</div>
                      </div>
                    </div>

                    {session.errors.length > 0 && (
                      <div className="mt-3">
                        <div className="text-red-400 text-sm font-medium mb-1">أخطاء:</div>
                        {session.errors.map((error, errorIndex) => (
                          <div key={errorIndex} className="text-red-300 text-xs">
                            • {error}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={testAutomatedCommenting}
          disabled={isCommenting || commentTexts.length === 0 || selectedPlatforms.length === 0}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4"
        >
          {isCommenting ? (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>جاري الاختبار...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Activity className="h-5 w-5" />
              <span>اختبار النظام (محاكاة)</span>
            </div>
          )}
        </Button>
        
        <Button
          onClick={startAutomatedCommenting}
          disabled={isCommenting || commentTexts.length === 0 || selectedPlatforms.length === 0}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4"
        >
          {isCommenting ? (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>جاري النشر...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Bot className="h-5 w-5" />
              <span>بدء النشر التلقائي</span>
            </div>
          )}
        </Button>
      </div>

      {/* Info Alert */}
      <Alert className="bg-blue-500/10 border-blue-500/30">
        <Bot className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-300">
          <div className="space-y-2">
            <p><strong>اختبار النظام:</strong> يحاكي عملية النشر ويظهر النتائج المتوقعة دون التعليق الفعلي</p>
            <p><strong>النشر التلقائي:</strong> يستخدم متصفح حقيقي للعثور على الفيديوهات الرائجة والتعليق عليها فعلياً</p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}