import React, { useState, useEffect, createContext, useContext } from "react";

// Simple Language Context
type Language = 'ar' | 'en' | 'fr' | 'es';

const translations = {
  ar: {
    title: 'منصة النشر الذكي متعددة المنصات',
    subtitle: 'أكثر من 1,171 موقع ومنتدى متاح',
    description: 'منصة النشر الذكي تمكنك من نشر فيديوهاتك ومحتواك على أكثر من 1100 موقع ومنتدى عالمي بضغطة واحدة.',
    contact: 'تواصل معنا',
    publish: 'نشر مجاناً',
    changeLanguage: 'تغيير اللغة'
  },
  en: {
    title: 'Smart Multi-Platform Publishing Platform',
    subtitle: 'More than 1,171 sites and forums available',
    description: 'Smart publishing platform allows you to publish your videos and content to more than 1100 global sites and forums with one click.',
    contact: 'Contact Us',
    publish: 'Publish Free',
    changeLanguage: 'Change Language'
  },
  fr: {
    title: 'Plateforme de publication intelligente multi-plateformes',
    subtitle: 'Plus de 1 171 sites et forums disponibles',
    description: 'La plateforme de publication intelligente vous permet de publier vos vidéos et votre contenu sur plus de 1100 sites et forums mondiaux en un clic.',
    contact: 'Nous contacter',
    publish: 'Publier gratuitement',
    changeLanguage: 'Changer la langue'
  },
  es: {
    title: 'Plataforma de publicación inteligente multiplataforma',
    subtitle: 'Más de 1,171 sitios y foros disponibles',
    description: 'La plataforma de publicación inteligente te permite publicar tus videos y contenido en más de 1100 sitios y foros globales con un clic.',
    contact: 'Contáctanos',
    publish: 'Publicar gratis',
    changeLanguage: 'Cambiar idioma'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    const isRTL = language === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Apply Arabic font
    if (language === 'ar') {
      document.documentElement.style.fontFamily = '"Cairo", "Noto Sans Arabic", "Arial Unicode MS", sans-serif';
    } else {
      document.documentElement.style.fontFamily = '"Inter", "Segoe UI", "Roboto", sans-serif';
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Language Selector Component
function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'ar' as Language, name: 'العربية', flag: '🇸🇦' },
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
    { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm"
        >
          <span>{currentLanguage?.flag}</span>
          <span className="hidden sm:inline">{t('changeLanguage')}</span>
          <span className="text-xs">▼</span>
        </button>
        
        {isOpen && (
          <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border min-w-[160px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 first:rounded-t-lg last:rounded-b-lg ${
                  language === lang.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                {language === lang.code && <span className="ml-auto">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Main Home Component
function Home() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white ${isRTL ? 'text-right' : 'text-left'}`}>
      <LanguageSelector />
      
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className={`flex items-center justify-between flex-wrap gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              🌐
            </div>
            <h1 className="text-xl md:text-2xl font-bold">{t('title')}</h1>
          </div>
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <a href="/contact" className="text-white hover:text-purple-300 transition-colors">
              {t('contact')}
            </a>
            <a href="https://karimnapoli13.com/" target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
              خدمات أخرى
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 inline-block bg-purple-600 text-white px-6 py-2 rounded-full text-lg">
            {t('subtitle')}
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent leading-tight">
            {t('title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/free-publish" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
              {t('publish')}
            </a>
            <a href="/contact" className="border-2 border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
              {t('contact')}
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-bold mb-2">تغطية عالمية</h3>
            <p className="text-gray-300">أكثر من 1,171 موقع ومنتدى عالمي</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">نشر سريع</h3>
            <p className="text-gray-300">أتمتة كاملة لعملية النشر</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2">أمان وموثوقية</h3>
            <p className="text-gray-300">حماية كاملة لبياناتك</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Router Component
function Router() {
  const path = window.location.pathname;
  
  if (path === '/contact') {
    return <ContactPage />;
  }
  
  if (path === '/free-publish') {
    return <PublishPage />;
  }
  
  return <Home />;
}

// Contact Page
function ContactPage() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <LanguageSelector />
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center mb-8">{t('contact')}</h1>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xl mb-8">نحن هنا لمساعدتك! تواصل معنا للحصول على الدعم والمساعدة</p>
          <div className="grid gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">📧 البريد الإلكتروني</h3>
              <p>info@smartpublishing.com</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">📱 واتساب</h3>
              <p>+966 50 123 4567</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Publish Page
function PublishPage() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <LanguageSelector />
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center mb-8">{t('publish')}</h1>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8">
            <h3 className="text-xl font-bold mb-4">النشر المجاني</h3>
            <p className="mb-6">أدخل رابط الفيديو الخاص بك وابدأ النشر على أكثر من 1000 موقع</p>
            <div className="space-y-4">
              <input 
                type="url" 
                placeholder="أدخل رابط الفيديو هنا..."
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30"
              />
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors">
                بدء النشر
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <LanguageProvider>
      <Router />
    </LanguageProvider>
  );
}

export default App;