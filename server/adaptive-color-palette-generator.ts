// مولد لوحة الألوان التكيفية
export interface ColorPalette {
  id: string;
  name: string;
  colors: ColorDefinition[];
  context: PaletteContext;
  accessibility: AccessibilityScores;
  createdAt: Date;
  usageStats: UsageStats;
}

export interface ColorDefinition {
  hex: string;
  rgb: { r: number, g: number, b: number };
  hsl: { h: number, s: number, l: number };
  name: string;
  role: 'primary' | 'secondary' | 'accent' | 'background' | 'text' | 'success' | 'warning' | 'error';
  contrast: number;
  temperature: 'warm' | 'cool' | 'neutral';
}

export interface PaletteContext {
  platform: string;
  audience: string;
  mood: string;
  industry: string;
  culturalRegion: string;
  season: string;
  timeOfDay: string;
}

export interface AccessibilityScores {
  wcagAA: boolean;
  wcagAAA: boolean;
  contrastRatio: number;
  colorBlindSafe: boolean;
  lowVisionFriendly: boolean;
}

export interface UsageStats {
  timesUsed: number;
  avgEngagement: number;
  platformPerformance: { [platform: string]: number };
  audienceResponse: number;
}

export class AdaptiveColorPaletteGenerator {
  private culturalColorMappings = {
    'arabic': {
      traditional: ['#1B4D3E', '#8B4513', '#DAA520', '#8FBC8F', '#F5DEB3'],
      modern: ['#2C3E50', '#3498DB', '#E74C3C', '#F39C12', '#27AE60'],
      religious: ['#2E7D32', '#1976D2', '#FFC107', '#FFFFFF', '#424242']
    },
    'western': {
      corporate: ['#1E3A8A', '#3B82F6', '#EF4444', '#10B981', '#F59E0B'],
      creative: ['#7C3AED', '#EC4899', '#F97316', '#06B6D4', '#84CC16'],
      minimal: ['#1F2937', '#6B7280', '#D1D5DB', '#F9FAFB', '#FFFFFF']
    }
  };

  private platformOptimizedColors = {
    'tiktok': {
      primary: '#FE2C55',
      secondary: '#25F4EE',
      background: '#000000',
      text: '#FFFFFF'
    },
    'youtube': {
      primary: '#FF0000',
      secondary: '#FF4444',
      background: '#0F0F0F',
      text: '#FFFFFF'
    },
    'instagram': {
      primary: '#E4405F',
      secondary: '#FCAF45',
      background: '#FAFAFA',
      text: '#262626'
    },
    'facebook': {
      primary: '#1877F2',
      secondary: '#42B883',
      background: '#F0F2F5',
      text: '#1C1E21'
    }
  };

  async generateAdaptivePalette(context: PaletteContext): Promise<ColorPalette> {
    // تحليل السياق وتحديد الألوان الأساسية
    const baseColors = await this.analyzeContextAndGenerateBase(context);
    
    // تطبيق تحسينات المنصة
    const platformOptimized = this.applyPlatformOptimizations(baseColors, context.platform);
    
    // ضمان إمكانية الوصول
    const accessibleColors = await this.ensureAccessibility(platformOptimized);
    
    // إنشاء ألوان مكملة
    const completeColors = this.generateComplementaryColors(accessibleColors, context);
    
    // حساب نتائج إمكانية الوصول
    const accessibility = this.calculateAccessibilityScores(completeColors);
    
    const palette: ColorPalette = {
      id: this.generatePaletteId(),
      name: this.generatePaletteName(context),
      colors: completeColors,
      context,
      accessibility,
      createdAt: new Date(),
      usageStats: {
        timesUsed: 0,
        avgEngagement: 0,
        platformPerformance: {},
        audienceResponse: 0
      }
    };

    return palette;
  }

  private async analyzeContextAndGenerateBase(context: PaletteContext): Promise<ColorDefinition[]> {
    const baseColors: ColorDefinition[] = [];
    
    // ألوان مبنية على الحالة المزاجية
    const moodColors = this.getMoodBasedColors(context.mood);
    
    // ألوان ثقافية
    const culturalColors = this.getCulturalColors(context.culturalRegion);
    
    // ألوان موسمية
    const seasonalColors = this.getSeasonalColors(context.season);
    
    // دمج الألوان وإنشاء لوحة متوازنة
    const primaryColor = this.selectBestColor([...moodColors, ...culturalColors], 'primary');
    const secondaryColor = this.selectComplementaryColor(primaryColor);
    
    baseColors.push(primaryColor);
    baseColors.push(secondaryColor);
    
    return baseColors;
  }

  private getMoodBasedColors(mood: string): ColorDefinition[] {
    const moodMappings: { [key: string]: string[] } = {
      'energetic': ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5'],
      'calm': ['#4A90A4', '#7FCDCD', '#B8E6B8', '#DCEDC8'],
      'professional': ['#2C3E50', '#34495E', '#3498DB', '#95A5A6'],
      'creative': ['#9B59B6', '#E74C3C', '#F39C12', '#1ABC9C'],
      'trustworthy': ['#3498DB', '#2980B9', '#5DADE2', '#85C1E9'],
      'exciting': ['#E74C3C', '#F39C12', '#F1C40F', '#E67E22']
    };

    const colors = moodMappings[mood] || moodMappings['professional'];
    return colors.map((hex, index) => this.createColorDefinition(hex, this.inferColorRole(index)));
  }

