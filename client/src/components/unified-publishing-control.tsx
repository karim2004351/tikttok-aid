import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Square, RotateCcw, Upload, CheckCircle2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analysisStore } from '@/lib/analysis-store';

type OperationType = 'publish' | 'verify' | 'followers';
type OperationStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed';

interface OperationState {
  type: OperationType;
  status: OperationStatus;
  progress: number;
  videoUrl: string;
  deploymentId?: number;
}

export function UnifiedPublishingControl() {
  const [operation, setOperation] = useState<OperationState>({
    type: 'publish',
    status: 'idle',
    progress: 0,
    videoUrl: ''
  });

  const [analysisData, setAnalysisData] = useState<any>(null);
  const { toast } = useToast();

  // مراقبة تغييرات بيانات التحليل
  useEffect(() => {
    const unsubscribe = analysisStore.subscribe(() => {
      setAnalysisData(analysisStore.getAnalysis());
    });

    // تحديث البيانات الحالية
    setAnalysisData(analysisStore.getAnalysis());

    return () => {
      unsubscribe();
    };
  }, []);

  const operationLabels = {
    publish: 'نشر الفيديو على جميع المنصات',
    verify: 'التحقق من النشر الحقيقي',
    followers: 'طلب متابعين البث المباشر'
  };

  const statusLabels = {
    idle: 'جاهز',
    running: 'جاري التنفيذ',
    paused: 'متوقف مؤقتاً',
    completed: 'مكتمل',
    failed: 'فشل'
  };

  const statusColors = {
    idle: 'bg-gray-500',
    running: 'bg-blue-500 animate-pulse',
    paused: 'bg-yellow-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500'
  };

  const handleStart = async () => {
    // التحقق من وجود رابط الفيديو - استخدام البيانات المحللة أو الرابط المدخل
    const videoUrl = analysisData?.videoUrl || operation.videoUrl;
    
    if (!videoUrl.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط الفيديو أو تحليل فيديو أولاً",
        variant: "destructive"
      });
      return;
    }

    try {
      setOperation(prev => ({ ...prev, status: 'running', progress: 0 }));

      let endpoint = '';
      let payload: any = {};

      // إعداد البيانات للنشر - استخدام البيانات المحللة أو الافتراضية
      const publishingData = analysisData ? {
        title: analysisData.title,
        description: analysisData.description,
        hashtags: analysisData.hashtags
      } : {
        title: 'فيديو جديد',
        description: 'وصف الفيديو',
        hashtags: []
      };

      switch (operation.type) {
        case 'publish':
          endpoint = '/api/deployments';
          payload = {
            repositoryUrl: videoUrl,
            branch: 'main',
            environment: 'production',
            // إضافة البيانات المحللة
            analysisData: publishingData
          };
          break;
        case 'verify':
          endpoint = '/api/verify-publishing';
          payload = {
            videoUrl: videoUrl,
            deploymentId: operation.deploymentId || 1
          };
          break;
        case 'followers':
          endpoint = '/api/followers-request';
          payload = {
            liveStreamUrl: videoUrl,
            userIdentifier: 'user_' + Date.now()
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success !== false) {
        toast({
          title: "تم بدء العملية",
          description: `تم بدء ${operationLabels[operation.type]} بنجاح`,
        });

        // محاكاة التقدم
        const progressInterval = setInterval(() => {
          setOperation(prev => {
            const newProgress = Math.min(prev.progress + Math.random() * 10, 100);
            if (newProgress >= 100) {
              clearInterval(progressInterval);
              // مسح الرابط تلقائياً بعد اكتمال العملية
              setTimeout(() => {
                setOperation(current => ({ 
                  ...current, 
                  videoUrl: '',
                  status: 'idle',
                  progress: 0
                }));
                toast({
                  title: "تم مسح البيانات",
                  description: "تم مسح رابط الفيديو تلقائياً بعد اكتمال العملية",
                });
              }, 3000);
              
              return { ...prev, status: 'completed', progress: 100 };
            }
            return { ...prev, progress: newProgress };
          });
        }, 1000);

        if (data.id) {
          setOperation(prev => ({ ...prev, deploymentId: data.id }));
        }
      } else {
        throw new Error(data.message || 'فشل في بدء العملية');
      }
    } catch (error: any) {
      setOperation(prev => ({ ...prev, status: 'failed' }));
      toast({
        title: "خطأ في بدء العملية",
        description: error.message || 'حدث خطأ أثناء بدء العملية',
        variant: "destructive"
      });
    }
  };

  const handleStop = async () => {
    try {
      if (operation.deploymentId) {
        await fetch('/api/deployment-control', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deploymentId: operation.deploymentId,
            action: 'stop'
          }),
        });
      }

      setOperation(prev => ({ ...prev, status: 'idle', progress: 0 }));
      toast({
        title: "تم إيقاف العملية",
        description: "تم إيقاف العملية بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في الإيقاف",
        description: "حدث خطأ أثناء إيقاف العملية",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    setOperation({
      type: 'publish',
      status: 'idle',
      progress: 0,
      videoUrl: ''
    });
    toast({
      title: "تم إعادة التعيين",
      description: "تم مسح جميع البيانات",
    });
  };

  const canStart = operation.status === 'idle' || operation.status === 'failed' || operation.status === 'completed';
  const canStop = operation.status === 'running' || operation.status === 'paused';

  return (
    <Card className="w-full bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="h-6 w-6 text-blue-400" />
          التحكم الموحد في العمليات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* عرض البيانات المحللة */}
        {analysisData && (
          <Alert className="border-green-600 bg-green-600/10">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-400">
              <div className="space-y-2">
                <div className="font-semibold">بيانات الفيديو المحللة جاهزة للنشر:</div>
                <div className="text-sm space-y-1">
                  <div>العنوان: {analysisData.title}</div>
                  <div>الهاشتاجات: {analysisData.hashtags?.join(', ')}</div>
                  <div>الرابط: {analysisData.videoUrl}</div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* تحذير عدم وجود بيانات محللة */}
        {!analysisData && operation.type === 'publish' && (
          <Alert className="border-yellow-600 bg-yellow-600/10">
            <Info className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-400">
              لم يتم تحليل الفيديو بعد. سيتم استخدام بيانات افتراضية للنشر أو يمكنك تحليل الفيديو أولاً للحصول على نتائج أفضل.
            </AlertDescription>
          </Alert>
        )}

        {/* نوع العملية */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400">نوع العملية</label>
          <Select
            value={operation.type}
            onValueChange={(value: OperationType) => 
              setOperation(prev => ({ ...prev, type: value }))
            }
            disabled={!canStart}
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="publish">نشر الفيديو على جميع المنصات</SelectItem>
              <SelectItem value="verify">التحقق من النشر الحقيقي</SelectItem>
              <SelectItem value="followers">طلب متابعين البث المباشر</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* رابط الفيديو */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400">رابط الفيديو</label>
          <Input
            placeholder="أدخل رابط الفيديو أو البث المباشر"
            value={operation.videoUrl}
            onChange={(e) => 
              setOperation(prev => ({ ...prev, videoUrl: e.target.value }))
            }
            disabled={!canStart}
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          />
        </div>

        {/* حالة العملية */}
        <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
          <div className="space-y-1">
            <div className="text-sm text-slate-400">حالة العملية</div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${statusColors[operation.status]}`}></div>
              <span className="text-white font-medium">{statusLabels[operation.status]}</span>
            </div>
          </div>
          <Badge variant="outline" className="text-slate-300">
            {operationLabels[operation.type]}
          </Badge>
        </div>

        {/* شريط التقدم */}
        {operation.status === 'running' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">التقدم</span>
              <span className="text-white">{Math.round(operation.progress)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${operation.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* أزرار التحكم */}
        <div className="flex gap-3">
          <Button
            onClick={handleStart}
            disabled={!canStart || !operation.videoUrl.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="h-4 w-4 mr-2" />
            بدء العملية
          </Button>

          {canStop && (
            <Button
              onClick={handleStop}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Square className="h-4 w-4 mr-2" />
              إيقاف
            </Button>
          )}

          <Button
            onClick={handleReset}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            إعادة تعيين
          </Button>
        </div>

        {/* معلومات إضافية */}
        {operation.deploymentId && (
          <div className="text-sm text-slate-400 bg-slate-700/30 p-3 rounded">
            معرف العملية: #{operation.deploymentId}
          </div>
        )}
      </CardContent>
    </Card>
  );
}