import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { VideoIcon, PlusCircle, Trash2, ExternalLink, PlayCircle } from "lucide-react";

interface TargetVideo {
  id: number;
  url: string;
  platform: string;
  title: string;
  views: number;
  likes: number;
  status: "active" | "completed" | "paused";
  createdAt: string;
}

export function TargetVideoManager() {
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: videos, isLoading } = useQuery<TargetVideo[]>({
    queryKey: ["/api/target-videos"],
    refetchInterval: 5000,
  });

  const addVideoMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/target-videos", { url });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/target-videos"] });
      setNewVideoUrl("");
      toast({
        title: "تم إضافة الفيديو",
        description: "تم إضافة الفيديو المستهدف بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الإضافة",
        description: error.message || "فشل في إضافة الفيديو",
        variant: "destructive",
      });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/target-videos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/target-videos"] });
      toast({
        title: "تم حذف الفيديو",
        description: "تم حذف الفيديو المستهدف بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحذف",
        description: error.message || "فشل في حذف الفيديو",
        variant: "destructive",
      });
    },
  });

  const handleAddVideo = () => {
    if (!newVideoUrl.trim()) {
      toast({
        title: "رابط مطلوب",
        description: "يرجى إدخال رابط الفيديو",
        variant: "destructive",
      });
      return;
    }
    addVideoMutation.mutate(newVideoUrl.trim());
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "paused":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "نشط";
      case "completed":
        return "مكتمل";
      case "paused":
        return "متوقف";
      default:
        return "غير معروف";
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <VideoIcon className="w-5 h-5" />
          <span>إدارة الفيديوهات المستهدفة</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* إضافة فيديو جديد */}
        <div className="flex space-x-2">
          <Input
            placeholder="أدخل رابط الفيديو (TikTok, YouTube, Instagram)"
            value={newVideoUrl}
            onChange={(e) => setNewVideoUrl(e.target.value)}
            className="flex-1 bg-slate-700 border-slate-600 text-white"
            onKeyPress={(e) => e.key === 'Enter' && handleAddVideo()}
          />
          <Button
            onClick={handleAddVideo}
            disabled={addVideoMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            إضافة
          </Button>
        </div>

        {/* قائمة الفيديوهات */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">
              جاري تحميل الفيديوهات...
            </div>
          ) : !videos || videos.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              لا توجد فيديوهات مستهدفة حالياً
            </div>
          ) : (
            videos.map((video) => (
              <div
                key={video.id}
                className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <PlayCircle className="w-8 h-8 text-purple-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {video.title || "عنوان غير متوفر"}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-slate-400 mt-1">
                      <span className="bg-slate-600 px-2 py-1 rounded text-xs">
                        {video.platform}
                      </span>
                      <span>{formatNumber(video.views)} مشاهدة</span>
                      <span>{formatNumber(video.likes)} إعجاب</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge className={`${getStatusColor(video.status)} border`}>
                    {getStatusText(video.status)}
                  </Badge>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(video.url, '_blank')}
                    className="border-slate-600 text-slate-300 hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteVideoMutation.mutate(video.id)}
                    disabled={deleteVideoMutation.isPending}
                    className="border-slate-600 text-slate-300 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* إحصائيات */}
        {videos && videos.length > 0 && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{videos.length}</p>
              <p className="text-sm text-slate-400">إجمالي الفيديوهات</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {videos.filter(v => v.status === 'active').length}
              </p>
              <p className="text-sm text-slate-400">نشط</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">
                {videos.filter(v => v.status === 'completed').length}
              </p>
              <p className="text-sm text-slate-400">مكتمل</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}