import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Globe, 
  Search, 
  Star,
  CheckCircle,
  MapPin,
  TrendingUp,
  ArrowLeft,
  Settings,
  Users,
  Shield,
  Filter,
  Eye,
  Edit,
  Video,
  UserCheck,
  BarChart3,
  Download,
  PlayCircle
} from 'lucide-react';

interface SiteConfig {
  id: string;
  name: string;
  url: string;
  category: string;
  country: string;
  enabled: boolean;
  freePublishingEnabled: boolean;
  successRate: number;
  totalPosts: number;
  status: 'active' | 'inactive' | 'maintenance' | 'blocked';
  userType: 'admin' | 'user' | 'both';
  priority: 'high' | 'medium' | 'low';
  adminControls: {
    canEnableDisable: boolean;
    canModifySettings: boolean;
    canViewAnalytics: boolean;
  };
  userControls: {
    canPublish: boolean;
    maxPostsPerDay: number;
    requiresApproval: boolean;
  };
}

export default function SitesControlSimple() {
  const { toast } = useToast();
  const [sites, setSites] = useState<SiteConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUserType, setSelectedUserType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    loadComprehensiveSites();
  }, []);

  const loadComprehensiveSites = () => {
    // بيانات شاملة للمواقع والمنصات مع جميع المعطيات المطلوبة
    const comprehensiveSites: SiteConfig[] = [
      // المنصات الاجتماعية الرئيسية
      {
        id: 'reddit',
        name: 'Reddit',
        url: 'reddit.com',
        category: 'اجتماعي',
        country: 'عالمي',
        enabled: true,
        freePublishingEnabled: true,
        successRate: 85,
        totalPosts: 2340,
        status: 'active',
        userType: 'both',
        priority: 'high',
        adminControls: {
          canEnableDisable: true,
          canModifySettings: true,
          canViewAnalytics: true
        },
        userControls: {
          canPublish: true,
          maxPostsPerDay: 5,
          requiresApproval: false
        }
      },
      {
        id: 'twitter',
        name: 'Twitter',
        url: 'twitter.com',
        category: 'اجتماعي',
        country: 'عالمي',
        enabled: true,
        freePublishingEnabled: false,
        successRate: 92,
        totalPosts: 4567,
        status: 'active',
        userType: 'admin',
        priority: 'high',
        adminControls: {
          canEnableDisable: true,
          canModifySettings: true,
          canViewAnalytics: true
        },
        userControls: {
          canPublish: false,
          maxPostsPerDay: 0,
          requiresApproval: true
        }
      },
      {
        id: 'facebook',
        name: 'Facebook',
        url: 'facebook.com',
        category: 'اجتماعي',
        country: 'عالمي',
        enabled: false,
        freePublishingEnabled: true,
        successRate: 78,
        totalPosts: 1234,
        status: 'maintenance',
        userType: 'both',
        priority: 'medium',
        adminControls: {
          canEnableDisable: true,
          canModifySettings: true,
          canViewAnalytics: true
        },
        userControls: {
          canPublish: true,
          maxPostsPerDay: 3,
          requiresApproval: true
        }
      },
      {
        id: 'youtube',
        name: 'YouTube',
        url: 'youtube.com',
        category: 'فيديو',
        country: 'عالمي',
        enabled: true,
        freePublishingEnabled: false,
        successRate: 95,
        totalPosts: 3456,
        status: 'active',
        userType: 'admin',
        priority: 'high',
        adminControls: {
          canEnableDisable: true,
          canModifySettings: true,
          canViewAnalytics: true
        },
        userControls: {
          canPublish: false,
          maxPostsPerDay: 0,
          requiresApproval: true
        }
      },
      {
        id: 'tiktok',
        name: 'TikTok',
        url: 'tiktok.com',
        category: 'فيديو',
        country: 'عالمي',
        enabled: true,
        freePublishingEnabled: true,
        successRate: 88,
        totalPosts: 5678,
        status: 'active',
        userType: 'both',
        priority: 'high',
        adminControls: {
          canEnableDisable: true,
          canModifySettings: true,
          canViewAnalytics: true
        },
        userControls: {
          canPublish: true,
          maxPostsPerDay: 10,
          requiresApproval: false
        }
      },
      {
        id: 'instagram',
        name: 'Instagram',
        url: 'instagram.com',
        category: 'صور',
        country: 'عالمي',
        enabled: true,
        freePublishingEnabled: false,
        successRate: 82,
        totalPosts: 2890,
        status: 'active',
        userType: 'admin',
        priority: 'medium',
        adminControls: {
          canEnableDisable: true,
          canModifySettings: true,
          canViewAnalytics: true
        },
        userControls: {
          canPublish: false,
          maxPostsPerDay: 0,
          requiresApproval: true
        }
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        url: 'linkedin.com',
        category: 'مهني',
        country: 'عالمي',
        enabled: false,
        freePublishingEnabled: false,
        successRate: 91,
        totalPosts: 1456,
        status: 'inactive',
        userType: 'admin',
        priority: 'low',
        adminControls: {
          canEnableDisable: true,
          canModifySettings: true,
          canViewAnalytics: true
        },
        userControls: {
          canPublish: false,
          maxPostsPerDay: 0,
          requiresApproval: true
        }
      },
      {
        id: 'pinterest',
        name: 'Pinterest',
        url: 'pinterest.com',
        category: 'صور',
        country: 'عالمي',
        enabled: true,
        freePublishingEnabled: true,
        successRate: 76,
        totalPosts: 987,
        status: 'active',
        userType: 'user',
        priority: 'low',
        adminControls: {
          canEnableDisable: true,
          canModifySettings: false,
          canViewAnalytics: true
        },
        userControls: {
          canPublish: true,
          maxPostsPerDay: 20,
          requiresApproval: false
        }
      },
      // المواقع العربية
      {
        id: 'elaph',
        name: 'إيلاف',
        url: 'elaph.com',
        category: 'أخبار',
        country: 'السعودية',
        enabled: true,
        freePublishingEnabled: true,
        successRate: 89,
        totalPosts: 1567,
        status: 'active',
        userType: 'both',
        priority: 'high',
        adminControls: {
          canEnableDisable: true,
          canModifySettings: true,
          canViewAnalytics: true
        },
        userControls: {
          canPublish: true,
          maxPostsPerDay: 8,
          requiresApproval: true
        }
      },
      {
        id: 'alarabiya',
        name: 'العربية',
        url: 'alarabiya.net',
        category: 'أخبار',
        country: 'الإمارات',
        enabled: true,
        freePublishingEnabled: false,
        successRate: 94,
        totalPosts: 3421,
        status: 'active',
        userType: 'admin',
        priority: 'high',
        adminControls: {
          canEnableDisable: true,
          canModifySettings: true,
          canViewAnalytics: true
        },
        userControls: {
          canPublish: false,
          maxPostsPerDay: 0,
          requiresApproval: true
        }
      },
      {
        id: 'aljazeera',
        name: 'الجزيرة',
        url: 'aljazeera.net',
        category: 'أخبار',
        country: 'قطر',
        enabled: true,
        freePublishingEnabled: true,
        successRate: 96,
        totalPosts: 4532,
        status: 'active',
        userType: 'both',
        priority: 'high',
        adminControls: {
          canEnableDisable: true,
          canModifySettings: true,
          canViewAnalytics: true
        },
        userControls: {
          canPublish: true,
          maxPostsPerDay: 6,
          requiresApproval: true
        }
      },
      {
        id: 'youm7',
        name: 'اليوم السابع',
        url: 'youm7.com',
        category: 'أخبار',
        country: 'مصر',
        enabled: true,
        freePublishingEnabled: true,
        successRate: 87,
        totalPosts: 2134,
        status: 'active',
        userType: 'user',
        priority: 'medium',
        adminControls: {
          canEnableDisable: true,
          canModifySettings: false,
          canViewAnalytics: true
        },
        userControls: {
          canPublish: true,
          maxPostsPerDay: 15,
          requiresApproval: false
        }
      },
      // المنتديات التقنية
      {
        id: 'stackoverflow',
        name: 'Stack Overflow',
        url: 'stackoverflow.com',
        category: 'تقنية',
        country: 'عالمي',
        enabled: true,
        freePublishingEnabled: false,
        successRate: 93,
        totalPosts: 1876,
        status: 'active',
        userType: 'admin',
        priority: 'high',
        adminControls: {
          canEnableDisable: true,
          canModifySettings: true,
          canViewAnalytics: true
        },
        userControls: {
          canPublish: false,
          maxPostsPerDay: 0,
          requiresApproval: true
        }
      },
      {
        id: 'github',
        name: 'GitHub',
        url: 'github.com',
        category: 'تقنية',
        country: 'عالمي',
        enabled: true,
        freePublishingEnabled: true,
        successRate: 91,
        totalPosts: 3245,
        status: 'active',
        userType: 'both',
        priority: 'high',
        adminControls: {
          canEnableDisable: true,
          canModifySettings: true,
          canViewAnalytics: true
        },
        userControls: {
          canPublish: true,
          maxPostsPerDay: 12,
          requiresApproval: false
        }
      }
    ];
    
    setSites(comprehensiveSites);
  };

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.category.includes(searchTerm) ||
                         site.country.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || site.category === selectedCategory;
    const matchesUserType = selectedUserType === 'all' || site.userType === selectedUserType;
    const matchesStatus = selectedStatus === 'all' || site.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesUserType && matchesStatus;
  });

  const toggleSite = (siteId: string, enabled: boolean) => {
    setSites(prev => prev.map(site => 
      site.id === siteId ? { ...site, enabled } : site
    ));

    toast({
      title: enabled ? "تم تفعيل الموقع" : "تم إلغاء تفعيل الموقع",
      description: `${sites.find(s => s.id === siteId)?.name}`,
    });
  };

  const toggleFreePublishing = (siteId: string, enabled: boolean) => {
    setSites(prev => prev.map(site => 
      site.id === siteId ? { ...site, freePublishingEnabled: enabled } : site
    ));

    toast({
      title: enabled ? "تم تفعيل النشر المجاني" : "تم إلغاء النشر المجاني",
      description: `${sites.find(s => s.id === siteId)?.name}`,
    });
  };

  const updateMaxPostsPerDay = (siteId: string, maxPosts: number) => {
    setSites(prev => prev.map(site => 
      site.id === siteId ? { 
        ...site, 
        userControls: { ...site.userControls, maxPostsPerDay: maxPosts }
      } : site
    ));

    toast({
      title: "تم تحديث الحد اليومي",
      description: `${sites.find(s => s.id === siteId)?.name}: ${maxPosts} منشورات/يوم`,
    });
  };

  const toggleRequiresApproval = (siteId: string, requiresApproval: boolean) => {
    setSites(prev => prev.map(site => 
      site.id === siteId ? { 
        ...site, 
        userControls: { ...site.userControls, requiresApproval }
      } : site
    ));

    toast({
      title: requiresApproval ? "تم تفعيل الموافقة المسبقة" : "تم إلغاء الموافقة المسبقة",
      description: `${sites.find(s => s.id === siteId)?.name}`,
    });
  };

  const updateUserType = (siteId: string, userType: 'admin' | 'user' | 'both') => {
    setSites(prev => prev.map(site => 
      site.id === siteId ? { ...site, userType } : site
    ));

    const typeLabels = {
      admin: 'المدير فقط',
      user: 'المستخدم فقط', 
      both: 'المدير والمستخدم'
    };

    toast({
      title: "تم تحديث نوع المستخدم",
      description: `${sites.find(s => s.id === siteId)?.name}: ${typeLabels[userType]}`,
    });
  };

  const updateSiteStatus = (siteId: string, status: 'active' | 'inactive' | 'maintenance' | 'blocked') => {
    setSites(prev => prev.map(site => 
      site.id === siteId ? { ...site, status } : site
    ));

    const statusLabels = {
      active: 'نشط',
      inactive: 'غير نشط',
      maintenance: 'صيانة',
      blocked: 'محظور'
    };

    toast({
      title: "تم تحديث حالة الموقع",
      description: `${sites.find(s => s.id === siteId)?.name}: ${statusLabels[status]}`,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'نشط', color: 'bg-green-500 text-white' },
      inactive: { label: 'غير نشط', color: 'bg-gray-500 text-white' },
      maintenance: { label: 'صيانة', color: 'bg-yellow-500 text-white' },
      blocked: { label: 'محظور', color: 'bg-red-500 text-white' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.inactive;
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  const getUserTypeBadge = (userType: string) => {
    const typeMap = {
      admin: { label: 'المدير فقط', color: 'bg-purple-100 text-purple-800', icon: Shield },
      user: { label: 'المستخدم فقط', color: 'bg-blue-100 text-blue-800', icon: Users },
      both: { label: 'المدير والمستخدم', color: 'bg-green-100 text-green-800', icon: Globe }
    };
    
    const typeInfo = typeMap[userType as keyof typeof typeMap] || typeMap.both;
    const IconComponent = typeInfo.icon;
    
    return (
      <Badge className={typeInfo.color}>
        <IconComponent className="h-3 w-3 mr-1" />
        {typeInfo.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      high: { label: 'عالية', color: 'bg-red-100 text-red-800' },
      medium: { label: 'متوسطة', color: 'bg-yellow-100 text-yellow-800' },
      low: { label: 'منخفضة', color: 'bg-green-100 text-green-800' }
    };
    
    const priorityInfo = priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
    return <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>;
  };

  // وظائف التحديد الجماعي
  const selectAllSites = () => {
    setSelectedSites(filteredSites.map(site => site.id));
  };

  const deselectAllSites = () => {
    setSelectedSites([]);
  };

  const toggleSiteSelection = (siteId: string) => {
    setSelectedSites(prev => 
      prev.includes(siteId) 
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  const executeBulkAction = () => {
    if (!bulkAction || selectedSites.length === 0) return;

    let updatedSites = [...sites];

    switch (bulkAction) {
      case 'enable':
        updatedSites = sites.map(site => 
          selectedSites.includes(site.id) ? { ...site, enabled: true } : site
        );
        break;
      case 'disable':
        updatedSites = sites.map(site => 
          selectedSites.includes(site.id) ? { ...site, enabled: false } : site
        );
        break;
      case 'enableFree':
        updatedSites = sites.map(site => 
          selectedSites.includes(site.id) ? { ...site, freePublishingEnabled: true } : site
        );
        break;
      case 'disableFree':
        updatedSites = sites.map(site => 
          selectedSites.includes(site.id) ? { ...site, freePublishingEnabled: false } : site
        );
        break;
      case 'setUserOnly':
        updatedSites = sites.map(site => 
          selectedSites.includes(site.id) ? { ...site, userType: 'user' as const } : site
        );
        break;
      case 'setAdminOnly':
        updatedSites = sites.map(site => 
          selectedSites.includes(site.id) ? { ...site, userType: 'admin' as const } : site
        );
        break;
      case 'setBoth':
        updatedSites = sites.map(site => 
          selectedSites.includes(site.id) ? { ...site, userType: 'both' as const } : site
        );
        break;
    }

    setSites(updatedSites);
    setSelectedSites([]);
    setBulkAction('');

    toast({
      title: "تم تطبيق العملية بنجاح",
      description: `تم تحديث ${selectedSites.length} موقع`,
    });
  };

  // وظيفة تحليل الفيديو وصاحب الصفحة
  const analyzeVideoAndProfile = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط الفيديو",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // تحليل الفيديو
      const videoResponse = await fetch('/api/analyze-video-real', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (!videoResponse.ok) {
        throw new Error('فشل في تحليل الفيديو');
      }

      const videoData = await videoResponse.json();

      // تحليل صاحب الصفحة والملف الشخصي
      const profileResponse = await fetch('/api/profile/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (!profileResponse.ok) {
        throw new Error('فشل في تحليل الملف الشخصي');
      }

      const profileData = await profileResponse.json();

      const combinedResult = {
        video: videoData,
        profile: profileData,
        timestamp: new Date().toISOString()
      };

      setAnalysisResult(combinedResult);
      setShowAnalysis(true);

      toast({
        title: "تم التحليل بنجاح",
        description: "تم تحليل الفيديو وصاحب الصفحة بنجاح",
      });

    } catch (error) {
      console.error('خطأ في التحليل:', error);
      toast({
        title: "خطأ في التحليل",
        description: "حدث خطأ أثناء تحليل الفيديو أو الملف الشخصي",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const categories = Array.from(new Set(sites.map(site => site.category)));
  const userTypes = ['admin', 'user', 'both'];
  const statuses = ['active', 'inactive', 'maintenance', 'blocked'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* الرأسية */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            إدارة المواقع والمنصات الشاملة
          </h1>
          <p className="text-gray-600">
            تحكم كامل في جميع المواقع والمنصات مع إعدادات المدير والمستخدم والنشر المجاني
          </p>
        </div>

        {/* قسم تحليل الفيديو وصاحب الصفحة */}
        <Card className="mb-8 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Video className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-bold text-purple-800">تحليل الفيديو وصاحب الصفحة</h2>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <PlayCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
                  <Input
                    placeholder="أدخل رابط الفيديو (TikTok, YouTube, Instagram...)"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="pr-12 border-purple-300 focus:border-purple-500"
                  />
                </div>
              </div>
              
              <Button
                onClick={analyzeVideoAndProfile}
                disabled={isAnalyzing || !videoUrl.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري التحليل...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    تحليل شامل
                  </div>
                )}
              </Button>
            </div>

            {/* عرض نتائج التحليل */}
            {showAnalysis && analysisResult && (
              <div className="mt-6 space-y-4">
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    نتائج التحليل الشامل
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* تحليل الفيديو */}
                    <Card className="border-blue-200">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          تحليل الفيديو
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">العنوان:</span>
                            <span className="font-medium">{analysisResult?.video?.title || 'غير متوفر'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">الفئة:</span>
                            <span className="font-medium">{analysisResult?.video?.category || 'غير محدد'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">التقييم:</span>
                            <span className="font-medium">{analysisResult?.video?.rating || '0'}/5</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">المشاهدات:</span>
                            <span className="font-medium">{analysisResult?.video?.views?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">الإعجابات:</span>
                            <span className="font-medium">{analysisResult?.video?.likes?.toLocaleString() || '0'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* تحليل صاحب الصفحة */}
                    <Card className="border-green-200">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          تحليل صاحب الصفحة
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">اسم المستخدم:</span>
                            <span className="font-medium">{analysisResult?.profile?.username || 'غير متوفر'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">المتابعون:</span>
                            <span className="font-medium">{analysisResult?.profile?.followers?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">المتابعين:</span>
                            <span className="font-medium">{analysisResult?.profile?.following?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">إجمالي الفيديوهات:</span>
                            <span className="font-medium">{analysisResult?.profile?.totalVideos?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">معدل التفاعل:</span>
                            <span className="font-medium">{analysisResult?.profile?.engagementRate || '0'}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">تاريخ الانضمام:</span>
                            <span className="font-medium">{analysisResult?.profile?.joinDate || 'غير متوفر'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* معلومات إضافية */}
                  {analysisResult?.video?.hashtags && analysisResult.video.hashtags.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-800 mb-2">الهاشتاقات:</h5>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.video.hashtags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-blue-600">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <Button
                      onClick={() => {
                        const data = JSON.stringify(analysisResult, null, 2);
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `video-analysis-${Date.now()}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      variant="outline"
                      className="text-purple-600 border-purple-500"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      تحميل التقرير
                    </Button>
                    
                    <Button
                      onClick={() => setShowAnalysis(false)}
                      variant="outline"
                    >
                      إخفاء النتائج
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المواقع</p>
                  <p className="text-2xl font-bold text-blue-600">{sites.length}</p>
                </div>
                <Globe className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">المواقع النشطة</p>
                  <p className="text-2xl font-bold text-green-600">
                    {sites.filter(s => s.enabled).length}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">النشر المجاني</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {sites.filter(s => s.freePublishingEnabled).length}
                  </p>
                </div>
                <Star className="h-6 w-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">للمستخدمين</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {sites.filter(s => s.userType === 'user' || s.userType === 'both').length}
                  </p>
                </div>
                <Users className="h-6 w-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">للمدير فقط</p>
                  <p className="text-2xl font-bold text-red-600">
                    {sites.filter(s => s.userType === 'admin').length}
                  </p>
                </div>
                <Shield className="h-6 w-6 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* شريط البحث والمرشحات */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في المواقع..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="نوع المستخدم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المستخدمين</SelectItem>
                    <SelectItem value="admin">المدير فقط</SelectItem>
                    <SelectItem value="user">المستخدم فقط</SelectItem>
                    <SelectItem value="both">المدير والمستخدم</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                    <SelectItem value="maintenance">صيانة</SelectItem>
                    <SelectItem value="blocked">محظور</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* شريط التحكم الجماعي */}
        {selectedSites.length > 0 && (
          <Card className="mb-6 border-blue-500 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600 text-white">
                    تم تحديد {selectedSites.length} موقع
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={deselectAllSites}
                    className="text-sm"
                  >
                    إلغاء التحديد
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">إجراء جماعي:</span>
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="اختر الإجراء" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enable">تفعيل جميع المواقع المحددة</SelectItem>
                      <SelectItem value="disable">إلغاء تفعيل المواقع المحددة</SelectItem>
                      <SelectItem value="enableFree">تفعيل النشر المجاني</SelectItem>
                      <SelectItem value="disableFree">إلغاء النشر المجاني</SelectItem>
                      <SelectItem value="setUserOnly">تحويل للمستخدم فقط</SelectItem>
                      <SelectItem value="setAdminOnly">تحويل للمدير فقط</SelectItem>
                      <SelectItem value="setBoth">تحويل للمدير والمستخدم</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {bulkAction && (
                    <Button 
                      onClick={executeBulkAction}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      تطبيق
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* أزرار التحديد السريع */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={selectAllSites}
                variant="outline"
                className="text-blue-600 border-blue-500"
              >
                تحديد الكل ({filteredSites.length})
              </Button>
              <Button 
                onClick={deselectAllSites}
                variant="outline"
              >
                إلغاء تحديد الكل
              </Button>
              <Button 
                onClick={() => {
                  const userSites = filteredSites.filter(site => site.userType === 'user' || site.userType === 'both');
                  setSelectedSites(userSites.map(site => site.id));
                }}
                variant="outline"
                className="text-green-600 border-green-500"
              >
                تحديد مواقع المستخدمين ({sites.filter(s => s.userType === 'user' || s.userType === 'both').length})
              </Button>
              <Button 
                onClick={() => {
                  const adminSites = filteredSites.filter(site => site.userType === 'admin');
                  setSelectedSites(adminSites.map(site => site.id));
                }}
                variant="outline"
                className="text-red-600 border-red-500"
              >
                تحديد مواقع المدير ({sites.filter(s => s.userType === 'admin').length})
              </Button>
              <Button 
                onClick={() => {
                  const freeSites = filteredSites.filter(site => site.freePublishingEnabled);
                  setSelectedSites(freeSites.map(site => site.id));
                }}
                variant="outline"
                className="text-purple-600 border-purple-500"
              >
                تحديد النشر المجاني ({sites.filter(s => s.freePublishingEnabled).length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* قائمة المواقع */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
            <Card 
              key={site.id} 
              className={`border-2 hover:shadow-lg transition-all duration-300 ${
                selectedSites.includes(site.id) ? 'border-blue-500 bg-blue-50' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedSites.includes(site.id)}
                      onChange={() => toggleSiteSelection(site.id)}
                      className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{site.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{site.url}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        <Badge variant="outline" className="text-xs">{site.category}</Badge>
                        {getPriorityBadge(site.priority)}
                      </div>
                      
                      <div className="mb-3">
                        <label className="text-xs font-medium text-gray-600 mb-1 block">نوع المستخدم:</label>
                        <Select
                          value={site.userType}
                          onValueChange={(value: 'admin' | 'user' | 'both') => updateUserType(site.id, value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">المدير فقط</SelectItem>
                            <SelectItem value="user">المستخدم فقط</SelectItem>
                            <SelectItem value="both">المدير والمستخدم</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">حالة الموقع:</label>
                      <Select
                        value={site.status}
                        onValueChange={(value: 'active' | 'inactive' | 'maintenance' | 'blocked') => updateSiteStatus(site.id, value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">نشط</SelectItem>
                          <SelectItem value="inactive">غير نشط</SelectItem>
                          <SelectItem value="maintenance">صيانة</SelectItem>
                          <SelectItem value="blocked">محظور</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {getStatusBadge(site.status)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">الدولة:</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{site.country}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">معدل النجاح:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${site.successRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{site.successRate}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">إجمالي المنشورات:</span>
                    <span className="text-sm font-medium">{site.totalPosts.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">حد المستخدم/يوم:</span>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={site.userControls.maxPostsPerDay}
                      onChange={(e) => updateMaxPostsPerDay(site.id, parseInt(e.target.value) || 1)}
                      className="w-16 h-8 text-center text-sm"
                    />
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">تفعيل الموقع:</span>
                      <Switch
                        checked={site.enabled}
                        onCheckedChange={(checked) => toggleSite(site.id, checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">النشر المجاني:</span>
                      <Switch
                        checked={site.freePublishingEnabled}
                        onCheckedChange={(checked) => toggleFreePublishing(site.id, checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">يتطلب موافقة:</span>
                      <Switch
                        checked={site.userControls.requiresApproval}
                        onCheckedChange={(checked) => toggleRequiresApproval(site.id, checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSites.length === 0 && (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد مواقع تطابق المرشحات المحددة</p>
          </div>
        )}
      </div>
    </div>
  );
}