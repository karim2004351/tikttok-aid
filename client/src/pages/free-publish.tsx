import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Globe, CheckCircle, ExternalLink, AlertCircle, Heart, Share, MessageCircle, UserPlus, Play, Video, Search, Hash, FileText, Eye, BarChart3, Users, Star, Download, RefreshCw, UserCheck } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
export default function FreePublish() {
  const [videoUrl, setVideoUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isFollowing: boolean;
    hasWatched: boolean;
    hasLiked: boolean;
    hasCommented: boolean;
    hasShared: boolean;
    allRequirementsMet: boolean;
  } | null>(null);
  const [hasUsedFreePublish, setHasUsedFreePublish] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState("");
  const [publishingResults, setPublishingResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  
  // متغيرات تحليل الفيديو
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customHashtags, setCustomHashtags] = useState("");
  
  // متغيرات تحليل صاحب الصفحة
  const [profileAnalysis, setProfileAnalysis] = useState<any>(null);
  const [showProfileAnalysis, setShowProfileAnalysis] = useState(false);
  
  const { toast } = useToast();

  // جلب رابط الفيديو المستهدف من الخادم
  const { data: targetVideoData, isLoading } = useQuery({
    queryKey: ['/api/target-video'],
    queryFn: async () => {
      const response = await fetch('/api/target-video');
      const result = await response.json();
      return result;
    }
  });

  const targetUrl = targetVideoData?.data?.url || "https://www.tiktok.com/@karimnapoli13?_t=ZN-8wlC2iJGYac&_r=1";

  // دالة تحليل الفيديو
  const analyzeVideo = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط الفيديو أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // تحليل الفيديو
      const videoResponse = await fetch('/api/analyze-video-real', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl })
      });

      if (videoResponse.ok) {
        const videoData = await videoResponse.json();
        if (videoData.success) {
          setAnalysisResult(videoData.data);
          setCustomTitle(videoData.data.title || "");
          setCustomDescription(videoData.data.description || "");
          setCustomHashtags(videoData.data.hashtags?.join(" ") || "");
          setShowAnalysis(true);
        }
      }

      // تحليل صاحب الصفحة
      const profileResponse = await fetch('/api/profile/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl })
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.success) {
          setProfileAnalysis(profileData.analysis);
          setShowProfileAnalysis(true);
        }
      }

      toast({
        title: "تم التحليل بنجاح",
        description: "تم تحليل الفيديو وصاحب الصفحة بنجاح",
      });

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

  // إنشاء معرف فريد للمستخدم إذا لم يكن موجوداً
  useEffect(() => {
    let identifier = localStorage.getItem('userIdentifier');
    if (!identifier) {
      identifier = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userIdentifier', identifier);
    }
    setUserIdentifier(identifier);
    
    // التحقق من استخدام النشر المجاني مسبقاً
    checkFreePublishStatus(identifier);
  }, []);

  const checkFreePublishStatus = async (identifier: string) => {
    try {
      const response = await fetch(`/api/free-publish/status?userIdentifier=${identifier}`);
      const result = await response.json();
      setHasUsedFreePublish(result.hasUsed);
    } catch (error) {
      console.error('Error checking free publish status:', error);
    }
  };

  const handleVerifyInteraction = async () => {
    if (!userIdentifier) {
      toast({
        title: "خطأ",
        description: "لم يتم تحديد هوية المستخدم",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      const response = await fetch('/api/verify-tiktok-interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          targetVideoUrl: targetUrl,
          userIdentifier: userIdentifier
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setVerificationResult(result.verification);
        if (result.verification.allRequirementsMet) {
          toast({
            title: "تم التحقق بنجاح!",
            description: "لقد أكملت جميع المتطلبات. يمكنك الآن النشر مجاناً!",
          });
        } else {
          const missingRequirements = [];
          if (!result.verification.isFollowing) missingRequirements.push('المتابعة');
          if (!result.verification.hasLiked) missingRequirements.push('الإعجاب');
          
          toast({
            title: "متطلبات غير مكتملة",
            description: `يرجى إكمال: ${missingRequirements.join(', ')}`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "خطأ في التحقق",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر التحقق من التفاعل",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // تأكيد التفاعل اليدوي
  const confirmInteraction = async (action: string) => {
    if (!userIdentifier) {
      toast({
        title: "خطأ",
        description: "لم يتم تحديد هوية المستخدم",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/confirm-interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIdentifier,
          action,
          targetVideoUrl: targetUrl
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "تم التأكيد",
          description: `تم تأكيد ${action === 'follow' ? 'المتابعة' : action === 'like' ? 'الإعجاب' : action === 'share' ? 'المشاركة' : 'التعليق'} بنجاح`,
        });
        
        // إعادة فحص التحقق
        await handleVerifyInteraction();
      } else {
        toast({
          title: "خطأ في التأكيد",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الشبكة",
        description: "تعذر تأكيد التفاعل",
        variant: "destructive",
      });
    }
  };

  const handleFreePublish = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط الفيديو أولاً",
        variant: "destructive",
      });
      return;
    }

    if (!verificationResult?.allRequirementsMet) {
      toast({
        title: "متطلبات غير مكتملة",
        description: "يجب التحقق من استيفاء جميع المتطلبات أولاً",
        variant: "destructive",
      });
      return;
    }

    if (hasUsedFreePublish) {
      toast({
        title: "استخدمت النشر المجاني",
        description: "يمكن استخدام النشر المجاني مرة واحدة في اليوم",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/free-publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          videoUrl,
          userIdentifier,
          verificationPassed: verificationResult?.allRequirementsMet
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setHasUsedFreePublish(true);
        setPublishingResults({
          deploymentId: result.deploymentId,
          totalSites: 1171,
          successfulSites: 0,
          failedSites: 0,
          status: "جاري النشر...",
          startTime: new Date().toLocaleString('en-US'),
          sites: []
        });
        setShowResults(true);
        
        // بدء مراقبة تقدم النشر
        monitorPublishingProgress(result.deploymentId);
        
        toast({
          title: "تم بدء النشر المجاني!",
          description: "سيتم نشر فيديوك على 1,171 موقع ومنتدى",
        });
      } else {
        toast({
          title: "خطأ في النشر",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر الاتصال بالخادم",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };



  // مراقبة تقدم النشر
  const monitorPublishingProgress = async (deploymentId: number) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/deployments/${deploymentId}`);
        const deployment = await response.json();
        
        if (deployment) {
          setPublishingResults((prev: any) => ({
            ...prev,
            status: deployment.status === 'completed' ? 'تم النشر بنجاح!' : 'جاري النشر...',
            successfulSites: Math.floor(deployment.progress * 1171 / 100),
            failedSites: deployment.status === 'failed' ? 50 : 0,
            progress: deployment.progress
          }));
          
          if (deployment.status === 'completed' || deployment.status === 'failed') {
            clearInterval(interval);
            if (deployment.status === 'completed') {
              toast({
                title: "تم النشر بنجاح!",
                description: "تم نشر فيديوك على 1,171 موقع ومنتدى بنجاح",
              });
            }
          }
        }
      } catch (error) {
        console.error('Error monitoring progress:', error);
      }
    }, 3000);
    
    // إيقاف المراقبة بعد 5 دقائق
    setTimeout(() => clearInterval(interval), 300000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 md:py-6">
        <nav className="flex items-center justify-between flex-wrap gap-4">
          <Link href="/">
            <div className="flex items-center space-x-2">
              <Globe className="h-6 w-6 md:h-8 md:w-8 text-purple-400" />
              <h1 className="text-lg md:text-2xl font-bold">منصة النشر الذكي متعددة المنصات</h1>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-purple-600">
              الرئيسية
            </Button>
          </Link>
        </nav>
      </header>

      {/* Free Publish Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">انشر مجاناً الآن</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            انشر فيديوك على أكثر من 1,171 موقع ومنتدى عالمي مجاناً بعد تحقيق الشروط البسيطة
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Status Section */}
          {hasUsedFreePublish && (
            <Card className="bg-red-900/20 border-red-500/30 mb-8">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center">
                  <AlertCircle className="mr-2 h-6 w-6" />
                  تم استخدام النشر المجاني
                </CardTitle>
                <CardDescription className="text-red-300">
                  لقد استخدمت النشر المجاني اليوم. يمكنك المحاولة مرة أخرى غداً.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Verification Results */}
          {verificationResult && (
            <Card className="bg-gray-800/50 border-gray-700 mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CheckCircle className="mr-2 h-6 w-6 text-green-400" />
                  نتائج التحقق
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {/* المتطلبات الأساسية */}
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-300 font-semibold mb-3">متطلبات أساسية (مطلوبة)</h4>
                    <div className="space-y-2">
                      {[
                        { key: 'hasWatched', label: 'مشاهدة الفيديو', icon: Play },
                        { key: 'hasLiked', label: 'إعجاب بالفيديو', icon: Heart }
                      ].map(({ key, label, icon: Icon }) => (
                        <div key={key} className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            verificationResult[key as keyof typeof verificationResult] 
                              ? 'bg-green-500' 
                              : 'bg-red-500'
                          }`}>
                            {verificationResult[key as keyof typeof verificationResult] ? '✓' : '✗'}
                          </div>
                          <Icon className="h-5 w-5 text-blue-400" />
                          <span className="text-white">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* المتطلبات الاختيارية */}
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <h4 className="text-green-300 font-semibold mb-3">متطلبات إضافية (أحدهما مطلوب)</h4>
                    <div className="space-y-2">
                      {[
                        { key: 'hasCommented', label: 'التعليق', icon: MessageCircle },
                        { key: 'hasShared', label: 'المشاركة', icon: Share }
                      ].map(({ key, label, icon: Icon }) => (
                        <div key={key} className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            verificationResult[key as keyof typeof verificationResult] 
                              ? 'bg-green-500' 
                              : 'bg-yellow-500'
                          }`}>
                            {verificationResult[key as keyof typeof verificationResult] ? '✓' : '○'}
                          </div>
                          <Icon className="h-5 w-5 text-green-400" />
                          <span className="text-white">{label}</span>
                        </div>
                      ))}
                    </div>
                    {(verificationResult.hasCommented || verificationResult.hasShared) && (
                      <div className="mt-2 text-green-300 text-sm">
                        ✓ تم استيفاء المتطلبات الإضافية
                      </div>
                    )}
                  </div>

                  {/* المتطلبات الاختيارية */}
                  <div className="bg-gray-900/20 border border-gray-500/30 rounded-lg p-4">
                    <h4 className="text-gray-300 font-semibold mb-3">متطلبات اختيارية (غير مطلوبة)</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          verificationResult.isFollowing 
                            ? 'bg-green-500' 
                            : 'bg-gray-500'
                        }`}>
                          {verificationResult.isFollowing ? '✓' : '○'}
                        </div>
                        <UserPlus className="h-5 w-5 text-gray-400" />
                        <span className="text-white">متابعة الصفحة</span>
                      </div>
                    </div>
                  </div>
                </div>
                {verificationResult.allRequirementsMet && (
                  <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <p className="text-green-300 font-semibold">تم استيفاء جميع المتطلبات! يمكنك الآن النشر مجاناً.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Target Page Section */}
          <Card className="bg-gray-800/50 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">الصفحة المطلوب التفاعل معها</CardTitle>
              <CardDescription className="text-gray-300">
                قم بزيارة الصفحة وتنفيذ جميع المتطلبات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-700 p-4 rounded-lg mb-4">
                <p className="text-gray-300 mb-2">الصفحة المستهدفة:</p>
                <a 
                  href={targetUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline break-all flex items-center"
                >
                  {targetUrl}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h4 className="text-blue-300 font-semibold mb-2">متطلبات النشر المجاني الجديدة:</h4>
                    <ul className="text-blue-200 text-sm space-y-1">
                      <li>✅ <strong>مطلوب:</strong> مشاهدة الفيديو + الإعجاب</li>
                      <li>✅ <strong>مطلوب:</strong> التعليق أو المشاركة (أحدهما)</li>
                      <li>ℹ️ <strong>اختياري:</strong> متابعة الصفحة (غير مطلوب)</li>
                      <li>📱 اضغط على الرابط أعلاه وقم بالتفاعل ثم عد هنا للتحقق</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* أزرار تأكيد التفاعل الحقيقي */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-semibold">أكد تفاعلك الآن:</h4>
                  <Button
                    onClick={handleVerifyInteraction}
                    disabled={isVerifying}
                    variant="outline"
                    size="sm"
                    className="border-purple-500 text-purple-300 hover:bg-purple-500/20"
                  >
                    <RefreshCw className={`h-4 w-4 ml-2 ${isVerifying ? 'animate-spin' : ''}`} />
                    {isVerifying ? "جاري التحقق..." : "تحديث الحالة"}
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { action: 'follow', label: 'متابعة الصفحة', icon: UserPlus, color: 'blue' },
                    { action: 'watch', label: 'مشاهدة الفيديو', icon: Play, color: 'green' },
                    { action: 'like', label: 'إعجاب بالفيديو', icon: Heart, color: 'red' },
                    { action: 'comment', label: 'التعليق', icon: MessageCircle, color: 'yellow' },
                    { action: 'share', label: 'المشاركة', icon: Share, color: 'purple' }
                  ].map(({ action, label, icon: Icon, color }) => (
                    <Button
                      key={action}
                      onClick={async () => {
                        if (!userIdentifier) {
                          toast({
                            title: "خطأ",
                            description: "لم يتم تحديد هوية المستخدم",
                            variant: "destructive",
                          });
                          return;
                        }

                        try {
                          const response = await fetch('/api/confirm-interaction', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              userIdentifier,
                              action,
                              targetVideoUrl: targetUrl
                            })
                          });

                          const result = await response.json();
                          
                          if (result.success) {
                            toast({
                              title: "تم التأكيد",
                              description: `تم تأكيد ${label} بنجاح`,
                            });
                            
                            // تحديث نتائج التحقق فوراً
                            setTimeout(() => {
                              handleVerifyInteraction();
                            }, 500);
                          } else {
                            toast({
                              title: "خطأ في التأكيد",
                              description: result.message,
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "خطأ في الاتصال",
                            description: "تعذر تأكيد التفاعل",
                            variant: "destructive",
                          });
                        }
                      }}
                      variant="outline"
                      className={`w-full border-${color}-500 text-${color}-300 hover:bg-${color}-500/20`}
                    >
                      <Icon className="h-4 w-4 ml-2" />
                      أكد {label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video URL Section */}
          <Card className="bg-gray-800/50 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">رابط فيديوك للنشر</CardTitle>
              <CardDescription className="text-gray-300">
                أدخل رابط الفيديو الذي تريد نشره
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="video-url" className="text-white">رابط الفيديو</Label>
                  <Input
                    id="video-url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.tiktok.com/@username/video/123456"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              {/* زر تحليل الفيديو */}
              <div className="pt-4">
                <Button
                  onClick={analyzeVideo}
                  disabled={isAnalyzing || !videoUrl.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Search className="h-4 w-4 ml-2" />
                  {isAnalyzing ? "جاري التحليل..." : "تحليل الفيديو"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* نتائج تحليل الفيديو */}
          {showAnalysis && analysisResult && (
            <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-500/30 mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Video className="h-5 w-5 ml-2" />
                  نتائج تحليل الفيديو
                </CardTitle>
                <CardDescription className="text-indigo-200">
                  يمكنك مراجعة وتعديل المعلومات قبل النشر
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* العنوان */}
                <div>
                  <Label htmlFor="custom-title" className="text-white flex items-center mb-2">
                    <FileText className="h-4 w-4 ml-2" />
                    العنوان
                  </Label>
                  <Input
                    id="custom-title"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="عنوان الفيديو"
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>

                {/* الوصف */}
                <div>
                  <Label htmlFor="custom-description" className="text-white flex items-center mb-2">
                    <FileText className="h-4 w-4 ml-2" />
                    الوصف
                  </Label>
                  <Textarea
                    id="custom-description"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="وصف مفصل للفيديو"
                    rows={3}
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>

                {/* الهاشتاجات */}
                <div>
                  <Label htmlFor="custom-hashtags" className="text-white flex items-center mb-2">
                    <Hash className="h-4 w-4 ml-2" />
                    الهاشتاجات
                  </Label>
                  <Input
                    id="custom-hashtags"
                    value={customHashtags}
                    onChange={(e) => setCustomHashtags(e.target.value)}
                    placeholder="#تيك_توك #فيديو #ترفيه"
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>

                {/* معلومات إضافية من التحليل */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-900/30 rounded-lg p-4">
                    <h4 className="text-blue-300 font-semibold mb-2">التصنيف</h4>
                    <p className="text-blue-200">{analysisResult.category || "غير محدد"}</p>
                  </div>
                  
                  <div className="bg-green-900/30 rounded-lg p-4">
                    <h4 className="text-green-300 font-semibold mb-2">التقييم</h4>
                    <div className="flex items-center">
                      <span className="text-green-200">{analysisResult.rating || 0}/5</span>
                      <div className="flex ml-2">
                        {[1,2,3,4,5].map((star) => (
                          <span 
                            key={star} 
                            className={`text-lg ${star <= (analysisResult.rating || 0) ? 'text-yellow-400' : 'text-gray-500'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-900/30 rounded-lg p-4">
                    <h4 className="text-purple-300 font-semibold mb-2">الحالة</h4>
                    <Badge className="bg-green-600 text-white">
                      <CheckCircle className="h-3 w-3 ml-1" />
                      جاهز للنشر
                    </Badge>
                  </div>
                </div>

                {/* زر المعاينة */}
                <div className="text-center">
                  <Button
                    onClick={() => window.open(videoUrl, '_blank')}
                    variant="outline"
                    className="border-indigo-400 text-indigo-400 hover:bg-indigo-400 hover:text-white"
                  >
                    <Eye className="h-4 w-4 ml-2" />
                    معاينة الفيديو
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* نتائج تحليل صاحب الصفحة */}
          {showProfileAnalysis && profileAnalysis && (
            <Card className="bg-gradient-to-br from-green-900/50 to-teal-900/50 border-green-500/30 mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <UserCheck className="h-5 w-5 ml-2" />
                  تحليل صاحب الصفحة
                </CardTitle>
                <CardDescription className="text-green-200">
                  معلومات شاملة عن صاحب الفيديو ومعدلات التفاعل
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* معلومات المستخدم */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white flex items-center mb-2">
                        <Users className="h-4 w-4 ml-2" />
                        اسم المستخدم
                      </Label>
                      <p className="text-green-200 font-medium">@{profileAnalysis.username}</p>
                    </div>

                    <div>
                      <Label className="text-white flex items-center mb-2">
                        <Heart className="h-4 w-4 ml-2" />
                        المتابعون
                      </Label>
                      <p className="text-green-200 font-medium">
                        {profileAnalysis.followers?.toLocaleString() || 'غير متاح'}
                      </p>
                    </div>

                    <div>
                      <Label className="text-white flex items-center mb-2">
                        <BarChart3 className="h-4 w-4 ml-2" />
                        معدل التفاعل
                      </Label>
                      <div className="flex items-center gap-2">
                        <Progress value={profileAnalysis.engagementRate || 0} className="flex-1" />
                        <span className="text-green-200 text-sm">{profileAnalysis.engagementRate || 0}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {profileAnalysis.averageViews && (
                      <div>
                        <Label className="text-white flex items-center mb-2">
                          <Eye className="h-4 w-4 ml-2" />
                          متوسط المشاهدات
                        </Label>
                        <p className="text-green-200 font-medium">
                          {profileAnalysis.averageViews.toLocaleString()}
                        </p>
                      </div>
                    )}

                    {profileAnalysis.platform && (
                      <div>
                        <Label className="text-white flex items-center mb-2">
                          <Globe className="h-4 w-4 ml-2" />
                          المنصة
                        </Label>
                        <Badge variant="outline" className="text-green-300 border-green-300">
                          {profileAnalysis.platform}
                        </Badge>
                      </div>
                    )}

                    {profileAnalysis.contentCategory && (
                      <div>
                        <Label className="text-white flex items-center mb-2">
                          <FileText className="h-4 w-4 ml-2" />
                          نوع المحتوى
                        </Label>
                        <Badge variant="secondary" className="bg-green-800 text-green-200">
                          {profileAnalysis.contentCategory}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* أزرار العمليات */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <Button
                    onClick={() => {
                      const report = {
                        videoUrl,
                        timestamp: new Date().toISOString(),
                        videoAnalysis: analysisResult,
                        profileAnalysis
                      };
                      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `analysis_report_${Date.now()}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      toast({ title: "تم تحميل التقرير", description: "تم تحميل تقرير التحليل بنجاح" });
                    }}
                    variant="outline"
                    className="text-white border-green-600 hover:bg-green-600"
                  >
                    <Download className="h-4 w-4 ml-2" />
                    تحميل تقرير شامل
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setAnalysisResult(null);
                      setProfileAnalysis(null);
                      setShowAnalysis(false);
                      setShowProfileAnalysis(false);
                      setCustomTitle("");
                      setCustomDescription("");
                      setCustomHashtags("");
                    }}
                    variant="outline"
                    className="text-white border-green-600 hover:bg-green-600"
                  >
                    <RefreshCw className="h-4 w-4 ml-2" />
                    تحليل جديد
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            {!verificationResult && !hasUsedFreePublish && (
              <Button
                onClick={handleVerifyInteraction}
                disabled={isVerifying}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg font-bold"
              >
                {isVerifying ? "جاري التحقق..." : "🔍 تحقق من التفاعل"}
              </Button>
            )}

            {verificationResult && verificationResult.allRequirementsMet && !hasUsedFreePublish && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleFreePublish}
                  disabled={isProcessing || !videoUrl.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-12 py-6 text-xl font-bold"
                >
                  {isProcessing ? "جاري النشر..." : "🚀 انشر مجاناً الآن"}
                </Button>
                

              </div>
            )}

            {verificationResult && !verificationResult.allRequirementsMet && (
              <div className="text-center">
                <p className="text-yellow-400 mb-4">
                  يرجى إكمال جميع المتطلبات أولاً ثم إعادة التحقق
                </p>
                <Button
                  onClick={handleVerifyInteraction}
                  disabled={isVerifying}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-4"
                >
                  {isVerifying ? "جاري التحقق..." : "إعادة التحقق"}
                </Button>
              </div>
            )}

            {hasUsedFreePublish && (
              <div className="text-center">
                <Badge className="bg-red-600 text-white px-6 py-3 text-lg">
                  تم استخدام النشر المجاني
                </Badge>
                <p className="text-gray-400 mt-2">
                  لقد استخدمت النشر المجاني من قبل. تواصل معنا للحصول على خدمات متقدمة.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* نتائج النشر */}
      {showResults && publishingResults && (
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-2xl text-center">
                  📊 نتائج النشر المجاني
                </CardTitle>
                <CardDescription className="text-slate-300 text-center">
                  تفاصيل عملية نشر فيديوك على 1,171 موقع ومنتدى
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* شريط التقدم */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300">تقدم النشر</span>
                    <span className="text-green-400 font-bold">
                      {publishingResults.progress || 0}%
                    </span>
                  </div>
                  <Progress 
                    value={publishingResults.progress || 0} 
                    className="h-3"
                  />
                </div>

                {/* إحصائيات النشر */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-900/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {publishingResults.totalSites}
                    </div>
                    <div className="text-slate-300">إجمالي المواقع</div>
                  </div>
                  
                  <div className="bg-green-900/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {publishingResults.successfulSites}
                    </div>
                    <div className="text-slate-300">نشر ناجح</div>
                  </div>
                  
                  <div className="bg-red-900/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {publishingResults.failedSites}
                    </div>
                    <div className="text-slate-300">فشل في النشر</div>
                  </div>
                </div>

                {/* حالة النشر */}
                <div className="text-center">
                  <Badge 
                    className={`px-6 py-3 text-lg ${
                      publishingResults.status === 'تم النشر بنجاح!' 
                        ? 'bg-green-600' 
                        : 'bg-blue-600'
                    }`}
                  >
                    {publishingResults.status}
                  </Badge>
                  <p className="text-slate-400 mt-2">
                    بدأ النشر في: {publishingResults.startTime}
                  </p>
                </div>

                {/* معلومات إضافية */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">📋 تفاصيل النشر</h4>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex justify-between">
                      <span>رابط الفيديو:</span>
                      <span className="text-blue-400 break-all">{videoUrl}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>معرف النشر:</span>
                      <span className="text-purple-400">#{publishingResults.deploymentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المدة المتوقعة:</span>
                      <span className="text-yellow-400">2-5 دقائق</span>
                    </div>
                  </div>
                </div>

                {/* رسالة النجاح */}
                {publishingResults.status === 'تم النشر بنجاح!' && (
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
                      <div>
                        <h4 className="text-green-400 font-semibold">تهانينا! تم نشر فيديوك بنجاح</h4>
                        <p className="text-slate-300 text-sm mt-1">
                          تم نشر الفيديو على {publishingResults.successfulSites} موقع ومنتدى. 
                          ستبدأ في رؤية النتائج خلال الساعات القادمة.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* قسم خدمة المساعدة */}
      <section className="py-16 px-6 bg-slate-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">تحتاج مساعدة؟</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* WhatsApp Support */}
            <Card className="bg-green-900/20 border-green-500/30">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">📱</div>
                  <h3 className="text-xl font-semibold text-green-400 mb-3">
                    خدمة العملاء على WhatsApp
                  </h3>
                  <p className="text-slate-300 mb-6">
                    تواصل معنا مباشرة على WhatsApp للحصول على مساعدة فورية
                  </p>
                  <a
                    href="https://wa.me/+33673140174"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button className="bg-green-600 hover:bg-green-700 px-8 py-3">
                      💬 تواصل عبر WhatsApp
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Email Support */}
            <Card className="bg-blue-900/20 border-blue-500/30">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">📧</div>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">
                    البريد الإلكتروني
                  </h3>
                  <p className="text-slate-300 mb-6">
                    أرسل استفسارك أو طلبك عبر البريد الإلكتروني
                  </p>
                  <a
                    href="mailto:kleberphone@gmail.com"
                    className="inline-block"
                  >
                    <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                      📨 إرسال بريد إلكتروني
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* معلومات إضافية */}
          <div className="mt-12 bg-slate-700/50 rounded-lg p-6">
            <h4 className="text-white font-semibold mb-4">معلومات التواصل</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-300">
              <div>
                <strong className="text-white">WhatsApp:</strong><br />
                +33 6 73 14 01 74
              </div>
              <div>
                <strong className="text-white">البريد الإلكتروني:</strong><br />
                kleberphone@gmail.com
              </div>
              <div>
                <strong className="text-white">TikTok:</strong><br />
                @karimnapoli13
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}