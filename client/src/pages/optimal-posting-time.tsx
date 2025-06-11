import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Globe, Video, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
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

const postingData: PostingData = {
  sa: {
    funny: "8 مساءً - 11 مساءً",
    sad: "11 مساءً - 1 صباحًا", 
    educational: "1 ظهرًا - 4 عصرًا",
    challenge: "6 مساءً - 9 مساءً",
    motivational: "9 صباحًا - 12 ظهرًا"
  },
  eg: {
    funny: "7 مساءً - 10 مساءً",
    sad: "10 مساءً - 12 صباحًا",
    educational: "2 ظهرًا - 5 عصرًا",
    challenge: "5 مساءً - 8 مساءً",
    motivational: "10 صباحًا - 1 ظهرًا"
  },
  dz: {
    funny: "8 مساءً - 11 مساءً",
    sad: "11 مساءً - 1 صباحًا",
    educational: "1 ظهرًا - 3 عصرًا",
    challenge: "6 مساءً - 9 مساءً",
    motivational: "9 صباحًا - 12 ظهرًا"
  },
  ma: {
    funny: "7 مساءً - 10 مساءً",
    sad: "11 مساءً - 1 صباحًا",
    educational: "12 ظهرًا - 3 عصرًا",
    challenge: "6 مساءً - 9 مساءً",
    motivational: "10 صباحًا - 12 ظهرًا"
  },
  ae: {
    funny: "9 مساءً - 12 منتصف الليل",
    sad: "12 - 2 صباحًا",
    educational: "1 ظهرًا - 4 عصرًا",
    challenge: "7 مساءً - 10 مساءً",
    motivational: "8 صباحًا - 11 صباحًا"
  },
  us: {
    funny: "6 مساءً - 9 مساءً",
    sad: "10 مساءً - 12 صباحًا",
    educational: "12 ظهرًا - 3 عصرًا",
    challenge: "5 مساءً - 8 مساءً",
    motivational: "9 صباحًا - 11 صباحًا"
  },
  fr: {
    funny: "7 مساءً - 10 مساءً",
    sad: "10 مساءً - 1 صباحًا",
    educational: "1 ظهرًا - 4 عصرًا",
    challenge: "6 مساءً - 9 مساءً",
    motivational: "9 صباحًا - 12 ظهرًا"
  },
  de: {
    funny: "8 مساءً - 11 مساءً",
    sad: "11 مساءً - 1 صباحًا",
    educational: "2 ظهرًا - 5 عصرًا",
    challenge: "6 مساءً - 9 مساءً",
    motivational: "8 صباحًا - 11 صباحًا"
  },
  gb: {
    funny: "7 مساءً - 10 مساءً",
    sad: "10 مساءً - 12 صباحًا",
    educational: "1 ظهرًا - 4 عصرًا",
    challenge: "5 مساءً - 8 مساءً",
    motivational: "9 صباحًا - 12 ظهرًا"
  },
  ca: {
    funny: "6 مساءً - 9 مساءً",
    sad: "9 مساءً - 12 صباحًا",
    educational: "12 ظهرًا - 3 عصرًا",
    challenge: "5 مساءً - 8 مساءً",
    motivational: "9 صباحًا - 11 صباحًا"
  },
  tr: {
    funny: "8 مساءً - 11 مساءً",
    sad: "11 مساءً - 1 صباحًا",
    educational: "1 ظهرًا - 4 عصرًا",
    challenge: "6 مساءً - 9 مساءً",
    motivational: "9 صباحًا - 12 ظهرًا"
  },
  iq: {
    funny: "8 مساءً - 11 مساءً",
    sad: "11 مساءً - 1 صباحًا",
    educational: "1 ظهرًا - 4 عصرًا",
    challenge: "6 مساءً - 9 مساءً",
    motivational: "9 صباحًا - 12 ظهرًا"
  },
  jo: {
    funny: "8 مساءً - 11 مساءً",
    sad: "11 مساءً - 1 صباحًا",
    educational: "1 ظهرًا - 4 عصرًا",
    challenge: "6 مساءً - 9 مساءً",
    motivational: "9 صباحًا - 12 ظهرًا"
  },
  sy: {
    funny: "8 مساءً - 11 مساءً",
    sad: "11 مساءً - 1 صباحًا",
    educational: "1 ظهرًا - 4 عصرًا",
    challenge: "6 مساءً - 9 مساءً",
    motivational: "9 صباحًا - 12 ظهرًا"
  },
  tn: {
    funny: "7 مساءً - 10 مساءً",
    sad: "11 مساءً - 1 صباحًا",
    educational: "12 ظهرًا - 3 عصرًا",
    challenge: "6 مساءً - 9 مساءً",
    motivational: "10 صباحًا - 12 ظهرًا"
  },
  lb: {
    funny: "8 مساءً - 11 مساءً",
    sad: "11 مساءً - 1 صباحًا",
    educational: "1 ظهرًا - 4 عصرًا",
    challenge: "6 مساءً - 9 مساءً",
    motivational: "9 صباحًا - 12 ظهرًا"
  },
  qa: {
    funny: "9 مساءً - 12 منتصف الليل",
    sad: "12 - 2 صباحًا",
    educational: "1 ظهرًا - 4 عصرًا",
    challenge: "7 مساءً - 10 مساءً",
    motivational: "8 صباحًا - 11 صباحًا"
  },
  kw: {
    funny: "8 مساءً - 11 مساءً",
    sad: "11 مساءً - 1 صباحًا",
    educational: "1 ظهرًا - 4 عصرًا",
    challenge: "6 مساءً - 9 مساءً",
    motivational: "8 صباحًا - 11 صباحًا"
  },
  om: {
    funny: "8 مساءً - 11 مساءً",
    sad: "11 مساءً - 1 صباحًا",
    educational: "1 ظهرًا - 4 عصرًا",
    challenge: "6 مساءً - 9 مساءً",
    motivational: "8 صباحًا - 11 صباحًا"
  },
  ye: {
    funny: "8 مساءً - 11 مساءً",
    sad: "11 مساءً - 1 صباحًا",
    educational: "1 ظهرًا - 4 عصرًا",
    challenge: "6 مساءً - 9 مساءً",
    motivational: "9 صباحًا - 12 ظهرًا"
  }
};

