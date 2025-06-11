// نظام تصميم الأصوات للتفاعلات الدقيقة
export interface SoundProfile {
  id: string;
  name: string;
  category: 'ui' | 'notification' | 'feedback' | 'ambient' | 'celebration';
  sounds: SoundDefinition[];
  context: SoundContext;
  accessibility: SoundAccessibility;
  culturalAdaptation: CulturalSoundSettings;
}

export interface SoundDefinition {
  id: string;
  name: string;
  trigger: string;
  audioData: string; // Base64 encoded audio
  format: 'mp3' | 'wav' | 'ogg';
  duration: number; // milliseconds
  volume: number; // 0-1
  pitch: number;
  timbre: 'soft' | 'sharp' | 'warm' | 'metallic' | 'organic';
  emotional_tone: 'success' | 'error' | 'neutral' | 'excitement' | 'calm';
  cultural_variant?: string;
}

export interface SoundContext {
  platform: string;
  userPreference: 'enabled' | 'reduced' | 'disabled';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  deviceType: 'mobile' | 'desktop' | 'tablet';
  environmentalNoise: 'quiet' | 'moderate' | 'noisy';
}

export interface SoundAccessibility {
  hasVisualAlternative: boolean;
  hasHapticFeedback: boolean;
  respectsReducedMotion: boolean;
  hearingImpairedFriendly: boolean;
  volumeControlAvailable: boolean;
}

export interface CulturalSoundSettings {
  region: string;
  language: string;
  traditionalInstruments: string[];
  avoidedSounds: string[];
  preferredFrequencies: number[];
}

