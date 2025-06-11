import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Send, Play, Pause, RotateCcw, CheckCircle, AlertCircle } from "lucide-react";

interface CommentSession {
  id: string;
  platform: string;
  targetUrl: string;
  comment: string;
  status: "pending" | "running" | "completed" | "paused" | "failed";
  posted: number;
  failed: number;
  total: number;
  startTime: string;
}

export function SocialCommentsPublisher() {
  const [targetUrl, setTargetUrl] = useState("");
  const [comment, setComment] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const platforms = [
    { id: "youtube", name: "YouTube", color: "bg-red-500" },
    { id: "tiktok", name: "TikTok", color: "bg-black" },
    { id: "instagram", name: "Instagram", color: "bg-pink-500" },
    { id: "facebook", name: "Facebook", color: "bg-blue-600" },
    { id: "twitter", name: "Twitter", color: "bg-sky-500" }
  ];

  const { data: sessions, isLoading } = useQuery<CommentSession[]>({
    queryKey: ["/api/comment-sessions"],
    refetchInterval: 3000,
  });

  const startSessionMutation = useMutation({
    mutationFn: async (data: { targetUrl: string; comment: string; platforms: string[] }) => {
      const response = await apiRequest("POST", "/api/comment-sessions", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comment-sessions"] });
      setTargetUrl("");
      setComment("");
      setSelectedPlatforms([]);
      toast({
        title: "تم بدء جلسة التعليق",
        description: "تم بدء نشر التعليقات بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في بدء الجلسة",
        description: error.message || "فشل في بدء جلسة التعليق",
        variant: "destructive",
      });
    },
  });

  const controlSessionMutation = useMutation({
    mutationFn: async ({ sessionId, action }: { sessionId: string; action: "pause" | "resume" | "stop" }) => {
      const response = await apiRequest("POST", `/api/comment-sessions/${sessionId}/${action}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comment-sessions"] });
    },
  });

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleStartSession = () => {
    if (!targetUrl.trim()) {
      toast({
        title: "رابط مطلوب",
        description: "يرجى إدخال رابط المنشور المستهدف",
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "تعليق مطلوب",
        description: "يرجى إدخال التعليق المراد نشره",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "منصة مطلوبة",
        description: "يرجى اختيار منصة واحدة على الأقل",
        variant: "destructive",
      });
      return;
    }

    startSessionMutation.mutate({
      targetUrl: targetUrl.trim(),
      comment: comment.trim(),
      platforms: selectedPlatforms
    });
  };

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
        return "في الانتظار";
    }
  };

  const calculateProgress = (session: CommentSession) => {
    if (session.total === 0) return 0;
    return Math.round((session.posted / session.total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* نموذج إنشاء جلسة جديدة */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <MessageSquare className="w-5 h-5" />
            <span>نشر التعليقات على الشبكات الاجتماعية</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* رابط المنشور المستهدف */}
          <div className="space-y-2">
            <label className="text-sm text-slate-400">رابط المنشور المستهدف</label>
            <Input
              placeholder="أدخل رابط المنشور (YouTube, TikTok, Instagram, إلخ)"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          {/* التعليق */}
          <div className="space-y-2">
            <label className="text-sm text-slate-400">التعليق المراد نشره</label>
            <Textarea
              placeholder="اكتب التعليق هنا..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="bg-slate-700 border-slate-600 text-white resize-none"
            />
            <p className="text-xs text-slate-500">
              {comment.length}/500 حرف
            </p>
          </div>

          {/* اختيار المنصات */}
          <div className="space-y-2">
            <label className="text-sm text-slate-400">المنصات المستهدفة</label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformToggle(platform.id)}
                  className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                    selectedPlatforms.includes(platform.id)
                      ? 'border-purple-500 bg-purple-500/10 text-white'
                      : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                  <span className="text-sm">{platform.name}</span>
                  {selectedPlatforms.includes(platform.id) && (
                    <CheckCircle className="w-4 h-4 text-purple-400 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* زر البدء */}
          <Button
            onClick={handleStartSession}
            disabled={startSessionMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {startSessionMutation.isPending ? "جاري البدء..." : "بدء نشر التعليقات"}
          </Button>
        </CardContent>
      </Card>

      {/* الجلسات النشطة */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">الجلسات النشطة</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">
              جاري تحميل الجلسات...
            </div>
          ) : !sessions || sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              لا توجد جلسات نشطة حالياً
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-white font-medium mb-1">
                        {session.platform} - {session.targetUrl.length > 50 
                          ? `${session.targetUrl.substring(0, 50)}...` 
                          : session.targetUrl}
                      </p>
                      <p className="text-sm text-slate-400 mb-2">
                        "{session.comment.length > 100 
                          ? `${session.comment.substring(0, 100)}...` 
                          : session.comment}"
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(session.status)} border`}>
                      {getStatusText(session.status)}
                    </Badge>
                  </div>

                  {/* شريط التقدم */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">التقدم</span>
                      <span className="text-white">
                        {session.posted} / {session.total}
                      </span>
                    </div>
                    <Progress value={calculateProgress(session)} className="h-2" />
                  </div>

                  {/* إحصائيات */}
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-400">{session.posted}</p>
                      <p className="text-xs text-slate-500">منشور</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-400">{session.failed}</p>
                      <p className="text-xs text-slate-500">فشل</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-400">
                        {session.total - session.posted}
                      </p>
                      <p className="text-xs text-slate-500">متبقي</p>
                    </div>
                  </div>

                  {/* أزرار التحكم */}
                  <div className="flex space-x-2">
                    {session.status === "running" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => controlSessionMutation.mutate({ sessionId: session.id, action: "pause" })}
                        className="border-slate-600 text-slate-300 hover:text-white"
                      >
                        <Pause className="w-4 h-4 mr-1" />
                        إيقاف مؤقت
                      </Button>
                    )}
                    {session.status === "paused" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => controlSessionMutation.mutate({ sessionId: session.id, action: "resume" })}
                        className="border-slate-600 text-slate-300 hover:text-white"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        استئناف
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => controlSessionMutation.mutate({ sessionId: session.id, action: "stop" })}
                      className="border-slate-600 text-slate-300 hover:text-red-400"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      إيقاف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}