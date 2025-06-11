import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface AccessGateProps {
  children: React.ReactNode;
}

export function AccessGate({ children }: AccessGateProps) {
  const [accessStatus, setAccessStatus] = useState(null);
  const [adminSettings, setAdminSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // تحميل إعدادات الإدارة
        const settingsResponse = await fetch('/api/admin/settings');
        const settingsResult = await settingsResponse.json();
        
        // تحميل حالة وصول المستخدم
        const accessResponse = await fetch('/api/user/access-status');
        const accessResult = await accessResponse.json();
        
        if (settingsResult.success && accessResult.success) {
          setAdminSettings(settingsResult.settings);
          setAccessStatus(accessResult.status);
        }
      } catch (error) {
        console.error('Error checking access:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-xl">جاري التحقق من صلاحيات الوصول...</p>
        </div>
      </div>
    );
  }

  // إذا كان التفاعل مع تيك توك غير مطلوب، اعرض المحتوى مباشرة
  if (!adminSettings?.accessRequirements?.requireTikTokInteraction) {
    return <>{children}</>;
  }

  // إذا أكمل المستخدم التفاعل المطلوب، اعرض المحتوى
  if (accessStatus?.canAccessServices) {
    return <>{children}</>;
  }

  // عرض صفحة طلب التفاعل مع تيك توك
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Lock className="h-24 w-24 text-purple-400 mx-auto mb-8" />
          
          <h1 className="text-5xl font-bold mb-6">مرحباً بك في منصة النشر الذكي</h1>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            للوصول لخدمات النشر على أكثر من 1100 موقع ومنتدى، نحتاج منك أولاً التفاعل مع صفحة تيك توك الخاصة بنا
          </p>

          <Card className="bg-gray-800/50 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white text-2xl">المتطلبات للوصول للخدمات</CardTitle>
              <CardDescription className="text-gray-300">
                يرجى إكمال التفاعلات التالية للحصول على الوصول الكامل
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {adminSettings?.requiredActions && Object.entries(adminSettings.requiredActions).map(([action, required]) => {
                  if (!required) return null;
                  
                  const isCompleted = accessStatus?.completedActions?.includes(action);
                  
                  return (
                    <div key={action} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <span className="text-white">
                        {action === 'follow' && 'متابعة الصفحة'}
                        {action === 'watch' && 'مشاهدة الفيديو'}
                        {action === 'repost' && 'إعادة النشر'}
                        {action === 'comment' && 'التعليق'}
                        {action === 'share' && 'المشاركة مع الأصدقاء'}
                      </span>
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-400" />
                      )}
                    </div>
                  );
                })}
              </div>

              <Alert className="mb-6 bg-purple-900/30 border-purple-700">
                <AlertDescription className="text-center text-purple-200">
                  بعد إكمال جميع التفاعلات المطلوبة، ستحصل على وصول فوري لجميع خدمات النشر
                </AlertDescription>
              </Alert>

              <div className="text-center space-y-4">
                <Link href="/tiktok">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-12 py-6 text-xl">
                    بدء التفاعل مع تيك توك
                    <ArrowRight className="mr-2 h-6 w-6" />
                  </Button>
                </Link>
                
                <div className="text-gray-400">
                  <p>الصفحة المستهدفة: {adminSettings?.tiktokUrl}</p>
                  {adminSettings?.targetVideo && (
                    <p>الفيديو المستهدف: {adminSettings.targetVideo}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">سهولة الاستخدام</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  عملية بسيطة تستغرق دقائق قليلة فقط
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">نشر فوري</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  وصول فوري للنشر على 1100+ موقع ومنتدى
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">دعم مجاني</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  مساعدة فورية عبر واتساب والإيمايل
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}