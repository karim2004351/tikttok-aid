import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Hash, TrendingUp, Copy, CheckCircle, AlertCircle, Sparkles, Target, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HashtagSuggestion {
  hashtag: string;
  popularity: number;
  trend: 'rising' | 'stable' | 'declining';
  category: string;
  relatedTopics: string[];
  estimatedReach: number;
  competitiveness: 'low' | 'medium' | 'high';
  platforms: string[];
  language: 'ar' | 'en' | 'mixed';
}

interface HashtagAnalysis {
  videoContent: string;
  contentType: string;
  targetAudience: string;
  country: string;
  suggestedHashtags: HashtagSuggestion[];
  trendingNow: HashtagSuggestion[];
  nicheTags: HashtagSuggestion[];
  broadTags: HashtagSuggestion[];
  confidence: number;
  lastUpdated: string;
}

interface APIStatus {
  openai: boolean;
  rapidapi: boolean;
  twitter: boolean;
  summary: string;
}

export default function HashtagGenerator() {
  const [videoContent, setVideoContent] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('entertainment');
  const [selectedCountry, setSelectedCountry] = useState('SA');
  const [targetAudience, setTargetAudience] = useState('عام');
  const [analysis, setAnalysis] = useState<HashtagAnalysis | null>(null);
  const [apiStatus, setApiStatus] = useState<APIStatus | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedHashtag, setCopiedHashtag] = useState<string | null>(null);
  const { toast } = useToast();

  const contentTypes = [
    { value: 'entertainment', label: 'ترفيهي', icon: '🎭' },
    { value: 'educational', label: 'تعليمي', icon: '📚' },
    { value: 'islamic', label: 'إسلامي', icon: '🕌' },
    { value: 'comedy', label: 'كوميدي', icon: '😂' },
    { value: 'dance', label: 'رقص', icon: '💃' },
    { value: 'music', label: 'موسيقى', icon: '🎵' },
    { value: 'food', label: 'طعام', icon: '🍔' },
    { value: 'sports', label: 'رياضة', icon: '⚽' },
    { value: 'beauty', label: 'جمال', icon: '💄' },
    { value: 'fashion', label: 'موضة', icon: '👗' },
    { value: 'travel', label: 'سفر', icon: '✈️' },
    { value: 'technology', label: 'تقنية', icon: '💻' },
    { value: 'health', label: 'صحة', icon: '🏥' },
    { value: 'business', label: 'أعمال', icon: '💼' },
    { value: 'art', label: 'فن', icon: '🎨' }
  ];

  const countries = [
    // الدول العربية
    { code: 'SA', name: 'السعودية', flag: '🇸🇦' },
    { code: 'AE', name: 'الإمارات', flag: '🇦🇪' },
    { code: 'EG', name: 'مصر', flag: '🇪🇬' },
    { code: 'MA', name: 'المغرب', flag: '🇲🇦' },
    { code: 'JO', name: 'الأردن', flag: '🇯🇴' },
    { code: 'LB', name: 'لبنان', flag: '🇱🇧' },
    { code: 'SY', name: 'سوريا', flag: '🇸🇾' },
    { code: 'IQ', name: 'العراق', flag: '🇮🇶' },
    { code: 'KW', name: 'الكويت', flag: '🇰🇼' },
    { code: 'QA', name: 'قطر', flag: '🇶🇦' },
    { code: 'BH', name: 'البحرين', flag: '🇧🇭' },
    { code: 'OM', name: 'عمان', flag: '🇴🇲' },
    { code: 'YE', name: 'اليمن', flag: '🇾🇪' },
    { code: 'DZ', name: 'الجزائر', flag: '🇩🇿' },
    { code: 'TN', name: 'تونس', flag: '🇹🇳' },
    { code: 'LY', name: 'ليبيا', flag: '🇱🇾' },
    { code: 'SD', name: 'السودان', flag: '🇸🇩' },
    { code: 'SO', name: 'الصومال', flag: '🇸🇴' },
    { code: 'DJ', name: 'جيبوتي', flag: '🇩🇯' },
    { code: 'KM', name: 'جزر القمر', flag: '🇰🇲' },
    { code: 'MR', name: 'موريتانيا', flag: '🇲🇷' },
    { code: 'PS', name: 'فلسطين', flag: '🇵🇸' },
    
    // أوروبا
    { code: 'UK', name: 'المملكة المتحدة', flag: '🇬🇧' },
    { code: 'FR', name: 'فرنسا', flag: '🇫🇷' },
    { code: 'DE', name: 'ألمانيا', flag: '🇩🇪' },
    { code: 'IT', name: 'إيطاليا', flag: '🇮🇹' },
    { code: 'ES', name: 'إسبانيا', flag: '🇪🇸' },
    { code: 'NL', name: 'هولندا', flag: '🇳🇱' },
    { code: 'BE', name: 'بلجيكا', flag: '🇧🇪' },
    { code: 'CH', name: 'سويسرا', flag: '🇨🇭' },
    { code: 'AT', name: 'النمسا', flag: '🇦🇹' },
    { code: 'SE', name: 'السويد', flag: '🇸🇪' },
    { code: 'NO', name: 'النرويج', flag: '🇳🇴' },
    { code: 'DK', name: 'الدنمارك', flag: '🇩🇰' },
    { code: 'FI', name: 'فنلندا', flag: '🇫🇮' },
    { code: 'PL', name: 'بولندا', flag: '🇵🇱' },
    { code: 'CZ', name: 'التشيك', flag: '🇨🇿' },
    { code: 'HU', name: 'المجر', flag: '🇭🇺' },
    { code: 'RO', name: 'رومانيا', flag: '🇷🇴' },
    { code: 'BG', name: 'بلغاريا', flag: '🇧🇬' },
    { code: 'GR', name: 'اليونان', flag: '🇬🇷' },
    { code: 'PT', name: 'البرتغال', flag: '🇵🇹' },
    { code: 'IE', name: 'أيرلندا', flag: '🇮🇪' },
    { code: 'HR', name: 'كرواتيا', flag: '🇭🇷' },
    { code: 'SI', name: 'سلوفينيا', flag: '🇸🇮' },
    { code: 'SK', name: 'سلوفاكيا', flag: '🇸🇰' },
    { code: 'EE', name: 'إستونيا', flag: '🇪🇪' },
    { code: 'LV', name: 'لاتفيا', flag: '🇱🇻' },
    { code: 'LT', name: 'ليتوانيا', flag: '🇱🇹' },
    { code: 'LU', name: 'لوكسمبورغ', flag: '🇱🇺' },
    { code: 'MT', name: 'مالطا', flag: '🇲🇹' },
    { code: 'CY', name: 'قبرص', flag: '🇨🇾' },
    
    // آسيا
    { code: 'CN', name: 'الصين', flag: '🇨🇳' },
    { code: 'JP', name: 'اليابان', flag: '🇯🇵' },
    { code: 'KR', name: 'كوريا الجنوبية', flag: '🇰🇷' },
    { code: 'IN', name: 'الهند', flag: '🇮🇳' },
    { code: 'ID', name: 'إندونيسيا', flag: '🇮🇩' },
    { code: 'MY', name: 'ماليزيا', flag: '🇲🇾' },
    { code: 'SG', name: 'سنغافورة', flag: '🇸🇬' },
    { code: 'TH', name: 'تايلاند', flag: '🇹🇭' },
    { code: 'VN', name: 'فيتنام', flag: '🇻🇳' },
    { code: 'PH', name: 'الفلبين', flag: '🇵🇭' },
    { code: 'BD', name: 'بنغلاديش', flag: '🇧🇩' },
    { code: 'PK', name: 'باكستان', flag: '🇵🇰' },
    { code: 'LK', name: 'سريلانكا', flag: '🇱🇰' },
    { code: 'MM', name: 'ميانمار', flag: '🇲🇲' },
    { code: 'KH', name: 'كمبوديا', flag: '🇰🇭' },
    { code: 'LA', name: 'لاوس', flag: '🇱🇦' },
    { code: 'NP', name: 'نيبال', flag: '🇳🇵' },
    { code: 'BT', name: 'بوتان', flag: '🇧🇹' },
    { code: 'MN', name: 'منغوليا', flag: '🇲🇳' },
    { code: 'KZ', name: 'كازاخستان', flag: '🇰🇿' },
    { code: 'UZ', name: 'أوزبكستان', flag: '🇺🇿' },
    { code: 'TM', name: 'تركمانستان', flag: '🇹🇲' },
    { code: 'KG', name: 'قيرغيزستان', flag: '🇰🇬' },
    { code: 'TJ', name: 'طاجيكستان', flag: '🇹🇯' },
    { code: 'AF', name: 'أفغانستان', flag: '🇦🇫' },
    { code: 'IR', name: 'إيران', flag: '🇮🇷' },
    { code: 'TR', name: 'تركيا', flag: '🇹🇷' },
    { code: 'IL', name: 'إسرائيل', flag: '🇮🇱' },
    { code: 'GE', name: 'جورجيا', flag: '🇬🇪' },
    { code: 'AM', name: 'أرمينيا', flag: '🇦🇲' },
    { code: 'AZ', name: 'أذربيجان', flag: '🇦🇿' },
    
    // أمريكا الشمالية
    { code: 'US', name: 'الولايات المتحدة', flag: '🇺🇸' },
    { code: 'CA', name: 'كندا', flag: '🇨🇦' },
    { code: 'MX', name: 'المكسيك', flag: '🇲🇽' },
    
    // أمريكا الجنوبية
    { code: 'BR', name: 'البرازيل', flag: '🇧🇷' },
    { code: 'AR', name: 'الأرجنتين', flag: '🇦🇷' },
    { code: 'CL', name: 'تشيلي', flag: '🇨🇱' },
    { code: 'PE', name: 'بيرو', flag: '🇵🇪' },
    { code: 'CO', name: 'كولومبيا', flag: '🇨🇴' },
    { code: 'VE', name: 'فنزويلا', flag: '🇻🇪' },
    { code: 'EC', name: 'الإكوادور', flag: '🇪🇨' },
    { code: 'BO', name: 'بوليفيا', flag: '🇧🇴' },
    { code: 'PY', name: 'باراغواي', flag: '🇵🇾' },
    { code: 'UY', name: 'أوروغواي', flag: '🇺🇾' },
    { code: 'GY', name: 'غيانا', flag: '🇬🇾' },
    { code: 'SR', name: 'سورينام', flag: '🇸🇷' },
    
    // أفريقيا
    { code: 'ZA', name: 'جنوب أفريقيا', flag: '🇿🇦' },
    { code: 'NG', name: 'نيجيريا', flag: '🇳🇬' },
    { code: 'KE', name: 'كينيا', flag: '🇰🇪' },
    { code: 'GH', name: 'غانا', flag: '🇬🇭' },
    { code: 'ET', name: 'إثيوبيا', flag: '🇪🇹' },
    { code: 'TZ', name: 'تنزانيا', flag: '🇹🇿' },
    { code: 'UG', name: 'أوغندا', flag: '🇺🇬' },
    { code: 'RW', name: 'رواندا', flag: '🇷🇼' },
    { code: 'MW', name: 'مالاوي', flag: '🇲🇼' },
    { code: 'ZM', name: 'زامبيا', flag: '🇿🇲' },
    { code: 'ZW', name: 'زيمبابوي', flag: '🇿🇼' },
    { code: 'BW', name: 'بوتسوانا', flag: '🇧🇼' },
    { code: 'NA', name: 'ناميبيا', flag: '🇳🇦' },
    { code: 'SZ', name: 'إسواتيني', flag: '🇸🇿' },
    { code: 'LS', name: 'ليسوتو', flag: '🇱🇸' },
    { code: 'MZ', name: 'موزمبيق', flag: '🇲🇿' },
    { code: 'MG', name: 'مدغشقر', flag: '🇲🇬' },
    { code: 'MU', name: 'موريشيوس', flag: '🇲🇺' },
    { code: 'SC', name: 'سيشل', flag: '🇸🇨' },
    
    // أوقيانوسيا
    { code: 'AU', name: 'أستراليا', flag: '🇦🇺' },
    { code: 'NZ', name: 'نيوزيلندا', flag: '🇳🇿' },
    { code: 'FJ', name: 'فيجي', flag: '🇫🇯' },
    { code: 'PG', name: 'بابوا غينيا الجديدة', flag: '🇵🇬' },
    { code: 'SB', name: 'جزر سليمان', flag: '🇸🇧' },
    { code: 'VU', name: 'فانواتو', flag: '🇻🇺' },
    { code: 'NC', name: 'كاليدونيا الجديدة', flag: '🇳🇨' },
    { code: 'PF', name: 'بولينيزيا الفرنسية', flag: '🇵🇫' }
  ];

  useEffect(() => {
    fetchAPIStatus();
  }, []);

  const fetchAPIStatus = async () => {
    try {
      const response = await fetch('/api/hashtags/status');
      const result = await response.json();
      
      if (result.success) {
        setApiStatus(result.data);
      }
    } catch (error) {
      console.error('Error fetching API status:', error);
    }
  };

  const generateHashtags = async () => {
    if (!videoContent.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال وصف للمحتوى",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/hashtags/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoContent,
          contentType: selectedContentType,
          targetAudience,
          country: selectedCountry
        })
      });

      const result = await response.json();

      if (result.success) {
        setAnalysis(result.data);
        toast({
          title: "تم التوليد بنجاح",
          description: `تم توليد ${result.data.suggestedHashtags.length} هاشتاغ مقترح`,
        });
      } else {
        toast({
          title: "خطأ في التوليد",
          description: result.message || "فشل في توليد الهاشتاغات",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر الوصول لخدمة توليد الهاشتاغات",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyHashtag = async (hashtag: string) => {
    try {
      await navigator.clipboard.writeText(hashtag);
      setCopiedHashtag(hashtag);
      setTimeout(() => setCopiedHashtag(null), 2000);
      toast({
        title: "تم النسخ",
        description: `تم نسخ ${hashtag}`,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في نسخ الهاشتاغ",
        variant: "destructive",
      });
    }
  };

  const copyAllHashtags = async (hashtags: HashtagSuggestion[]) => {
    const hashtagText = hashtags.map(h => h.hashtag).join(' ');
    try {
      await navigator.clipboard.writeText(hashtagText);
      toast({
        title: "تم النسخ",
        description: `تم نسخ ${hashtags.length} هاشتاغ`,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في نسخ الهاشتاغات",
        variant: "destructive",
      });
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'stable': return <div className="h-4 w-4 bg-yellow-400 rounded-full" />;
      case 'declining': return <div className="h-4 w-4 bg-red-400 rounded-full" />;
      default: return null;
    }
  };

  const getCompetitivenessColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'high': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const formatReach = (reach: number) => {
    if (reach >= 1000000) return `${(reach / 1000000).toFixed(1)}M`;
    if (reach >= 1000) return `${(reach / 1000).toFixed(1)}K`;
    return reach.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            🏷️ مولد الهاشتاغات الذكي
          </h1>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg px-2">
            توليد هاشتاغات مخصصة وترندات حقيقية لزيادة انتشار المحتوى
          </p>
        </div>

        {/* API Status */}
        {apiStatus && (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                حالة خدمات الذكاء الاصطناعي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  {apiStatus.openai ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className="text-sm">OpenAI GPT-4</span>
                </div>
                <div className="flex items-center gap-2">
                  {apiStatus.rapidapi ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className="text-sm">RapidAPI TikTok</span>
                </div>
                <div className="flex items-center gap-2">
                  {apiStatus.twitter ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className="text-sm">Twitter Trends</span>
                </div>
                <div className="text-sm text-gray-400">
                  {apiStatus.summary}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Input Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                  <Hash className="h-4 w-4 sm:h-5 sm:w-5" />
                  وصف المحتوى
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Textarea
                  placeholder="اكتب وصفاً تفصيلياً للمحتوى الذي تريد إنشاء هاشتاغات له..."
                  value={videoContent}
                  onChange={(e) => setVideoContent(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white min-h-[100px] sm:min-h-[120px] resize-none text-sm sm:text-base"
                  maxLength={500}
                />
                <div className="text-xs text-gray-400 mt-2">
                  {videoContent.length}/500 حرف
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  نوع المحتوى
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedContentType} onValueChange={setSelectedContentType}>
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
                  <Globe className="h-5 w-5" />
                  الدولة المستهدفة
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

            <Button 
              onClick={generateHashtags}
              disabled={isGenerating || !videoContent.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  جاري التوليد...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  توليد الهاشتاغات
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Confidence Score */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>مؤشر الدقة</span>
                  <Badge className={`${analysis.confidence >= 80 ? 'bg-green-600' : analysis.confidence >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}>
                    {Math.round(analysis.confidence)}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full ${analysis.confidence >= 80 ? 'bg-green-400' : analysis.confidence >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                    style={{ width: `${analysis.confidence}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400">
                  آخر تحديث: {new Date(analysis.lastUpdated).toLocaleString('ar-SA')}
                </p>
              </CardContent>
            </Card>

            {/* Suggested Hashtags */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>الهاشتاغات المقترحة</span>
                  <Button 
                    size="sm" 
                    onClick={() => copyAllHashtags(analysis.suggestedHashtags)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    نسخ الكل
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {analysis.suggestedHashtags.map((hashtag, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-3 sm:p-4 hover:bg-gray-600 transition-colors touch-manipulation">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-purple-400 font-semibold text-sm sm:text-base break-all">
                          {hashtag.hashtag}
                        </span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => copyHashtag(hashtag.hashtag)}
                          className="h-8 w-8 sm:h-6 sm:w-6 p-0 flex-shrink-0 touch-manipulation"
                        >
                          {copiedHashtag === hashtag.hashtag ? (
                            <CheckCircle className="h-4 w-4 sm:h-3 sm:w-3 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4 sm:h-3 sm:w-3" />
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {getTrendIcon(hashtag.trend)}
                        <span className="text-xs text-gray-400">{hashtag.trend}</span>
                        <Badge className={`text-xs ${getCompetitivenessColor(hashtag.competitiveness)}`}>
                          {hashtag.competitiveness}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-400 space-y-1">
                        <div>شعبية: {Math.round(hashtag.popularity)}%</div>
                        <div>وصول متوقع: {formatReach(hashtag.estimatedReach)}</div>
                        <div className="break-words">منصات: {hashtag.platforms.join(', ')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Now */}
            {analysis.trendingNow.length > 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    الرائج الآن
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.trendingNow.map((hashtag, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => copyHashtag(hashtag.hashtag)}
                        className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 touch-manipulation"
                      >
                        <span className="truncate max-w-[120px] sm:max-w-none">{hashtag.hashtag}</span>
                        <TrendingUp className="h-3 w-3 ml-1 flex-shrink-0" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Niche and Broad Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {analysis.nicheTags.length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="text-white text-lg sm:text-xl">هاشتاغات متخصصة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysis.nicheTags.map((hashtag, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => copyHashtag(hashtag.hashtag)}
                          className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 touch-manipulation"
                        >
                          <span className="truncate max-w-[120px] sm:max-w-none">{hashtag.hashtag}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysis.broadTags.length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">هاشتاغات عامة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysis.broadTags.map((hashtag, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => copyHashtag(hashtag.hashtag)}
                          className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
                        >
                          {hashtag.hashtag}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* No Data State */}
        {!analysis && (
          <Card className="bg-gray-800 border-gray-700 text-center py-12">
            <CardContent>
              <Hash className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                ابدأ بتوليد الهاشتاغات
              </h3>
              <p className="text-gray-400 mb-6">
                اكتب وصفاً للمحتوى واختر النوع والدولة للحصول على هاشتاغات مخصصة
              </p>
              <div className="text-sm text-gray-500">
                النظام يستخدم الذكاء الاصطناعي وبيانات الترندات الحقيقية
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}