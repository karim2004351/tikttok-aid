import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Search, Copy, ExternalLink, Hash, Target, Users, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoAnalysisResult {
  title: string;
  description: string;
  category: string;
  tags: string[];
  targetAudience: string;
  contentType: string;
  suggestedPlatforms: string[];
  customTitles: {
    reddit: string;
    twitter: string;
    facebook: string;
    tiktok: string;
    youtube: string;
    arabic_forums: string;
  };
  customDescriptions: {
    reddit: string;
    twitter: string;
    facebook: string;
    tiktok: string;
    youtube: string;
    arabic_forums: string;
  };
  hashtags: {
    general: string[];
    twitter: string[];
    tiktok: string[];
    instagram: string[];
  };
  keyMoments: string[];
  thumbnailSuggestions: string[];
}

export function VideoAnalyzer() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<VideoAnalysisResult | null>(null);
  const [urlValidation, setUrlValidation] = useState<{
    isValid: boolean;
    platform: string;
    videoId: string;
    error?: string;
  } | null>(null);
  const { toast } = useToast();

  const validateUrl = (url: string) => {
    if (!url.trim()) {
      setUrlValidation(null);
      return;
    }

    try {
      const urlObj = new URL(url);
      const supportedPlatforms = {
        'youtube.com': 'YouTube',
        'youtu.be': 'YouTube',
        'tiktok.com': 'TikTok',
        'vm.tiktok.com': 'TikTok',
        'facebook.com': 'Facebook',
        'instagram.com': 'Instagram',
        'twitter.com': 'Twitter',
        'vimeo.com': 'Vimeo',
        'dailymotion.com': 'Dailymotion'
      };

      let detectedPlatform = '';
      let videoId = '';

      for (const [domain, platform] of Object.entries(supportedPlatforms)) {
        if (urlObj.hostname.includes(domain)) {
          detectedPlatform = platform;
          
          // استخراج معرف الفيديو
          if (platform === 'YouTube') {
            if (url.includes('youtu.be/')) {
              videoId = url.split('youtu.be/')[1].split('?')[0];
            } else if (url.includes('watch?v=')) {
              videoId = url.split('watch?v=')[1].split('&')[0];
            }
          } else if (platform === 'TikTok') {
            const match = url.match(/\/video\/(\d+)/);
            videoId = match ? match[1] : 'غير محدد';
          } else if (platform === 'Vimeo') {
            const match = url.match(/vimeo\.com\/(\d+)/);
            videoId = match ? match[1] : 'غير محدد';
          }
          break;
        }
      }

      if (detectedPlatform) {
        setUrlValidation({
          isValid: true,
          platform: detectedPlatform,
          videoId: videoId || 'غير محدد'
        });
      } else {
        setUrlValidation({
          isValid: false,
          platform: 'غير مدعوم',
          videoId: '',
          error: 'المنصة غير مدعومة. المنصات المدعومة: YouTube, TikTok, Facebook, Instagram, Twitter, Vimeo, Dailymotion'
        });
      }
    } catch (error) {
      setUrlValidation({
        isValid: false,
        platform: '',
        videoId: '',
        error: 'رابط غير صحيح'
      });
    }
  };

  const handleAnalyze = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط الفيديو",
        variant: "destructive"
      });
      return;
    }

    if (urlValidation && !urlValidation.isValid) {
      toast({
        title: "رابط غير صحيح",
        description: urlValidation.error || "يرجى التحقق من صحة الرابط",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
        toast({
          title: "تم التحليل بنجاح",
          description: "تم تحليل الفيديو وإنشاء المحتوى المخصص",
        });
      } else {
        throw new Error(data.error || 'فشل في تحليل الفيديو');
      }
    } catch (error: any) {
      toast({
        title: "خطأ في التحليل",
        description: error.message || 'حدث خطأ أثناء تحليل الفيديو',
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ",
      description: "تم نسخ النص إلى الحافظة",
    });
  };

  const getPlatformColor = (platform: string) => {
    const colors: { [key: string]: string } = {
      'Reddit': 'bg-orange-500',
      'Twitter': 'bg-blue-500',
      'Facebook': 'bg-blue-600',
      'TikTok': 'bg-black',
      'YouTube': 'bg-red-500',
      'Instagram': 'bg-pink-500'
    };
    return colors[platform] || 'bg-gray-500';
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-6 w-6 text-blue-400" />
            تحليل الفيديو بالذكاء الاصطناعي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="أدخل رابط الفيديو (YouTube, TikTok, Vimeo...)"
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                validateUrl(e.target.value);
              }}
              className="flex-1 bg-slate-700 border-slate-600 text-white"
            />
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <Search className="h-4 w-4 mr-2 animate-spin" />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  تحليل الفيديو
                </>
              )}
            </Button>
          </div>

          {/* منطقة عرض حالة الرابط */}
          {urlValidation && (
            <Card className={`${urlValidation.isValid ? 'bg-green-900/30 border-green-600' : 'bg-red-900/30 border-red-600'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {urlValidation.isValid ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-green-400 font-semibold">رابط صحيح</span>
                          <Badge className={getPlatformColor(urlValidation.platform)}>
                            {urlValidation.platform}
                          </Badge>
                        </div>
                        {urlValidation.videoId && (
                          <div className="text-sm text-green-300">
                            معرف الفيديو: {urlValidation.videoId}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-red-400 font-semibold mb-1">رابط غير صحيح</div>
                        <div className="text-sm text-red-300">
                          {urlValidation.error}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {isAnalyzing && (
            <div className="text-center py-8">
              <div className="space-y-3">
                <div className="animate-pulse text-blue-400">
                  جاري تحليل الفيديو وإنشاء المحتوى المخصص...
                </div>
                {urlValidation && urlValidation.isValid && (
                  <div className="text-sm text-slate-400">
                    تحليل فيديو {urlValidation.platform} - {urlValidation.videoId}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-6">
          {/* معلومات أساسية */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">العنوان المقترح</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 p-2 bg-slate-700 rounded text-white">
                      {analysis.title}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(analysis.title)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-slate-400">الفئة</label>
                  <div className="mt-1">
                    <Badge className="bg-purple-600">{analysis.category}</Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-slate-400">الجمهور المستهدف</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="text-white">{analysis.targetAudience}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-slate-400">نوع المحتوى</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Target className="h-4 w-4 text-slate-400" />
                    <span className="text-white">{analysis.contentType}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400">الوصف العام</label>
                <div className="flex items-start gap-2 mt-1">
                  <div className="flex-1 p-2 bg-slate-700 rounded text-white text-sm">
                    {analysis.description}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(analysis.description)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400">المنصات المقترحة</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {analysis.suggestedPlatforms.map((platform, index) => (
                    <Badge key={index} className={getPlatformColor(platform)}>
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* المحتوى المخصص لكل منصة */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">المحتوى المخصص لكل منصة</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="reddit" className="w-full">
                <TabsList className="grid w-full grid-cols-6 bg-slate-700">
                  <TabsTrigger value="reddit" className="text-white">Reddit</TabsTrigger>
                  <TabsTrigger value="twitter" className="text-white">Twitter</TabsTrigger>
                  <TabsTrigger value="facebook" className="text-white">Facebook</TabsTrigger>
                  <TabsTrigger value="tiktok" className="text-white">TikTok</TabsTrigger>
                  <TabsTrigger value="youtube" className="text-white">YouTube</TabsTrigger>
                  <TabsTrigger value="arabic_forums" className="text-white">المنتديات</TabsTrigger>
                </TabsList>

                {Object.entries(analysis.customTitles).map(([platform, title]) => (
                  <TabsContent key={platform} value={platform} className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-400">العنوان المخصص</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 p-3 bg-slate-700 rounded text-white">
                          {title}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(title)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-slate-400">الوصف المخصص</label>
                      <div className="flex items-start gap-2 mt-1">
                        <div className="flex-1 p-3 bg-slate-700 rounded text-white text-sm">
                          {analysis.customDescriptions[platform as keyof typeof analysis.customDescriptions]}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(analysis.customDescriptions[platform as keyof typeof analysis.customDescriptions])}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* الهاشتاجات */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Hash className="h-5 w-5" />
                الهاشتاجات المقترحة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(analysis.hashtags).map(([platform, tags]) => (
                  <div key={platform}>
                    <label className="text-sm text-slate-400 capitalize">{platform}</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-blue-600"
                          onClick={() => copyToClipboard(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* اللحظات المهمة واقتراحات الصور المصغرة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">اللحظات المهمة</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.keyMoments.map((moment, index) => (
                    <li key={index} className="flex items-start gap-2 text-white">
                      <Eye className="h-4 w-4 mt-1 text-blue-400" />
                      {moment}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">اقتراحات الصور المصغرة</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.thumbnailSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-white">
                      <Target className="h-4 w-4 mt-1 text-green-400" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}