const countries = [
  { value: 'sa', label: '🇸🇦 السعودية' },
  { value: 'eg', label: '🇪🇬 مصر' },
  { value: 'dz', label: '🇩🇿 الجزائر' },
  { value: 'ma', label: '🇲🇦 المغرب' },
  { value: 'ae', label: '🇦🇪 الإمارات' },
  { value: 'us', label: '🇺🇸 الولايات المتحدة' },
  { value: 'fr', label: '🇫🇷 فرنسا' },
  { value: 'de', label: '🇩🇪 ألمانيا' },
  { value: 'gb', label: '🇬🇧 بريطانيا' },
  { value: 'ca', label: '🇨🇦 كندا' },
  { value: 'tr', label: '🇹🇷 تركيا' },
  { value: 'iq', label: '🇮🇶 العراق' },
  { value: 'jo', label: '🇯🇴 الأردن' },
  { value: 'sy', label: '🇸🇾 سوريا' },
  { value: 'tn', label: '🇹🇳 تونس' },
  { value: 'lb', label: '🇱🇧 لبنان' },
  { value: 'qa', label: '🇶🇦 قطر' },
  { value: 'kw', label: '🇰🇼 الكويت' },
  { value: 'om', label: '🇴🇲 عمان' },
  { value: 'ye', label: '🇾🇪 اليمن' }
];

const videoTypes = [
  { value: 'funny', label: 'مضحك', icon: '😄' },
  { value: 'sad', label: 'محزن', icon: '😢' },
  { value: 'educational', label: 'علمي / تعليمي', icon: '📚' },
  { value: 'challenge', label: 'تحدي / ترند', icon: '🏆' },
  { value: 'motivational', label: 'تحفيزي', icon: '💪' }
];

