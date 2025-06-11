import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Server, Cpu, Database, Activity, RefreshCw } from "lucide-react";

interface ServerStatus {
  status: "online" | "offline" | "maintenance";
  uptime: number;
  cpu: number;
  memory: number;
  database: "connected" | "disconnected";
  activeConnections: number;
  lastCheck: string;
}

export function ServerStatusMonitor() {
  const { data: status, isLoading, refetch } = useQuery<ServerStatus>({
    queryKey: ["/api/server-status"],
    refetchInterval: 5000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "offline":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "maintenance":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "متصل";
      case "offline":
        return "غير متصل";
      case "maintenance":
        return "صيانة";
      default:
        return "غير معروف";
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}د ${hours}س ${minutes}ق`;
    } else if (hours > 0) {
      return `${hours}س ${minutes}ق`;
    } else {
      return `${minutes}ق`;
    }
  };

  const getPerformanceColor = (value: number) => {
    if (value < 50) return "text-green-400";
    if (value < 80) return "text-yellow-400";
    return "text-red-400";
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
            <span className="mr-2 text-slate-400">جاري فحص حالة الخادم...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2 text-white">
          <Server className="w-5 h-5" />
          <span>حالة الخادم</span>
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
          <div className="text-center py-4 text-slate-500">
            لا يمكن الحصول على حالة الخادم
          </div>
        ) : (
          <>
            {/* حالة الخادم العامة */}
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="text-white font-medium">حالة الخادم</p>
                  <p className="text-sm text-slate-400">
                    آخر فحص: {new Date(status.lastCheck).toLocaleTimeString('ar-SA')}
                  </p>
                </div>
              </div>
              <Badge className={`${getStatusColor(status.status)} border`}>
                {getStatusText(status.status)}
              </Badge>
            </div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-400">المعالج</span>
                </div>
                <p className={`text-2xl font-bold ${getPerformanceColor(status.cpu)}`}>
                  {status.cpu}%
                </p>
              </div>

              <div className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-400">الذاكرة</span>
                </div>
                <p className={`text-2xl font-bold ${getPerformanceColor(status.memory)}`}>
                  {status.memory}%
                </p>
              </div>

              <div className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-slate-400">قاعدة البيانات</span>
                </div>
                <p className={`text-sm font-medium ${
                  status.database === 'connected' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {status.database === 'connected' ? 'متصلة' : 'غير متصلة'}
                </p>
              </div>

              <div className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Server className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-slate-400">الاتصالات النشطة</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {status.activeConnections}
                </p>
              </div>
            </div>

            {/* وقت التشغيل */}
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">وقت التشغيل</span>
                <span className="text-white font-medium">
                  {formatUptime(status.uptime)}
                </span>
              </div>
            </div>

            {/* مؤشر الأداء العام */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">الأداء العام</span>
                <span className="text-white">
                  {Math.round((100 - (status.cpu + status.memory) / 2))}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    (100 - (status.cpu + status.memory) / 2) > 70
                      ? 'bg-green-500'
                      : (100 - (status.cpu + status.memory) / 2) > 50
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.round((100 - (status.cpu + status.memory) / 2))}%`
                  }}
                ></div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}