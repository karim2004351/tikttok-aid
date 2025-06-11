import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileVideo,
  CheckCircle,
  AlertTriangle,
  Clock,
  Monitor,
  Cog,
  BarChart3,
  Shield,
  Camera,
  Hash,
  Copy,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnhancedVideoAnalysis {
  technicalSpecs: {
    duration: number;
    resolution: string;
    format: string;
    size: number;
    bitrate: number;
    frameRate: number;
    hasAudio: boolean;
    videoCodec: string;
    audioCodec: string;
    metadata: {
      title?: string;
      artist?: string;
      date?: string;
      comment?: string;
    };
  };
  aiContentAnalysis: {
    title: {
      original: string;
      aiGenerated: string;
      confidence: number;
      language: 'ar' | 'en' | 'mixed';
    };
    description: {
      original: string;
      aiGenerated: string;
      summary: string;
      keyPoints: string[];
      confidence: number;
    };
    contentType: {
      category: string;
      subcategory: string;
      audience: string;
      tone: string;
      confidence: number;
    };
    speechAnalysis: {
      hasSpokenContent: boolean;
      language: string[];
      transcript: string;
      keyTopics: string[];
      sentiment: string;
      speakerCount: number;
    };
    visualAnalysis: {
      sceneDescription: string;
      objectsDetected: string[];
      colorPalette: string[];
      visualStyle: string;
    };
  };
  watermarkDetection: {
    hasWatermark: boolean;
    confidence: number;
    detectionMethod: string;
  };
  musicAnalysis: {
    isProtected: boolean;
    confidence: number;
    trackInfo?: {
      title: string;
      artist: string;
      album?: string;
      label?: string;
      releaseDate?: string;
      duration?: number;
      genres?: string[];
    };
    copyrightInfo?: {
      hasContentID: boolean;
      copyrightOwner?: string;
      usage: 'commercial' | 'non-commercial' | 'unknown';
      requiresLicense: boolean;
    };
    analysisDetails: {
      method: string;
      audioSampleDuration: number;
      recognitionScore: number;
      errors: string[];
    };
  };
  contentCompliance: {
    tiktokCompliant: boolean;
    violations: string[];
    recommendations: string[];
    eligibilityChecklist: {
      durationCheck: { passed: boolean; details: string };
      originalityCheck: { passed: boolean; details: string };
      musicRightsCheck: { passed: boolean; details: string };
      duetStitchCheck: { passed: boolean; details: string };
      advertisingCheck: { passed: boolean; details: string };
      communityGuidelinesCheck: { passed: boolean; details: string };
      accountEligibilityCheck: { passed: boolean; details: string };
      overallScore: number;
    };
  };
  processingDetails: {
    analysisTime: number;
    extractionMethod: string;
    errors: string[];
    rawData: any;
  };
}

interface HashtagSuggestion {
  hashtag: string;
  popularity: number;
  trend: 'rising' | 'stable' | 'declining';
  category: string;
  estimatedReach: number;
  competitiveness: 'low' | 'medium' | 'high';
}

interface HashtagAnalysis {
  hashtags: HashtagSuggestion[];
  confidence: number;
  contentType: string;
}

