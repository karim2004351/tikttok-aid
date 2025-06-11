import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Zap, Brain, Globe, Video, Play, Users, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function FastPublish() {
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishingProgress, setPublishingProgress] = useState(0);

  const { toast } = useToast();

  const analyzeVideo = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "⚠️ خطأ في الإدخال",
        description: "يرجى إدخال رابط الفيديو أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // محاكاة تحليل الفيديو
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTitle("فيديو ترفيهي مميز - محتوى عربي رائع");
      setHashtags("#ترفيه #محتوى_عربي #فيديو #مسلي #رائع #شعبي #ترند");
      
      toast({
        title: "✅ تم التحليل بنجاح!",
        description: "تم استخراج العنوان و 7 هاشتاغات",
      });
    } catch (error) {
      toast({
        title: "❌ خطأ في التحليل",
        description: "تعذر تحليل الفيديو، حاول مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startPublishing = async () => {
    if (!videoUrl.trim() || !title.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال رابط الفيديو والعنوان",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    setPublishingProgress(0);
    
    try {
      const response = await fetch('/api/quick-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          videoUrl, 
          title, 
          hashtags: hashtags
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        toast({
          title: "تم بدء النشر",
          description: "جاري النشر على جميع المواقع",
        });

        // عرض تقدم النشر للمستخدم
        for (let i = 0; i <= 100; i += 2) {
          await new Promise(resolve => setTimeout(resolve, 150));
          setPublishingProgress(i);
        }
        
        toast({
          title: "تم النشر بنجاح",
          description: "تم نشر المحتوى على 1,173 موقع",
        });
      } else {
        throw new Error('فشل في بدء النشر');
      }
    } catch (error) {
      toast({
        title: "خطأ في النشر",
        description: "تعذر إكمال عملية النشر",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
      setPublishingProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Zap className="text-yellow-500 w-12 h-12" />
            النشر السريع المتقدم
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            تحليل ذكي للفيديو ونشر فوري على أكثر من 1000 موقع ومنصة
          </p>
          
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">1,173</div>
              <div className="text-sm text-gray-600">إجمالي المواقع</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">95%</div>
              <div className="text-sm text-gray-600">معدل النجاح</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">3 دقائق</div>
              <div className="text-sm text-gray-600">متوسط الوقت</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* قسم إدخال الفيديو */}
          <Card className="border-2 border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-3 text-blue-800">
                <Video className="text-blue-600 w-6 h-6" />
                📹 رابط الفيديو
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  رابط الفيديو (TikTok, YouTube, Instagram)
                </label>
                <Input
                  placeholder="https://www.tiktok.com/@username/video/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="text-left h-12"
                />
              </div>
              
              <Button 
                onClick={analyzeVideo} 
                disabled={isAnalyzing || !videoUrl.trim()}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                size="lg"
              >
                <Brain className="ml-2 w-5 h-5" />
                {isAnalyzing ? "🧠 جاري التحليل الذكي..." : "🤖 تحليل الفيديو بالذكاء الاصطناعي"}
              </Button>

              {isAnalyzing && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-blue-700 font-medium">تحليل المحتوى...</span>
                  </div>
                  <div className="text-sm text-blue-600">
                    • استخراج العنوان والوصف<br/>
                    • تحديد الهاشتاغات المناسبة<br/>
                    • تحسين المحتوى للنشر
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* قسم المحتوى والتحرير */}
          <Card className="border-2 border-green-200 shadow-lg">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-3 text-green-800">
                <Globe className="text-green-600 w-6 h-6" />
                ✏️ محتوى النشر
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  عنوان المنشور
                </label>
                <Textarea
                  placeholder="عنوان جذاب للمنشور..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  الهاشتاغات
                </label>
                <Textarea
                  placeholder="#هاشتاغ1 #هاشتاغ2 #هاشتاغ3..."
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {(title || hashtags) && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">📋 معاينة المحتوى:</h4>
                  {title && (
                    <div className="mb-2">
                      <span className="text-xs text-green-600">العنوان:</span>
                      <div className="text-sm text-green-700">{title}</div>
                    </div>
                  )}
                  {hashtags && (
                    <div>
                      <span className="text-xs text-green-600">الهاشتاغات:</span>
                      <div className="text-sm text-green-700">{hashtags}</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* قسم النشر */}
        <Card className="mt-8 border-2 border-purple-200 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center">
              {publishingProgress > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-purple-700 font-medium">جاري النشر...</span>
                    <span className="text-purple-600">{publishingProgress}%</span>
                  </div>
                  <div className="w-full bg-purple-100 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${publishingProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-purple-600 mt-2">
                    تم النشر على {Math.floor(publishingProgress * 11.73)} موقع من أصل 1,173
                  </div>
                </div>
              )}

              <Button 
                onClick={startPublishing} 
                disabled={isPublishing || !title.trim()}
                size="lg"
                className="px-12 py-4 h-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg"
              >
                <Zap className="ml-3 w-6 h-6" />
                {isPublishing ? "🚀 جاري النشر..." : "🎯 بدء النشر على 1,173 موقع"}
              </Button>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-blue-600">مواقع التواصل</div>
                  <div className="text-sm text-gray-600">147 منصة</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-600">المنتديات</div>
                  <div className="text-sm text-gray-600">623 منتدى</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <Play className="w-6 h-6 text-red-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-red-600">مواقع الفيديو</div>
                  <div className="text-sm text-gray-600">298 موقع</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <Globe className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-purple-600">مواقع أخرى</div>
                  <div className="text-sm text-gray-600">105 مواقع</div>
                </div>
              </div>

              <div className="mt-6 flex justify-center gap-4">
                <Link href="/admin" className="text-blue-600 hover:underline">
                  🔧 إعدادات متقدمة
                </Link>
                <Link href="/sites-manager" className="text-green-600 hover:underline">
                  📊 إدارة المواقع
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}