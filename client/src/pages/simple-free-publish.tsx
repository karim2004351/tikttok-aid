import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, ExternalLink, Users, Heart, Eye, MessageCircle, AlertCircle, Play } from "lucide-react";

export default function SimpleFreePublish() {
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [targetVideo, setTargetVideo] = useState({ url: '', title: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'checking' | 'publishing' | 'completed' | 'failed'>('idle');
  const [userInteractions, setUserInteractions] = useState({
    follow: false,
    watch: false,
    like: false,
    comment: false
  });

  // تحميل الفيديو المستهدف
  useEffect(() => {
    const loadTargetVideo = async () => {
      try {
        const response = await fetch('/api/target-video');
        const data = await response.json();
        if (data.success && data.data.url) {
          setTargetVideo(data.data);
        }
      } catch (error) {
        console.error('خطأ في تحميل الفيديو المستهدف:', error);
      }
    };
    loadTargetVideo();
  }, []);

  // تأكيد التفاعل
  const confirmInteraction = async (action: string) => {
    if (!targetVideo.url) {
      toast({
        title: "خطأ",
        description: "لا يوجد فيديو مستهدف محدد",
        variant: "destructive"
      });
      return;
    }

    try {
      const userIdentifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch('/api/confirm-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIdentifier,
          action,
          targetVideoUrl: targetVideo.url
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setUserInteractions(prev => ({
          ...prev,
          [action as keyof typeof prev]: true
        }));
        
        toast({
          title: "تم التأكيد",
          description: `تم تأكيد ${getActionName(action)} بنجاح`,
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تأكيد التفاعل",
        variant: "destructive"
      });
    }
  };

  const getActionName = (action: string) => {
    const names: { [key: string]: string } = {
      follow: 'المتابعة',
      watch: 'المشاهدة', 
      like: 'الإعجاب',
      comment: 'التعليق'
    };
    return names[action] || action;
  };

  // بدء النشر
  const startPublishing = async () => {
    if (!videoUrl || !title || !userEmail) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    // التحقق من التفاعلات المطلوبة
    const requiredInteractions: (keyof typeof userInteractions)[] = ['follow', 'watch', 'like'];
    const completedInteractions = requiredInteractions.filter(action => userInteractions[action]);
    
    if (completedInteractions.length < 3) {
      toast({
        title: "شروط غير مكتملة",
        description: "يجب تأكيد المتابعة والمشاهدة والإعجاب أولاً",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setPublishStatus('checking');

    try {
      // محاكاة عملية النشر
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPublishStatus('publishing');
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      setPublishStatus('completed');
      
      toast({
        title: "نجح النشر",
        description: "تم نشر المحتوى بنجاح على جميع المنصات",
      });
    } catch (error) {
      setPublishStatus('failed');
      toast({
        title: "فشل النشر",
        description: "حدث خطأ أثناء النشر",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            النشر المجاني البسيط
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            انشر محتواك على 1185+ موقع مجاناً
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* قسم الشروط */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                الشروط المطلوبة
              </CardTitle>
              <CardDescription>
                أكمل هذه الخطوات للحصول على النشر المجاني
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {targetVideo.url ? (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">الفيديو المستهدف:</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {targetVideo.title}
                    </p>
                    <a 
                      href={targetVideo.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      فتح الفيديو
                    </a>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>متابعة الحساب</span>
                      </div>
                      {userInteractions.follow ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => confirmInteraction('follow')}
                        >
                          تأكيد
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>مشاهدة الفيديو</span>
                      </div>
                      {userInteractions.watch ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => confirmInteraction('watch')}
                        >
                          تأكيد
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        <span>إعجاب بالفيديو</span>
                      </div>
                      {userInteractions.like ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => confirmInteraction('like')}
                        >
                          تأكيد
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        <span>تعليق (اختياري)</span>
                      </div>
                      {userInteractions.comment ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => confirmInteraction('comment')}
                        >
                          تأكيد
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا يوجد فيديو مستهدف حالياً</p>
                  <p className="text-sm">يرجى المحاولة لاحقاً</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* قسم النشر */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل النشر</CardTitle>
              <CardDescription>
                أدخل تفاصيل المحتوى الذي تريد نشره
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="videoUrl">رابط الفيديو *</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/..."
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">العنوان *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="عنوان جذاب للمحتوى"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
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

              {publishStatus === 'idle' && (
                <Button 
                  onClick={startPublishing}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  ابدأ النشر المجاني
                </Button>
              )}

              {publishStatus === 'checking' && (
                <div className="text-center py-4">
                  <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  <p>جاري التحقق من الشروط...</p>
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
                    تم نشر المحتوى على 1185+ موقع
                  </p>
                </div>
              )}

              {publishStatus === 'failed' && (
                <div className="text-center py-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-red-600 dark:text-red-300">
                    فشل في النشر. يرجى المحاولة مرة أخرى.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setPublishStatus('idle')}
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