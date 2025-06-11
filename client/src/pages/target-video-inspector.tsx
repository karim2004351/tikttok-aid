import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, ExternalLink, Users, Eye, Heart, MessageCircle, Share, Clock, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function TargetVideoInspector() {
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState('');
  const [targetVideo, setTargetVideo] = useState({ url: '', title: '' });
  const [inspectionResult, setInspectionResult] = useState<any>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [lastInspection, setLastInspection] = useState<string>('');

  // تحميل الفيديو المستهدف
  useEffect(() => {
    const loadTargetVideo = async () => {
      try {
        const response = await fetch('/api/target-video');
        const data = await response.json();
        if (data.success && data.data.url) {
          setTargetVideo(data.data);
          setVideoUrl(data.data.url);
        }
      } catch (error) {
        console.error('خطأ في تحميل الفيديو المستهدف:', error);
      }
    };
    loadTargetVideo();
  }, []);

  // فحص الفيديو المستهدف
  const inspectVideo = async () => {
    if (!videoUrl) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط الفيديو للفحص",
        variant: "destructive"
      });
      return;
    }

    setIsInspecting(true);
    try {
      const response = await fetch('/api/inspect-target-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl })
      });

      const result = await response.json();
      
      if (result.success) {
        setInspectionResult(result.data);
        setLastInspection(new Date().toLocaleString('en-US'));
        
        if (result.data.inspection.isAccessible) {
          toast({
            title: "نجح الفحص",
            description: `تم فحص الفيديو بنجاح باستخدام ${getMethodName(result.data.inspection.method)}`,
          });
        } else {
          toast({
            title: "فشل الفحص",
            description: result.data.inspection.error || "تعذر الوصول للفيديو",
            variant: "destructive"
          });
        }
      } else {
        throw new Error(result.message || 'فشل في فحص الفيديو');
      }
    } catch (error: any) {
      toast({
        title: "خطأ في الفحص",
        description: error?.message || "حدث خطأ أثناء فحص الفيديو",
        variant: "destructive"
      });
    } finally {
      setIsInspecting(false);
    }
  };

  const getMethodName = (method: string) => {
    const methods: { [key: string]: string } = {
      'apify_api': 'Apify API',
      'tiktok_publishing_api': 'TikTok Publishing API',
      'tiktok_client_api': 'TikTok Client API',
      'rapidapi': 'RapidAPI',
      'failed': 'فشل',
      'error': 'خطأ'
    };
    return methods[method] || method;
  };

  const getStatusIcon = (isAccessible: boolean, method: string) => {
    if (method === 'failed' || method === 'error') return <XCircle className="h-5 w-5 text-red-500" />;
    if (isAccessible) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            فحص الفيديو المستهدف وصاحب الصفحة
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            فحص حقيقي للفيديو المستهدف ومعلومات صاحب الحساب باستخدام APIs متعددة
          </p>
        </div>

        {/* قسم فحص الفيديو */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-6 w-6" />
              فحص الفيديو المستهدف
            </CardTitle>
            <CardDescription>
              أدخل رابط الفيديو للحصول على معلومات حقيقية عن الفيديو وصاحب الحساب
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {targetVideo.url && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">الفيديو المستهدف الحالي:</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{targetVideo.title}</p>
                <a 
                  href={targetVideo.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  عرض الفيديو
                </a>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="videoUrl">رابط الفيديو للفحص</Label>
              <div className="flex gap-2">
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://vm.tiktok.com/... أو https://www.tiktok.com/..."
                  dir="ltr"
                  className="flex-1"
                />
                <Button 
                  onClick={inspectVideo}
                  disabled={isInspecting || !videoUrl}
                >
                  {isInspecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "فحص"
                  )}
                </Button>
              </div>
            </div>

            {lastInspection && (
              <p className="text-sm text-gray-500">
                آخر فحص: {lastInspection}
              </p>
            )}
          </CardContent>
        </Card>

        {/* نتائج الفحص */}
        {inspectionResult && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* حالة الفحص */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(inspectionResult.inspection.isAccessible, inspectionResult.inspection.method)}
                  حالة الفحص
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>طريقة الفحص:</span>
                  <Badge variant={inspectionResult.inspection.isAccessible ? "default" : "destructive"}>
                    {getMethodName(inspectionResult.inspection.method)}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>إمكانية الوصول:</span>
                  <Badge variant={inspectionResult.accessibility.isAccessible ? "default" : "destructive"}>
                    {inspectionResult.accessibility.isAccessible ? "متاح" : "غير متاح"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>رمز الحالة:</span>
                  <Badge variant="outline">
                    {inspectionResult.accessibility.statusCode}
                  </Badge>
                </div>

                {inspectionResult.inspection.error && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      <strong>خطأ:</strong> {inspectionResult.inspection.error}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* بيانات الفيديو */}
            {inspectionResult.inspection.videoData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    معلومات الفيديو
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {inspectionResult.inspection.videoData.title && (
                    <div>
                      <Label className="text-sm font-medium">العنوان:</Label>
                      <p className="text-sm mt-1">{inspectionResult.inspection.videoData.title}</p>
                    </div>
                  )}

                  {inspectionResult.inspection.videoData.description && (
                    <div>
                      <Label className="text-sm font-medium">الوصف:</Label>
                      <p className="text-sm mt-1 line-clamp-3">{inspectionResult.inspection.videoData.description}</p>
                    </div>
                  )}

                  {inspectionResult.inspection.videoData.duration && (
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        المدة:
                      </span>
                      <span>{inspectionResult.inspection.videoData.duration}s</span>
                    </div>
                  )}

                  {inspectionResult.inspection.videoData.createTime && (
                    <div className="flex justify-between items-center">
                      <span>تاريخ النشر:</span>
                      <span className="text-sm">
                        {new Date(inspectionResult.inspection.videoData.createTime).toLocaleDateString('en-US')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* إحصائيات التفاعل */}
            {inspectionResult.inspection.interactionStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    إحصائيات التفاعل
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Eye className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">المشاهدات</p>
                      <p className="font-bold text-lg">
                        {formatNumber(inspectionResult.inspection.interactionStats.views)}
                      </p>
                    </div>

                    <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <Heart className="h-6 w-6 mx-auto mb-1 text-red-600" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">الإعجابات</p>
                      <p className="font-bold text-lg">
                        {formatNumber(inspectionResult.inspection.interactionStats.likes)}
                      </p>
                    </div>

                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <MessageCircle className="h-6 w-6 mx-auto mb-1 text-green-600" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">التعليقات</p>
                      <p className="font-bold text-lg">
                        {formatNumber(inspectionResult.inspection.interactionStats.comments)}
                      </p>
                    </div>

                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Share className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">المشاركات</p>
                      <p className="font-bold text-lg">
                        {formatNumber(inspectionResult.inspection.interactionStats.shares)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* معلومات صاحب الحساب */}
            {inspectionResult.inspection.authorData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    معلومات صاحب الحساب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    {inspectionResult.inspection.authorData.avatar && (
                      <img 
                        src={inspectionResult.inspection.authorData.avatar} 
                        alt="صورة الملف الشخصي"
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {inspectionResult.inspection.authorData.displayName || 'غير محدد'}
                        </h3>
                        {inspectionResult.inspection.authorData.verified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        @{inspectionResult.inspection.authorData.username || 'غير محدد'}
                      </p>
                    </div>
                  </div>

                  {inspectionResult.inspection.authorData.bio && (
                    <div>
                      <Label className="text-sm font-medium">النبذة الشخصية:</Label>
                      <p className="text-sm mt-1">{inspectionResult.inspection.authorData.bio}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-3">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-300">المتابعون</p>
                      <p className="font-bold">
                        {formatNumber(inspectionResult.inspection.authorData.followers || 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-300">يتابع</p>
                      <p className="font-bold">
                        {formatNumber(inspectionResult.inspection.authorData.following || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* رسالة عدم توفر البيانات */}
        {inspectionResult && !inspectionResult.inspection.isAccessible && (
          <Card className="mt-8 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
                <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                  تعذر الحصول على البيانات الحقيقية
                </h3>
                <p className="text-sm text-orange-600 dark:text-orange-300 mb-4">
                  {inspectionResult.inspection.error || "جميع طرق الفحص المتاحة فشلت في الوصول للبيانات"}
                </p>
                <p className="text-xs text-orange-500 dark:text-orange-400">
                  تحتاج إلى مفاتيح API صحيحة للحصول على البيانات الحقيقية للفيديو وصاحب الحساب
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}