import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Wrench, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MaintenanceStatus {
  enabled: boolean;
  message: string;
  since: string;
}

export default function MaintenanceCheck({ children }: { children: React.ReactNode }) {
  const { data: maintenanceStatus, isLoading } = useQuery<MaintenanceStatus>({
    queryKey: ["/api/admin/maintenance-status"],
    refetchInterval: 10000, // فحص كل 10 ثوانٍ
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (maintenanceStatus?.enabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gray-800/50 border-gray-700">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Wrench className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <AlertTriangle className="h-8 w-8 text-orange-400 mx-auto" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              الموقع قيد الصيانة
            </h1>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              {maintenanceStatus.message}
            </p>
            
            <div className="flex items-center justify-center text-sm text-gray-400 mb-6">
              <Clock className="h-4 w-4 ml-2" />
              منذ: {new Date(maintenanceStatus.since).toLocaleString('en-US')}
            </div>
            
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-300 mb-2">
                معلومات الاتصال
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>واتساب: +33673140174</p>
                <p>البريد الإلكتروني: kleberphone@gmail.com</p>
                <p>تيليجرام: متاح</p>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              سنعود قريباً بتحديثات جديدة ومحسنة
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}