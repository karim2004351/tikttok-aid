import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Globe, Video, TrendingUp, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OptimalTime {
  hour: number;
  minute: number;
  day: string;
  score: number;
  reason: string;
}

interface OptimalPostingData {
  country: string;
  contentType: string;
  optimalTimes: OptimalTime[];
  dataAccuracy: number;
  lastAnalyzed: string;
}

interface TrafficAnalyticsStatus {
  cloudflare: boolean;
  similarweb: boolean;
  semrush: boolean;
  summary: string;
}

export default function RealOptimalPostingTime() {
  const [selectedCountry, setSelectedCountry] = useState('SA');
  const [selectedContent, setSelectedContent] = useState('entertainment');
  const [optimalData, setOptimalData] = useState<OptimalPostingData | null>(null);
  const [analyticsStatus, setAnalyticsStatus] = useState<TrafficAnalyticsStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const countries = [
    // البلدان العربية
    { code: 'SA', name: 'السعودية', flag: '🇸🇦' },
    { code: 'AE', name: 'الإمارات', flag: '🇦🇪' },
    { code: 'EG', name: 'مصر', flag: '🇪🇬' },
    { code: 'MA', name: 'المغرب', flag: '🇲🇦' },
    { code: 'DZ', name: 'الجزائر', flag: '🇩🇿' },
    { code: 'TN', name: 'تونس', flag: '🇹🇳' },
    { code: 'JO', name: 'الأردن', flag: '🇯🇴' },
    { code: 'LB', name: 'لبنان', flag: '🇱🇧' },
    { code: 'KW', name: 'الكويت', flag: '🇰🇼' },
    { code: 'QA', name: 'قطر', flag: '🇶🇦' },
    { code: 'BH', name: 'البحرين', flag: '🇧🇭' },
    { code: 'OM', name: 'عُمان', flag: '🇴🇲' },
    { code: 'IQ', name: 'العراق', flag: '🇮🇶' },
    { code: 'YE', name: 'اليمن', flag: '🇾🇪' },
    { code: 'SY', name: 'سوريا', flag: '🇸🇾' },
    { code: 'PS', name: 'فلسطين', flag: '🇵🇸' },
    { code: 'LY', name: 'ليبيا', flag: '🇱🇾' },
    { code: 'SD', name: 'السودان', flag: '🇸🇩' },
    { code: 'SO', name: 'الصومال', flag: '🇸🇴' },
    { code: 'DJ', name: 'جيبوتي', flag: '🇩🇯' },
    { code: 'KM', name: 'جزر القمر', flag: '🇰🇲' },
    { code: 'MR', name: 'موريتانيا', flag: '🇲🇷' },
    
    // أمريكا الشمالية
    { code: 'US', name: 'الولايات المتحدة', flag: '🇺🇸' },
    { code: 'CA', name: 'كندا', flag: '🇨🇦' },
    { code: 'MX', name: 'المكسيك', flag: '🇲🇽' },
    
    // أوروبا
    { code: 'UK', name: 'المملكة المتحدة', flag: '🇬🇧' },
    { code: 'FR', name: 'فرنسا', flag: '🇫🇷' },
    { code: 'DE', name: 'ألمانيا', flag: '🇩🇪' },
    { code: 'ES', name: 'إسبانيا', flag: '🇪🇸' },
    { code: 'IT', name: 'إيطاليا', flag: '🇮🇹' },
    { code: 'NL', name: 'هولندا', flag: '🇳🇱' },
    { code: 'CH', name: 'سويسرا', flag: '🇨🇭' },
    { code: 'AT', name: 'النمسا', flag: '🇦🇹' },
    { code: 'BE', name: 'بلجيكا', flag: '🇧🇪' },
    { code: 'SE', name: 'السويد', flag: '🇸🇪' },
    { code: 'NO', name: 'النرويج', flag: '🇳🇴' },
    { code: 'DK', name: 'الدنمارك', flag: '🇩🇰' },
    { code: 'FI', name: 'فنلندا', flag: '🇫🇮' },
    { code: 'PL', name: 'بولندا', flag: '🇵🇱' },
    { code: 'CZ', name: 'التشيك', flag: '🇨🇿' },
    { code: 'HU', name: 'المجر', flag: '🇭🇺' },
    { code: 'GR', name: 'اليونان', flag: '🇬🇷' },
    { code: 'PT', name: 'البرتغال', flag: '🇵🇹' },
    { code: 'IE', name: 'أيرلندا', flag: '🇮🇪' },
    { code: 'RU', name: 'روسيا', flag: '🇷🇺' },
    { code: 'TR', name: 'تركيا', flag: '🇹🇷' },
    
    // آسيا
    { code: 'JP', name: 'اليابان', flag: '🇯🇵' },
    { code: 'KR', name: 'كوريا الجنوبية', flag: '🇰🇷' },
    { code: 'CN', name: 'الصين', flag: '🇨🇳' },
    { code: 'IN', name: 'الهند', flag: '🇮🇳' },
    { code: 'ID', name: 'إندونيسيا', flag: '🇮🇩' },
    { code: 'TH', name: 'تايلاند', flag: '🇹🇭' },
    { code: 'VN', name: 'فيتنام', flag: '🇻🇳' },
    { code: 'MY', name: 'ماليزيا', flag: '🇲🇾' },
    { code: 'SG', name: 'سنغافورة', flag: '🇸🇬' },
    { code: 'PH', name: 'الفلبين', flag: '🇵🇭' },
    { code: 'PK', name: 'باكستان', flag: '🇵🇰' },
    { code: 'BD', name: 'بنغلاديش', flag: '🇧🇩' },
    { code: 'IR', name: 'إيران', flag: '🇮🇷' },
    { code: 'IL', name: 'إسرائيل', flag: '🇮🇱' },
    
    // أوقيانوسيا
    { code: 'AU', name: 'أستراليا', flag: '🇦🇺' },
    { code: 'NZ', name: 'نيوزيلندا', flag: '🇳🇿' },
    
    // أمريكا الجنوبية
    { code: 'BR', name: 'البرازيل', flag: '🇧🇷' },
    { code: 'AR', name: 'الأرجنتين', flag: '🇦🇷' },
    { code: 'CL', name: 'تشيلي', flag: '🇨🇱' },
    { code: 'PE', name: 'بيرو', flag: '🇵🇪' },
    { code: 'CO', name: 'كولومبيا', flag: '🇨🇴' },
    { code: 'VE', name: 'فنزويلا', flag: '🇻🇪' },
    { code: 'UY', name: 'أوروغواي', flag: '🇺🇾' },
    
    // أفريقيا
    { code: 'ZA', name: 'جنوب أفريقيا', flag: '🇿🇦' },
    { code: 'NG', name: 'نيجيريا', flag: '🇳🇬' },
    { code: 'KE', name: 'كينيا', flag: '🇰🇪' },
    { code: 'ET', name: 'إثيوبيا', flag: '🇪🇹' },
    { code: 'GH', name: 'غانا', flag: '🇬🇭' },
    { code: 'TZ', name: 'تنزانيا', flag: '🇹🇿' },
    { code: 'UG', name: 'أوغندا', flag: '🇺🇬' }
  ];

  const contentTypes = [
    { value: 'entertainment', label: 'ترفيهي', icon: '🎭' },
    { value: 'educational', label: 'تعليمي', icon: '📚' },
    { value: 'business', label: 'أعمال', icon: '💼' },
    { value: 'lifestyle', label: 'أسلوب حياة', icon: '🌟' },
    { value: 'music', label: 'موسيقى', icon: '🎵' },
    { value: 'comedy', label: 'كوميدي', icon: '😂' },
    { value: 'dance', label: 'رقص', icon: '💃' },
    { value: 'sports', label: 'رياضة', icon: '⚽' },
    { value: 'gaming', label: 'ألعاب', icon: '🎮' },
    { value: 'food', label: 'طعام', icon: '🍔' },
    { value: 'travel', label: 'سفر', icon: '✈️' },
    { value: 'fashion', label: 'موضة', icon: '👗' },
    { value: 'beauty', label: 'جمال', icon: '💄' },
    { value: 'technology', label: 'تقنية', icon: '💻' },
    { value: 'health', label: 'صحة', icon: '🏥' },
    { value: 'news', label: 'أخبار', icon: '📰' },
    { value: 'pets', label: 'حيوانات', icon: '🐱' },
    { value: 'art', label: 'فن', icon: '🎨' },
    { value: 'science', label: 'علوم', icon: '🔬' },
    { value: 'motivation', label: 'تحفيزي', icon: '🚀' }
  ];

  useEffect(() => {
    fetchAnalyticsStatus();
  }, []);

  const fetchAnalyticsStatus = async () => {
    try {
      const response = await fetch('/api/traffic-analytics/status');
      const result = await response.json();
      
      if (result.success) {
        setAnalyticsStatus(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics status:', error);
    }
  };

  const analyzeOptimalTimes = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/traffic-analytics/optimal-times', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          countryCode: selectedCountry,
          contentType: selectedContent
        })
      });

      const result = await response.json();

      if (result.success) {
        setOptimalData(result.data);
        toast({
          title: "تم تحليل البيانات",
          description: `تم الحصول على الأوقات المثلى للنشر في ${result.data.country}`,
        });
      } else {
        toast({
          title: "خطأ في التحليل",
          description: result.message || "فشل في تحليل البيانات",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر الوصول لخدمات تحليل حركة المرور",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (hour: number, minute: number = 0) => {
    const period = hour >= 12 ? 'مساءً' : 'صباحًا';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const displayMinute = minute > 0 ? `:${minute.toString().padStart(2, '0')}` : '';
    return `${displayHour}${displayMinute} ${period}`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.8) return 'text-green-400';
    if (accuracy >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getAccuracyLabel = (accuracy: number) => {
    if (accuracy >= 0.8) return 'دقة عالية';
    if (accuracy >= 0.6) return 'دقة متوسطة';
    return 'دقة منخفضة';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            ⏰ الوقت المثالي للنشر - البيانات الحقيقية
          </h1>
          <p className="text-gray-300 text-lg">
            تحليل مبني على بيانات حركة المرور الحقيقية من Cloudflare و SimilarWeb و SEMrush
          </p>
        </div>

        {/* Analytics Status */}
        {analyticsStatus && (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                حالة خدمات التحليل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  {analyticsStatus.cloudflare ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className="text-sm">Cloudflare Radar</span>
                </div>
                <div className="flex items-center gap-2">
                  {analyticsStatus.similarweb ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className="text-sm">SimilarWeb</span>
                </div>
                <div className="flex items-center gap-2">
                  {analyticsStatus.semrush ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className="text-sm">SEMrush</span>
                </div>
                <div className="text-sm text-gray-400">
                  {analyticsStatus.summary}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="h-5 w-5" />
                اختر الدولة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code} className="text-white hover:bg-gray-600">
                      {country.flag} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Video className="h-5 w-5" />
                نوع المحتوى
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedContent} onValueChange={setSelectedContent}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {contentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-white hover:bg-gray-600">
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                تحليل البيانات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={analyzeOptimalTimes}
                disabled={isAnalyzing}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    جاري التحليل...
                  </>
                ) : (
                  'تحليل الأوقات المثلى'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {optimalData && (
          <div className="space-y-6">
            {/* Data Quality Indicator */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>جودة البيانات</span>
                  <Badge className={`${getAccuracyColor(optimalData.dataAccuracy)}`}>
                    {getAccuracyLabel(optimalData.dataAccuracy)} ({Math.round(optimalData.dataAccuracy * 100)}%)
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full ${optimalData.dataAccuracy >= 0.8 ? 'bg-green-400' : optimalData.dataAccuracy >= 0.6 ? 'bg-yellow-400' : 'bg-red-400'}`}
                    style={{ width: `${optimalData.dataAccuracy * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400">
                  آخر تحليل: {new Date(optimalData.lastAnalyzed).toLocaleString('ar-SA')}
                </p>
              </CardContent>
            </Card>

            {/* Optimal Times */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  أفضل الأوقات للنشر في {optimalData.country}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {optimalData.optimalTimes.map((time, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Clock className="h-5 w-5 text-purple-400" />
                        <Badge className="bg-purple-600">
                          المرتبة #{index + 1}
                        </Badge>
                      </div>
                      <div className="text-xl font-bold text-white mb-1">
                        {formatTime(time.hour, time.minute)}
                      </div>
                      <div className="text-sm text-purple-400 mb-2">
                        نقاط التفاعل: {Math.round(time.score)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {time.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Type Specific Tips */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  نصائح خاصة بنوع المحتوى
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedContent === 'entertainment' && (
                    <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-400 mb-2">المحتوى الترفيهي</h4>
                      <p className="text-sm text-gray-300">
                        أفضل أوقات النشر هي المساء والليل عندما يكون الجمهور في وقت فراغ ويبحث عن الترفيه.
                      </p>
                    </div>
                  )}
                  {selectedContent === 'educational' && (
                    <div className="bg-green-600/20 border border-green-500 rounded-lg p-4">
                      <h4 className="font-semibold text-green-400 mb-2">المحتوى التعليمي</h4>
                      <p className="text-sm text-gray-300">
                        أفضل أوقات النشر هي ساعات النهار عندما يكون الجمهور في حالة تركيز عالية.
                      </p>
                    </div>
                  )}
                  {selectedContent === 'business' && (
                    <div className="bg-yellow-600/20 border border-yellow-500 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-400 mb-2">محتوى الأعمال</h4>
                      <p className="text-sm text-gray-300">
                        أفضل أوقات النشر هي ساعات العمل عندما يكون المهنيون نشطين على المنصات.
                      </p>
                    </div>
                  )}
                  {selectedContent === 'lifestyle' && (
                    <div className="bg-purple-600/20 border border-purple-500 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-400 mb-2">أسلوب الحياة</h4>
                      <p className="text-sm text-gray-300">
                        أفضل أوقات النشر هي الصباح الباكر والمساء عندما يخطط الناس ليومهم أو يستعدون للراحة.
                      </p>
                    </div>
                  )}
                  {selectedContent === 'music' && (
                    <div className="bg-red-600/20 border border-red-500 rounded-lg p-4">
                      <h4 className="font-semibold text-red-400 mb-2">المحتوى الموسيقي</h4>
                      <p className="text-sm text-gray-300">
                        أفضل أوقات النشر هي بعد الظهر والمساء عندما يستمع الناس للموسيقى أثناء التنقل أو الاسترخاء.
                      </p>
                    </div>
                  )}
                  {selectedContent === 'comedy' && (
                    <div className="bg-yellow-600/20 border border-yellow-500 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-400 mb-2">المحتوى الكوميدي</h4>
                      <p className="text-sm text-gray-300">
                        أفضل أوقات النشر هي المساء والليل عندما يريد الناس الاسترخاء والضحك بعد يوم طويل.
                      </p>
                    </div>
                  )}
                  {selectedContent === 'dance' && (
                    <div className="bg-pink-600/20 border border-pink-500 rounded-lg p-4">
                      <h4 className="font-semibold text-pink-400 mb-2">محتوى الرقص</h4>
                      <p className="text-sm text-gray-300">
                        أفضل أوقات النشر هي المساء عندما يكون الناس نشطين ويستمعون للموسيقى.
                      </p>
                    </div>
                  )}
                  {selectedContent === 'sports' && (
                    <div className="bg-orange-600/20 border border-orange-500 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-400 mb-2">المحتوى الرياضي</h4>
                      <p className="text-sm text-gray-300">
                        أفضل أوقات النشر هي المساء وعطلة نهاية الأسبوع عندما يتابع الناس الرياضة.
                      </p>
                    </div>
                  )}
                  {selectedContent === 'gaming' && (
                    <div className="bg-indigo-600/20 border border-indigo-500 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-400 mb-2">محتوى الألعاب</h4>
                      <p className="text-sm text-gray-300">
                        أفضل أوقات النشر هي المساء والليل عندما يكون اللاعبون نشطين على الإنترنت.
                      </p>
                    </div>
                  )}
                  {selectedContent === 'food' && (
                    <div className="bg-red-600/20 border border-red-500 rounded-lg p-4">
                      <h4 className="font-semibold text-red-400 mb-2">محتوى الطعام</h4>
                      <p className="text-sm text-gray-300">
                        أفضل أوقات النشر هي قبل وجبات الطعام الرئيسية عندما يبحث الناس عن أفكار للطبخ.
                      </p>
                    </div>
                  )}
                  {selectedContent === 'travel' && (
                    <div className="bg-teal-600/20 border border-teal-500 rounded-lg p-4">
                      <h4 className="font-semibold text-teal-400 mb-2">محتوى السفر</h4>
                      <p className="text-sm text-gray-300">
                        أفضل أوقات النشر هي الصباح والمساء عندما يخطط الناس لرحلاتهم أو يحلمون بالسفر.
                      </p>
                    </div>
                  )}
                  {selectedContent === 'fashion' && (
                    <div className="bg-purple-600/20 border border-purple-500 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-400 mb-2">محتوى الموضة</h4>
                      <p className="text-sm text-gray-300">
                        أفضل أوقات النشر هي الصباح والمساء عندما يختار الناس ملابسهم أو يتصفحون الموضة.
                      </p>
                    </div>
                  )}
                  {selectedContent === 'beauty' && (
                    <div className="bg-pink-600/20 border border-pink-500 rounded-lg p-4">
                      <h4 className="font-semibold text-pink-400 mb-2">محتوى الجمال</h4>
                      <p className="text-sm text-gray-300">
                        أفضل أوقات النشر هي الصباح والمساء عندما يتجهز الناس أو يهتمون بروتين العناية.
                      </p>
                    </div>
                  )}
                  {selectedContent === 'technology' && (
                    <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-400 mb-2">المحتوى التقني</h4>
                      <p className="text-sm text-gray-300">
                        أفضل أوقات النشر هي ساعات العمل والمساء عندما يتابع المهتمون بالتقنية آخر الأخبار.
                      </p>
                    </div>
                  )}
                  {selectedContent === 'health' && (
                    <div className="bg-green-600/20 border border-green-500 rounded-lg p-4">
                      <h4 className="font-semibold text-green-400 mb-2">محتوى الصحة</h4>
                      <p className="text-sm text-gray-300">
                        أفضل أوقات النشر هي الصباح الباكر والمساء عندما يخطط الناس لروتينهم الصحي.
                      </p>
                    </div>
                  )}
                  {selectedContent === 'news' && (
                    <div className="bg-gray-600/20 border border-gray-500 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-400 mb-2">محتوى الأخبار</h4>
                      <p className="text-sm text-gray-300">
                        أفضل أوقات النشر هي الصباح والمساء عندما يتابع الناس الأخبار اليومية.
                      </p>
                    </div>
                  )}
                  {selectedContent === 'pets' && (
                    <div className="bg-yellow-600/20 border border-yellow-500 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-400 mb-2">محتوى الحيوانات</h4>
                      <p className="text-sm text-gray-300">
                        أفضل أوقات النشر هي الصباح والمساء عندما يكون أصحاب الحيوانات نشطين مع حيواناتهم.
                      </p>
                    </div>
                  )}
                  {selectedContent === 'art' && (
                    <div className="bg-purple-600/20 border border-purple-500 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-400 mb-2">المحتوى الفني</h4>
                      <p className="text-sm text-gray-300">
                        أفضل أوقات النشر هي بعد الظهر والمساء عندما يكون الناس في حالة إبداعية وتقدير الفن.
                      </p>
                    </div>
                  )}
                  {selectedContent === 'science' && (
                    <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-400 mb-2">المحتوى العلمي</h4>
                      <p className="text-sm text-gray-300">
                        أفضل أوقات النشر هي ساعات النهار والمساء عندما يكون المهتمون بالعلوم نشطين.
                      </p>
                    </div>
                  )}
                  {selectedContent === 'motivation' && (
                    <div className="bg-orange-600/20 border border-orange-500 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-400 mb-2">المحتوى التحفيزي</h4>
                      <p className="text-sm text-gray-300">
                        أفضل أوقات النشر هي الصباح الباكر والمساء عندما يحتاج الناس للإلهام والتحفيز.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Data State */}
        {!optimalData && (
          <Card className="bg-gray-800 border-gray-700 text-center py-12">
            <CardContent>
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                ابدأ تحليل البيانات
              </h3>
              <p className="text-gray-400 mb-6">
                اختر الدولة ونوع المحتوى ثم اضغط على "تحليل الأوقات المثلى" للحصول على بيانات حقيقية
              </p>
              <div className="text-sm text-gray-500">
                البيانات مستمدة من مصادر موثوقة: Cloudflare Radar، SimilarWeb، SEMrush
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}