export default function EnhancedVideoAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<EnhancedVideoAnalysis | null>(null);
  const [hashtagAnalysis, setHashtagAnalysis] = useState<HashtagAnalysis | null>(null);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [copiedHashtag, setCopiedHashtag] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast({
          title: "خطأ في نوع الملف",
          description: "يرجى اختيار ملف فيديو صحيح",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 500 * 1024 * 1024) {
        toast({
          title: "حجم الملف كبير جداً",
          description: "يرجى اختيار فيديو أصغر من 500MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);

      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({
          title: "خطأ في المصادقة",
          description: "يرجى تسجيل الدخول أولاً",
          variant: "destructive",
        });
        return;
      }

      // محاكاة تقدم الرفع
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + Math.random() * 15;
          return next > 90 ? 90 : next;
        });
      }, 200);

      const response = await fetch('/api/analyze-uploaded-video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('فشل في تحليل الفيديو');
      }

      const data = await response.json();
      
      if (data.success) {
        setAnalysisResult(data.analysis);
        
        // توليد الهاشتاغات تلقائياً بعد التحليل
        generateHashtagsFromAnalysis(data.analysis);
        
        toast({
          title: "تم التحليل بنجاح",
          description: "تم تحليل الفيديو وفحص جميع المواصفات",
        });
      } else {
        throw new Error(data.message || 'فشل في التحليل');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "فشل في التحليل",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const generateHashtagsFromAnalysis = async (analysis: EnhancedVideoAnalysis) => {
    if (!analysis) return;

    setIsGeneratingHashtags(true);
    
    try {
      // استخراج وصف المحتوى من تحليل الفيديو
      const videoContent = analysis.technicalSpecs.metadata.title || 
                          analysis.technicalSpecs.metadata.comment || 
                          `فيديو ${analysis.technicalSpecs.format} مدته ${Math.round(analysis.technicalSpecs.duration)}s`;

      // تحديد نوع المحتوى بناءً على التحليل
      let contentType = 'entertainment';
      if (analysis.musicAnalysis.isProtected) contentType = 'music';
      if (analysis.technicalSpecs.duration > 300) contentType = 'educational';

      const response = await fetch('/api/hashtags/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoContent,
          contentType,
          targetAudience: 'عام',
          country: 'SA'
        })
      });

      const result = await response.json();

      if (result.success) {
        setHashtagAnalysis({
          hashtags: result.data.suggestedHashtags || [],
          confidence: result.data.confidence || 75,
          contentType: result.data.contentType || contentType
        });

        toast({
          title: "تم توليد الهاشتاغات",
          description: `تم اقتراح ${result.data.suggestedHashtags?.length || 0} هاشتاغ مناسب للمحتوى`,
        });
      }
    } catch (error) {
      console.error('Hashtag generation error:', error);
      toast({
        title: "تعذر توليد الهاشتاغات",
        description: "يمكنك توليدها يدوياً من صفحة مولد الهاشتاغات",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingHashtags(false);
    }
  };

  const copyHashtag = async (hashtag: string) => {
    try {
      await navigator.clipboard.writeText(hashtag);
      setCopiedHashtag(hashtag);
      setTimeout(() => setCopiedHashtag(null), 2000);
      toast({
        title: "تم النسخ",
        description: `تم نسخ ${hashtag}`,
      });
    } catch (error) {
      toast({
        title: "فشل النسخ",
        description: "تعذر نسخ الهاشتاغ",
        variant: "destructive",
      });
    }
  };

  const copyAllHashtags = async () => {
    if (!hashtagAnalysis?.hashtags) return;
    
    const hashtagText = hashtagAnalysis.hashtags.map(h => h.hashtag).join(' ');
    try {
      await navigator.clipboard.writeText(hashtagText);
      toast({
        title: "تم النسخ",
        description: `تم نسخ ${hashtagAnalysis.hashtags.length} هاشتاغ`,
      });
    } catch (error) {
      toast({
        title: "فشل النسخ",
        description: "تعذر نسخ الهاشتاغات",
        variant: "destructive",
      });
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-3 w-3 text-green-400" />;
      case 'stable': return <div className="h-3 w-3 bg-yellow-400 rounded-full" />;
      case 'declining': return <div className="h-3 w-3 bg-red-400 rounded-full" />;
      default: return null;
    }
  };

  const getCompetitivenessColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'high': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const formatReach = (reach: number) => {
    if (reach >= 1000000) return `${(reach / 1000000).toFixed(1)}M`;
    if (reach >= 1000) return `${(reach / 1000).toFixed(1)}K`;
    return reach.toString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            محلل الفيديو المحسن
          </h1>
          <p className="text-xl text-gray-300">
            تحليل دقيق للفيديو مع استخراج المواصفات التقنية الحقيقية
          </p>
        </div>

        {/* Upload Section */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              رفع الفيديو
            </CardTitle>
            <CardDescription className="text-gray-400">
              ارفع فيديو لتحليل مواصفاته التقنية وفحص التوافق مع منصات النشر
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileVideo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white mb-2">اضغط لاختيار فيديو أو اسحب وأفلت هنا</p>
                <p className="text-gray-400 text-sm">أنواع مدعومة: MP4, AVI, MOV, MKV (حد أقصى 100MB)</p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {selectedFile && (
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{selectedFile.name}</p>
                      <p className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <Button 
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isAnalyzing ? "جاري التحليل..." : "تحليل الفيديو"}
                    </Button>
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">تقدم التحليل</span>
                    <span className="text-white">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Technical Specifications */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Cog className="h-5 w-5 mr-2" />
                  المواصفات التقنية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">المدة الزمنية</div>
                    <div className="text-white bg-gray-700/50 p-2 rounded-lg flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-blue-400" />
                      {formatDuration(analysisResult.technicalSpecs.duration)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">الدقة</div>
                    <div className="text-white bg-gray-700/50 p-2 rounded-lg flex items-center">
                      <Monitor className="h-4 w-4 mr-2 text-green-400" />
                      {analysisResult.technicalSpecs.resolution}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">الصيغة</div>
                    <div className="text-white bg-gray-700/50 p-2 rounded-lg">
                      {analysisResult.technicalSpecs.format}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">حجم الملف</div>
                    <div className="text-white bg-gray-700/50 p-2 rounded-lg">
                      {formatFileSize(analysisResult.technicalSpecs.size)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">معدل البت</div>
                    <div className="text-white bg-gray-700/50 p-2 rounded-lg">
                      {Math.round(analysisResult.technicalSpecs.bitrate / 1000)} kbps
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">الصوت</div>
                    <div className="text-white bg-gray-700/50 p-2 rounded-lg">
                      {analysisResult.technicalSpecs.hasAudio ? "موجود" : "غير موجود"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Watermark Detection */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  فحص العلامة المائية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {analysisResult.watermarkDetection.hasWatermark ? (
                      <AlertTriangle className="h-6 w-6 text-red-400" />
                    ) : (
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    )}
                    <div>
                      <div className="text-white font-medium">
                        {analysisResult.watermarkDetection.hasWatermark ? "تم اكتشاف علامة مائية" : "لا توجد علامة مائية"}
                      </div>
                      <div className="text-gray-400 text-sm">
                        دقة الفحص: {analysisResult.watermarkDetection.confidence}%
                      </div>
                      <div className="text-gray-400 text-xs">
                        الطريقة: {analysisResult.watermarkDetection.detectionMethod}
                      </div>
                    </div>
                  </div>
                  <Badge variant={analysisResult.watermarkDetection.hasWatermark ? "destructive" : "default"}>
                    {analysisResult.watermarkDetection.hasWatermark ? "غير مقبول" : "مقبول"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* AI Content Analysis */}
            {analysisResult.aiContentAnalysis && (
              <Card className="bg-gray-800/50 border-gray-700 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    تحليل المحتوى بالذكاء الاصطناعي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title Analysis */}
                  <div className="bg-gray-700/30 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-3 flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      العنوان المولد بالذكاء الاصطناعي
                    </h4>
                    <div className="space-y-2">
                      <div className="text-lg text-blue-300 font-medium">
                        {analysisResult.aiContentAnalysis.title.aiGenerated}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline" className="text-white">
                          اللغة: {analysisResult.aiContentAnalysis.title.language === 'ar' ? 'عربي' : 
                                   analysisResult.aiContentAnalysis.title.language === 'en' ? 'إنجليزي' : 'مختلط'}
                        </Badge>
                        <Badge variant="outline" className="text-white">
                          دقة: {Math.round(analysisResult.aiContentAnalysis.title.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Description Analysis */}
                  <div className="bg-gray-700/30 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-3">الوصف التلقائي</h4>
                    <div className="space-y-3">
                      <div className="text-gray-300">
                        {analysisResult.aiContentAnalysis.description.aiGenerated}
                      </div>
                      <div className="text-sm text-gray-400">
                        <strong>ملخص:</strong> {analysisResult.aiContentAnalysis.description.summary}
                      </div>
                      {analysisResult.aiContentAnalysis.description.keyPoints.length > 0 && (
                        <div>
                          <div className="text-sm text-gray-400 mb-2">النقاط الرئيسية:</div>
                          <div className="flex flex-wrap gap-2">
                            {analysisResult.aiContentAnalysis.description.keyPoints.map((point, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {point}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Classification */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-3">تصنيف المحتوى</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">الفئة:</span>
                          <Badge className="bg-purple-600">{analysisResult.aiContentAnalysis.contentType.category}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">الفئة الفرعية:</span>
                          <span className="text-white">{analysisResult.aiContentAnalysis.contentType.subcategory}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">الجمهور:</span>
                          <span className="text-white">{analysisResult.aiContentAnalysis.contentType.audience}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">النبرة:</span>
                          <span className="text-white">{analysisResult.aiContentAnalysis.contentType.tone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-3">التحليل المرئي</h4>
                      <div className="space-y-2">
                        <div className="text-gray-300 text-sm">
                          {analysisResult.aiContentAnalysis.visualAnalysis.sceneDescription}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">النمط:</span>
                          <span className="text-white">{analysisResult.aiContentAnalysis.visualAnalysis.visualStyle}</span>
                        </div>
                        {analysisResult.aiContentAnalysis.visualAnalysis.objectsDetected.length > 0 && (
                          <div>
                            <div className="text-gray-400 text-xs mb-1">الكائنات المكتشفة:</div>
                            <div className="flex flex-wrap gap-1">
                              {analysisResult.aiContentAnalysis.visualAnalysis.objectsDetected.slice(0, 4).map((obj, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {obj}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Speech Analysis */}
                  {analysisResult.aiContentAnalysis.speechAnalysis.hasSpokenContent && (
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-3">تحليل الكلام</h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">اللغة:</span>
                            <span className="text-white">{analysisResult.aiContentAnalysis.speechAnalysis.language.join(', ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">المشاعر:</span>
                            <Badge variant={
                              analysisResult.aiContentAnalysis.speechAnalysis.sentiment === 'positive' ? 'default' :
                              analysisResult.aiContentAnalysis.speechAnalysis.sentiment === 'negative' ? 'destructive' : 'secondary'
                            }>
                              {analysisResult.aiContentAnalysis.speechAnalysis.sentiment === 'positive' ? 'إيجابي' :
                               analysisResult.aiContentAnalysis.speechAnalysis.sentiment === 'negative' ? 'سلبي' : 'محايد'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">المتحدثون:</span>
                            <span className="text-white">{analysisResult.aiContentAnalysis.speechAnalysis.speakerCount}</span>
                          </div>
                        </div>
                        
                        {analysisResult.aiContentAnalysis.speechAnalysis.keyTopics.length > 0 && (
                          <div>
                            <div className="text-gray-400 text-sm mb-2">المواضيع الرئيسية:</div>
                            <div className="flex flex-wrap gap-2">
                              {analysisResult.aiContentAnalysis.speechAnalysis.keyTopics.map((topic, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {analysisResult.aiContentAnalysis.speechAnalysis.transcript && (
                          <div>
                            <div className="text-gray-400 text-sm mb-2">النص المستخرج:</div>
                            <div className="text-gray-300 text-sm bg-gray-800/50 p-3 rounded max-h-32 overflow-y-auto">
                              {analysisResult.aiContentAnalysis.speechAnalysis.transcript}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Content Compliance */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  توافق المحتوى
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white">توافق TikTok</span>
                  <Badge variant={analysisResult.contentCompliance.tiktokCompliant ? "default" : "destructive"}>
                    {analysisResult.contentCompliance.tiktokCompliant ? "متوافق" : "غير متوافق"}
                  </Badge>
                </div>

                {analysisResult.contentCompliance.violations.length > 0 && (
                  <div>
                    <div className="text-sm text-red-400 mb-2">المخالفات:</div>
                    <div className="space-y-1">
                      {analysisResult.contentCompliance.violations.map((violation, index) => (
                        <div key={index} className="text-red-300 text-sm bg-red-900/20 p-2 rounded">
                          • {violation}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysisResult.contentCompliance.recommendations.length > 0 && (
                  <div>
                    <div className="text-sm text-blue-400 mb-2">التوصيات:</div>
                    <div className="space-y-1">
                      {analysisResult.contentCompliance.recommendations.map((rec, index) => (
                        <div key={index} className="text-blue-300 text-sm bg-blue-900/20 p-2 rounded">
                          • {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Eligibility Checklist */}
            <Card className="bg-gray-800/50 border-gray-700 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    قائمة تحقق الأهلية للربح
                  </div>
                  <Badge variant={analysisResult.contentCompliance.eligibilityChecklist.overallScore >= 70 ? "default" : "destructive"}>
                    {analysisResult.contentCompliance.eligibilityChecklist.overallScore}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {analysisResult.contentCompliance.eligibilityChecklist.durationCheck.passed ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      )}
                      <div>
                        <div className="text-white font-medium text-sm">مدة الفيديو أطول من دقيقة</div>
                        <div className="text-gray-400 text-xs">{analysisResult.contentCompliance.eligibilityChecklist.durationCheck.details}</div>
                      </div>
                    </div>
                    <Badge variant={analysisResult.contentCompliance.eligibilityChecklist.durationCheck.passed ? "default" : "destructive"}>
                      {analysisResult.contentCompliance.eligibilityChecklist.durationCheck.passed ? "✓" : "✗"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {analysisResult.contentCompliance.eligibilityChecklist.originalityCheck.passed ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      )}
                      <div>
                        <div className="text-white font-medium text-sm">الفيديو أصلي 100%</div>
                        <div className="text-gray-400 text-xs">{analysisResult.contentCompliance.eligibilityChecklist.originalityCheck.details}</div>
                      </div>
                    </div>
                    <Badge variant={analysisResult.contentCompliance.eligibilityChecklist.originalityCheck.passed ? "default" : "secondary"}>
                      {analysisResult.contentCompliance.eligibilityChecklist.originalityCheck.passed ? "✓" : "؟"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {analysisResult.contentCompliance.eligibilityChecklist.musicRightsCheck.passed ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      )}
                      <div>
                        <div className="text-white font-medium text-sm">حقوق الموسيقى</div>
                        <div className="text-gray-400 text-xs">{analysisResult.contentCompliance.eligibilityChecklist.musicRightsCheck.details}</div>
                      </div>
                    </div>
                    <Badge variant={analysisResult.contentCompliance.eligibilityChecklist.musicRightsCheck.passed ? "default" : "secondary"}>
                      {analysisResult.contentCompliance.eligibilityChecklist.musicRightsCheck.passed ? "✓" : "؟"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {analysisResult.contentCompliance.eligibilityChecklist.duetStitchCheck.passed ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      )}
                      <div>
                        <div className="text-white font-medium text-sm">ليس duet أو stitch</div>
                        <div className="text-gray-400 text-xs">{analysisResult.contentCompliance.eligibilityChecklist.duetStitchCheck.details}</div>
                      </div>
                    </div>
                    <Badge variant={analysisResult.contentCompliance.eligibilityChecklist.duetStitchCheck.passed ? "default" : "secondary"}>
                      {analysisResult.contentCompliance.eligibilityChecklist.duetStitchCheck.passed ? "✓" : "؟"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Details */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  تفاصيل المعالجة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">العنوان المستخرج</div>
                  <div className="text-white bg-gray-700/50 p-3 rounded-lg">
                    {analysisResult.technicalSpecs.metadata.title || 'لا يوجد عنوان'}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">طريقة الاستخراج</div>
                  <div className="text-white bg-gray-700/50 p-3 rounded-lg">
                    {analysisResult.processingDetails.extractionMethod}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">وقت التحليل</div>
                  <div className="text-white bg-gray-700/50 p-3 rounded-lg">
                    {analysisResult.processingDetails.analysisTime} مللي ثانية
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">كودك الفيديو</div>
                    <div className="text-white bg-gray-700/50 p-2 rounded-lg">
                      {analysisResult.technicalSpecs.videoCodec}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">معدل الإطارات</div>
                    <div className="text-white bg-gray-700/50 p-2 rounded-lg">
                      {analysisResult.technicalSpecs.frameRate} fps
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Generated Hashtags */}
            {hashtagAnalysis && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <Hash className="h-5 w-5 mr-2" />
                      الهاشتاغات المقترحة بالذكاء الاصطناعي
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${hashtagAnalysis.confidence >= 80 ? 'bg-green-600' : hashtagAnalysis.confidence >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}>
                        دقة {Math.round(hashtagAnalysis.confidence)}%
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={copyAllHashtags}
                        className="text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        نسخ الكل
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {hashtagAnalysis.hashtags.slice(0, 9).map((hashtag, index) => (
                      <div key={index} className="bg-gray-700/40 rounded-lg p-3 hover:bg-gray-600/40 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-purple-400 font-semibold text-sm">
                            {hashtag.hashtag}
                          </span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => copyHashtag(hashtag.hashtag)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedHashtag === hashtag.hashtag ? (
                              <CheckCircle className="h-3 w-3 text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          {getTrendIcon(hashtag.trend)}
                          <span className="text-xs text-gray-400">{hashtag.trend}</span>
                          <Badge className={`text-xs px-1 py-0 ${getCompetitivenessColor(hashtag.competitiveness)}`}>
                            {hashtag.competitiveness}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-gray-400 space-y-1">
                          <div>شعبية: {Math.round(hashtag.popularity)}%</div>
                          <div>وصول: {formatReach(hashtag.estimatedReach)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {hashtagAnalysis.hashtags.length > 9 && (
                    <div className="mt-4 text-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = '/hashtag-generator'}
                        className="text-purple-400 border-purple-500 hover:bg-purple-500 hover:text-white"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        عرض جميع الهاشتاغات ({hashtagAnalysis.hashtags.length})
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Hashtag Generation Loading */}
            {isGeneratingHashtags && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="py-8">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <div className="text-white font-medium mb-2">جاري توليد الهاشتاغات...</div>
                    <div className="text-gray-400 text-sm">تحليل المحتوى وإنشاء هاشتاغات مخصصة بالذكاء الاصطناعي</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}