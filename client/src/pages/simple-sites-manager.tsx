import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Settings, Save, RotateCcw, Shield, Users, Star, CheckCircle, XCircle, Clock, Eye, MessageSquare } from 'lucide-react';

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

export default function SimpleSitesManager() {
  const { toast } = useToast();
  
  const [sites, setSites] = useState<Site[]>([
    // منصات التواصل الاجتماعي الرئيسية
    { id: '1', name: 'فيسبوك', url: 'facebook.com', category: 'اجتماعي', country: 'عالمي', enabled: true, maxPostsPerDay: 10, freePublishing: true, userType: 'both', requiresApproval: false, priority: 'high', totalPosts: 2450, successRate: 95 },
    { id: '2', name: 'تويتر (X)', url: 'x.com', category: 'اجتماعي', country: 'عالمي', enabled: true, maxPostsPerDay: 15, freePublishing: true, userType: 'both', requiresApproval: false, priority: 'high', totalPosts: 3200, successRate: 92 },
    { id: '3', name: 'إنستغرام', url: 'instagram.com', category: 'اجتماعي', country: 'عالمي', enabled: true, maxPostsPerDay: 8, freePublishing: false, userType: 'admin', requiresApproval: true, priority: 'high', totalPosts: 1890, successRate: 88 },
    { id: '4', name: 'تيك توك', url: 'tiktok.com', category: 'اجتماعي', country: 'عالمي', enabled: true, maxPostsPerDay: 5, freePublishing: true, userType: 'both', requiresApproval: false, priority: 'medium', totalPosts: 1200, successRate: 85 },
    { id: '5', name: 'لينكد إن', url: 'linkedin.com', category: 'مهني', country: 'عالمي', enabled: true, maxPostsPerDay: 3, freePublishing: false, userType: 'admin', requiresApproval: true, priority: 'medium', totalPosts: 890, successRate: 91 },
    { id: '6', name: 'يوتيوب', url: 'youtube.com', category: 'فيديو', country: 'عالمي', enabled: true, maxPostsPerDay: 2, freePublishing: false, userType: 'admin', requiresApproval: true, priority: 'high', totalPosts: 450, successRate: 89 },
    { id: '7', name: 'ريديت', url: 'reddit.com', category: 'منتديات', country: 'عالمي', enabled: true, maxPostsPerDay: 20, freePublishing: true, userType: 'both', requiresApproval: false, priority: 'medium', totalPosts: 5600, successRate: 78 },
    { id: '8', name: 'بنترست', url: 'pinterest.com', category: 'إبداعي', country: 'عالمي', enabled: true, maxPostsPerDay: 12, freePublishing: true, userType: 'both', requiresApproval: false, priority: 'low', totalPosts: 2100, successRate: 82 },
    
    // منصات عربية
    { id: '9', name: 'واتساب الأعمال', url: 'business.whatsapp.com', category: 'تراسل', country: 'عالمي', enabled: true, maxPostsPerDay: 50, freePublishing: true, userType: 'both', requiresApproval: false, priority: 'high', totalPosts: 8900, successRate: 97 },
    { id: '10', name: 'تيليجرام', url: 'telegram.org', category: 'تراسل', country: 'عالمي', enabled: true, maxPostsPerDay: 30, freePublishing: true, userType: 'both', requiresApproval: false, priority: 'medium', totalPosts: 4500, successRate: 94 },
    { id: '11', name: 'سناب شات', url: 'snapchat.com', category: 'اجتماعي', country: 'عالمي', enabled: false, maxPostsPerDay: 10, freePublishing: false, userType: 'admin', requiresApproval: true, priority: 'low', totalPosts: 230, successRate: 76 },
    { id: '12', name: 'ديسكورد', url: 'discord.com', category: 'مجتمعات', country: 'عالمي', enabled: true, maxPostsPerDay: 25, freePublishing: true, userType: 'both', requiresApproval: false, priority: 'medium', totalPosts: 3400, successRate: 87 },
    
    // منصات إخبارية ومدونات
    { id: '13', name: 'ووردبريس', url: 'wordpress.com', category: 'مدونات', country: 'عالمي', enabled: true, maxPostsPerDay: 5, freePublishing: true, userType: 'both', requiresApproval: false, priority: 'medium', totalPosts: 1200, successRate: 92 },
    { id: '14', name: 'بلوجر', url: 'blogger.com', category: 'مدونات', country: 'عالمي', enabled: true, maxPostsPerDay: 5, freePublishing: true, userType: 'both', requiresApproval: false, priority: 'low', totalPosts: 890, successRate: 88 },
    { id: '15', name: 'ميديوم', url: 'medium.com', category: 'مدونات', country: 'عالمي', enabled: true, maxPostsPerDay: 3, freePublishing: false, userType: 'admin', requiresApproval: true, priority: 'medium', totalPosts: 340, successRate: 91 },
    
    // منصات تجارية
    { id: '16', name: 'أمازون', url: 'amazon.com', category: 'تجاري', country: 'عالمي', enabled: false, maxPostsPerDay: 5, freePublishing: false, userType: 'admin', requiresApproval: true, priority: 'high', totalPosts: 120, successRate: 95 },
    { id: '17', name: 'إيباي', url: 'ebay.com', category: 'تجاري', country: 'عالمي', enabled: false, maxPostsPerDay: 10, freePublishing: false, userType: 'admin', requiresApproval: true, priority: 'medium', totalPosts: 89, successRate: 87 },
    { id: '18', name: 'علي إكسبريس', url: 'aliexpress.com', category: 'تجاري', country: 'عالمي', enabled: false, maxPostsPerDay: 8, freePublishing: false, userType: 'admin', requiresApproval: true, priority: 'medium', totalPosts: 156, successRate: 83 },
    
    // منصات تعليمية ومهنية
    { id: '19', name: 'كورسيرا', url: 'coursera.org', category: 'تعليمي', country: 'عالمي', enabled: true, maxPostsPerDay: 2, freePublishing: false, userType: 'admin', requiresApproval: true, priority: 'low', totalPosts: 45, successRate: 92 },
    { id: '20', name: 'يوديمي', url: 'udemy.com', category: 'تعليمي', country: 'عالمي', enabled: true, maxPostsPerDay: 3, freePublishing: false, userType: 'admin', requiresApproval: true, priority: 'low', totalPosts: 67, successRate: 89 },
    
    // منصات محلية عربية
    { id: '21', name: 'حراج', url: 'haraj.com.sa', category: 'إعلانات', country: 'السعودية', enabled: true, maxPostsPerDay: 15, freePublishing: true, userType: 'both', requiresApproval: false, priority: 'medium', totalPosts: 2300, successRate: 91 },
    { id: '22', name: 'السوق المفتوح', url: 'opensooq.com', category: 'إعلانات', country: 'الأردن', enabled: true, maxPostsPerDay: 12, freePublishing: true, userType: 'both', requiresApproval: false, priority: 'medium', totalPosts: 1800, successRate: 88 },
    { id: '23', name: 'دوبيزل', url: 'dubizzle.com', category: 'إعلانات', country: 'الإمارات', enabled: true, maxPostsPerDay: 10, freePublishing: true, userType: 'both', requiresApproval: false, priority: 'medium', totalPosts: 1500, successRate: 90 },
    { id: '24', name: 'أوليكس', url: 'olx.com.eg', category: 'إعلانات', country: 'مصر', enabled: true, maxPostsPerDay: 18, freePublishing: true, userType: 'both', requiresApproval: false, priority: 'medium', totalPosts: 2100, successRate: 86 },
    
    // منصات أخرى مهمة
    { id: '25', name: 'فايبر', url: 'viber.com', category: 'تراسل', country: 'عالمي', enabled: false, maxPostsPerDay: 20, freePublishing: true, userType: 'both', requiresApproval: false, priority: 'low', totalPosts: 890, successRate: 84 },
    { id: '26', name: 'ويشات', url: 'wechat.com', category: 'تراسل', country: 'الصين', enabled: false, maxPostsPerDay: 15, freePublishing: false, userType: 'admin', requiresApproval: true, priority: 'low', totalPosts: 234, successRate: 79 },
    { id: '27', name: 'كيك', url: 'kik.com', category: 'تراسل', country: 'عالمي', enabled: false, maxPostsPerDay: 25, freePublishing: true, userType: 'both', requiresApproval: false, priority: 'low', totalPosts: 567, successRate: 81 },
    { id: '28', name: 'لاين', url: 'line.me', category: 'تراسل', country: 'اليابان', enabled: false, maxPostsPerDay: 20, freePublishing: true, userType: 'both', requiresApproval: false, priority: 'low', totalPosts: 345, successRate: 83 },
  ]);

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
    // إعادة تحميل القائمة الكاملة للمواقع
    window.location.reload();
  };

  const activeSites = sites.filter(site => site.enabled).length;
  const freeSites = sites.filter(site => site.freePublishing).length;
  const adminSites = sites.filter(site => site.userType === 'admin').length;
  const userSites = sites.filter(site => site.userType === 'user').length;
  const bothSites = sites.filter(site => site.userType === 'both').length;

  // بيانات المنشورات المعلقة
  const [pendingPosts] = useState([
    {
      id: '1',
      title: 'إعلان عن منتج جديد',
      content: 'نحن متحمسون لإطلاق منتجنا الجديد الذي سيغير طريقة عملكم.',
      author: 'أحمد محمد',
      targetSite: 'فيسبوك',
      submittedAt: '2025-01-05T10:30:00',
      priority: 'high' as const
    },
    {
      id: '2',
      title: 'مشاركة مقال تقني',
      content: 'مقال رائع حول أحدث تطورات الذكاء الاصطناعي وتأثيرها على مستقبل التكنولوجيا.',
      author: 'سارة أحمد',
      targetSite: 'لينكد إن',
      submittedAt: '2025-01-05T09:15:00',
      priority: 'medium' as const
    },
    {
      id: '3',
      title: 'فيديو تعريفي بالشركة',
      content: 'فيديو قصير يعرف بخدماتنا ورؤيتنا للمستقبل.',
      author: 'محمد علي',
      targetSite: 'يوتيوب',
      submittedAt: '2025-01-05T08:45:00',
      priority: 'high' as const
    }
  ]);

  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">إدارة المواقع والمنصات</h1>
          <p className="text-lg text-gray-600">تحكم بسيط وواضح في إعدادات النشر</p>
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
              <Settings className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-900">{adminSites}</h3>
              <p className="text-sm text-gray-600">للمدير فقط</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Settings className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-900">{userSites}</h3>
              <p className="text-sm text-gray-600">للمستخدم فقط</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Settings className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-900">{bothSites}</h3>
              <p className="text-sm text-gray-600">للمدير والمستخدم</p>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات الرئيسية */}
        <Tabs defaultValue="sites" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="sites" className="text-lg py-3">
              <Settings className="h-5 w-5 ml-2" />
              إدارة المواقع
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* قائمة المنشورات المعلقة */}
              <div className="lg:col-span-2">
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
                            <Badge className={post.priority === 'high' ? 'bg-red-500' : post.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}>
                              {post.priority === 'high' ? 'عالية' : post.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3">{post.content}</p>
                          
                          <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                            <span>الكاتب: {post.author}</span>
                            <span>الموقع: {post.targetSite}</span>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handlePostApproval(post.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 ml-1" />
                              موافقة
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handlePostApproval(post.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 ml-1" />
                              رفض
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* الإحصائيات */}
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
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* معلومات إضافية */}
        <Card className="mt-8 bg-blue-50/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-900">ملاحظات مهمة:</h3>
            <ul className="space-y-2 text-blue-800">
              <li>• المواقع المعطلة لن تظهر في خيارات النشر</li>
              <li>• النشر المجاني يسمح للمستخدمين بالنشر بدون دفع</li>
              <li>• عدد المنشورات اليومية يحدد الحد الأقصى لكل مستخدم</li>
              <li>• "يتطلب الموافقة" يعني أن المنشورات تحتاج موافقة المدير قبل النشر</li>
              <li>• التغييرات تصبح فعالة فوراً بعد الحفظ</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}