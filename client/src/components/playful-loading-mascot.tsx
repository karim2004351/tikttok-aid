import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlayfulLoadingMascotProps {
  isLoading: boolean;
  loadingText?: string;
  mascotType?: 'robot' | 'cat' | 'rocket' | 'wizard';
  size?: 'small' | 'medium' | 'large';
}

export function PlayfulLoadingMascot({ 
  isLoading, 
  loadingText = "جار التحميل...", 
  mascotType = 'robot',
  size = 'medium'
}: PlayfulLoadingMascotProps) {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);

  const loadingPhrases = [
    "جار التحميل...",
    "نعمل بجد...",
    "تقريباً انتهينا...",
    "جار الإعداد...",
    "قرابة الانتهاء..."
  ];

  const mascotSizes = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  useEffect(() => {
    if (!isLoading) return;

    const phraseInterval = setInterval(() => {
      setCurrentPhrase(prev => (prev + 1) % loadingPhrases.length);
    }, 2000);

    const sparkleInterval = setInterval(() => {
      setShowSparkles(prev => !prev);
    }, 1500);

    return () => {
      clearInterval(phraseInterval);
      clearInterval(sparkleInterval);
    };
  }, [isLoading]);

  const getMascotComponent = () => {
    const baseClasses = `${mascotSizes[size]} relative`;
    
    switch (mascotType) {
      case 'robot':
        return (
          <motion.div 
            className={baseClasses}
            animate={{ 
              rotateY: [0, 10, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl relative overflow-hidden">
              {/* رأس الروبوت */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-blue-300 rounded-full"></div>
              
              {/* العيون */}
              <motion.div 
                className="absolute top-4 left-3 w-2 h-2 bg-white rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div 
                className="absolute top-4 right-3 w-2 h-2 bg-white rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              />
              
              {/* الفم */}
              <motion.div 
                className="absolute top-7 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-white rounded-full"
                animate={{ scaleX: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* أضواء الصدر */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 bg-green-400 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ 
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'cat':
        return (
          <motion.div 
            className={baseClasses}
            animate={{ 
              y: [0, -8, 0],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-orange-300 to-orange-500 rounded-full relative">
              {/* أذني القط */}
              <div className="absolute -top-2 left-2 w-3 h-4 bg-orange-400 rounded-full transform rotate-12"></div>
              <div className="absolute -top-2 right-2 w-3 h-4 bg-orange-400 rounded-full transform -rotate-12"></div>
              
              {/* العيون */}
              <motion.div 
                className="absolute top-6 left-4 w-2 h-3 bg-green-400 rounded-full"
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div 
                className="absolute top-6 right-4 w-2 h-3 bg-green-400 rounded-full"
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.1 }}
              />
              
              {/* الأنف والفم */}
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-pink-400 rounded-full"></div>
              <motion.div 
                className="absolute top-11 left-1/2 transform -translate-x-1/2 w-3 h-1 border-b-2 border-pink-400 rounded-full"
                animate={{ scaleX: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* الشوارب */}
              <div className="absolute top-9 left-1 w-3 h-0.5 bg-gray-600 rounded-full"></div>
              <div className="absolute top-11 left-1 w-2 h-0.5 bg-gray-600 rounded-full"></div>
              <div className="absolute top-9 right-1 w-3 h-0.5 bg-gray-600 rounded-full"></div>
              <div className="absolute top-11 right-1 w-2 h-0.5 bg-gray-600 rounded-full"></div>
            </div>
          </motion.div>
        );

      case 'rocket':
        return (
          <motion.div 
            className={baseClasses}
            animate={{ 
              y: [0, -12, 0],
              x: [0, 3, -3, 0]
            }}
            transition={{ 
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-full h-full relative">
              {/* جسم الصاروخ */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-16 bg-gradient-to-t from-red-500 to-blue-500 rounded-t-full"></div>
              
              {/* رأس الصاروخ */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-silver-400 bg-gray-300 rounded-full"></div>
              
              {/* النوافذ */}
              <motion.div 
                className="absolute top-8 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-200 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              
              {/* الأجنحة */}
              <div className="absolute bottom-4 left-2 w-2 h-4 bg-yellow-400 rounded-full transform rotate-45"></div>
              <div className="absolute bottom-4 right-2 w-2 h-4 bg-yellow-400 rounded-full transform -rotate-45"></div>
              
              {/* لهب الصاروخ */}
              <motion.div 
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-gradient-to-t from-orange-500 to-red-500 rounded-b-full"
                animate={{ 
                  scaleY: [0.8, 1.2, 0.8],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        );

      case 'wizard':
        return (
          <motion.div 
            className={baseClasses}
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.02, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-full h-full relative">
              {/* القبعة */}
              <motion.div 
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-gradient-to-t from-purple-600 to-purple-800 rounded-t-full"
                animate={{ rotateZ: [0, 2, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {/* نجوم القبعة */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                    style={{
                      top: `${20 + i * 15}%`,
                      left: `${30 + (i % 2) * 40}%`
                    }}
                    animate={{ 
                      scale: [0.5, 1, 0.5],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                  />
                ))}
              </motion.div>
              
              {/* الوجه */}
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-12 h-10 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full">
                {/* العيون */}
                <motion.div 
                  className="absolute top-2 left-2 w-2 h-2 bg-blue-600 rounded-full"
                  animate={{ scaleY: [1, 0.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.div 
                  className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"
                  animate={{ scaleY: [1, 0.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 0.2 }}
                />
                
                {/* اللحية */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-gray-200 rounded-b-full"></div>
              </div>
              
              {/* العصا السحرية */}
              <motion.div 
                className="absolute bottom-2 right-2 w-1 h-6 bg-brown-600 bg-yellow-700 rounded-full"
                animate={{ rotateZ: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div 
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full"
                  animate={{ 
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.div>
            </div>
          </motion.div>
        );

      default:
        return <div className={baseClasses}></div>;
    }
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          dir="rtl"
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col items-center space-y-6 shadow-2xl"
          >
            {/* التميمة */}
            <div className="relative">
              {getMascotComponent()}
              
              {/* البريق والنجوم */}
              <AnimatePresence>
                {showSparkles && (
                  <>
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                          rotate: [0, 180, 360]
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ 
                          duration: 1.5,
                          delay: i * 0.2
                        }}
                        className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                        style={{
                          top: `${10 + Math.sin(i * 90) * 20}%`,
                          left: `${10 + Math.cos(i * 90) * 20}%`
                        }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* النص */}
            <div className="text-center space-y-2">
              <motion.h3
                key={currentPhrase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg font-semibold text-gray-800 dark:text-white"
              >
                {loadingPhrases[currentPhrase]}
              </motion.h3>
              
              {/* شريط التقدم المتحرك */}
              <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  animate={{
                    x: ['-100%', '100%']
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
              
              {/* نقاط التحميل */}
              <div className="flex justify-center space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}