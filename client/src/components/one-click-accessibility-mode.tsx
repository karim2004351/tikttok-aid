import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Type, 
  Contrast, 
  MousePointer,
  Accessibility,
  Settings,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
  soundEnabled: boolean;
  focusIndicators: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  fontSize: 'normal' | 'large' | 'extra-large';
}

export function OneClickAccessibilityMode() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReaderMode: false,
    keyboardNavigation: true,
    soundEnabled: true,
    focusIndicators: true,
    colorBlindMode: 'none',
    fontSize: 'normal'
  });
  const { toast } = useToast();

  useEffect(() => {
    // تحميل الإعدادات المحفوظة
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    // تطبيق الإعدادات على الصفحة
    applyAccessibilitySettings(settings);
    // حفظ الإعدادات
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const applyAccessibilitySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;
    const body = document.body;

    // وضع التباين العالي
    if (settings.highContrast) {
      root.classList.add('high-contrast');
      root.style.setProperty('--bg-primary', '#000000');
      root.style.setProperty('--text-primary', '#FFFFFF');
      root.style.setProperty('--border-color', '#FFFFFF');
    } else {
      root.classList.remove('high-contrast');
      root.style.removeProperty('--bg-primary');
      root.style.removeProperty('--text-primary');
      root.style.removeProperty('--border-color');
    }

    // حجم النص
    switch (settings.fontSize) {
      case 'large':
        root.style.fontSize = '18px';
        break;
      case 'extra-large':
        root.style.fontSize = '22px';
        break;
      default:
        root.style.fontSize = '16px';
    }

    // تقليل الحركة
    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // مؤشرات التركيز
    if (settings.focusIndicators) {
      root.classList.add('enhanced-focus');
      const focusStyle = `
        *:focus {
          outline: 3px solid #0066CC !important;
          outline-offset: 2px !important;
        }
      `;
      updateStyleSheet('focus-indicators', focusStyle);
    } else {
      root.classList.remove('enhanced-focus');
      removeStyleSheet('focus-indicators');
    }

    // وضع عمى الألوان
    if (settings.colorBlindMode !== 'none') {
      const filters = {
        protanopia: 'url(#protanopia-filter)',
        deuteranopia: 'url(#deuteranopia-filter)',
        tritanopia: 'url(#tritanopia-filter)'
      };
      body.style.filter = filters[settings.colorBlindMode];
      addColorBlindFilters();
    } else {
      body.style.filter = 'none';
    }

    // وضع قارئ الشاشة
    if (settings.screenReaderMode) {
      root.setAttribute('aria-live', 'polite');
      addScreenReaderSupport();
    } else {
      root.removeAttribute('aria-live');
    }
  };

  const updateStyleSheet = (id: string, css: string) => {
    let style = document.getElementById(id) as HTMLStyleElement;
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = css;
  };

  const removeStyleSheet = (id: string) => {
    const style = document.getElementById(id);
    if (style) {
      style.remove();
    }
  };

  const addColorBlindFilters = () => {
    const svg = `
      <svg style="position: absolute; width: 0; height: 0;">
        <defs>
          <filter id="protanopia-filter">
            <feColorMatrix values="0.567 0.433 0 0 0
                                   0.558 0.442 0 0 0
                                   0 0.242 0.758 0 0
                                   0 0 0 1 0"/>
          </filter>
          <filter id="deuteranopia-filter">
            <feColorMatrix values="0.625 0.375 0 0 0
                                   0.7 0.3 0 0 0
                                   0 0.3 0.7 0 0
                                   0 0 0 1 0"/>
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix values="0.95 0.05 0 0 0
                                   0 0.433 0.567 0 0
                                   0 0.475 0.525 0 0
                                   0 0 0 1 0"/>
          </filter>
        </defs>
      </svg>
    `;
    
    let filterContainer = document.getElementById('color-blind-filters');
    if (!filterContainer) {
      filterContainer = document.createElement('div');
      filterContainer.id = 'color-blind-filters';
      filterContainer.innerHTML = svg;
      document.body.appendChild(filterContainer);
    }
  };

  const addScreenReaderSupport = () => {
    // إضافة نصوص مساعدة لقارئ الشاشة
    const elements = document.querySelectorAll('button, input, select, textarea');
    elements.forEach(element => {
      if (!element.getAttribute('aria-label') && !element.getAttribute('aria-describedby')) {
        const text = element.textContent || element.getAttribute('placeholder') || 'عنصر تفاعلي';
        element.setAttribute('aria-label', text);
      }
    });
  };

  const toggleSetting = (key: keyof AccessibilitySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const quickAccessibilityMode = () => {
    const quickSettings: AccessibilitySettings = {
      highContrast: true,
      largeText: true,
      reducedMotion: true,
      screenReaderMode: true,
      keyboardNavigation: true,
      soundEnabled: false,
      focusIndicators: true,
      colorBlindMode: 'none',
      fontSize: 'large'
    };
    
    setSettings(quickSettings);
    toast({
      title: "تم تفعيل وضع إمكانية الوصول",
      description: "تم تطبيق جميع إعدادات إمكانية الوصول المحسنة",
    });
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReaderMode: false,
      keyboardNavigation: true,
      soundEnabled: true,
      focusIndicators: true,
      colorBlindMode: 'none',
      fontSize: 'normal'
    };
    
    setSettings(defaultSettings);
    toast({
      title: "تم إعادة تعيين الإعدادات",
      description: "تم إرجاع جميع إعدادات إمكانية الوصول للوضع الافتراضي",
    });
  };

  const getActiveFeaturesCount = () => {
    return Object.values(settings).filter(value => 
      value === true || (typeof value === 'string' && value !== 'none' && value !== 'normal')
    ).length;
  };

  return (
    <div className="fixed bottom-4 left-4 z-50" dir="rtl">
      {/* زر إمكانية الوصول السريع */}
      <div className="relative">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
          aria-label="إعدادات إمكانية الوصول"
        >
          <Accessibility className="h-6 w-6 text-white" />
        </Button>
        
        {getActiveFeaturesCount() > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-green-500"
          >
            {getActiveFeaturesCount()}
          </Badge>
        )}
      </div>

      {/* لوحة الإعدادات */}
      {isOpen && (
        <Card className="absolute bottom-16 left-0 w-80 shadow-2xl">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">إمكانية الوصول</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                aria-label="إغلاق"
              >
                ×
              </Button>
            </div>

            {/* التفعيل السريع */}
            <div className="space-y-2">
              <Button
                onClick={quickAccessibilityMode}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Accessibility className="h-4 w-4 ml-2" />
                تفعيل سريع شامل
              </Button>
              
              <Button
                onClick={resetSettings}
                variant="outline"
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 ml-2" />
                إعادة تعيين
              </Button>
            </div>

            {/* إعدادات مفصلة */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">التباين العالي</label>
                <Button
                  variant={settings.highContrast ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSetting('highContrast')}
                >
                  <Contrast className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">النص الكبير</label>
                <Button
                  variant={settings.fontSize !== 'normal' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    fontSize: prev.fontSize === 'normal' ? 'large' : 
                             prev.fontSize === 'large' ? 'extra-large' : 'normal'
                  }))}
                >
                  <Type className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">تقليل الحركة</label>
                <Button
                  variant={settings.reducedMotion ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSetting('reducedMotion')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">قارئ الشاشة</label>
                <Button
                  variant={settings.screenReaderMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSetting('screenReaderMode')}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">مؤشرات التركيز</label>
                <Button
                  variant={settings.focusIndicators ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSetting('focusIndicators')}
                >
                  <MousePointer className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">عمى الألوان</label>
                <select
                  value={settings.colorBlindMode}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    colorBlindMode: e.target.value as any
                  }))}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value="none">عادي</option>
                  <option value="protanopia">بروتانوبيا</option>
                  <option value="deuteranopia">ديوترانوبيا</option>
                  <option value="tritanopia">تريتانوبيا</option>
                </select>
              </div>
            </div>

            {/* معلومات الحالة */}
            <div className="pt-2 border-t text-xs text-gray-600">
              <p>{getActiveFeaturesCount()} ميزة مفعلة</p>
              <p>الإعدادات محفوظة تلقائياً</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}