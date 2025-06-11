import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Video, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Eye,
  Shield,
  Zap,
  FileVideo,
  Camera
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoAnalysis {
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
  watermarkDetection: {
    hasWatermark: boolean;
    confidence: number;
    detectionMethod: string;
  };
  contentCompliance: {
    tiktokCompliant: boolean;
    violations: string[];
    recommendations: string[];
  };
  processingDetails: {
    analysisTime: number;
    extractionMethod: string;
    errors: string[];
    rawData: any;
  };
}

export default function VideoUploadAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysis | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // فحص نوع الملف
      if (!file.type.startsWith('video/')) {
        toast({
          title: "خطأ في نوع الملف",
          description: "يرجى اختيار ملف فيديو صحيح",
          variant: "destructive",
        });
        return;
      }

      // فحص حجم الملف (حد أقصى 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "حجم الملف كبير جداً",
          description: "يرجى اختيار فيديو أصغر من 100MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setAnalysisResult(null);
    }
  };

  const handleAnalyzeVideo = async () => {
    if (!selectedFile) {
      toast({
        title: "لا يوجد فيديو محدد",
        description: "يرجى اختيار فيديو أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);

      // محاكاة تقدم الرفع
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/analyze-uploaded-video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      clearInterval(uploadInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result.analysis);
        
        toast({
          title: "تم تحليل الفيديو بنجاح",
          description: "تم فحص العلامة المائية وقوانين المحتوى",
        });
      } else {
        const error = await response.json();
        toast({
          title: "خطأ في التحليل",
          description: error.message || "فشل في تحليل الفيديو",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الشبكة",
        description: "حدث خطأ أثناء رفع الفيديو",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            تحليل الفيديو بالذكاء الاصطناعي
          </h1>
          <p className="text-gray-300 text-lg">
            ارفع فيديوك وتحقق من العلامة المائية وقوانين TikTok
          </p>
        </div>

        {/* Upload Section */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              رفع الفيديو
            </CardTitle>
            <CardDescription className="text-gray-400">
              اختر فيديو من جهازك للتحليل (حد أقصى 100MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {selectedFile ? (
                <div className="space-y-2">
                  <FileVideo className="h-12 w-12 text-green-400 mx-auto" />
                  <p className="text-white font-medium">{selectedFile.name}</p>
                  <p className="text-gray-400">{formatFileSize(selectedFile.size)}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="text-white">انقر لاختيار فيديو</p>
                  <p className="text-gray-400">أو اسحب الملف هنا</p>
                </div>
              )}
            </div>

            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>جاري الرفع والتحليل...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <Button 
              onClick={handleAnalyzeVideo}
              disabled={!selectedFile || isAnalyzing}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {isAnalyzing ? "جاري التحليل..." : "تحليل الفيديو"}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-6">
            {/* Watermark Detection */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
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

            {/* Content Compliance */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  فحص قوانين TikTok
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {analysisResult.contentCompliance.tiktokCompliant ? (
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    ) : (
                      <X className="h-6 w-6 text-red-400" />
                    )}
                    <div>
                      <div className="text-white font-medium">
                        {analysisResult.contentCompliance.tiktokCompliant ? "متوافق مع قوانين TikTok" : "غير متوافق مع قوانين TikTok"}
                      </div>
                    </div>
                  </div>
                  <Badge variant={analysisResult.contentCompliance.tiktokCompliant ? "default" : "destructive"}>
                    {analysisResult.contentCompliance.tiktokCompliant ? "آمن للنشر" : "يحتاج مراجعة"}
                  </Badge>
                </div>

                {analysisResult.contentCompliance.violations.length > 0 && (
                  <div>
                    <h4 className="text-red-400 font-medium mb-2">مخالفات محتملة:</h4>
                    <ul className="space-y-1">
                      {analysisResult.contentCompliance.violations.map((violation, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-center">
                          <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                          {violation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResult.contentCompliance.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-blue-400 font-medium mb-2">توصيات للتحسين:</h4>
                    <ul className="space-y-1">
                      {analysisResult.contentCompliance.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-center">
                          <Zap className="h-4 w-4 text-blue-400 mr-2" />
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Technical Specs */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Video className="h-5 w-5 mr-2" />
                  المواصفات التقنية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">المدة</div>
                    <div className="text-lg font-bold text-white">
                      {formatDuration(analysisResult.technicalSpecs.duration)}
                    </div>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">الدقة</div>
                    <div className="text-lg font-bold text-white">
                      {analysisResult.technicalSpecs.resolution}
                    </div>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">التنسيق</div>
                    <div className="text-lg font-bold text-white">
                      {analysisResult.technicalSpecs.format}
                    </div>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">الحجم</div>
                    <div className="text-lg font-bold text-white">
                      {formatFileSize(analysisResult.technicalSpecs.size)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Analysis */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  تحليل المحتوى
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
                  <div className="text-sm text-gray-400 mb-1">الوصف المقترح</div>
                  <div className="text-white bg-gray-700/50 p-3 rounded-lg">
                    {analysisResult.contentAnalysis.description}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">الهاشتاغات المقترحة</div>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.contentAnalysis.suggestedHashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">الفئة</div>
                    <div className="text-white bg-gray-700/50 p-2 rounded-lg text-center">
                      {analysisResult.contentAnalysis.category}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">المزاج</div>
                    <div className="text-white bg-gray-700/50 p-2 rounded-lg text-center">
                      {analysisResult.contentAnalysis.mood}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}