  private getCulturalColors(region: string): ColorDefinition[] {
    if (region === 'arabic' || region === 'middle_east') {
      return this.culturalColorMappings.arabic.modern.map((hex, index) => 
        this.createColorDefinition(hex, this.inferColorRole(index))
      );
    }
    
    return this.culturalColorMappings.western.corporate.map((hex, index) => 
      this.createColorDefinition(hex, this.inferColorRole(index))
    );
  }

  private getSeasonalColors(season: string): ColorDefinition[] {
    const seasonalMappings: { [key: string]: string[] } = {
      'spring': ['#8BC34A', '#CDDC39', '#FFEB3B', '#FF9800'],
      'summer': ['#2196F3', '#00BCD4', '#4CAF50', '#FFEB3B'],
      'autumn': ['#FF5722', '#FF9800', '#FFC107', '#795548'],
      'winter': ['#607D8B', '#9E9E9E', '#3F51B5', '#673AB7']
    };

    const colors = seasonalMappings[season] || seasonalMappings['spring'];
    return colors.map((hex, index) => this.createColorDefinition(hex, this.inferColorRole(index)));
  }

  private applyPlatformOptimizations(colors: ColorDefinition[], platform: string): ColorDefinition[] {
    const platformColors = this.platformOptimizedColors[platform.toLowerCase()];
    if (!platformColors) return colors;

    // تطبيق ألوان محسنة للمنصة على الألوان الأساسية
    const optimized = [...colors];
    
    // استبدال اللون الأساسي بلون المنصة المحسن
    if (optimized.length > 0) {
      optimized[0] = this.createColorDefinition(platformColors.primary, 'primary');
    }
    
    // إضافة لون ثانوي محسن
    if (platformColors.secondary) {
      optimized.push(this.createColorDefinition(platformColors.secondary, 'secondary'));
    }

    return optimized;
  }

  private async ensureAccessibility(colors: ColorDefinition[]): Promise<ColorDefinition[]> {
    const accessibleColors: ColorDefinition[] = [];
    
    for (const color of colors) {
      let adjustedColor = { ...color };
      
      // ضمان تباين كافي
      if (color.contrast < 4.5) {
        adjustedColor = this.adjustColorForContrast(color, 4.5);
      }
      
      // تحسين للمكفوفين
      adjustedColor = this.optimizeForColorBlindness(adjustedColor);
      
      accessibleColors.push(adjustedColor);
    }
    
    return accessibleColors;
  }

  private generateComplementaryColors(baseColors: ColorDefinition[], context: PaletteContext): ColorDefinition[] {
    const completeColors = [...baseColors];
    
    // إضافة ألوان الخلفية والنص
    completeColors.push(this.createColorDefinition('#FFFFFF', 'background'));
    completeColors.push(this.createColorDefinition('#1A1A1A', 'text'));
    
    // ألوان الحالة
    completeColors.push(this.createColorDefinition('#10B981', 'success'));
    completeColors.push(this.createColorDefinition('#F59E0B', 'warning'));
    completeColors.push(this.createColorDefinition('#EF4444', 'error'));
    
    // لون مميز
    const accent = this.generateAccentColor(baseColors[0]);
    completeColors.push(accent);
    
    return completeColors;
  }

  private createColorDefinition(hex: string, role: ColorDefinition['role']): ColorDefinition {
    const rgb = this.hexToRgb(hex);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    return {
      hex,
      rgb,
      hsl,
      name: this.generateColorName(hex, role),
      role,
      contrast: this.calculateContrast(hex, '#FFFFFF'),
      temperature: this.determineTemperature(hsl.h)
    };
  }

  private selectBestColor(colors: ColorDefinition[], role: ColorDefinition['role']): ColorDefinition {
    // اختيار أفضل لون بناء على معايير متعددة
    return colors.reduce((best, current) => {
      const bestScore = this.calculateColorScore(best);
      const currentScore = this.calculateColorScore(current);
      return currentScore > bestScore ? current : best;
    });
  }

  private selectComplementaryColor(baseColor: ColorDefinition): ColorDefinition {
    // حساب اللون المكمل
    const complementHue = (baseColor.hsl.h + 180) % 360;
    const complementHex = this.hslToHex(complementHue, baseColor.hsl.s, baseColor.hsl.l);
    
    return this.createColorDefinition(complementHex, 'secondary');
  }

  private calculateColorScore(color: ColorDefinition): number {
    let score = 0;
    
    // نتيجة التباين
    score += color.contrast * 20;
    
    // نتيجة التشبع
    score += color.hsl.s * 10;
    
    // نتيجة الإضاءة (متوازنة)
    const lightnessScore = 100 - Math.abs(50 - color.hsl.l);
    score += lightnessScore;
    
    return score;
  }

