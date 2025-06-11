import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Activity, Globe, CheckCircle, AlertCircle, Clock, RefreshCw } from "lucide-react";

interface PublishingStatus {
  id: string;
  videoUrl: string;
  totalSites: number;
  completedSites: number;
  failedSites: number;
  activeSites: number;
  status: "running" | "completed" | "paused" | "failed";
  startTime: string;
  estimatedCompletion: string;
  currentSite: string;
  successRate: number;
}

export function RealTimePublishingStatus() {
  const { data: status, isLoading, refetch } = useQuery<PublishingStatus>({
    queryKey: ["/api/publishing-status"],
    refetchInterval: 2000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "completed":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "paused":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "failed":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "running":
        return "جاري النشر";
      case "completed":
        return "مكتمل";
      case "paused":
        return "متوقف";
      case "failed":
        return "فشل";
      default:
        return "غير معروف";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Activity className="w-4 h-4 animate-pulse" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "paused":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const calculateProgress = () => {
    if (!status) return 0;
    return Math.round((status.completedSites / status.totalSites) * 100);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
            <span className="mr-2 text-slate-400">جاري تحميل حالة النشر...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2 text-white">
          <Globe className="w-5 h-5" />
          <span>حالة النشر المباشر</span>
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="border-slate-600 text-slate-300 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {!status ? (
          <div className="text-center py-8">
            <Globe className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">لا توجد عملية نشر نشطة حالياً</p>
          </div>
        ) : (
          <>
            {/* معلومات العملية */}
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(status.status)}
                <div>
                  <p className="text-white font-medium">عملية النشر الحالية</p>
                  <p className="text-sm text-slate-400">
                    بدأت: {formatTime(status.startTime)}
                  </p>
                </div>
              </div>
              <Badge className={`${getStatusColor(status.status)} border`}>
                {getStatusText(status.status)}
              </Badge>
            </div>

            {/* شريط التقدم */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">التقدم العام</span>
                <span className="text-white">
                  {status.completedSites} / {status.totalSites} مواقع
                </span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
              <div className="flex justify-between text-xs text-slate-500">
                <span>{calculateProgress()}% مكتمل</span>
                <span>متبقي: {status.totalSites - status.completedSites}</span>
              </div>
            </div>

            {/* الإحصائيات التفصيلية */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">مكتمل</span>
                </div>
                <p className="text-2xl font-bold text-green-400">
                  {status.completedSites}
                </p>
              </div>

              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">فشل</span>
                </div>
                <p className="text-2xl font-bold text-red-400">
                  {status.failedSites}
                </p>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-400">نشط</span>
                </div>
                <p className="text-2xl font-bold text-blue-400">
                  {status.activeSites}
                </p>
              </div>

              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-400">معدل النجاح</span>
                </div>
                <p className="text-2xl font-bold text-purple-400">
                  {status.successRate}%
                </p>
              </div>
            </div>

            {/* الموقع الحالي */}
            {status.status === "running" && (
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
                  <span className="text-sm text-slate-400">يتم النشر حالياً في:</span>
                </div>
                <p className="text-white font-medium">
                  {status.currentSite}
                </p>
              </div>
            )}

            {/* الوقت المتوقع للانتهاء */}
            {status.status === "running" && (
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">الانتهاء المتوقع</span>
                  <span className="text-white font-medium">
                    {formatTime(status.estimatedCompletion)}
                  </span>
                </div>
              </div>
            )}

            {/* رابط الفيديو */}
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">الفيديو المنشور</span>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => window.open(status.videoUrl, '_blank')}
                  className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                >
                  عرض الفيديو
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}