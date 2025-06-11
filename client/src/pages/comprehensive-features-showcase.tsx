import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PlayfulLoadingMascot } from '@/components/playful-loading-mascot';
import { OneClickAccessibilityMode } from '@/components/one-click-accessibility-mode';
import { InteractiveAchievementTimeline } from '@/components/interactive-achievement-timeline';
import { PersonalizedContentMoodTracker } from '@/components/personalized-content-mood-tracker';
import { 
  Sparkles, 
  Accessibility, 
  Trophy, 
  Heart, 
  Clock, 
  Palette,
  Volume2,
  Share2,
  TrendingUp,
  Users,
  Target,
  Zap,
  Brain,
  Settings
} from 'lucide-react';

export default function ComprehensiveFeaturesShowcase() {
  const [activeDemo, setActiveDemo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeRecommendations, setTimeRecommendations] = useState<any[]>([]);

  const features = [
    {
      id: 'loading-mascot',
      title: 'رسوم التحميل المرحة',
      description: 'تميمة لطيفة تجعل انتظار التحميل ممتعاً',
      icon: Sparkles,
      color: 'bg-yellow-500',
      category: 'تجربة المستخدم'
    },
    {
      id: 'accessibility-mode',
      title: 'وضع إمكانية الوصول',
      description: 'تفعيل شامل لميزات إمكانية الوصول بنقرة واحدة',
      icon: Accessibility,
      color: 'bg-blue-500',
      category: 'إمكانية الوصول'
    },
    {
      id: 'achievement-timeline',
      title: 'جدول الإنجازات التفاعلي',
      description: 'متابعة تفاعلية لتقدمك وإنجازاتك',
      icon: Trophy,
      color: 'bg-purple-500',
      category: 'التحفيز'
    },
    {
      id: 'mood-tracker',
      title: 'متتبع المزاج الشخصي',
      description: 'تتبع مزاجك وربطه بأداء المحتوى',
      icon: Heart,
      color: 'bg-pink-500',
      category: 'ذكاء اصطناعي'
    },
    {
      id: 'time-recommender',
      title: 'موصي المحتوى الذكي',
      description: 'توصيات محتوى مخصصة حسب وقت اليوم',
      icon: Clock,
      color: 'bg-green-500',
      category: 'ذكاء اصطناعي'
    }
  ];

  useEffect(() => {
    loadTimeRecommendations();
  }, []);

  const loadTimeRecommendations = async () => {
    try {
      const userProfile = {
        timezone: 'Asia/Riyadh',
        workingHours: { start: '09:00', end: '17:00' },
        preferredLanguage: 'ar',
        culturalRegion: 'arabic',
        contentPreferences: ['تكنولوجيا', 'تعليم', 'ترفيه'],
        engagementHistory: [
          {
            timeSlot: 'المساء المبكر',
            platform: 'tiktok',
            engagementRate: 0.8,
            contentType: 'video',
            timestamp: new Date()
          }
        ]
      };

      const response = await fetch('/api/smart-time-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile })
      });

      const data = await response.json();
      if (data.success) {
        setTimeRecommendations(data.data);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const demoLoadingMascot = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  const getFeaturesByCategory = () => {
    const categories = features.reduce((acc, feature) => {
      if (!acc[feature.category]) {
        acc[feature.category] = [];
      }
      acc[feature.category].push(feature);
      return acc;
    }, {} as Record<string, typeof features>);
    
    return categories;
  };

  const getCurrentTimeSlot = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 9) return 'الصباح الباكر';
    if (hour >= 9 && hour < 12) return 'ساعات العمل الصباحية';
    if (hour >= 12 && hour < 14) return 'وقت الغداء';
    if (hour >= 14 && hour < 17) return 'بعد الظهر';
    if (hour >= 17 && hour < 20) return 'المساء المبكر';
    if (hour >= 20 && hour < 23) return 'المساء المتأخر';
    return 'الليل المتأخر';
  };

  return (
    <div className="container mx-auto p-6 space-y-8" dir="rtl">
      {/* رسوم التحميل المرحة */}
      <PlayfulLoadingMascot 
        isLoading={isLoading}
        loadingText="جار عرض الميزات الجديدة..."
        mascotType="wizard"
        size="large"
      />

      {/* وضع إمكانية الوصول */}
      <OneClickAccessibilityMode />

      {/* العنوان الرئيسي */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          عرض شامل للميزات المتطورة
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          استكشف أحدث الميزات المطورة التي تجعل تجربتك أكثر تفاعلاً وذكاءً
        </p>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{features.length}</p>
            <p className="text-sm text-gray-600">ميزات جديدة</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <Brain className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">AI</p>
            <p className="text-sm text-gray-600">ذكاء اصطناعي</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">100%</p>
            <p className="text-sm text-gray-600">تخصيص</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{getCurrentTimeSlot()}</p>
            <p className="text-sm text-gray-600">التوقيت الحالي</p>
          </CardContent>
        </Card>
      </div>

      {/* عرض الميزات */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="interactive">تفاعلي</TabsTrigger>
          <TabsTrigger value="ai-powered">ذكاء اصطناعي</TabsTrigger>
          <TabsTrigger value="live-demo">عرض مباشر</TabsTrigger>
        </TabsList>

        {/* نظرة عامة */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center`}>
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <Badge variant="outline">{feature.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {feature.description}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveDemo(feature.id)}
                    className="w-full"
                  >
                    تجربة الميزة
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* التفاعلي */}
        <TabsContent value="interactive" className="space-y-6">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  رسوم التحميل المرحة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  تميمة لطيفة تظهر أثناء التحميل مع رسوم متحركة مرحة ونصوص تفاعلية
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['robot', 'cat', 'rocket', 'wizard'].map((type) => (
                    <Button 
                      key={type}
                      variant="outline"
                      onClick={demoLoadingMascot}
                      className="h-20 flex flex-col items-center gap-2"
                    >
                      <Sparkles className="h-6 w-6" />
                      <span className="text-xs">{type}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  جدول الإنجازات التفاعلي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InteractiveAchievementTimeline />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ذكاء اصطناعي */}
        <TabsContent value="ai-powered" className="space-y-6">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  متتبع المزاج الشخصي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PersonalizedContentMoodTracker />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  توصيات المحتوى الذكي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  توصيات محتوى مخصصة حسب الوقت الحالي والجمهور المستهدف
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {timeRecommendations.slice(0, 4).map((rec, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{rec.title}</h4>
                          <p className="text-sm text-gray-600">{rec.platform}</p>
                        </div>
                        <Badge className={rec.urgencyLevel === 'high' ? 'bg-red-500' : 'bg-blue-500'}>
                          {rec.timeSlot?.name}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">تفاعل متوقع</span>
                        <span className="font-semibold">{rec.expectedEngagement}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* عرض مباشر */}
        <TabsContent value="live-demo" className="space-y-6">
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold">عرض مباشر للميزات</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6">
                <h4 className="font-semibold mb-4">اختبار رسوم التحميل</h4>
                <Button 
                  onClick={demoLoadingMascot}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'جار التحميل...' : 'بدء العرض'}
                </Button>
              </Card>

              <Card className="p-6">
                <h4 className="font-semibold mb-4">معلومات الوقت الحالي</h4>
                <div className="space-y-2">
                  <p><strong>الفترة:</strong> {getCurrentTimeSlot()}</p>
                  <p><strong>الوقت:</strong> {new Date().toLocaleTimeString('en-US')}</p>
                  <p><strong>أفضل منصة:</strong> {timeRecommendations[0]?.platform || 'تحميل...'}</p>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h4 className="font-semibold mb-4">الميزات المتاحة</h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {Object.entries(getFeaturesByCategory()).map(([category, categoryFeatures]) => (
                  <Badge key={category} variant="outline" className="px-3 py-1">
                    {category}: {categoryFeatures.length}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* قسم المعلومات التقنية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            معلومات تقنية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">التقنيات المستخدمة</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• React + TypeScript</li>
                <li>• Framer Motion للحركة</li>
                <li>• AI للتوصيات الذكية</li>
                <li>• تصميم متجاوب</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">إمكانية الوصول</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• دعم قارئ الشاشة</li>
                <li>• تباين عالي</li>
                <li>• تحكم بالكيبورد</li>
                <li>• خطوط قابلة للتكبير</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">الأداء</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• تحميل سريع</li>
                <li>• ذاكرة محسنة</li>
                <li>• تفاعل سلس</li>
                <li>• استجابة فورية</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}