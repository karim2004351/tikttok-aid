import { useQuery } from "@tanstack/react-query";
import { Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Deployment {
  id: number;
  repositoryUrl: string;
  branch: string;
  environment: string;
  status: "pending" | "running" | "success" | "failed";
  createdAt: string;
  updatedAt: string;
  duration?: number;
}

export function DeploymentStatus() {
  const { data: deployments, isLoading, refetch } = useQuery<Deployment[]>({
    queryKey: ["/api/deployments"],
    refetchInterval: 5000,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "running":
        return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "failed":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "running":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "-";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
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
        <CardTitle className="text-xl text-white">حالة النشر</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="border-slate-600 text-slate-300 hover:text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          تحديث
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {!deployments || deployments.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">لا توجد عمليات نشر حالياً</p>
          </div>
        ) : (
          deployments.map((deployment) => (
            <div
              key={deployment.id}
              className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(deployment.status)}
                <div>
                  <p className="text-white font-medium">
                    {deployment.repositoryUrl.length > 50
                      ? `${deployment.repositoryUrl.substring(0, 50)}...`
                      : deployment.repositoryUrl}
                  </p>
                  <p className="text-sm text-slate-400">
                    {deployment.branch} • {deployment.environment}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm text-slate-400">
                    {formatDuration(deployment.duration)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(deployment.createdAt).toLocaleString('ar-SA')}
                  </p>
                </div>
                <Badge className={`${getStatusColor(deployment.status)} border`}>
                  {deployment.status === "pending" && "في الانتظار"}
                  {deployment.status === "running" && "جاري التنفيذ"}
                  {deployment.status === "success" && "مكتمل"}
                  {deployment.status === "failed" && "فشل"}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}