import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Crown, 
  Calendar, 
  Activity, 
  BarChart3, 
  Shield,
  LogOut,
  Eye,
  TrendingUp,
  UserCheck
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  email: string;
  username: string;
  displayName: string;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string;
  lastLogin: string;
  loginCount: number;
}

interface UserStats {
  totalUsers: number;
  premiumUsers: number;
  activeToday: number;
  newThisWeek: number;
}

interface ActivityLog {
  id: number;
  userId: number;
  username: string;
  displayName: string;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

interface PublishingProcess {
  id: number;
  userId: number;
  username: string;
  displayName: string;
  videoUrl: string;
  title: string;
  hashtags: string;
  totalSites: number;
  completedSites: number;
  successfulSites: number;
  failedSites: number;
  status: string;
  progress: number;
  startedAt: string;
}

interface PublishingStats {
  totalProcesses: number;
  completedProcesses: number;
  activeProcesses: number;
  failedProcesses: number;
}

export default function AdminUsersDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [publishingProcesses, setPublishingProcesses] = useState<PublishingProcess[]>([]);
  const [publishingStats, setPublishingStats] = useState<PublishingStats | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLocation('/auth-login');
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      // تحميل بيانات المستخدمين
      const usersResponse = await fetch('/api/admin/users', { headers });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
        setUserStats(usersData.stats || null);
      }

      // تحميل سجل الأنشطة
      const activityResponse = await fetch('/api/admin/activity-logs', { headers });
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setActivityLogs(activityData.logs || []);
      }

      // تحميل عمليات النشر
      const publishingResponse = await fetch('/api/admin/publishing-processes', { headers });
      if (publishingResponse.ok) {
        const publishingData = await publishingResponse.json();
        setPublishingProcesses(publishingData.processes || []);
        setPublishingStats(publishingData.stats || null);
      }

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setLocation('/auth-login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'مكتمل': { label: 'مكتمل', variant: 'default' as const },
      'جاري النشر': { label: 'جاري النشر', variant: 'secondary' as const },
      'فشل': { label: 'فشل', variant: 'destructive' as const },
      'متوقف': { label: 'متوقف', variant: 'outline' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-purple-400" />
              <div>
                <h1 className="text-xl font-bold">لوحة إدارة المستخدمين</h1>
                <p className="text-sm text-gray-400">إدارة شاملة للمنصة</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setLocation('/user-dashboard')}
                variant="outline"
                className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
              >
                العودة للوحة المستخدم
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="overview" className="text-white">نظرة عامة</TabsTrigger>
            <TabsTrigger value="users" className="text-white">المستخدمين</TabsTrigger>
            <TabsTrigger value="publishing" className="text-white">عمليات النشر</TabsTrigger>
            <TabsTrigger value="activity" className="text-white">سجل الأنشطة</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* إحصائيات المستخدمين */}
            {userStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">إجمالي المستخدمين</p>
                        <p className="text-2xl font-bold text-white">{userStats.totalUsers}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">المستخدمين المميزين</p>
                        <p className="text-2xl font-bold text-white">{userStats.premiumUsers}</p>
                      </div>
                      <Crown className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">نشطين اليوم</p>
                        <p className="text-2xl font-bold text-white">{userStats.activeToday}</p>
                      </div>
                      <UserCheck className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">جدد هذا الأسبوع</p>
                        <p className="text-2xl font-bold text-white">{userStats.newThisWeek}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* إحصائيات النشر */}
            {publishingStats && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">إحصائيات عمليات النشر</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{publishingStats.totalProcesses}</p>
                      <p className="text-sm text-gray-400">إجمالي العمليات</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">{publishingStats.completedProcesses}</p>
                      <p className="text-sm text-gray-400">مكتملة</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{publishingStats.activeProcesses}</p>
                      <p className="text-sm text-gray-400">جارية</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-400">{publishingStats.failedProcesses}</p>
                      <p className="text-sm text-gray-400">فاشلة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">قائمة المستخدمين</CardTitle>
                <CardDescription className="text-gray-400">
                  جميع المستخدمين المسجلين في المنصة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-right p-2 text-gray-300">الاسم</th>
                        <th className="text-right p-2 text-gray-300">البريد الإلكتروني</th>
                        <th className="text-right p-2 text-gray-300">اسم المستخدم</th>
                        <th className="text-right p-2 text-gray-300">النوع</th>
                        <th className="text-right p-2 text-gray-300">آخر دخول</th>
                        <th className="text-right p-2 text-gray-300">عدد الدخول</th>
                        <th className="text-right p-2 text-gray-300">تاريخ التسجيل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                          <td className="p-2 text-white">{user.displayName}</td>
                          <td className="p-2 text-gray-300">{user.email}</td>
                          <td className="p-2 text-gray-300">{user.username}</td>
                          <td className="p-2">
                            <div className="flex space-x-1">
                              {user.isAdmin && <Badge variant="destructive">مدير</Badge>}
                              {user.isPremium && <Badge variant="secondary">مميز</Badge>}
                              {!user.isAdmin && !user.isPremium && <Badge variant="outline">عادي</Badge>}
                            </div>
                          </td>
                          <td className="p-2 text-gray-300">
                            {user.lastLogin ? formatDate(user.lastLogin) : 'لم يسجل دخول بعد'}
                          </td>
                          <td className="p-2 text-gray-300">{user.loginCount}</td>
                          <td className="p-2 text-gray-300">{formatDate(user.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="publishing" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">عمليات النشر</CardTitle>
                <CardDescription className="text-gray-400">
                  جميع عمليات النشر في المنصة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-right p-2 text-gray-300">المستخدم</th>
                        <th className="text-right p-2 text-gray-300">العنوان</th>
                        <th className="text-right p-2 text-gray-300">الحالة</th>
                        <th className="text-right p-2 text-gray-300">التقدم</th>
                        <th className="text-right p-2 text-gray-300">المواقع المنشورة</th>
                        <th className="text-right p-2 text-gray-300">تاريخ البدء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {publishingProcesses.map((process) => (
                        <tr key={process.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                          <td className="p-2 text-white">{process.displayName}</td>
                          <td className="p-2 text-gray-300">
                            {process.title || 'بدون عنوان'}
                          </td>
                          <td className="p-2">{getStatusBadge(process.status)}</td>
                          <td className="p-2 text-gray-300">{process.progress}%</td>
                          <td className="p-2 text-gray-300">
                            {process.successfulSites} / {process.totalSites}
                          </td>
                          <td className="p-2 text-gray-300">{formatDate(process.startedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">سجل الأنشطة</CardTitle>
                <CardDescription className="text-gray-400">
                  آخر 100 نشاط في المنصة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Activity className="h-4 w-4 text-purple-400" />
                        <div>
                          <p className="text-white text-sm">
                            <span className="font-medium">{log.displayName}</span> - {log.action}
                          </p>
                          {log.details && (
                            <p className="text-gray-400 text-xs">{log.details}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs">{formatDate(log.createdAt)}</p>
                        {log.ipAddress && (
                          <p className="text-gray-500 text-xs">{log.ipAddress}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}