export default function OptimalPostingTime() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showResult, setShowResult] = useState(false);

  const handleSuggestTime = () => {
    if (selectedCountry && selectedType) {
      setShowResult(true);
    }
  };

  const getSuggestedTime = () => {
    if (selectedCountry && selectedType) {
      return postingData[selectedCountry]?.[selectedType] || "لا تتوفر بيانات حالياً لهذه الدولة";
    }
    return "";
  };

  const getCountryName = () => {
    return countries.find(c => c.value === selectedCountry)?.label || '';
  };

  const getTypeName = () => {
    return videoTypes.find(t => t.value === selectedType)?.label || '';
  };

  const getTypeIcon = () => {
    return videoTypes.find(t => t.value === selectedType)?.icon || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-blue-400 mr-3" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                اقتراح الوقت المثالي للنشر
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              اكتشف أفضل الأوقات لنشر محتواك على TikTok حسب نوع الفيديو والدولة المستهدفة
            </p>
          </div>

          {/* Main Card */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-6 w-6 mr-3 text-green-400" />
                تحسين توقيت النشر لزيادة المشاهدات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Country Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  اختر الدولة المستهدفة
                </label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="اختر الدولة..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {countries.map((country) => (
                      <SelectItem 
                        key={country.value} 
                        value={country.value}
                        className="text-white hover:bg-gray-600"
                      >
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Video Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center">
                  <Video className="h-4 w-4 mr-2" />
                  نوع المحتوى
                </label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="اختر نوع الفيديو..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {videoTypes.map((type) => (
                      <SelectItem 
                        key={type.value} 
                        value={type.value}
                        className="text-white hover:bg-gray-600"
                      >
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleSuggestTime}
                disabled={!selectedCountry || !selectedType}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Clock className="h-4 w-4 mr-2" />
                اعرض أفضل وقت للنشر
              </Button>

              {/* Result */}
              {showResult && selectedCountry && selectedType && (
                <Card className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-400/30 mt-6 animate-in slide-in-from-bottom duration-500">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center space-x-2 text-gray-300">
                        <span>⏰ أفضل وقت للنشر في</span>
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-400">
                          {getCountryName()}
                        </Badge>
                        <span>لمحتوى</span>
                        <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400">
                          {getTypeIcon()} {getTypeName()}
                        </Badge>
                        <span>هو:</span>
                      </div>
                      
                      <div className="text-3xl font-bold text-green-400 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                        {getSuggestedTime()}
                      </div>
                      
                      <div className="text-sm text-gray-400 bg-gray-700/30 rounded-lg p-3 mt-4">
                        💡 <strong>نصيحة:</strong> هذه الأوقات مبنية على دراسات سلوك المستخدمين في المنطقة المحددة. 
                        قم بتجربة أوقات مختلفة وراقب النتائج لتحديد الوقت الأمثل لجمهورك المحدد.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Tips Section */}
          <Card className="bg-gray-800/30 border-gray-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white text-lg">
                نصائح إضافية لتحسين التوقيت
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                <div className="flex items-start space-x-3">
                  <span className="text-blue-400">📅</span>
                  <div>
                    <strong>أيام الأسبوع:</strong> الثلاثاء إلى الخميس هي أفضل الأيام للمحتوى التعليمي
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400">🎯</span>
                  <div>
                    <strong>عطلة نهاية الأسبوع:</strong> مثالية للمحتوى الترفيهي والمضحك
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-400">⚡</span>
                  <div>
                    <strong>النشر السريع:</strong> انشر خلال الساعة الأولى من الاتجاهات الجديدة
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-purple-400">📊</span>
                  <div>
                    <strong>تحليل البيانات:</strong> راقب إحصائياتك واضبط التوقيت حسب النتائج
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}