import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Activity,
  MessageCircle,
  TrendingUp,
  CheckCircle,
  XCircle,
  RefreshCw,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LiveCommentStats {
  platform: string;
  commentsPosted: number;
  failed: number;
  videosFound: number;
  duration: number;
  errors: string[];
}

export function LiveCommentsMonitor() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: liveStats, refetch } = useQuery({
    queryKey: ['/api/comments-live-stats'],
    refetchInterval: autoRefresh ? 2000 : false,
    refetchIntervalInBackground: true
  });

  const { data: sessionsData } = useQuery({
    queryKey: ['/api/comments-sessions'],
    refetchInterval: autoRefresh ? 3000 : false
  });

  const stats: LiveCommentStats[] = (liveStats as any)?.liveResults || [];
  const totalComments = (liveStats as any)?.totalCommentsPosted || 0;
  const isActive = (liveStats as any)?.isActive || false;

  const calculateSuccessRate = (posted: number, failed: number) => {
    const total = posted + failed;
    return total > 0 ? Math.round((posted / total) * 100) : 0;
  };

  const getTotalStats = () => {
    const totalPosted = stats.reduce((sum, stat) => sum + stat.commentsPosted, 0);
    const totalFailed = stats.reduce((sum, stat) => sum + stat.failed, 0);
    const totalVideos = stats.reduce((sum, stat) => sum + stat.videosFound, 0);
    
    return {
      totalPosted,
      totalFailed,
      totalVideos,
      successRate: calculateSuccessRate(totalPosted, totalFailed)
    };
  };

  const totalStats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* إحصائيات عامة */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-5 w-5 ml-2" />
              مراقب التعليقات المباشر
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="border-slate-500 text-slate-300 hover:bg-slate-600"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "bg-green-600 hover:bg-green-700" : "border-slate-500 text-slate-300 hover:bg-slate-600"}
              >
                {autoRefresh ? "مفعل" : "متوقف"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{totalStats.totalPosted}</div>
              <div className="text-sm text-slate-400">تعليقات منشورة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{totalStats.totalVideos}</div>
              <div className="text-sm text-slate-400">فيديوهات مستهدفة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{totalStats.successRate}%</div>
              <div className="text-sm text-slate-400">معدل النجاح</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{totalStats.totalFailed}</div>
              <div className="text-sm text-slate-400">فشل</div>
            </div>
          </div>
          
          {totalStats.successRate > 0 && (
            <div className="mt-4">
              <Progress 
                value={totalStats.successRate} 
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* إحصائيات المنصات */}
      {stats.length > 0 && (
        <div className="grid gap-4">
          <h3 className="text-white font-semibold flex items-center">
            <BarChart3 className="h-5 w-5 ml-2" />
            إحصائيات المنصات
          </h3>
          
          <AnimatePresence>
            {stats.map((stat, index) => {
              const successRate = calculateSuccessRate(stat.commentsPosted, stat.failed);
              
              return (
                <motion.div
                  key={stat.platform}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800/70 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-white font-medium">{stat.platform}</h4>
                          <Badge 
                            variant={stat.commentsPosted > 0 ? "default" : "destructive"}
                            className={stat.commentsPosted > 0 ? "bg-green-600" : "bg-red-600"}
                          >
                            {stat.commentsPosted > 0 ? "نشط" : "متوقف"}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-400">
                          {stat.duration}ث
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="text-center">
                          <div className="flex items-center justify-center text-green-400">
                            <CheckCircle className="h-4 w-4 ml-1" />
                            {stat.commentsPosted}
                          </div>
                          <div className="text-xs text-slate-500">نجح</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-red-400">
                            <XCircle className="h-4 w-4 ml-1" />
                            {stat.failed}
                          </div>
                          <div className="text-xs text-slate-500">فشل</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-blue-400">
                            <TrendingUp className="h-4 w-4 ml-1" />
                            {stat.videosFound}
                          </div>
                          <div className="text-xs text-slate-500">فيديوهات</div>
                        </div>
                      </div>
                      
                      <Progress 
                        value={successRate} 
                        className="h-2 mb-2"
                      />
                      <div className="text-xs text-slate-400 text-center">
                        معدل النجاح: {successRate}%
                      </div>
                      
                      {stat.errors.length > 0 && (
                        <div className="mt-3 p-2 bg-red-900/20 rounded border border-red-800">
                          <div className="text-red-400 text-xs font-medium mb-1">أخطاء حديثة:</div>
                          {stat.errors.slice(0, 2).map((error, errorIndex) => (
                            <div key={errorIndex} className="text-red-300 text-xs">
                              • {error}
                            </div>
                          ))}
                          {stat.errors.length > 2 && (
                            <div className="text-red-400 text-xs">
                              +{stat.errors.length - 2} أخطاء أخرى
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* رسالة عدم وجود نشاط */}
      {!isActive && stats.length === 0 && (
        <Card className="bg-slate-800/50 border-slate-600 border-dashed">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-slate-400 font-medium mb-2">لا توجد جلسات تعليقات نشطة</h3>
            <p className="text-slate-500 text-sm">
              ابدأ جلسة تعليقات تلقائية لرؤية الإحصائيات المباشرة هنا
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}