import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Globe, Play, Share, Heart, MessageCircle, UserPlus, Send, Settings, Eye } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function TikTokManager() {
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [targetVideo, setTargetVideo] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminSettings, setAdminSettings] = useState(null);
  const [interactionStatus, setInteractionStatus] = useState({
    follow: false,
    watch: false,
    repost: false,
    comment: false,
    share: false
  });
  
  const { toast } = useToast();

  // تحميل الإعدادات من لوحة التحكم الإدارية
  useEffect(() => {
    const loadAdminSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const result = await response.json();
        if (result.success) {
          setAdminSettings(result.settings);
          setTiktokUrl(result.settings.tiktokUrl);
          setTargetVideo(result.settings.targetVideo);
        }
      } catch (error) {
        console.error('Error loading admin settings:', error);
      }
    };
    
    loadAdminSettings();
  }, []);

  const handleTikTokInteraction = async (action: string) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/tiktok-interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: tiktokUrl,
          action: action
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setInteractionStatus(prev => ({
          ...prev,
          [action]: true
        }));
        
        toast({
          title: "نجح التفاعل!",
          description: `تم ${getActionLabel(action)} بنجاح`,
        });
      } else {
        toast({
          title: "خطأ في التفاعل",
          description: result.message || "حدث خطأ أثناء المعالجة",
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

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      follow: "متابعة الصفحة",
      watch: "مشاهدة الفيديو",
      repost: "إعادة النشر",
      comment: "التعليق",
      share: "مشاركة مع 10 أصدقاء"
    };
    return labels[action] || action;
  };

  const handleCompleteInteraction = async () => {
    setIsProcessing(true);
    
    try {
      // تنفيذ جميع التفاعلات بالتتابع
      const actions = ['follow', 'watch', 'repost', 'comment', 'share'];
      
      for (const action of actions) {
        await handleTikTokInteraction(action);
        // انتظار قصير بين كل عملية
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      toast({
        title: "اكتملت جميع التفاعلات!",
        description: "تم تنفيذ جميع المتطلبات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في التفاعل الشامل",
        description: "حدث خطأ أثناء تنفيذ بعض العمليات",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-purple-400" />
              <h1 className="text-2xl font-bold">منصة النشر الذكي</h1>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white">
                لوحة التحكم
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-purple-600">
                الرئيسية
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* TikTok Manager Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">إدارة التفاعل مع تيك توك</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            قم بتكوين وإدارة التفاعل التلقائي مع صفحة تيك توك الخاصة بك
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* إعدادات الرابط */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="mr-2 h-6 w-6 text-purple-400" />
                إعدادات صفحة تيك توك
              </CardTitle>
              <CardDescription className="text-gray-300">
                قم بتحديث رابط صفحة تيك توك للتفاعل معها
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="tiktok-url" className="text-white">رابط صفحة تيك توك</Label>
                <Input
                  id="tiktok-url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@username"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">الرابط الحالي:</h4>
                <a 
                  href={tiktokUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline break-all"
                >
                  {tiktokUrl}
                </a>
              </div>

              <Button 
                onClick={() => {
                  toast({
                    title: "تم حفظ الرابط",
                    description: "تم تحديث رابط تيك توك بنجاح",
                  });
                }}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                حفظ التغييرات
              </Button>
            </CardContent>
          </Card>

          {/* حالة التفاعلات */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Eye className="mr-2 h-6 w-6 text-green-400" />
                حالة التفاعلات
              </CardTitle>
              <CardDescription className="text-gray-300">
                تتبع حالة التفاعلات المختلفة مع الصفحة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">متابعة الصفحة</span>
                  <Badge variant={interactionStatus.follow ? "default" : "secondary"}>
                    {interactionStatus.follow ? "تم" : "معلق"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">مشاهدة الفيديو</span>
                  <Badge variant={interactionStatus.watch ? "default" : "secondary"}>
                    {interactionStatus.watch ? "تم" : "معلق"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">إعادة النشر</span>
                  <Badge variant={interactionStatus.repost ? "default" : "secondary"}>
                    {interactionStatus.repost ? "تم" : "معلق"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">التعليق</span>
                  <Badge variant={interactionStatus.comment ? "default" : "secondary"}>
                    {interactionStatus.comment ? "تم" : "معلق"}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">مشاركة مع 10 أصدقاء</span>
                <Badge variant={interactionStatus.share ? "default" : "secondary"}>
                  {interactionStatus.share ? "تم" : "معلق"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* إدارة الفيديو المستهدف */}
        <div className="mt-12">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">إدارة الفيديو المستهدف للنشر المجاني</CardTitle>
              <CardDescription className="text-gray-300">
                رابط الفيديو الذي سيطلب من المستخدمين التفاعل معه للحصول على النشر المجاني
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="target-video" className="text-white">رابط الفيديو المستهدف</Label>
                <Input
                  id="target-video"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@username/video/123456"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <Button 
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('adminToken');
                    const response = await fetch('/api/target-video', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({ targetVideo: tiktokUrl })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                      toast({
                        title: "تم حفظ الفيديو المستهدف",
                        description: "سيطلب من المستخدمين التفاعل مع هذا الفيديو",
                      });
                    } else {
                      toast({
                        title: "خطأ في الحفظ",
                        description: result.message,
                        variant: "destructive"
                      });
                    }
                  } catch (error) {
                    toast({
                      title: "خطأ في الاتصال",
                      description: "تعذر حفظ الفيديو المستهدف",
                      variant: "destructive"
                    });
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                حفظ الفيديو المستهدف
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* أزرار التفاعل */}
        <div className="mt-12">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-center">عمليات التفاعل</CardTitle>
              <CardDescription className="text-gray-300 text-center">
                اختر نوع التفاعل المطلوب أو قم بتنفيذ جميع العمليات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
                <Button
                  onClick={() => handleTikTokInteraction('follow')}
                  disabled={isProcessing || interactionStatus.follow}
                  className="flex flex-col items-center space-y-2 h-20 bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="h-6 w-6" />
                  <span>متابعة</span>
                </Button>

                <Button
                  onClick={() => handleTikTokInteraction('watch')}
                  disabled={isProcessing || interactionStatus.watch}
                  className="flex flex-col items-center space-y-2 h-20 bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-6 w-6" />
                  <span>مشاهدة</span>
                </Button>

                <Button
                  onClick={() => handleTikTokInteraction('repost')}
                  disabled={isProcessing || interactionStatus.repost}
                  className="flex flex-col items-center space-y-2 h-20 bg-purple-600 hover:bg-purple-700"
                >
                  <Share className="h-6 w-6" />
                  <span>إعادة نشر</span>
                </Button>

                <Button
                  onClick={() => handleTikTokInteraction('comment')}
                  disabled={isProcessing || interactionStatus.comment}
                  className="flex flex-col items-center space-y-2 h-20 bg-yellow-600 hover:bg-yellow-700"
                >
                  <MessageCircle className="h-6 w-6" />
                  <span>تعليق</span>
                </Button>

                <Button
                  onClick={() => handleTikTokInteraction('share')}
                  disabled={isProcessing || interactionStatus.share}
                  className="flex flex-col items-center space-y-2 h-20 bg-pink-600 hover:bg-pink-700"
                >
                  <Send className="h-6 w-6" />
                  <span>مشاركة</span>
                </Button>
              </div>

              <div className="text-center">
                <Button
                  onClick={handleCompleteInteraction}
                  disabled={isProcessing}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-12 py-6 text-lg"
                >
                  {isProcessing ? "جاري التنفيذ..." : "تنفيذ جميع التفاعلات"}
                  <Heart className="mr-2 h-6 w-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* معلومات إضافية */}
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          <Card className="bg-gray-800/30 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">المتطلبات</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-300 space-y-2">
                <li>• الدخول إلى صفحة تيك توك</li>
                <li>• متابعة صاحب الصفحة</li>
                <li>• مشاهدة الفيديو كاملاً</li>
                <li>• إعادة النشر</li>
                <li>• إضافة تعليق</li>
                <li>• إرسال لـ10 أصدقاء</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">الأتمتة</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-300 space-y-2">
                <li>• تفاعل تلقائي</li>
                <li>• متابعة مباشرة للحالة</li>
                <li>• تقارير مفصلة</li>
                <li>• إعادة المحاولة عند الفشل</li>
                <li>• تأكيد كل عملية</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">الأمان</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-300 space-y-2">
                <li>• تفاعل طبيعي</li>
                <li>• احترام حدود المنصة</li>
                <li>• عدم حفظ كلمات المرور</li>
                <li>• حماية البيانات</li>
                <li>• تشفير الاتصالات</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}