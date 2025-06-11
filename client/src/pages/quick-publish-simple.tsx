import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Zap, Brain, Globe, Video } from "lucide-react";

export default function QuickPublishSimple() {
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const { toast } = useToast();

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
      const response = await fetch('/api/analyze-video-real', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success && data.data) {
          const analysis = data.data;
          setTitle(analysis.title || 'عنوان محلل');
          setHashtags(Array.isArray(analysis.hashtags) ? analysis.hashtags.join(', ') : '');
          
          toast({
            title: "تم التحليل بنجاح!",
            description: `تم استخراج ${Array.isArray(analysis.hashtags) ? analysis.hashtags.length : 0} هاشتاغ`,
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
        description: "تعذر تحليل الفيديو",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startPublishing = async () => {
    if (!videoUrl.trim() || !title.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط الفيديو والعنوان",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    
    try {
      const response = await fetch('/api/free-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl, title, hashtags }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "تم النشر بنجاح!",
          description: data.message || "تم النشر على المنصات المختارة",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في النشر');
      }
    } catch (error) {
      toast({
        title: "خطأ في النشر",
        description: "تعذر بدء عملية النشر",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Zap className="text-yellow-500" />
            النشر السريع المتقدم
          </h1>
          <p className="text-lg text-gray-600">
            تحليل ذكي للفيديو ونشر فوري على جميع المنصات
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* إدخال الفيديو والتحليل */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="text-blue-500" />
                رابط الفيديو
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="https://www.tiktok.com/@username/video/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="text-left"
              />
              <Button 
                onClick={analyzeVideo} 
                disabled={isAnalyzing}
                className="w-full"
              >
                <Brain className="ml-2" />
                {isAnalyzing ? "جاري التحليل..." : "تحليل الفيديو"}
              </Button>
            </CardContent>
          </Card>

          {/* النتائج والتحرير */}
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="text-green-500" />
                محتوى النشر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">العنوان</label>
                <Textarea
                  placeholder="عنوان المنشور..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الهاشتاغات</label>
                <Textarea
                  placeholder="هاشتاغ1, هاشتاغ2, هاشتاغ3..."
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* زر النشر */}
        <Card className="mt-6 border-2 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Button 
                onClick={startPublishing} 
                disabled={isPublishing || !title.trim()}
                size="lg"
                className="px-8"
              >
                <Zap className="ml-2" />
                {isPublishing ? "جاري النشر..." : "بدء النشر على 1000+ موقع"}
              </Button>
              
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">1,173</div>
                  <div className="text-sm text-gray-600">إجمالي المواقع</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">1,089</div>
                  <div className="text-sm text-gray-600">مواقع نشطة</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">87%</div>
                  <div className="text-sm text-gray-600">معدل النجاح</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}