export class MicroInteractionSoundDesign {
  private soundLibrary: Map<string, SoundDefinition> = new Map();
  private audioContext: AudioContext | null = null;
  private soundBuffers: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.initializeAudioContext();
    this.generateBaseSounds();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio Context not supported');
    }
  }

  private generateBaseSounds() {
    // أصوات تفاعلية أساسية مولدة برمجياً
    const baseSounds: Omit<SoundDefinition, 'audioData'>[] = [
      {
        id: 'click_soft',
        name: 'نقرة ناعمة',
        trigger: 'button_click',
        format: 'wav',
        duration: 150,
        volume: 0.3,
        pitch: 800,
        timbre: 'soft',
        emotional_tone: 'neutral'
      },
      {
        id: 'success_chime',
        name: 'صوت نجاح',
        trigger: 'success_action',
        format: 'wav',
        duration: 500,
        volume: 0.5,
        pitch: 1200,
        timbre: 'warm',
        emotional_tone: 'success'
      },
      {
        id: 'error_alert',
        name: 'تنبيه خطأ',
        trigger: 'error_state',
        format: 'wav',
        duration: 300,
        volume: 0.4,
        pitch: 400,
        timbre: 'sharp',
        emotional_tone: 'error'
      },
      {
        id: 'notification_subtle',
        name: 'إشعار خفيف',
        trigger: 'notification',
        format: 'wav',
        duration: 800,
        volume: 0.35,
        pitch: 600,
        timbre: 'organic',
        emotional_tone: 'neutral'
      },
      {
        id: 'loading_ambient',
        name: 'صوت تحميل',
        trigger: 'loading_state',
        format: 'wav',
        duration: 2000,
        volume: 0.2,
        pitch: 300,
        timbre: 'soft',
        emotional_tone: 'calm'
      },
      {
        id: 'celebration_sparkle',
        name: 'احتفال',
        trigger: 'achievement',
        format: 'wav',
        duration: 1200,
        volume: 0.6,
        pitch: 1500,
        timbre: 'metallic',
        emotional_tone: 'excitement'
      }
    ];

    baseSounds.forEach(sound => {
      const audioData = this.generateSyntheticAudio(sound);
      this.soundLibrary.set(sound.id, { ...sound, audioData });
    });
  }

  private generateSyntheticAudio(sound: Omit<SoundDefinition, 'audioData'>): string {
    if (!this.audioContext) return '';

    const sampleRate = this.audioContext.sampleRate;
    const length = (sound.duration / 1000) * sampleRate;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // توليد موجة صوتية حسب نوع الصوت
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      switch (sound.emotional_tone) {
        case 'success':
          // موجة صاعدة للنجاح
          sample = Math.sin(2 * Math.PI * sound.pitch * t * (1 + t * 0.5)) * 
                   Math.exp(-t * 3) * sound.volume;
          break;
        
        case 'error':
          // موجة هابطة للخطأ
          sample = Math.sin(2 * Math.PI * sound.pitch * t * (1 - t * 0.3)) * 
                   Math.exp(-t * 2) * sound.volume;
          break;
        
        case 'excitement':
          // موجات متعددة للإثارة
          sample = (Math.sin(2 * Math.PI * sound.pitch * t) + 
                    Math.sin(2 * Math.PI * sound.pitch * 1.5 * t) * 0.5) * 
                   Math.exp(-t * 2) * sound.volume;
          break;
        
        case 'calm':
          // موجة ناعمة للهدوء
          sample = Math.sin(2 * Math.PI * sound.pitch * t) * 
                   Math.exp(-t * 1) * sound.volume * (1 + Math.sin(t * 2) * 0.1);
          break;
        
        default:
          // موجة بسيطة
          sample = Math.sin(2 * Math.PI * sound.pitch * t) * 
                   Math.exp(-t * 2) * sound.volume;
      }

      data[i] = sample;
    }

    // تحويل إلى Base64 (محاكاة)
    return `data:audio/wav;base64,${this.bufferToBase64(buffer)}`;
  }

  private bufferToBase64(buffer: AudioBuffer): string {
    // محاكاة تحويل AudioBuffer إلى Base64
    return btoa(Array.from(buffer.getChannelData(0)).join(','));
  }

  async createCulturallyAdaptedSounds(region: string, language: string): Promise<SoundProfile> {
    const culturalSounds: SoundDefinition[] = [];

    if (region === 'arabic' || language === 'ar') {
      // أصوات مكيفة ثقافياً للمنطقة العربية
      const arabicSounds = [
        {
          id: 'oud_click',
          name: 'نقرة عود',
          trigger: 'button_click',
          format: 'wav' as const,
          duration: 200,
          volume: 0.4,
          pitch: 440,
          timbre: 'warm' as const,
          emotional_tone: 'neutral' as const,
          audioData: this.generateMiddleEasternSound('oud', 440, 200),
          cultural_variant: 'arabic'
        },
        {
          id: 'qanun_success',
          name: 'نجاح قانون',
          trigger: 'success_action',
          format: 'wav' as const,
          duration: 600,
          volume: 0.5,
          pitch: 660,
          timbre: 'metallic' as const,
          emotional_tone: 'success' as const,
          audioData: this.generateMiddleEasternSound('qanun', 660, 600),
          cultural_variant: 'arabic'
        }
      ];

      culturalSounds.push(...arabicSounds);
    }

    return {
      id: `cultural_${region}_${Date.now()}`,
      name: `أصوات ${region}`,
      category: 'ui',
      sounds: culturalSounds,
      context: {
        platform: 'universal',
        userPreference: 'enabled',
        timeOfDay: 'afternoon',
        deviceType: 'desktop',
        environmentalNoise: 'quiet'
      },
      accessibility: {
        hasVisualAlternative: true,
        hasHapticFeedback: true,
        respectsReducedMotion: true,
        hearingImpairedFriendly: true,
        volumeControlAvailable: true
      },
      culturalAdaptation: {
        region,
        language,
        traditionalInstruments: ['oud', 'qanun', 'nay', 'darbuka'],
        avoidedSounds: ['aggressive', 'harsh'],
        preferredFrequencies: [440, 660, 880]
      }
    };
  }

  private generateMiddleEasternSound(instrument: string, frequency: number, duration: number): string {
    // توليد أصوات تحاكي الآلات الشرقية
    if (!this.audioContext) return '';

    const sampleRate = this.audioContext.sampleRate;
    const length = (duration / 1000) * sampleRate;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      switch (instrument) {
        case 'oud':
          // محاكاة صوت العود بموجات متعددة
          sample = (Math.sin(2 * Math.PI * frequency * t) * 0.6 +
                    Math.sin(2 * Math.PI * frequency * 2 * t) * 0.3 +
                    Math.sin(2 * Math.PI * frequency * 3 * t) * 0.1) *
                   Math.exp(-t * 2) * 0.4;
          break;

        case 'qanun':
          // محاكاة صوت القانون بنبرة معدنية
          sample = Math.sin(2 * Math.PI * frequency * t) *
                   (1 + Math.sin(t * 10) * 0.1) *
                   Math.exp(-t * 1.5) * 0.5;
          break;

        default:
          sample = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 2) * 0.4;
      }

      data[i] = sample;
    }

    return `data:audio/wav;base64,${this.bufferToBase64(buffer)}`;
  }

  async playSound(soundId: string, context?: Partial<SoundContext>): Promise<boolean> {
    const sound = this.soundLibrary.get(soundId);
    if (!sound || !this.audioContext) return false;

    try {
      // فحص تفضيلات المستخدم
      if (context?.userPreference === 'disabled') return false;

      // تقليل مستوى الصوت في حالة تقليل الحركة
      let volume = sound.volume;
      if (context?.userPreference === 'reduced') {
        volume *= 0.5;
      }

      // تعديل الصوت حسب الوقت والبيئة
      if (context?.timeOfDay === 'night') {
        volume *= 0.3;
      }

      if (context?.environmentalNoise === 'noisy') {
        volume *= 1.2;
      }

      // تشغيل الصوت
      const audioBuffer = await this.decodeAudioData(sound.audioData);
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = audioBuffer;
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start();

      return true;
    } catch (error) {
      console.error('Error playing sound:', error);
      return false;
    }
  }

  private async decodeAudioData(audioData: string): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not available');

    // محاكاة فك تشفير البيانات الصوتية
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // ملء البيانات بموجة بسيطة (لأغراض العرض)
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.1;
    }

    return buffer;
  }

  async createAdaptiveSoundSystem(userPreferences: any): Promise<{
    soundProfile: SoundProfile,
    recommendations: string[]
  }> {
    const profile = await this.createCulturallyAdaptedSounds(
      userPreferences.region || 'universal',
      userPreferences.language || 'en'
    );

    const recommendations = [
      'استخدم الأصوات الناعمة في البيئات الهادئة',
      'قم بتخفيض مستوى الصوت في الأوقات المتأخرة',
      'اختر أصوات مألوفة ثقافياً لتحسين تجربة المستخدم',
      'وفر بدائل بصرية للمستخدمين ضعاف السمع',
      'اتبع إعدادات تقليل الحركة في النظام'
    ];

    return { soundProfile: profile, recommendations };
  }

  getSoundByTrigger(trigger: string, context?: SoundContext): SoundDefinition | null {
    for (const sound of this.soundLibrary.values()) {
      if (sound.trigger === trigger) {
        // تحقق من التوافق الثقافي
        if (context?.platform && sound.cultural_variant) {
          // إعطاء أولوية للأصوات المتكيفة ثقافياً
          return sound;
        }
        return sound;
      }
    }
    return null;
  }

  async analyzeAudioAccessibility(sounds: SoundDefinition[]): Promise<{
    accessibilityScore: number,
    recommendations: string[],
    issues: string[]
  }> {
    let score = 100;
    const recommendations: string[] = [];
    const issues: string[] = [];

    // فحص مستويات الصوت
    const volumeLevels = sounds.map(s => s.volume);
    const avgVolume = volumeLevels.reduce((a, b) => a + b, 0) / volumeLevels.length;

    if (avgVolume > 0.7) {
      score -= 20;
      issues.push('مستويات الصوت مرتفعة جداً');
      recommendations.push('قم بتقليل مستويات الصوت الافتراضية');
    }

    // فحص التنوع في الترددات
    const frequencies = sounds.map(s => s.pitch);
    const freqRange = Math.max(...frequencies) - Math.min(...frequencies);

    if (freqRange < 500) {
      score -= 15;
      issues.push('نطاق ترددي محدود');
      recommendations.push('استخدم نطاق أوسع من الترددات');
    }

    // فحص المدة الزمنية
    const durations = sounds.map(s => s.duration);
    const longSounds = durations.filter(d => d > 1000).length;

    if (longSounds > sounds.length / 2) {
      score -= 10;
      issues.push('أصوات طويلة قد تكون مزعجة');
      recommendations.push('اجعل معظم الأصوات قصيرة (أقل من ثانية واحدة)');
    }

    return { accessibilityScore: score, recommendations, issues };
  }

  generateSoundManifest(): {
    totalSounds: number,
    categories: string[],
    culturalVariants: string[],
    accessibilityFeatures: string[]
  } {
    const sounds = Array.from(this.soundLibrary.values());
    
    return {
      totalSounds: sounds.length,
      categories: [...new Set(sounds.map(s => s.emotional_tone))],
      culturalVariants: [...new Set(sounds.map(s => s.cultural_variant).filter(Boolean))],
      accessibilityFeatures: [
        'Volume control',
        'Cultural adaptation',
        'Reduced motion support',
        'Visual alternatives',
        'Frequency optimization'
      ]
    };
  }
}

export const microInteractionSoundDesign = new MicroInteractionSoundDesign();