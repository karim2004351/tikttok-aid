import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Loader2, 
  Copy, 
  CheckCircle2, 
  ExternalLink, 
  Edit3, 
  Save, 
  X, 
  AlertCircle,
  Link2,
  RefreshCw,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { analysisStore } from "@/lib/analysis-store";

interface AnalysisResult {
  title: string;
  description: string;
  hashtags: string[];
  category: string;
  rating: number;
}

export function EnhancedVideoAnalyzer() {
  const [videoUrl, setVideoUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isEditing, setIsEditing] = useState({
    title: false,
    description: false,
    hashtags: false
  });
  const [editedValues, setEditedValues] = useState({
    title: "",
    description: "", 
    hashtags: ""
  });
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const { toast } = useToast();

  // جلب رابط الفيديو المحفوظ
  const { data: targetVideo } = useQuery<{ url?: string }>({
    queryKey: ["/api/target-video"],
    refetchInterval: 5000,
  });

  // تحديث رابط الفيديو عند تغيير الهدف
  useEffect(() => {
    if (targetVideo?.url && !videoUrl) {
      setVideoUrl(targetVideo.url);
    }
  }, [targetVideo?.url, videoUrl]);

  const validateVideoUrl = (url: string) => {
    if (!url.trim()) return { isValid: false, platform: "", error: "لا يوجد رابط" };
    
    const videoPatterns = [
      { pattern: /youtube\.com\/watch\?v=/, platform: "YouTube" },
      { pattern: /youtu\.be\//, platform: "YouTube" },
      { pattern: /tiktok\.com/, platform: "TikTok" },
      { pattern: /instagram\.com/, platform: "Instagram" },
      { pattern: /facebook\.com/, platform: "Facebook" },
      { pattern: /twitter\.com/, platform: "Twitter" },
      { pattern: /vimeo\.com/, platform: "Vimeo" }
    ];
    
    for (const { pattern, platform } of videoPatterns) {
      if (pattern.test(url)) {
        return { isValid: true, platform, error: null };
      }
    }
    
    return { 
      isValid: false, 
      platform: "غير مدعوم", 
      error: "المنصة غير مدعومة. المنصات المدعومة: YouTube, TikTok, Instagram, Facebook, Twitter, Vimeo" 
    };
  };

  const urlValidation = validateVideoUrl(videoUrl);

  const updateTargetVideo = async (url: string) => {
    try {
      const response = await fetch("/api/target-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("فشل في حفظ رابط الفيديو");
      }

      toast({
        title: "تم التحديث",
        description: "تم حفظ رابط الفيديو الجديد",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حفظ رابط الفيديو",
        variant: "destructive",
      });
    }
  };

  const analyzeVideo = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رابط الفيديو",
        variant: "destructive",
      });
      return;
    }

    if (!urlValidation.isValid) {
      toast({
        title: "رابط غير صحيح",
        description: urlValidation.error || "الرجاء إدخال رابط فيديو صحيح",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-video-real", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل في تحليل الفيديو");
      }

      const data = await response.json();
      if (data.success && data.data) {
        const result = data.data;
        setAnalysis(result);
        setEditedValues({
          title: result.title,
          description: result.description,
          hashtags: (result.hashtags || []).map((tag: string) => tag.startsWith('#') ? tag : `#${tag}`).join(' ')
        });

        // حفظ البيانات في المخزن المشترك
        analysisStore.setAnalysis({
          title: result.title,
          description: result.description,
          hashtags: result.hashtags || [],
          category: result.category || 'عام',
          rating: result.rating,
          videoUrl: videoUrl,
          isAnalyzed: true
        });
      } else {
        throw new Error("فشل في تحليل الفيديو");
      }

      // حفظ رابط الفيديو كهدف
      await updateTargetVideo(videoUrl);

      toast({
        title: "تم التحليل بنجاح",
        description: "تم تحليل الفيديو وحفظ البيانات للنشر",
      });
    } catch (error: any) {
      let errorMessage = "حدث خطأ أثناء تحليل الفيديو";
      let shouldShowApiInput = false;
      
      if (error.message.includes("API key") || error.message.includes("authentication") || error.message.includes("401")) {
        errorMessage = "مفتاح OpenAI غير متوفر أو غير صحيح";
        shouldShowApiInput = true;
      } else if (error.message.includes("429")) {
        errorMessage = "تم تجاوز حد الاستخدام لـ API";
      }
      
      if (shouldShowApiInput) {
        setShowApiKeyInput(true);
        toast({
          title: "مطلوب مفتاح OpenAI",
          description: "لتحسين جودة التحليل، يمكنك إضافة مفتاح OpenAI أدناه",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطأ في التحليل",
          description: errorMessage,
          variant: "destructive",
        });
      }
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

  const saveEdit = (field: 'title' | 'description' | 'hashtags') => {
    if (analysis) {
      let updatedAnalysis = { ...analysis };
      
      if (field === 'hashtags') {
        const hashtagArray = editedValues.hashtags.split(/\s+/).map(tag => tag.replace('#', '').trim()).filter(tag => tag);
        updatedAnalysis.hashtags = hashtagArray;
        
        // تحديث المخزن المشترك
        analysisStore.updateField('hashtags', hashtagArray);
      } else {
        updatedAnalysis[field] = editedValues[field];
        
        // تحديث المخزن المشترك
        analysisStore.updateField(field, editedValues[field]);
      }
      
      setAnalysis(updatedAnalysis);
    }
    setIsEditing({ ...isEditing, [field]: false });
    toast({
      title: "تم الحفظ",
      description: "تم حفظ التعديلات وتحديث بيانات النشر",
    });
  };

  const cancelEdit = (field: 'title' | 'description' | 'hashtags') => {
    if (analysis) {
      if (field === 'hashtags') {
        setEditedValues({
          ...editedValues,
          hashtags: analysis.hashtags.map((tag: string) => `#${tag}`).join(' ')
        });
      } else {
        setEditedValues({
          ...editedValues,
          [field]: analysis[field]
        });
      }
    }
    setIsEditing({ ...isEditing, [field]: false });
  };

  const openVideoPreview = () => {
    if (videoUrl && urlValidation.isValid) {
      window.open(videoUrl, '_blank');
    }
  };

  const handleApiKeySubmit = async () => {
    if (!tempApiKey.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال مفتاح OpenAI",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/fix-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: tempApiKey.trim() }),
      });

      if (response.ok) {
        setShowApiKeyInput(false);
        toast({
          title: "تم الحفظ",
          description: "تم حفظ مفتاح OpenAI بنجاح",
        });
        // Re-analyze with the new API key
        if (videoUrl) {
          analyzeVideo();
        }
      } else {
        throw new Error('فشل في حفظ المفتاح');
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حفظ مفتاح OpenAI",
        variant: "destructive",
      });
    }
  };

      if (!response.ok) {
        throw new Error('فشل في إضافة المفتاح');
      }

      toast({
        title: "تم إضافة المفتاح",
        description: "تم إضافة مفتاح OpenAI بنجاح. جرب التحليل مرة أخرى",
      });

      setTempApiKey("");
      setShowApiKeyInput(false);
    } catch (error: any) {
      toast({
        title: "خطأ في إضافة المفتاح",
        description: error.message || "حدث خطأ أثناء إضافة المفتاح",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* قسم إدخال وفحص رابط الفيديو */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Link2 className="h-6 w-6 text-blue-400" />
            رابط الفيديو للتحليل
          </CardTitle>
          <CardDescription className="text-slate-400">
            أدخل رابط الفيديو وتأكد من صحته قبل التحليل
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* عرض الرابط المحفوظ */}
          {targetVideo?.url && targetVideo.url !== videoUrl && (
            <Alert className="border-blue-600 bg-blue-600/10">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-400">
                الرابط المحفوظ حالياً: {targetVideo.url}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setVideoUrl(targetVideo.url || "")}
                  className="ml-2 text-blue-400 hover:text-blue-300"
                >
                  استخدام هذا الرابط
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <Label htmlFor="video-url" className="text-white">رابط الفيديو</Label>
              <Input
                id="video-url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="أدخل رابط الفيديو (YouTube, TikTok, Instagram, Facebook...)"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="flex items-end gap-2">
              {videoUrl && urlValidation.isValid && (
                <Button
                  variant="outline"
                  onClick={openVideoPreview}
                  className="border-slate-600 text-slate-300 hover:text-white"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button
                onClick={analyzeVideo}
                disabled={isAnalyzing || !videoUrl || !urlValidation.isValid}
                className="bg-purple-600 hover:bg-purple-700 flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    جاري التحليل...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    تحليل الفيديو
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* حالة الرابط */}
          {videoUrl && (
            <Alert className={urlValidation.isValid ? "border-green-600 bg-green-600/10" : "border-red-600 bg-red-600/10"}>
              {urlValidation.isValid ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-400">
                    <div className="flex items-center gap-2">
                      <span>رابط صحيح من {urlValidation.platform}</span>
                      <Badge className="bg-green-600">{urlValidation.platform}</Badge>
                    </div>
                  </AlertDescription>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">
                    {urlValidation.error}
                  </AlertDescription>
                </>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* قسم إضافة مفتاح OpenAI */}
      {showApiKeyInput && (
        <Card className="bg-orange-900/20 border-orange-600">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              إضافة مفتاح OpenAI لتحسين التحليل
            </CardTitle>
            <CardDescription className="text-orange-300">
              أضف مفتاح OpenAI للحصول على تحليل أكثر دقة وتفصيلاً
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai-key" className="text-white">مفتاح OpenAI API</Label>
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-400">
                يمكنك الحصول على مفتاح من platform.openai.com
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleApiKeySubmit}
                className="bg-green-600 hover:bg-green-700"
              >
                إضافة المفتاح
              </Button>
              <Button
                onClick={() => setShowApiKeyInput(false)}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* قسم نتائج التحليل */}
      {analysis && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-400" />
              نتائج التحليل بالذكاء الاصطناعي
              <Badge className="bg-green-600 ml-auto">جاهز للتعديل والنشر</Badge>
            </CardTitle>
            <CardDescription className="text-slate-400">
              يمكنك تعديل أي من المقترحات التالية قبل النشر. انقر على أيقونة التعديل لتخصيص المحتوى.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* العنوان */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white font-semibold">العنوان المقترح</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing({ ...isEditing, title: !isEditing.title })}
                  className="text-slate-400 hover:text-white"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
              {isEditing.title ? (
                <div className="space-y-2">
                  <Textarea
                    value={editedValues.title}
                    onChange={(e) => setEditedValues({ ...editedValues, title: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white min-h-[80px]"
                    placeholder="اكتب العنوان المخصص..."
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit('title')} className="bg-green-600 hover:bg-green-700">
                      <Save className="h-4 w-4 mr-1" />
                      حفظ
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => cancelEdit('title')}>
                      <X className="h-4 w-4 mr-1" />
                      إلغاء
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-700 p-4 rounded-lg border border-slate-600 relative">
                  <p className="text-white text-sm leading-relaxed">{analysis.title}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(analysis.title)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <Separator className="bg-slate-600" />

            {/* الوصف */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white font-semibold">الوصف المقترح</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing({ ...isEditing, description: !isEditing.description })}
                  className="text-slate-400 hover:text-white"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
              {isEditing.description ? (
                <div className="space-y-2">
                  <Textarea
                    value={editedValues.description}
                    onChange={(e) => setEditedValues({ ...editedValues, description: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
                    placeholder="اكتب الوصف المخصص..."
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit('description')} className="bg-green-600 hover:bg-green-700">
                      <Save className="h-4 w-4 mr-1" />
                      حفظ
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => cancelEdit('description')}>
                      <X className="h-4 w-4 mr-1" />
                      إلغاء
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-700 p-4 rounded-lg border border-slate-600 relative max-h-40 overflow-y-auto">
                  <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">{analysis.description}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(analysis.description)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <Separator className="bg-slate-600" />

            {/* الهاشتاجات */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white font-semibold">الهاشتاجات المقترحة</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing({ ...isEditing, hashtags: !isEditing.hashtags })}
                  className="text-slate-400 hover:text-white"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
              {isEditing.hashtags ? (
                <div className="space-y-2">
                  <Input
                    value={editedValues.hashtags}
                    onChange={(e) => setEditedValues({ ...editedValues, hashtags: e.target.value })}
                    placeholder="أدخل الهاشتاجات مفصولة بمسافات (مثال: #فيديو #ترفيه #محتوى)"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <div className="text-xs text-slate-400">
                    تلميح: اكتب الهاشتاجات مفصولة بمسافات. رمز # اختياري.
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit('hashtags')} className="bg-green-600 hover:bg-green-700">
                      <Save className="h-4 w-4 mr-1" />
                      حفظ
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => cancelEdit('hashtags')}>
                      <X className="h-4 w-4 mr-1" />
                      إلغاء
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-700 p-4 rounded-lg border border-slate-600 relative">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {analysis.hashtags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-blue-600/20 text-blue-300 cursor-pointer hover:bg-blue-600/30" onClick={() => copyToClipboard(`#${tag}`)}>
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(analysis.hashtags.map((tag: string) => `#${tag}`).join(' '))}
                    className="absolute top-2 right-2 text-slate-400 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <Separator className="bg-slate-600" />

            {/* معلومات إضافية */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <Label className="text-slate-400 text-sm">فئة المحتوى</Label>
                <div className="mt-2">
                  <Badge className="bg-green-600 text-white">{analysis.category}</Badge>
                </div>
              </div>

              <div className="bg-slate-700/50 p-4 rounded-lg">
                <Label className="text-slate-400 text-sm">تقييم جودة المحتوى</Label>
                <div className="mt-2">
                  <Badge className="bg-yellow-600 text-white">{analysis.rating}/5 نجوم</Badge>
                </div>
              </div>

              <div className="bg-slate-700/50 p-4 rounded-lg">
                <Label className="text-slate-400 text-sm">حالة التحليل</Label>
                <div className="flex items-center gap-2 mt-2 text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-semibold">جاهز للنشر</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}