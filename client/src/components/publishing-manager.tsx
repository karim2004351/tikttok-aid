import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, Square, RotateCcw, Globe, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PublishingProcess {
  id: number;
  deploymentId: number;
  videoUrl: string;
  totalSites: number;
  completedSites: number;
  successfulSites: number;
  failedSites: number;
  status: string;
  currentSite: string;
  postsPerSite: number;
  totalPosts: number;
  successfulPosts: number;
  progress: number;
  startedAt: string;
  lastUpdated: string;
  details: string;
}

export function PublishingManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: processes = [], isLoading } = useQuery<PublishingProcess[]>({
    queryKey: ['/api/publishing-processes'],
    refetchInterval: 2000, // تحديث كل ثانيتين
  });

  const startRealPublishing = useMutation({
    mutationFn: async ({ videoUrl, postsPerSite }: { videoUrl: string; postsPerSite: number }) => {
      const response = await fetch('/api/start-real-publishing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl, postsPerSite }),
      });
      if (!response.ok) {
        throw new Error('فشل في بدء النشر الحقيقي');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/publishing-processes'] });
      toast({
        title: "تم بدء النشر الحقيقي",
        description: "بدأت عملية النشر على المنصات الاجتماعية والمنتديات",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في بدء النشر الحقيقي",
        variant: "destructive",
      });
    },
  });

  const controlProcess = useMutation({
    mutationFn: async ({ processId, action }: { processId: number; action: string }) => {
      const response = await fetch(`/api/publishing-processes/${processId}/${action}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('فشل في تنفيذ العملية');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/publishing-processes'] });
      const actionNames = {
        pause: 'إيقاف',
        resume: 'استئناف',
        stop: 'توقف',
        restart: 'إعادة تشغيل'
      };
      toast({
        title: "تم بنجاح",
        description: `تم ${actionNames[variables.action as keyof typeof actionNames]} العملية`,
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تنفيذ العملية",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'stopped':
        return <Square className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'stopped':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US');
  };

  const parseDetails = (details: string) => {
    try {
      return JSON.parse(details || '{}');
    } catch {
      return {};
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            إدارة عمليات النشر المحسن
          </CardTitle>
          <CardDescription>
            مراقبة والتحكم في عمليات النشر على 1,171 موقع ومنتدى (50 مرة لكل موقع)
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-slate-900 text-slate-200">
          <form className="space-y-4">
            {/* إدخال رابط الفيديو */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                رابط الفيديو للنشر الحقيقي:
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-200 placeholder-slate-400"
                placeholder="https://vm.tiktok.com/ZMkWf3QJR/"
                defaultValue="https://vm.tiktok.com/ZMkWf3QJR/"
              />
            </div>

            {/* عنوان المنشور */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                عنوان المنشور:
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-200 placeholder-slate-400"
                placeholder="عنوان الفيديو"
                defaultValue="فيديو مشارك من TikTok"
              />
            </div>

            {/* اختيار المواقع للنشر الحقيقي */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                المواقع المستهدفة للنشر الحقيقي:
              </label>
              
              {/* أزرار اختيار المواقع */}
              <div className="flex flex-wrap gap-2 p-3 bg-green-900/30 rounded-lg mb-4">

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  المنصات الرئيسية (4)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  Twitter + Reddit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  Facebook + TikTok
                </Button>
              </div>

              {/* معلومات المواقع المختارة */}
              <div className="text-center p-3 bg-green-50 rounded-lg mb-4">
                <p className="text-sm text-green-700 mb-2">
                  سيتم النشر الحقيقي على جميع المنصات المدعومة
                </p>
                <p className="text-xs text-green-600">
                  Twitter, Reddit, Facebook, TikTok + 1,167 موقع إضافي
                </p>
              </div>
            </div>

            {/* زر النشر الحقيقي */}
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => startRealPublishing.mutate({ 
                  videoUrl: "https://vm.tiktok.com/ZMkWf3QJR/", 
                  postsPerSite: 3 
                })}
                disabled={startRealPublishing.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:bg-slate-600 disabled:transform-none"
              >
                <Send className="w-4 h-4 mr-2" />
                {startRealPublishing.isPending ? "جاري النشر الحقيقي..." : "بدء النشر الحقيقي على جميع المواقع"}
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-slate-700 rounded-lg">
            <h4 className="text-slate-200 font-medium mb-2">معلومات النشر الحقيقي:</h4>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• سيتم النشر الفعلي على جميع المنصات المدعومة</li>
              <li>• استخدام مفاتيح APIs الحقيقية الخاصة بك</li>
              <li>• مراقبة مباشرة للنتائج والإحصائيات</li>
              <li>• نشر حقيقي بنتائج فعلية</li>
            </ul>
          </div>

          {isLoading ? (
            <div className="text-center py-8">جاري تحميل عمليات النشر...</div>
          ) : processes.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد عمليات نشر نشطة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {processes.map((process) => {
                const details = parseDetails(process.details);
                return (
                  <Card key={process.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* رأس العملية */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(process.status)}
                            <div>
                              <h3 className="font-semibold">عملية النشر #{process.id}</h3>
                              <p className="text-sm text-gray-600">النشر #{process.deploymentId}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(process.status)}>
                              {process.status === 'running' ? 'قيد التشغيل' :
                               process.status === 'paused' ? 'متوقف مؤقتاً' :
                               process.status === 'stopped' ? 'متوقف' :
                               process.status === 'completed' ? 'مكتمل' : process.status}
                            </Badge>
                          </div>
                        </div>

                        {/* شريط التقدم */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>التقدم الإجمالي</span>
                            <span>{process.progress}%</span>
                          </div>
                          <Progress value={process.progress} className="h-2" />
                        </div>

                        {/* إحصائيات مفصلة */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {process.completedSites}
                            </div>
                            <div className="text-xs text-blue-600">مواقع مكتملة</div>
                            <div className="text-xs text-gray-500">من أصل {process.totalSites}</div>
                          </div>
                          
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {process.successfulPosts}
                            </div>
                            <div className="text-xs text-green-600">نشريات ناجحة</div>
                            <div className="text-xs text-gray-500">من أصل {process.totalPosts}</div>
                          </div>
                          
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {process.successfulSites}
                            </div>
                            <div className="text-xs text-green-600">مواقع ناجحة</div>
                          </div>
                          
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                              {process.failedSites}
                            </div>
                            <div className="text-xs text-red-600">مواقع فاشلة</div>
                          </div>
                        </div>

                        {/* الموقع الحالي */}
                        {process.currentSite && process.status === 'running' && (
                          <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm">جاري النشر في: <strong>{process.currentSite}</strong></span>
                          </div>
                        )}

                        {/* أزرار التحكم */}
                        <div className="flex space-x-2 pt-2">
                          {process.status === 'running' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => controlProcess.mutate({ processId: process.id, action: 'pause' })}
                                disabled={controlProcess.isPending}
                              >
                                <Pause className="h-4 w-4 mr-1" />
                                إيقاف مؤقت
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => controlProcess.mutate({ processId: process.id, action: 'stop' })}
                                disabled={controlProcess.isPending}
                              >
                                <Square className="h-4 w-4 mr-1" />
                                توقف نهائي
                              </Button>
                            </>
                          )}
                          
                          {process.status === 'paused' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => controlProcess.mutate({ processId: process.id, action: 'resume' })}
                                disabled={controlProcess.isPending}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                استئناف
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => controlProcess.mutate({ processId: process.id, action: 'stop' })}
                                disabled={controlProcess.isPending}
                              >
                                <Square className="h-4 w-4 mr-1" />
                                توقف نهائي
                              </Button>
                            </>
                          )}
                          
                          {(process.status === 'stopped' || process.status === 'completed') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => controlProcess.mutate({ processId: process.id, action: 'restart' })}
                              disabled={controlProcess.isPending}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              إعادة تشغيل
                            </Button>
                          )}
                        </div>

                        {/* معلومات إضافية */}
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>بدأت في: {formatTime(process.startedAt)}</div>
                          <div>آخر تحديث: {formatTime(process.lastUpdated)}</div>
                          <div>رابط الفيديو: {process.videoUrl}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}