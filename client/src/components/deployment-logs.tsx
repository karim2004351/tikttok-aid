import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, Download, Trash2, Terminal } from "lucide-react";

interface LogEntry {
  id: number;
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  message: string;
  source: string;
}

export function DeploymentLogs() {
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: logs, isLoading, refetch } = useQuery<LogEntry[]>({
    queryKey: ["/api/logs"],
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      case "success":
        return "text-green-400";
      default:
        return "text-slate-300";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ar-SA', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const clearLogs = async () => {
    try {
      await fetch('/api/logs', { method: 'DELETE' });
      refetch();
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  const downloadLogs = () => {
    if (!logs) return;
    
    const logText = logs.map(log => 
      `[${formatTimestamp(log.timestamp)}] ${log.level.toUpperCase()}: ${log.message} (${log.source})`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deployment-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-slate-800 border-slate-700 h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-slate-400" />
          <CardTitle className="text-lg text-white">سجلات النشر</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`border-slate-600 text-xs ${
              autoScroll ? 'text-green-400 border-green-500/30' : 'text-slate-400'
            }`}
          >
            تمرير تلقائي
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadLogs}
            className="border-slate-600 text-slate-300 hover:text-white"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearLogs}
            className="border-slate-600 text-slate-300 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-slate-600 text-slate-300 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-96">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="p-4 space-y-1 font-mono text-sm">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-5 h-5 animate-spin text-slate-400 ml-2" />
                <span className="text-slate-400">جاري تحميل السجلات...</span>
              </div>
            ) : !logs || logs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                لا توجد سجلات متاحة
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start space-x-3 p-2 hover:bg-slate-700/30 rounded"
                >
                  <span className="text-xs text-slate-500 font-normal w-16 flex-shrink-0">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className={`text-xs font-medium w-16 flex-shrink-0 ${getLevelColor(log.level)}`}>
                    [{log.level.toUpperCase()}]
                  </span>
                  <span className="text-xs text-slate-400 w-20 flex-shrink-0">
                    {log.source}
                  </span>
                  <span className="text-xs text-slate-300 flex-1 break-words">
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}