  private generateAccentColor(baseColor: ColorDefinition): ColorDefinition {
    // إنشاء لون مميز بناء على اللون الأساسي
    const accentHue = (baseColor.hsl.h + 120) % 360;
    const accentHex = this.hslToHex(accentHue, Math.min(baseColor.hsl.s + 20, 100), baseColor.hsl.l);
    
    return this.createColorDefinition(accentHex, 'accent');
  }

  private calculateAccessibilityScores(colors: ColorDefinition[]): AccessibilityScores {
    const textColor = colors.find(c => c.role === 'text')?.hex || '#000000';
    const bgColor = colors.find(c => c.role === 'background')?.hex || '#FFFFFF';
    
    const contrastRatio = this.calculateContrast(textColor, bgColor);
    
    return {
      wcagAA: contrastRatio >= 4.5,
      wcagAAA: contrastRatio >= 7,
      contrastRatio,
      colorBlindSafe: this.isColorBlindSafe(colors),
      lowVisionFriendly: contrastRatio >= 4.5 && this.hasGoodSaturation(colors)
    };
  }

  private adjustColorForContrast(color: ColorDefinition, targetContrast: number): ColorDefinition {
    let adjustedL = color.hsl.l;
    
    // تعديل الإضاءة لتحقيق التباين المطلوب
    while (this.calculateContrast(this.hslToHex(color.hsl.h, color.hsl.s, adjustedL), '#FFFFFF') < targetContrast) {
      adjustedL = Math.max(0, adjustedL - 5);
      if (adjustedL <= 0) break;
    }
    
    const adjustedHex = this.hslToHex(color.hsl.h, color.hsl.s, adjustedL);
    return this.createColorDefinition(adjustedHex, color.role);
  }

  private optimizeForColorBlindness(color: ColorDefinition): ColorDefinition {
    // تحسين الألوان للمكفوفين (تجنب الأحمر الأخضر المتشابه)
    if (color.hsl.h >= 0 && color.hsl.h <= 60 && color.hsl.s > 70) {
      // تقليل التشبع للألوان الحمراء/البرتقالية
      const adjustedHex = this.hslToHex(color.hsl.h, Math.min(color.hsl.s, 60), color.hsl.l);
      return this.createColorDefinition(adjustedHex, color.role);
    }
    
    return color;
  }

  private isColorBlindSafe(colors: ColorDefinition[]): boolean {
    // فحص إذا كانت الألوان آمنة للمكفوفين
    const problematicRanges = [
      { start: 0, end: 30 },   // أحمر
      { start: 90, end: 150 }  // أخضر
    ];
    
    const problematicColors = colors.filter(color => 
      problematicRanges.some(range => 
        color.hsl.h >= range.start && color.hsl.h <= range.end && color.hsl.s > 50
      )
    );
    
    return problematicColors.length <= 1;
  }

  private hasGoodSaturation(colors: ColorDefinition[]): boolean {
    const avgSaturation = colors.reduce((sum, color) => sum + color.hsl.s, 0) / colors.length;
    return avgSaturation >= 30 && avgSaturation <= 80;
  }

  // Utility functions
  private hexToRgb(hex: string): { r: number, g: number, b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number, s: number, l: number } {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  private hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  private calculateContrast(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    const lum1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  private getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  private determineTemperature(hue: number): 'warm' | 'cool' | 'neutral' {
    if ((hue >= 0 && hue <= 60) || (hue >= 300 && hue <= 360)) {
      return 'warm';
    } else if (hue >= 180 && hue <= 240) {
      return 'cool';
    }
    return 'neutral';
  }

  private generateColorName(hex: string, role: ColorDefinition['role']): string {
    const colorNames: { [key: string]: string } = {
      '#FF0000': 'أحمر', '#00FF00': 'أخضر', '#0000FF': 'أزرق',
      '#FFFF00': 'أصفر', '#FF00FF': 'بنفسجي', '#00FFFF': 'سماوي',
      '#000000': 'أسود', '#FFFFFF': 'أبيض', '#808080': 'رمادي'
    };
    
    return colorNames[hex.toUpperCase()] || `${role} ${hex}`;
  }

  private inferColorRole(index: number): ColorDefinition['role'] {
    const roles: ColorDefinition['role'][] = ['primary', 'secondary', 'accent', 'background', 'text'];
    return roles[index] || 'accent';
  }

  private generatePaletteId(): string {
    return `palette_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePaletteName(context: PaletteContext): string {
    return `${context.mood} ${context.platform} - ${context.season}`;
  }

  async analyzePalettePerformance(paletteId: string): Promise<UsageStats> {
    // تحليل أداء لوحة الألوان (يمكن ربطها بقاعدة البيانات)
    return {
      timesUsed: Math.floor(Math.random() * 100),
      avgEngagement: Math.random() * 10,
      platformPerformance: {
        'tiktok': Math.random() * 10,
        'youtube': Math.random() * 10,
        'instagram': Math.random() * 10
      },
      audienceResponse: Math.random() * 10
    };
  }
}

export const adaptiveColorPaletteGenerator = new AdaptiveColorPaletteGenerator();