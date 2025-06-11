import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Play, 
  Pause, 
  Square, 
  Clock,
  TrendingUp,
  Activity,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ActiveSession {
  id: string;
  startTime: string;
  platforms: string[];
  status: 'running' | 'paused' | 'stopped';
  currentPlatform: string;
  currentVideo: number;
  totalVideos: number;
  commentsPosted: number;
  commentsTarget: number;
  progress: number;
}

export function ActiveSessionsMonitor() {
  const queryClient = useQueryClient();

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['/api/comments-sessions'],
    refetchInterval: 10000, // تحديث كل 10 ثواني بدلاً من ثانيتين
    staleTime: 5000, // اعتبار البيانات حديثة لمدة 5 ثواني
  });

  const stopSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest("POST", `/api/comments-sessions/${sessionId}/stop`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments-sessions'] });
    }
  });

  const pauseSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest("POST", `/api/comments-sessions/${sessionId}/pause`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments-sessions'] });
    }
  });

  const resumeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest("POST", `/api/comments-sessions/${sessionId}/resume`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments-sessions'] });
    }
  });

  const stopAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/comments-sessions/stop-all");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments-sessions'] });
    }
  });

  const sessions: ActiveSession[] = (sessionsData as any)?.sessions || [];
  const activeSessions = sessions.filter(s => s.status !== 'stopped');

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `${diffMins} دقيقة`;
    return `${Math.floor(diffMins / 60)} ساعة`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500/20 text-green-400';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400';
      case 'stopped': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'نشط';
      case 'paused': return 'متوقف مؤقتاً';
      case 'stopped': return 'متوقف';
      default: return 'غير معروف';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/70 border-slate-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="mr-3 text-slate-300">جاري تحميل الجلسات النشطة...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800/70 border-slate-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <Activity className="h-5 w-5 ml-2" />
              الجلسات النشطة للتعليقات التلقائية
            </CardTitle>
            {activeSessions.length > 0 && (
              <Button
                onClick={() => stopAllMutation.mutate()}
                disabled={stopAllMutation.isPending}
                variant="destructive"
                size="sm"
              >
                إيقاف جميع الجلسات
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {activeSessions.length === 0 ? (
            <Alert className="bg-slate-700/30 border-slate-600">
              <TrendingUp className="h-4 w-4 text-slate-400" />
              <AlertDescription className="text-slate-300">
                لا توجد جلسات تعليقات نشطة حالياً. ابدأ جلسة جديدة من علامة تبويب "الإعداد".
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {activeSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <Badge className={getStatusColor(session.status)}>
                          {getStatusText(session.status)}
                        </Badge>
                        <span className="text-sm text-slate-400 flex items-center">
                          <Clock className="h-4 w-4 ml-1" />
                          بدأت منذ {formatTime(session.startTime)}
                        </span>
                      </div>
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        {session.status === 'running' && (
                          <Button
                            onClick={() => pauseSessionMutation.mutate(session.id)}
                            disabled={pauseSessionMutation.isPending}
                            variant="outline"
                            size="sm"
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {session.status === 'paused' && (
                          <Button
                            onClick={() => resumeSessionMutation.mutate(session.id)}
                            disabled={resumeSessionMutation.isPending}
                            variant="outline"
                            size="sm"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => stopSessionMutation.mutate(session.id)}
                          disabled={stopSessionMutation.isPending}
                          variant="destructive"
                          size="sm"
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">المنصة الحالية:</span>
                          <span className="text-white mr-2">{session.currentPlatform}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">التقدم:</span>
                          <span className="text-white mr-2">{session.currentVideo}/{session.totalVideos} فيديو</span>
                        </div>
                        <div>
                          <span className="text-slate-400">التعليقات المنشورة:</span>
                          <span className="text-green-400 mr-2">{session.commentsPosted}/{session.commentsTarget}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">المنصات:</span>
                          <span className="text-white mr-2">{session.platforms.join(', ')}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">التقدم الإجمالي</span>
                          <span className="text-white">{session.progress}%</span>
                        </div>
                        <Progress value={session.progress} className="h-2" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}