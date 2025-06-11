import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Smile, 
  Frown, 
  Meh, 
  Zap, 
  Sun, 
  Cloud, 
  CloudRain,
  Calendar,
  TrendingUp,
  BarChart3,
  Brain,
  Target,
  Clock
} from 'lucide-react';

interface MoodEntry {
  id: string;
  mood: 'happy' | 'excited' | 'calm' | 'neutral' | 'sad' | 'anxious';
  energy: number; // 1-10
  creativity: number; // 1-10
  timestamp: Date;
  contentType: string;
  platform: string;
  engagement: number;
  notes?: string;
}

interface MoodPattern {
  mood: string;
  frequency: number;
  averageEngagement: number;
  bestPerformingTime: string;
  recommendedContentTypes: string[];
}

interface MoodAnalytics {
  dominantMood: string;
  moodStability: number;
  peakPerformanceMood: string;
  moodContentCorrelation: number;
  weeklyTrend: 'improving' | 'declining' | 'stable';
}

export function PersonalizedContentMoodTracker() {
  const [currentMood, setCurrentMood] = useState<string>('');
  const [currentEnergy, setCurrentEnergy] = useState(5);
  const [currentCreativity, setCurrentCreativity] = useState(5);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [analytics, setAnalytics] = useState<MoodAnalytics | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'day' | 'week' | 'month'>('week');

  const moodOptions = [
    { id: 'happy', label: 'سعيد', icon: Smile, color: 'bg-yellow-500', description: 'مزاج إيجابي ومتفائل' },
    { id: 'excited', label: 'متحمس', icon: Zap, color: 'bg-orange-500', description: 'طاقة عالية وحماس' },
    { id: 'calm', label: 'هادئ', icon: Sun, color: 'bg-blue-500', description: 'استرخاء وسكينة' },
    { id: 'neutral', label: 'عادي', icon: Meh, color: 'bg-gray-500', description: 'مزاج متوازن' },
    { id: 'sad', label: 'حزين', icon: Frown, color: 'bg-blue-700', description: 'مزاج منخفض' },
    { id: 'anxious', label: 'قلق', icon: CloudRain, color: 'bg-purple-600', description: 'توتر وقلق' }
  ];

  useEffect(() => {
    loadMoodHistory();
  }, []);

  useEffect(() => {
    if (moodEntries.length > 0) {
      analyzeMoodPatterns();
    }
  }, [moodEntries, selectedTimeRange]);

  const loadMoodHistory = async () => {
    // محاكاة تحميل بيانات المزاج من الخادم
    const mockEntries: MoodEntry[] = [
      {
        id: '1',
        mood: 'happy',
        energy: 8,
        creativity: 7,
        timestamp: new Date('2025-06-04T10:00:00'),
        contentType: 'video',
        platform: 'tiktok',
        engagement: 850,
        notes: 'فيديو عن التكنولوجيا'
      },
      {
        id: '2',
        mood: 'excited',
        energy: 9,
        creativity: 9,
        timestamp: new Date('2025-06-04T14:00:00'),
        contentType: 'image',
        platform: 'instagram',
        engagement: 1200,
        notes: 'صورة إبداعية'
      },
      {
        id: '3',
        mood: 'calm',
        energy: 6,
        creativity: 8,
        timestamp: new Date('2025-06-03T16:00:00'),
        contentType: 'text',
        platform: 'twitter',
        engagement: 320,
        notes: 'مقال تأملي'
      }
    ];

    setMoodEntries(mockEntries);
  };

  const analyzeMoodPatterns = () => {
    const filteredEntries = filterEntriesByTimeRange();
    
    if (filteredEntries.length === 0) return;

    // تحليل المزاج المهيمن
    const moodCounts = filteredEntries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0][0];

    // حساب استقرار المزاج
    const moodVariance = Object.values(moodCounts).reduce((acc, count) => {
      return acc + Math.pow(count - filteredEntries.length / Object.keys(moodCounts).length, 2);
    }, 0);
    const moodStability = Math.max(0, 100 - (moodVariance / filteredEntries.length) * 10);

    // أفضل مزاج للأداء
    const moodEngagement = filteredEntries.reduce((acc, entry) => {
      if (!acc[entry.mood]) {
        acc[entry.mood] = { total: 0, count: 0 };
      }
      acc[entry.mood].total += entry.engagement;
      acc[entry.mood].count += 1;
      return acc;
    }, {} as Record<string, { total: number, count: number }>);

    const peakPerformanceMood = Object.entries(moodEngagement)
      .map(([mood, data]) => ({ mood, avg: data.total / data.count }))
      .sort((a, b) => b.avg - a.avg)[0]?.mood || dominantMood;

    // ارتباط المزاج بالمحتوى
    const moodContentCorrelation = Math.random() * 40 + 60; // محاكاة

    // اتجاه الأسبوع
    const weeklyTrend = 'improving'; // محاكاة

    setAnalytics({
      dominantMood,
      moodStability: Math.round(moodStability),
      peakPerformanceMood,
      moodContentCorrelation: Math.round(moodContentCorrelation),
      weeklyTrend
    });
  };

  const filterEntriesByTimeRange = () => {
    const now = new Date();
    const cutoff = new Date();
    
    switch (selectedTimeRange) {
      case 'day':
        cutoff.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
    }

    return moodEntries.filter(entry => entry.timestamp >= cutoff);
  };

  const recordMood = async () => {
    if (!currentMood) return;

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      mood: currentMood as any,
      energy: currentEnergy,
      creativity: currentCreativity,
      timestamp: new Date(),
      contentType: 'video', // افتراضي
      platform: 'tiktok', // افتراضي
      engagement: 0, // سيتم تحديثه لاحقاً
      notes: ''
    };

    setMoodEntries(prev => [newEntry, ...prev]);
    
    // إعادة تعيين النموذج
    setCurrentMood('');
    setCurrentEnergy(5);
    setCurrentCreativity(5);
  };

  const getMoodOption = (moodId: string) => {
    return moodOptions.find(option => option.id === moodId);
  };

  const getMoodRecommendations = () => {
    if (!analytics) return [];

    const recommendations = [];

    if (analytics.dominantMood === 'excited') {
      recommendations.push('أنشئ محتوى ديناميكي وسريع');
      recommendations.push('استخدم ألوان زاهية وحيوية');
    } else if (analytics.dominantMood === 'calm') {
      recommendations.push('ركز على المحتوى التأملي');
      recommendations.push('استخدم ألوان هادئة ومريحة');
    } else if (analytics.dominantMood === 'happy') {
      recommendations.push('أنشئ محتوى إيجابي ومرح');
      recommendations.push('شارك القصص الملهمة');
    }

    if (analytics.moodStability < 70) {
      recommendations.push('حاول الحفاظ على روتين ثابت');
      recommendations.push('مارس تقنيات الاسترخاء');
    }

    return recommendations;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* تسجيل المزاج الحالي */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            كيف تشعر الآن؟
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* اختيار المزاج */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {moodOptions.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentMood(option.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  currentMood === option.id
                    ? `${option.color} border-white text-white`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <option.icon className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm font-medium">{option.label}</p>
              </motion.button>
            ))}
          </div>

          {/* مقاييس الطاقة والإبداع */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">مستوى الطاقة</label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentEnergy}
                  onChange={(e) => setCurrentEnergy(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>منخفض</span>
                  <span className="font-medium">{currentEnergy}</span>
                  <span>عالي</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">مستوى الإبداع</label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentCreativity}
                  onChange={(e) => setCurrentCreativity(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>منخفض</span>
                  <span className="font-medium">{currentCreativity}</span>
                  <span>عالي</span>
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={recordMood}
            disabled={!currentMood}
            className="w-full"
          >
            تسجيل المزاج
          </Button>
        </CardContent>
      </Card>

      {/* تحليلات المزاج */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                تحليل المزاج
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>المزاج المهيمن</span>
                  <Badge className={getMoodOption(analytics.dominantMood)?.color}>
                    {getMoodOption(analytics.dominantMood)?.label}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>استقرار المزاج</span>
                    <span>{analytics.moodStability}%</span>
                  </div>
                  <Progress value={analytics.moodStability} />
                </div>

                <div className="flex justify-between items-center">
                  <span>أفضل مزاج للأداء</span>
                  <Badge className={getMoodOption(analytics.peakPerformanceMood)?.color}>
                    {getMoodOption(analytics.peakPerformanceMood)?.label}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>ارتباط المزاج بالمحتوى</span>
                    <span>{analytics.moodContentCorrelation}%</span>
                  </div>
                  <Progress value={analytics.moodContentCorrelation} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                توصيات ذكية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getMoodRecommendations().map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* سجل المزاج الأخير */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              سجل المزاج الأخير
            </CardTitle>
            <div className="flex gap-2">
              {(['day', 'week', 'month'] as const).map((range) => (
                <Button
                  key={range}
                  variant={selectedTimeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeRange(range)}
                >
                  {range === 'day' ? 'يوم' : range === 'week' ? 'أسبوع' : 'شهر'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {filterEntriesByTimeRange().slice(0, 5).map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${getMoodOption(entry.mood)?.color} flex items-center justify-center`}>
                      {(() => {
                        const moodOption = getMoodOption(entry.mood);
                        if (moodOption?.icon) {
                          const IconComponent = moodOption.icon;
                          return <IconComponent className="h-4 w-4 text-white" />;
                        }
                        return null;
                      })()}
                    </div>
                    <div>
                      <p className="font-medium">{getMoodOption(entry.mood)?.label}</p>
                      <p className="text-xs text-gray-500">
                        طاقة: {entry.energy} • إبداع: {entry.creativity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{entry.engagement} تفاعل</p>
                    <p className="text-xs text-gray-500">
                      {entry.timestamp.toLocaleString('en-US')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}