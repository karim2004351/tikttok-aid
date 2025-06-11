import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  FastForward, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeploymentControlsProps {
  deploymentId: number;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

export function DeploymentControls({ deploymentId, currentStatus, onStatusChange }: DeploymentControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(currentStatus);
  const { toast } = useToast();

  const handleControlAction = async (action: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/deployment-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deploymentId,
          action
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setLocalStatus(result.newStatus);
        onStatusChange?.(result.newStatus);
        
        toast({
          title: "تم تنفيذ العملية",
          description: result.message,
        });
      } else {
        toast({
          title: "فشل في تنفيذ العملية",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر تنفيذ العملية المطلوبة",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'running':
        return { 
          color: 'blue', 
          icon: Activity, 
          label: 'قيد التشغيل',
          description: 'عملية النشر جارية حالياً'
        };
      case 'paused':
        return { 
          color: 'yellow', 
          icon: Pause, 
          label: 'متوقف مؤقتاً',
          description: 'تم إيقاف العملية مؤقتاً'
        };
      case 'completed':
        return { 
          color: 'green', 
          icon: CheckCircle, 
          label: 'مكتمل',
          description: 'تم إكمال النشر بنجاح'
        };
      case 'failed':
        return { 
          color: 'red', 
          icon: AlertTriangle, 
          label: 'فشل',
          description: 'فشل في عملية النشر'
        };
      case 'pending':
        return { 
          color: 'gray', 
          icon: Clock, 
          label: 'في الانتظار',
          description: 'في انتظار بدء العملية'
        };
      default:
        return { 
          color: 'gray', 
          icon: Clock, 
          label: status,
          description: 'حالة غير معروفة'
        };
    }
  };

  const statusInfo = getStatusInfo(localStatus);
  const StatusIcon = statusInfo.icon;

  const canPause = localStatus === 'running';
  const canResume = localStatus === 'paused';
  const canStop = ['running', 'paused'].includes(localStatus);
  const canRestart = ['failed', 'completed', 'paused'].includes(localStatus);
  const canForceComplete = ['running', 'paused'].includes(localStatus);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 text-${statusInfo.color}-500`} />
          تحكم في النشر #{deploymentId}
        </CardTitle>
        <CardDescription>{statusInfo.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* حالة النشر الحالية */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-6 w-6 text-${statusInfo.color}-500`} />
            <div>
              <div className="font-medium">{statusInfo.label}</div>
              <div className="text-sm text-gray-600">{statusInfo.description}</div>
            </div>
          </div>
          <Badge variant={statusInfo.color === 'green' ? 'default' : 'secondary'}>
            {statusInfo.label}
          </Badge>
        </div>

        <Separator />

        {/* أزرار التحكم */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* إيقاف مؤقت */}
          <Button
            onClick={() => handleControlAction('pause')}
            disabled={!canPause || isLoading}
            variant="outline"
            className="flex flex-col gap-1 h-auto py-3"
          >
            <Pause className="h-4 w-4" />
            <span className="text-xs">إيقاف مؤقت</span>
          </Button>

          {/* استكمال */}
          <Button
            onClick={() => handleControlAction('resume')}
            disabled={!canResume || isLoading}
            variant="outline"
            className="flex flex-col gap-1 h-auto py-3"
          >
            <Play className="h-4 w-4" />
            <span className="text-xs">استكمال</span>
          </Button>

          {/* إيقاف نهائي */}
          <Button
            onClick={() => handleControlAction('stop')}
            disabled={!canStop || isLoading}
            variant="destructive"
            className="flex flex-col gap-1 h-auto py-3"
          >
            <Square className="h-4 w-4" />
            <span className="text-xs">إيقاف نهائي</span>
          </Button>

          {/* إعادة تشغيل */}
          <Button
            onClick={() => handleControlAction('restart')}
            disabled={!canRestart || isLoading}
            variant="default"
            className="flex flex-col gap-1 h-auto py-3"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="text-xs">إعادة تشغيل</span>
          </Button>
        </div>

        {/* إكمال إجباري */}
        {canForceComplete && (
          <>
            <Separator />
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                يمكنك إجبار النظام على اعتبار العملية مكتملة إذا كانت معطلة
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={() => handleControlAction('force-complete')}
              disabled={isLoading}
              variant="secondary"
              className="w-full"
            >
              <FastForward className="mr-2 h-4 w-4" />
              إكمال إجباري
            </Button>
          </>
        )}

        {/* شريط التقدم للعمليات الجارية */}
        {localStatus === 'running' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>تقدم العملية</span>
              <span>جاري التنفيذ...</span>
            </div>
            <Progress value={undefined} className="h-2" />
          </div>
        )}

        {/* تحذيرات */}
        {localStatus === 'failed' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              فشلت عملية النشر. يمكنك إعادة المحاولة أو مراجعة السجلات لمعرفة السبب.
            </AlertDescription>
          </Alert>
        )}

        {localStatus === 'paused' && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              تم إيقاف العملية مؤقتاً. يمكنك استكمالها أو إيقافها نهائياً.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}