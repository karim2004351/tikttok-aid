import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  Settings, 
  Save, 
  RotateCcw, 
  Shield, 
  Users, 
  Star, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare 
} from 'lucide-react';

interface Site {
  id: string;
  name: string;
  url: string;
  category: string;
  country: string;
  enabled: boolean;
  maxPostsPerDay: number;
  freePublishing: boolean;
  userType: 'admin' | 'user' | 'both';
  requiresApproval: boolean;
  priority: 'high' | 'medium' | 'low';
  totalPosts: number;
  successRate: number;
}

interface PendingPost {
  id: string;
  title: string;
  content: string;
  author: string;
  targetSite: string;
  submittedAt: string;
  priority: 'high' | 'medium' | 'low';
}

export default function SitesManagerWithReview() {
  const { toast } = useToast();
  
  const [sites, setSites] = useState<Site[]>([
    // منصات التواصل الاجتماعي الرئيسية
    { id: '1', name: 'فيسبوك', url: 'facebook.com', category: 'اجتماعي', country: 'عالمي', enabled: true, maxPostsPerDay: 10, freePublishing: true, userType: 'both', requiresApproval: false, priority: 'high', totalPosts: 2450, successRate: 95 },
    { id: '2', name: 'تويتر (X)', url: 'x.com', category: 'اجتماعي', country: 'عالمي', enabled: true, maxPostsPerDay: 15, freePublishing: true, userType: 'both', requiresApproval: false, priority: 'high', totalPosts: 3200, successRate: 92 },
    { id: '3', name: 'إنستغرام', url: 'instagram.com', category: 'اجتماعي', country: 'عالمي', enabled: true, maxPostsPerDay: 8, freePublishing: false, userType: 'admin', requiresApproval: true, priority: 'high', totalPosts: 1890, successRate: 88 },
    { id: '4', name: 'تيك توك', url: 'tiktok.com', category: 'اجتماعي', country: 'عالمي', enabled: true, maxPostsPerDay: 5, freePublishing: true, userType: 'both', requiresApproval: false, priority: 'medium', totalPosts: 1200, successRate: 85 },
    { id: '5', name: 'لينكد إن', url: 'linkedin.com', category: 'مهني', country: 'عالمي', enabled: true, maxPostsPerDay: 3, freePublishing: false, userType: 'admin', requiresApproval: true, priority: 'medium', totalPosts: 890, successRate: 91 },
    { id: '6', name: 'يوتيوب', url: 'youtube.com', category: 'فيديو', country: 'عالمي', enabled: true, maxPostsPerDay: 2, freePublishing: false, userType: 'admin', requiresApproval: true, priority: 'high', totalPosts: 450, successRate: 89 },
  ]);

  const [pendingPosts] = useState<PendingPost[]>([
    {
      id: '1',
      title: 'إعلان عن منتج جديد',
      content: 'نحن متحمسون لإطلاق منتجنا الجديد الذي سيغير طريقة عملكم.',
      author: 'أحمد محمد',
      targetSite: 'فيسبوك',
      submittedAt: '2025-01-05T10:30:00',
      priority: 'high'
    },
    {
      id: '2',
      title: 'مشاركة مقال تقني',
      content: 'مقال رائع حول أحدث تطورات الذكاء الاصطناعي وتأثيرها على مستقبل التكنولوجيا.',
      author: 'سارة أحمد',
      targetSite: 'لينكد إن',
      submittedAt: '2025-01-05T09:15:00',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'فيديو تعريفي بالشركة',
      content: 'فيديو قصير يعرف بخدماتنا ورؤيتنا للمستقبل.',
      author: 'محمد علي',
      targetSite: 'يوتيوب',
      submittedAt: '2025-01-05T08:45:00',
      priority: 'high'
    }
  ]);

  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  const updateSite = (id: string, field: keyof Site, value: any) => {
    setSites(prev => prev.map(site => 
      site.id === id ? { ...site, [field]: value } : site
    ));
  };

  const saveChanges = () => {
    toast({
      title: "تم حفظ التغييرات",
      description: "تم تحديث إعدادات المواقع بنجاح",
    });
  };

  const resetToDefaults = () => {
    window.location.reload();
  };

  const handlePostApproval = (postId: string, action: 'approved' | 'rejected') => {
    if (action === 'approved') {
      setApprovedCount(prev => prev + 1);
    } else {
      setRejectedCount(prev => prev + 1);
    }
    
    toast({
      title: action === 'approved' ? "تمت الموافقة على المنشور" : "تم رفض المنشور",
      description: `المنشور رقم ${postId}`,
    });
  };

  const activeSites = sites.filter(site => site.enabled).length;
  const freeSites = sites.filter(site => site.freePublishing).length;
  const adminSites = sites.filter(site => site.userType === 'admin').length;
  const userSites = sites.filter(site => site.userType === 'user').length;
  const bothSites = sites.filter(site => site.userType === 'both').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">إدارة المواقع ومراجعة المنشورات</h1>
          <p className="text-lg text-gray-600">تحكم شامل في إعدادات المواقع ومراجعة المحتوى</p>
        </div>

        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-900">{sites.length}</h3>
              <p className="text-sm text-gray-600">إجمالي المواقع</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Settings className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-900">{activeSites}</h3>
              <p className="text-sm text-gray-600">المواقع النشطة</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Save className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-900">{freeSites}</h3>
              <p className="text-sm text-gray-600">النشر المجاني</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-900">{pendingPosts.length}</h3>
              <p className="text-sm text-gray-600">في الانتظار</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-900">{approvedCount}</h3>
              <p className="text-sm text-gray-600">تم قبولها</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-900">{rejectedCount}</h3>
              <p className="text-sm text-gray-600">تم رفضها</p>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات الرئيسية */}
        <Tabs defaultValue="sites" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="sites" className="text-lg py-3">
              <Settings className="h-5 w-5 ml-2" />
              إدارة المواقع ({sites.length})
            </TabsTrigger>
            <TabsTrigger value="posts" className="text-lg py-3">
              <MessageSquare className="h-5 w-5 ml-2" />
              مراجعة المنشورات ({pendingPosts.length})
            </TabsTrigger>
          </TabsList>

          {/* تبويب إدارة المواقع */}
          <TabsContent value="sites">
            {/* أزرار التحكم */}
            <div className="flex justify-center gap-4 mb-8">
              <Button 
                onClick={saveChanges}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              >
                <Save className="h-5 w-5 ml-2" />
                حفظ التغييرات
              </Button>
              
              <Button 
                onClick={resetToDefaults}
                variant="outline"
                className="px-8 py-3 text-lg"
              >
                <RotateCcw className="h-5 w-5 ml-2" />
                إعادة تعيين
              </Button>
            </div>

            {/* قائمة المواقع */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sites.map((site) => (
                <Card key={site.id} className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg font-semibold">{site.name}</span>
                      <div className="flex gap-2">
                        <Badge className={site.enabled ? 'bg-green-500' : 'bg-gray-500'}>
                          {site.enabled ? 'نشط' : 'معطل'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {site.category}
                        </Badge>
                      </div>
                    </CardTitle>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">{site.url}</p>
                      <div className="flex items-center gap-1">
                        {site.userType === 'admin' && <Shield className="h-4 w-4 text-red-500" />}
                        {site.userType === 'user' && <Users className="h-4 w-4 text-blue-500" />}
                        {site.userType === 'both' && <Star className="h-4 w-4 text-green-500" />}
                        <Badge variant="outline" className="text-xs">
                          {site.country}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* تفعيل/إلغاء الموقع */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium">تفعيل الموقع:</span>
                      <Switch
                        checked={site.enabled}
                        onCheckedChange={(checked) => updateSite(site.id, 'enabled', checked)}
                      />
                    </div>

                    {/* النشر المجاني */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium">النشر المجاني:</span>
                      <Switch
                        checked={site.freePublishing}
                        onCheckedChange={(checked) => updateSite(site.id, 'freePublishing', checked)}
                      />
                    </div>

                    {/* نوع المستخدم */}
                    <div className="space-y-2">
                      <label className="font-medium block">نوع المستخدم:</label>
                      <Select
                        value={site.userType}
                        onValueChange={(value: 'admin' | 'user' | 'both') => updateSite(site.id, 'userType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">المدير فقط</SelectItem>
                          <SelectItem value="user">المستخدم فقط</SelectItem>
                          <SelectItem value="both">المدير والمستخدم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* متطلبات الموافقة */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium">يتطلب موافقة:</span>
                      <Switch
                        checked={site.requiresApproval}
                        onCheckedChange={(checked) => updateSite(site.id, 'requiresApproval', checked)}
                      />
                    </div>

                    {/* عدد المنشورات اليومية */}
                    <div className="space-y-2">
                      <label className="font-medium block">المنشورات المسموحة يومياً:</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={site.maxPostsPerDay}
                          onChange={(e) => updateSite(site.id, 'maxPostsPerDay', parseInt(e.target.value) || 1)}
                          className="text-center"
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateSite(site.id, 'maxPostsPerDay', 5)}
                            className="px-2 text-xs"
                          >
                            5
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateSite(site.id, 'maxPostsPerDay', 10)}
                            className="px-2 text-xs"
                          >
                            10
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateSite(site.id, 'maxPostsPerDay', 20)}
                            className="px-2 text-xs"
                          >
                            20
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* معلومات إضافية */}
                    <div className="text-xs text-gray-500 space-y-1 border-t pt-2">
                      <div>إجمالي المنشورات: {site.totalPosts.toLocaleString()}</div>
                      <div>معدل النجاح: {site.successRate}%</div>
                      <div>الأولوية: {site.priority === 'high' ? 'عالية' : site.priority === 'medium' ? 'متوسطة' : 'منخفضة'}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* تبويب مراجعة المنشورات */}
          <TabsContent value="posts">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* قائمة المنشورات المعلقة */}
              <div className="lg:col-span-3">
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      المنشورات في الانتظار ({pendingPosts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pendingPosts.map((post) => (
                      <Card key={post.id} className="cursor-pointer transition-all hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold text-lg">{post.title}</h3>
                            <Badge className={post.priority === 'high' ? 'bg-red-500 text-white' : post.priority === 'medium' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'}>
                              {post.priority === 'high' ? 'عالية' : post.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3">{post.content}</p>
                          
                          <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                            <span>الكاتب: {post.author}</span>
                            <span>الموقع المستهدف: {post.targetSite}</span>
                          </div>

                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              size="sm"
                              onClick={() => handlePostApproval(post.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700 flex-1"
                            >
                              <CheckCircle className="h-4 w-4 ml-1" />
                              موافقة
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handlePostApproval(post.id, 'rejected')}
                              className="flex-1"
                            >
                              <XCircle className="h-4 w-4 ml-1" />
                              رفض
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {pendingPosts.length === 0 && (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">لا توجد منشورات في الانتظار</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* إحصائيات المراجعة */}
              <div>
                <div className="space-y-4">
                  <Card className="bg-orange-50">
                    <CardContent className="p-4 text-center">
                      <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <h3 className="text-xl font-bold">{pendingPosts.length}</h3>
                      <p className="text-sm text-gray-600">في الانتظار</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h3 className="text-xl font-bold">{approvedCount}</h3>
                      <p className="text-sm text-gray-600">تم قبولها</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-50">
                    <CardContent className="p-4 text-center">
                      <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <h3 className="text-xl font-bold">{rejectedCount}</h3>
                      <p className="text-sm text-gray-600">تم رفضها</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 text-blue-900">تعليمات المراجعة:</h4>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>• راجع المحتوى للتأكد من مطابقته للسياسات</li>
                        <li>• تحقق من جودة النص والمعلومات</li>
                        <li>• انتبه للأولوية عند المراجعة</li>
                        <li>• المنشورات المقبولة تنشر تلقائياً</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* معلومات إضافية */}
        <Card className="mt-8 bg-blue-50/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-900">ملاحظات مهمة:</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800">
              <div>
                <h4 className="font-semibold mb-2">إدارة المواقع:</h4>
                <ul className="space-y-1">
                  <li>• المواقع المعطلة لن تظهر في خيارات النشر</li>
                  <li>• النشر المجاني يسمح للمستخدمين بالنشر بدون دفع</li>
                  <li>• عدد المنشورات اليومية يحدد الحد الأقصى لكل مستخدم</li>
                  <li>• التغييرات تصبح فعالة فوراً بعد الحفظ</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">مراجعة المنشورات:</h4>
                <ul className="space-y-1">
                  <li>• "يتطلب الموافقة" يعني أن المنشورات تحتاج موافقة المدير</li>
                  <li>• المنشورات المرفوضة يمكن للمستخدم تعديلها وإعادة إرسالها</li>
                  <li>• المنشورات المقبولة تنشر تلقائياً على المنصة المحددة</li>
                  <li>• الأولوية تساعد في ترتيب المراجعة</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}