import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, ExternalLink, Users, Heart, Eye, MessageCircle, AlertCircle, Play, Loader2, Phone, Gift, Copy, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FollowersRequest {
  streamUrl: string;
  desiredFollowers: number;
  preferredTime: string;
  userWhatsApp: string;
  userEmail: string;
}

interface GeneratedCode {
  code: string;
  timestamp: string;
  streamUrl: string;
  followersCount: number;
  scheduledTime: string;
  status: 'pending' | 'sent' | 'delivered';
}

export default function RealFreePublish() {
  const { toast } = useToast();
  const [followersRequest, setFollowersRequest] = useState<FollowersRequest>({
    streamUrl: '',
    desiredFollowers: 30,
    preferredTime: '',
    userWhatsApp: '',
    userEmail: ''
  });
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUsedWeeklyFree, setHasUsedWeeklyFree] = useState(false);
  const [lastUsageDate, setLastUsageDate] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState({
    isFollowing: false,
    hasWatched: false,
    hasLiked: false,
    allRequirementsMet: false
  });

  // تحميل حالة الاستخدام الأسبوعي المجاني
  useEffect(() => {
    const loadWeeklyUsageStatus = async () => {
      try {
        // تحميل الفيديو المستهدف
        const targetResponse = await fetch('/api/target-video');
        const targetData = await targetResponse.json();
        if (targetData.success && targetData.data.url) {
          setTargetVideo(targetData.data);
          // فحص التفاعل مع الفيديو المستهدف
          checkInteractionStatus(targetData.data.url);
        }

        // تحميل حالة النشر المجاني
        const statusResponse = await fetch('/api/free-publish/status');
        const statusData = await statusResponse.json();
        if (statusData.success) {
          setHasUsedFreePublish(statusData.data.hasUsed);
        }
      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
      }
    };
    loadInitialData();
  }, []);

  // فحص حالة التفاعل مع الفيديو المستهدف
  const checkInteractionStatus = async (videoUrl?: string) => {
    const targetUrl = videoUrl || targetVideo.url;
    if (!targetUrl) return;

    try {
      const userIdentifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch('/api/verify-tiktok-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetVideoUrl: targetUrl,
          userIdentifier
        })
      });

      const result = await response.json();
      
      if (result.success && result.verification) {
        setVerificationStatus({
          isFollowing: result.verification.isFollowing || false,
          hasWatched: result.verification.hasWatched || false,
          hasLiked: result.verification.hasLiked || false,
          allRequirementsMet: result.verification.allRequirementsMet || false
        });
      }
    } catch (error) {
      console.error('خطأ في فحص التفاعل:', error);
    }
  };

  // تحليل الفيديو باستخدام البيانات الحقيقية
  const analyzeVideo = async () => {
    if (!videoUrl) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط الفيديو",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-video-real', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl })
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        setAnalyzedVideoData(result.data);
        setTitle(result.data.title || '');
        setDescription(result.data.description || '');
        
        toast({
          title: "تم التحليل",
          description: "تم تحليل الفيديو بنجاح باستخدام البيانات الحقيقية",
        });
      } else {
        throw new Error(result.message || 'فشل في تحليل الفيديو');
      }
    } catch (error) {
      toast({
        title: "خطأ في التحليل",
        description: "تعذر تحليل الفيديو. تأكد من صحة الرابط",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // التحقق من التفاعل مع الفيديو المستهدف
  const verifyInteraction = async () => {
    if (!targetVideo.url) {
      toast({
        title: "خطأ",
        description: "لا يوجد فيديو مستهدف للتحقق من التفاعل معه",
        variant: "destructive"
      });
      return false;
    }

    try {
      const userIdentifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch('/api/verify-tiktok-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetVideoUrl: targetVideo.url,
          userIdentifier
        })
      });

      const result = await response.json();
      
      if (result.success && result.verification) {
        const { isFollowing, hasWatched, hasLiked, allRequirementsMet } = result.verification;
        
        if (allRequirementsMet) {
          toast({
            title: "تم التحقق",
            description: "تم التحقق من جميع التفاعلات المطلوبة",
          });
          return true;
        } else {
          let missingActions = [];
          if (!isFollowing) missingActions.push('المتابعة');
          if (!hasWatched) missingActions.push('المشاهدة');
          if (!hasLiked) missingActions.push('الإعجاب');
          
          toast({
            title: "تفاعل غير مكتمل",
            description: `يرجى تأكيد: ${missingActions.join('، ')} مع الفيديو المستهدف`,
            variant: "destructive"
          });
          setVerificationRequired(true);
          return false;
        }
      }
    } catch (error) {
      toast({
        title: "خطأ في التحقق",
        description: "تعذر التحقق من التفاعل",
        variant: "destructive"
      });
    }
    
    return false;
  };

  // بدء عملية النشر الحقيقية
  const startRealPublishing = async () => {
    if (!analyzedVideoData || !title || !userEmail) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى تحليل الفيديو وملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    if (hasUsedFreePublish) {
      toast({
        title: "تم الاستخدام",
        description: "تم استخدام النشر المجاني لهذا اليوم",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setPublishStatus('verifying');

    try {
      // التحقق من التفاعل مع الفيديو المستهدف
      const isVerified = await verifyInteraction();
      
      if (!isVerified) {
        setPublishStatus('failed');
        setIsLoading(false);
        return;
      }

      setPublishStatus('publishing');

      // استخدام النشر المجاني الحقيقي
      const publishResponse = await fetch('/api/free-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          title,
          description,
          userEmail,
          videoData: analyzedVideoData
        })
      });

      const publishResult = await publishResponse.json();

      if (publishResult.success) {
        // تسجيل استخدام النشر المجاني
        await fetch('/api/free-publish/use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        setPublishStatus('completed');
        setHasUsedFreePublish(true);
        
        toast({
          title: "نجح النشر",
          description: `تم نشر المحتوى بنجاح على ${publishResult.sitesCount || 1185} موقع`,
        });
      } else {
        throw new Error(publishResult.message || 'فشل في النشر');
      }
    } catch (error) {
      setPublishStatus('failed');
      toast({
        title: "فشل النشر",
        description: "حدث خطأ أثناء عملية النشر",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            النشر المجاني الحقيقي
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            انشر محتواك على 1185+ موقع مع تحليل حقيقي للبيانات
          </p>
        </div>

        {hasUsedFreePublish && (
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">تم استخدام النشر المجاني لهذا اليوم</span>
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                يمكنك استخدام النشر المجاني مرة واحدة يومياً. سيتم إعادة تعيين الحد غداً.
              </p>
            </CardContent>
          </Card>
        )}

        {/* قسم التحقق من الشروط - في الأعلى */}
        {targetVideo.url && (
          <Card className="mb-8 border-2 border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Users className="h-6 w-6" />
                التحقق من الشروط المطلوبة
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                يجب إكمال جميع الشروط التالية للحصول على النشر المجاني
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 rounded-lg mb-6">
                <h3 className="font-bold text-lg mb-3 text-blue-900 dark:text-blue-100">
                  الفيديو المستهدف للتفاعل:
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">
                  {targetVideo.title}
                </p>
                <a 
                  href={targetVideo.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <ExternalLink className="h-5 w-5" />
                  فتح الفيديو والتفاعل معه
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border-2 transition-all ${
                  verificationStatus.isFollowing 
                    ? 'border-green-300 bg-green-50 dark:bg-green-900/20' 
                    : 'border-red-300 bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <span className="font-semibold">المتابعة</span>
                    </div>
                    {verificationStatus.isFollowing ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {verificationStatus.isFollowing ? 'تم التأكيد ✓' : 'يتطلب التأكيد'}
                  </p>
                </div>

                <div className={`p-4 rounded-lg border-2 transition-all ${
                  verificationStatus.hasWatched 
                    ? 'border-green-300 bg-green-50 dark:bg-green-900/20' 
                    : 'border-red-300 bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      <span className="font-semibold">المشاهدة</span>
                    </div>
                    {verificationStatus.hasWatched ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {verificationStatus.hasWatched ? 'تم التأكيد ✓' : 'يتطلب التأكيد'}
                  </p>
                </div>

                <div className={`p-4 rounded-lg border-2 transition-all ${
                  verificationStatus.hasLiked 
                    ? 'border-green-300 bg-green-50 dark:bg-green-900/20' 
                    : 'border-red-300 bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      <span className="font-semibold">الإعجاب</span>
                    </div>
                    {verificationStatus.hasLiked ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {verificationStatus.hasLiked ? 'تم التأكيد ✓' : 'يتطلب التأكيد'}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <Button 
                    onClick={() => checkInteractionStatus()}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    تحديث حالة التحقق
                  </Button>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    كيفية إثبات التفاعل:
                  </h4>
                  <ol className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>1. اضغط على "فتح الفيديو والتفاعل معه" أعلاه</li>
                    <li>2. تابع الحساب على TikTok</li>
                    <li>3. شاهد الفيديو حتى النهاية</li>
                    <li>4. اضغط على زر الإعجاب</li>
                    <li>5. عد هنا واضغط "تحديث حالة التحقق"</li>
                  </ol>
                </div>
              </div>

              {verificationStatus.allRequirementsMet && (
                <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">تم استيفاء جميع الشروط!</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    يمكنك الآن المتابعة للنشر المجاني
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* قسم تحليل الفيديو */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                تحليل الفيديو الحقيقي
              </CardTitle>
              <CardDescription>
                أدخل رابط الفيديو للحصول على تحليل حقيقي للبيانات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="videoUrl">رابط الفيديو *</Label>
                <div className="flex gap-2">
                  <Input
                    id="videoUrl"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.tiktok.com/... أو https://youtube.com/..."
                    dir="ltr"
                    className="flex-1"
                  />
                  <Button 
                    onClick={analyzeVideo}
                    disabled={isAnalyzing || !videoUrl}
                  >
                    {isAnalyzing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "تحليل"
                    )}
                  </Button>
                </div>
              </div>

              {analyzedVideoData && (
                <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">
                    نتائج التحليل الحقيقي:
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>العنوان:</span>
                      <span className="font-medium">{analyzedVideoData.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المنصة:</span>
                      <span className="font-medium">{analyzedVideoData.platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المشاهدات:</span>
                      <span className="font-medium">{analyzedVideoData.views.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الإعجابات:</span>
                      <span className="font-medium">{analyzedVideoData.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>منشئ المحتوى:</span>
                      <span className="font-medium">@{analyzedVideoData.author.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>البيانات أصيلة:</span>
                      <span className="font-medium text-green-600">
                        {analyzedVideoData.isAuthentic ? "نعم ✓" : "لا"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">العنوان المخصص *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="عنوان جذاب للمحتوى"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف المخصص</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف تفصيلي للمحتوى..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userEmail">البريد الإلكتروني *</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  dir="ltr"
                />
              </div>
            </CardContent>
          </Card>

          {/* قسم النشر */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                بدء النشر المجاني
              </CardTitle>
              <CardDescription>
                ابدأ النشر على 1185+ موقع بعد استيفاء الشروط
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!verificationStatus.allRequirementsMet && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">التحقق من التفاعل مطلوب</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                    لم يتم التحقق من تفاعلك مع الفيديو المستهدف. النظام يتطلب تفاعل حقيقي.
                  </p>
                  <div className="text-xs text-red-500 dark:text-red-400">
                    للحصول على تحقق أكثر دقة، يمكن إضافة مفاتيح TikTok API الحقيقية في لوحة الإدارة
                  </div>
                </div>
              )}

              {verificationStatus.allRequirementsMet && analyzedVideoData && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">جاهز للنشر</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    تم التحقق من جميع المتطلبات وتحليل الفيديو. يمكنك الآن بدء النشر المجاني.
                  </p>
                </div>
              )}

              {publishStatus === 'idle' && (
                <Button 
                  onClick={startRealPublishing}
                  disabled={isLoading || !analyzedVideoData || hasUsedFreePublish}
                  className="w-full"
                  size="lg"
                >
                  ابدأ النشر الحقيقي
                </Button>
              )}

              {publishStatus === 'verifying' && (
                <div className="text-center py-4">
                  <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  <p>جاري التحقق من التفاعل مع الفيديو المستهدف...</p>
                </div>
              )}

              {publishStatus === 'publishing' && (
                <div className="text-center py-4">
                  <div className="animate-pulse">
                    <div className="h-2 bg-blue-200 rounded-full mb-4">
                      <div className="h-2 bg-blue-600 rounded-full animate-pulse" style={{width: '70%'}}></div>
                    </div>
                  </div>
                  <p>جاري النشر على المنصات...</p>
                </div>
              )}

              {publishStatus === 'completed' && (
                <div className="text-center py-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    تم النشر بنجاح!
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    تم نشر المحتوى على 1185+ موقع باستخدام البيانات الحقيقية
                  </p>
                </div>
              )}

              {publishStatus === 'failed' && (
                <div className="text-center py-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-red-600 dark:text-red-300 mb-2">
                    فشل في النشر. يرجى التأكد من التفاعل مع الفيديو المستهدف والمحاولة مرة أخرى.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setPublishStatus('idle');
                      setVerificationRequired(false);
                    }}
                    className="mt-2"
                  >
                    إعادة المحاولة
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}