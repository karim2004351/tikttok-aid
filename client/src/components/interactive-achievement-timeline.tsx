import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Crown, 
  Award, 
  Medal,
  Calendar,
  TrendingUp,
  Users,
  Share2,
  Video,
  Heart,
  MessageSquare
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'publishing' | 'engagement' | 'milestone' | 'special';
  points: number;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress?: number;
  maxProgress?: number;
  isCompleted: boolean;
}

interface AchievementLevel {
  level: number;
  title: string;
  pointsRequired: number;
  color: string;
  benefits: string[];
}

export function InteractiveAchievementTimeline() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userLevel, setUserLevel] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyCompleted, setShowOnlyCompleted] = useState(false);

  const achievementLevels: AchievementLevel[] = [
    { level: 1, title: 'مبتدئ', pointsRequired: 0, color: 'bg-gray-500', benefits: ['وصول أساسي'] },
    { level: 2, title: 'ناشر', pointsRequired: 100, color: 'bg-green-500', benefits: ['تحليل محسن'] },
    { level: 3, title: 'خبير', pointsRequired: 250, color: 'bg-blue-500', benefits: ['أدوات متقدمة'] },
    { level: 4, title: 'محترف', pointsRequired: 500, color: 'bg-purple-500', benefits: ['إحصائيات مفصلة'] },
    { level: 5, title: 'أسطورة', pointsRequired: 1000, color: 'bg-yellow-500', benefits: ['ميزات حصرية'] }
  ];

  useEffect(() => {
    loadUserAchievements();
  }, []);

  const loadUserAchievements = async () => {
    // محاكاة تحميل الإنجازات من الخادم
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        title: 'أول نشر',
        description: 'نشرت أول فيديو لك بنجاح',
        icon: Video,
        category: 'milestone',
        points: 50,
        unlockedAt: new Date('2025-06-01'),
        rarity: 'common',
        isCompleted: true
      },
      {
        id: '2',
        title: 'ناشر نشيط',
        description: 'نشرت 10 فيديوهات',
        icon: Trophy,
        category: 'publishing',
        points: 100,
        unlockedAt: new Date('2025-06-02'),
        rarity: 'rare',
        progress: 7,
        maxProgress: 10,
        isCompleted: false
      },
      {
        id: '3',
        title: 'محبوب الجماهير',
        description: 'حصلت على 1000 إعجاب',
        icon: Heart,
        category: 'engagement',
        points: 150,
        unlockedAt: new Date('2025-06-03'),
        rarity: 'epic',
        progress: 850,
        maxProgress: 1000,
        isCompleted: false
      },
      {
        id: '4',
        title: 'صانع محتوى',
        description: 'استخدمت جميع أدوات التحليل',
        icon: Star,
        category: 'special',
        points: 200,
        unlockedAt: new Date('2025-06-04'),
        rarity: 'legendary',
        isCompleted: true
      },
      {
        id: '5',
        title: 'ملك المشاركة',
        description: 'شارك المحتوى 50 مرة',
        icon: Share2,
        category: 'engagement',
        points: 75,
        unlockedAt: new Date(),
        rarity: 'rare',
        progress: 32,
        maxProgress: 50,
        isCompleted: false
      }
    ];

    setAchievements(mockAchievements);
    
    // حساب النقاط الإجمالية
    const completedPoints = mockAchievements
      .filter(a => a.isCompleted)
      .reduce((sum, a) => sum + a.points, 0);
    
    setTotalPoints(completedPoints);
    
    // تحديد المستوى
    const currentLevel = achievementLevels
      .reverse()
      .find(level => completedPoints >= level.pointsRequired);
    
    setUserLevel(currentLevel?.level || 1);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getCurrentLevelInfo = () => {
    return achievementLevels.find(level => level.level === userLevel);
  };

  const getNextLevelInfo = () => {
    return achievementLevels.find(level => level.level === userLevel + 1);
  };

  const getProgressToNextLevel = () => {
    const nextLevel = getNextLevelInfo();
    const currentLevel = getCurrentLevelInfo();
    
    if (!nextLevel || !currentLevel) return 100;
    
    const pointsNeeded = nextLevel.pointsRequired - currentLevel.pointsRequired;
    const pointsEarned = totalPoints - currentLevel.pointsRequired;
    
    return Math.min((pointsEarned / pointsNeeded) * 100, 100);
  };

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
    const completedMatch = !showOnlyCompleted || achievement.isCompleted;
    return categoryMatch && completedMatch;
  });

  const categories = [
    { id: 'all', name: 'الكل', icon: Target },
    { id: 'publishing', name: 'النشر', icon: Video },
    { id: 'engagement', name: 'التفاعل', icon: Heart },
    { id: 'milestone', name: 'المعالم', icon: Trophy },
    { id: 'special', name: 'خاص', icon: Crown }
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* معلومات المستوى */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full ${getCurrentLevelInfo()?.color} flex items-center justify-center`}>
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">المستوى {userLevel}</h3>
                <p className="text-blue-100">{getCurrentLevelInfo()?.title}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{totalPoints}</p>
              <p className="text-blue-100">نقطة</p>
            </div>
          </div>
          
          {getNextLevelInfo() && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>التقدم للمستوى التالي</span>
                <span>{getNextLevelInfo()?.pointsRequired - totalPoints} نقطة متبقية</span>
              </div>
              <Progress value={getProgressToNextLevel()} className="bg-blue-400" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* فلاتر */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center gap-2"
          >
            <category.icon className="h-4 w-4" />
            {category.name}
          </Button>
        ))}
        
        <Button
          variant={showOnlyCompleted ? "default" : "outline"}
          size="sm"
          onClick={() => setShowOnlyCompleted(!showOnlyCompleted)}
        >
          المكتملة فقط
        </Button>
      </div>

      {/* الجدول الزمني */}
      <div className="relative">
        {/* خط الجدول الزمني */}
        <div className="absolute right-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        
        <div className="space-y-6">
          <AnimatePresence>
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* نقطة الجدول الزمني */}
                <div className={`absolute right-6 w-4 h-4 rounded-full border-4 border-white dark:border-gray-900 ${
                  achievement.isCompleted ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                
                {/* بطاقة الإنجاز */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`mr-12 ${getRarityColor(achievement.rarity)} border-2 rounded-lg p-4 cursor-pointer`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`w-12 h-12 rounded-lg ${getRarityBadgeColor(achievement.rarity)} flex items-center justify-center flex-shrink-0`}>
                        <achievement.icon className="h-6 w-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-lg">{achievement.title}</h4>
                          <Badge className={getRarityBadgeColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          {achievement.description}
                        </p>
                        
                        {!achievement.isCompleted && achievement.progress !== undefined && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>التقدم</span>
                              <span>{achievement.progress}/{achievement.maxProgress}</span>
                            </div>
                            <Progress 
                              value={(achievement.progress / (achievement.maxProgress || 1)) * 100} 
                              className="h-2"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {achievement.unlockedAt.toLocaleDateString('en-US')}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">{achievement.points}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{achievements.filter(a => a.isCompleted).length}</p>
            <p className="text-sm text-gray-600">إنجازات مكتملة</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{achievements.filter(a => !a.isCompleted).length}</p>
            <p className="text-sm text-gray-600">قيد التقدم</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Medal className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">
              {achievements.filter(a => a.rarity === 'legendary' && a.isCompleted).length}
            </p>
            <p className="text-sm text-gray-600">إنجازات أسطورية</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{userLevel}</p>
            <p className="text-sm text-gray-600">المستوى الحالي</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}