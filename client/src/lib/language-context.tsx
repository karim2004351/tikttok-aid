import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en' | 'fr' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations = {
  ar: {
    // Navigation & Common
    'nav.home': 'الرئيسية',
    'nav.dashboard': 'لوحة التحكم',
    'nav.publish': 'نشر المحتوى',
    'nav.contact': 'تواصل معنا',
    'nav.features': 'الميزات',
    'nav.admin': 'إدارة',
    'common.loading': 'تحميل...',
    'common.success': 'نجح',
    'common.error': 'خطأ',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.submit': 'إرسال',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.previous': 'السابق',
    'common.close': 'إغلاق',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.view': 'عرض',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.sort': 'ترتيب',
    'common.refresh': 'تحديث',
    
    // Home Page
    'home.title': 'منصة النشر الذكي متعددة المنصات',
    'home.subtitle': 'أكثر من 1,171 موقع ومنتدى متاح',
    'home.description': 'منصة النشر الذكي تمكنك من نشر فيديوهاتك ومحتواك على أكثر من 1100 موقع ومنتدى عالمي بضغطة واحدة. وصل إلى ملايين المشاهدين حول العالم.',
    'home.heroTitle': 'انشر محتواك على العالم كله',
    'home.videoAnalysis': 'تحليل الفيديو المتقدم',
    'home.freePublish': 'انشر مجاناً الآن',
    'home.followers': 'متابعين البث المباشر',
    'home.advancedServices': 'أو تواصل معنا للحصول على خدمات متقدمة',
    'home.whyTitle': 'لماذا منصة النشر الذكي؟',
    'home.whyDescription': 'احصل على أقصى وصول لمحتواك مع أدوات النشر الاحترافية',
    'home.globalCoverage': 'تغطية عالمية شاملة',
    'home.globalCoverageDesc': 'أكثر من 1,171 موقع ومنتدى من جميع أنحاء العالم',
    'home.smartPublish': 'نشر سريع وذكي',
    'home.smartPublishDesc': 'اتمتة كاملة لعملية النشر مع متابعة مباشرة',
    'home.security': 'أمان وموثوقية',
    'home.securityDesc': 'نشر آمن مع حماية كاملة لبياناتك',
    'home.start_now': 'ابدأ الآن',
    'home.learn_more': 'اعرف المزيد',
    'home.features.title': 'الميزات الرئيسية',
    'home.features.automation': 'أتمتة كاملة',
    'home.features.ai_powered': 'مدعوم بالذكاء الاصطناعي',
    'home.features.multi_platform': 'متعدد المنصات',
    'home.features.analytics': 'تحليلات متقدمة',
    
    // Contact
    'contact.title': 'تواصل معنا',
    'contact.email': 'البريد الإلكتروني',
    'contact.whatsapp': 'واتساب',
    'contact.tiktok': 'تيك توك',
    'contact.telegram': 'تلغرام',
    'contact.social': 'الشبكات الاجتماعية',
    'contact.description': 'نحن هنا لمساعدتك! تواصل معنا عبر أي من الطرق التالية للحصول على الدعم والمساعدة',
    'contact.emailDesc': 'تواصل معنا عبر البريد الإلكتروني للاستفسارات والدعم',
    'contact.whatsappDesc': 'تواصل فوري عبر واتساب للدعم السريع',
    'contact.tiktokDesc': 'تابعنا على تيك توك للحصول على آخر التحديثات',
    'contact.telegramDesc': 'انضم لقناة التلغرام للحصول على الدعم والمساعدة',
    
    // Publishing
    'publish.title': 'نشر المحتوى',
    'publish.url_placeholder': 'أدخل رابط الفيديو هنا...',
    'publish.analyze': 'تحليل',
    'publish.start_publishing': 'بدء النشر',
    'publish.status': 'حالة النشر',
    'publish.success_sites': 'المواقع الناجحة',
    'publish.failed_sites': 'المواقع الفاشلة',
    'publish.total_sites': 'إجمالي المواقع',
    'publish.free_title': 'النشر المجاني',
    'publish.requirements': 'المتطلبات',
    'publish.follow_account': 'متابعة الحساب',
    'publish.watch_video': 'مشاهدة الفيديو',
    'publish.like_video': 'إعجاب بالفيديو',
    'publish.comment_video': 'التعليق على الفيديو',
    'publish.share_video': 'مشاركة الفيديو',
    'publish.verify_requirements': 'التحقق من المتطلبات',
    'publish.video_analysis': 'تحليل الفيديو',
    'publish.custom_title': 'عنوان مخصص',
    'publish.custom_description': 'وصف مخصص',
    'publish.custom_hashtags': 'هاشتاغات مخصصة',
    'publish.free_description': 'أكمل المتطلبات البسيطة واحصل على نشر مجاني لفيديوك على أكثر من 1000 موقع',
    'publish.used_today': 'تم استخدام النشر المجاني',
    'publish.used_description': 'لقد استخدمت النشر المجاني اليوم. يمكنك المحاولة مرة أخرى غداً.',
    'publish.verification_results': 'نتائج التحقق',
    'publish.follow_page': 'متابعة الصفحة',
    'publish.watch_complete': 'مشاهدة الفيديو',
    'publish.like_complete': 'إعجاب بالفيديو',
    'publish.comment_complete': 'التعليق',
    'publish.share_complete': 'المشاركة',
    
    // Language Selector
    'language.select': 'اختر اللغة',
    'language.arabic': 'العربية',
    'language.english': 'English',
    'language.french': 'Français',
    'language.spanish': 'Español',
  },
  
  en: {
    // Navigation & Common
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.publish': 'Publish Content',
    'nav.contact': 'Contact Us',
    'nav.features': 'Features',
    'nav.admin': 'Admin',
    'common.loading': 'Loading...',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.submit': 'Submit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.refresh': 'Refresh',
    
    // Home Page
    'home.title': 'Smart Multi-Platform Publishing Platform',
    'home.subtitle': 'More than 1,171 sites and forums available',
    'home.description': 'Smart publishing platform allows you to publish your videos and content to more than 1100 global sites and forums with one click. Reach millions of viewers around the world.',
    'home.heroTitle': 'Publish Your Content to the Whole World',
    'home.videoAnalysis': 'Advanced Video Analysis',
    'home.freePublish': 'Publish for Free Now',
    'home.followers': 'Live Stream Followers',
    'home.advancedServices': 'Or contact us for advanced services',
    'home.whyTitle': 'Why Smart Publishing Platform?',
    'home.whyDescription': 'Get maximum reach for your content with professional publishing tools',
    'home.globalCoverage': 'Comprehensive Global Coverage',
    'home.globalCoverageDesc': 'More than 1,171 sites and forums from around the world',
    'home.smartPublish': 'Fast and Smart Publishing',
    'home.smartPublishDesc': 'Complete automation of the publishing process with live monitoring',
    'home.security': 'Security and Reliability',
    'home.securityDesc': 'Secure publishing with complete protection of your data',
    'home.start_now': 'Start Now',
    'home.learn_more': 'Learn More',
    'home.features.title': 'Key Features',
    'home.features.automation': 'Full Automation',
    'home.features.ai_powered': 'AI-Powered',
    'home.features.multi_platform': 'Multi-Platform',
    'home.features.analytics': 'Advanced Analytics',
    
    // Contact
    'contact.title': 'Contact Us',
    'contact.email': 'Email',
    'contact.whatsapp': 'WhatsApp',
    'contact.tiktok': 'TikTok',
    'contact.telegram': 'Telegram',
    'contact.social': 'Social Networks',
    'contact.description': 'We are here to help you! Contact us through any of the following methods for support and assistance',
    'contact.emailDesc': 'Contact us via email for inquiries and support',
    'contact.whatsappDesc': 'Instant contact via WhatsApp for quick support',
    'contact.tiktokDesc': 'Follow us on TikTok for the latest updates',
    'contact.telegramDesc': 'Join our Telegram channel for support and assistance',
    
    // Publishing
    'publish.title': 'Publish Content',
    'publish.url_placeholder': 'Enter video URL here...',
    'publish.analyze': 'Analyze',
    'publish.start_publishing': 'Start Publishing',
    'publish.status': 'Publishing Status',
    'publish.success_sites': 'Successful Sites',
    'publish.failed_sites': 'Failed Sites',
    'publish.total_sites': 'Total Sites',
    'publish.free_title': 'Free Publishing',
    'publish.requirements': 'Requirements',
    'publish.follow_account': 'Follow Account',
    'publish.watch_video': 'Watch Video',
    'publish.like_video': 'Like Video',
    'publish.comment_video': 'Comment on Video',
    'publish.share_video': 'Share Video',
    'publish.verify_requirements': 'Verify Requirements',
    'publish.video_analysis': 'Video Analysis',
    'publish.custom_title': 'Custom Title',
    'publish.custom_description': 'Custom Description',
    'publish.custom_hashtags': 'Custom Hashtags',
    'publish.free_description': 'Complete simple requirements and get free publishing for your video on over 1000 sites',
    'publish.used_today': 'Free Publishing Used',
    'publish.used_description': 'You have used free publishing today. You can try again tomorrow.',
    'publish.verification_results': 'Verification Results',
    'publish.follow_page': 'Follow Page',
    'publish.watch_complete': 'Watch Video',
    'publish.like_complete': 'Like Video',
    'publish.comment_complete': 'Comment',
    'publish.share_complete': 'Share',
    
    // Language Selector
    'language.select': 'Select Language',
    'language.arabic': 'العربية',
    'language.english': 'English',
    'language.french': 'Français',
    'language.spanish': 'Español',
  },
  
  fr: {
    // Navigation & Common
    'nav.home': 'Accueil',
    'nav.dashboard': 'Tableau de bord',
    'nav.publish': 'Publier du contenu',
    'nav.contact': 'Nous contacter',
    'nav.features': 'Fonctionnalités',
    'nav.admin': 'Administration',
    'common.loading': 'Chargement...',
    'common.success': 'Succès',
    'common.error': 'Erreur',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.submit': 'Soumettre',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    'common.close': 'Fermer',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.view': 'Voir',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.sort': 'Trier',
    'common.refresh': 'Actualiser',
    
    // Home Page
    'home.title': 'Plateforme de publication intelligente multi-plateformes',
    'home.subtitle': 'Plus de 1 171 sites et forums disponibles',
    'home.description': 'La plateforme de publication intelligente vous permet de publier vos vidéos et votre contenu sur plus de 1100 sites et forums mondiaux en un clic. Atteignez des millions de spectateurs dans le monde entier.',
    'home.heroTitle': 'Publiez votre contenu dans le monde entier',
    'home.videoAnalysis': 'Analyse vidéo avancée',
    'home.freePublish': 'Publier gratuitement maintenant',
    'home.followers': 'Abonnés de diffusion en direct',
    'home.advancedServices': 'Ou contactez-nous pour des services avancés',
    'home.whyTitle': 'Pourquoi la plateforme de publication intelligente?',
    'home.whyDescription': 'Obtenez une portée maximale pour votre contenu avec des outils de publication professionnels',
    'home.globalCoverage': 'Couverture mondiale complète',
    'home.globalCoverageDesc': 'Plus de 1 171 sites et forums du monde entier',
    'home.smartPublish': 'Publication rapide et intelligente',
    'home.smartPublishDesc': 'Automatisation complète du processus de publication avec surveillance en direct',
    'home.security': 'Sécurité et fiabilité',
    'home.securityDesc': 'Publication sécurisée avec protection complète de vos données',
    'home.start_now': 'Commencer maintenant',
    'home.learn_more': 'En savoir plus',
    'home.features.title': 'Fonctionnalités principales',
    'home.features.automation': 'Automatisation complète',
    'home.features.ai_powered': 'Alimenté par IA',
    'home.features.multi_platform': 'Multi-plateformes',
    'home.features.analytics': 'Analyses avancées',
    
    // Contact
    'contact.title': 'Nous contacter',
    'contact.email': 'Email',
    'contact.whatsapp': 'WhatsApp',
    'contact.tiktok': 'TikTok',
    'contact.telegram': 'Telegram',
    'contact.social': 'Réseaux sociaux',
    'contact.description': 'Nous sommes là pour vous aider! Contactez-nous par l\'un des moyens suivants pour obtenir du support et de l\'assistance',
    'contact.emailDesc': 'Contactez-nous par email pour les demandes et le support',
    'contact.whatsappDesc': 'Contact instantané via WhatsApp pour un support rapide',
    'contact.tiktokDesc': 'Suivez-nous sur TikTok pour les dernières mises à jour',
    'contact.telegramDesc': 'Rejoignez notre chaîne Telegram pour le support et l\'assistance',
    
    // Publishing
    'publish.title': 'Publier du contenu',
    'publish.url_placeholder': 'Entrez l\'URL de la vidéo ici...',
    'publish.analyze': 'Analyser',
    'publish.start_publishing': 'Commencer la publication',
    'publish.status': 'Statut de publication',
    'publish.success_sites': 'Sites réussis',
    'publish.failed_sites': 'Sites échoués',
    'publish.total_sites': 'Total des sites',
    'publish.free_title': 'Publication gratuite',
    'publish.requirements': 'Exigences',
    'publish.follow_account': 'Suivre le compte',
    'publish.watch_video': 'Regarder la vidéo',
    'publish.like_video': 'Aimer la vidéo',
    'publish.comment_video': 'Commenter la vidéo',
    'publish.share_video': 'Partager la vidéo',
    'publish.verify_requirements': 'Vérifier les exigences',
    'publish.video_analysis': 'Analyse vidéo',
    'publish.custom_title': 'Titre personnalisé',
    'publish.custom_description': 'Description personnalisée',
    'publish.custom_hashtags': 'Hashtags personnalisés',
    'publish.free_description': 'Complétez les exigences simples et obtenez une publication gratuite pour votre vidéo sur plus de 1000 sites',
    'publish.used_today': 'Publication gratuite utilisée',
    'publish.used_description': 'Vous avez utilisé la publication gratuite aujourd\'hui. Vous pouvez réessayer demain.',
    'publish.verification_results': 'Résultats de vérification',
    'publish.follow_page': 'Suivre la page',
    'publish.watch_complete': 'Regarder la vidéo',
    'publish.like_complete': 'Aimer la vidéo',
    'publish.comment_complete': 'Commenter',
    'publish.share_complete': 'Partager',
    
    // Language Selector
    'language.select': 'Sélectionner la langue',
    'language.arabic': 'العربية',
    'language.english': 'English',
    'language.french': 'Français',
    'language.spanish': 'Español',
  },
  
  es: {
    // Navigation & Common
    'nav.home': 'Inicio',
    'nav.dashboard': 'Panel de control',
    'nav.publish': 'Publicar contenido',
    'nav.contact': 'Contáctanos',
    'nav.features': 'Características',
    'nav.admin': 'Administración',
    'common.loading': 'Cargando...',
    'common.success': 'Éxito',
    'common.error': 'Error',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.submit': 'Enviar',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.close': 'Cerrar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.view': 'Ver',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.sort': 'Ordenar',
    'common.refresh': 'Actualizar',
    
    // Home Page
    'home.title': 'Plataforma de publicación inteligente multiplataforma',
    'home.subtitle': 'Más de 1,171 sitios y foros disponibles',
    'home.description': 'La plataforma de publicación inteligente te permite publicar tus videos y contenido en más de 1100 sitios y foros globales con un clic. Llega a millones de espectadores en todo el mundo.',
    'home.heroTitle': 'Publica tu contenido en todo el mundo',
    'home.videoAnalysis': 'Análisis de video avanzado',
    'home.freePublish': 'Publicar gratis ahora',
    'home.followers': 'Seguidores de transmisión en vivo',
    'home.advancedServices': 'O contáctanos para servicios avanzados',
    'home.whyTitle': '¿Por qué la plataforma de publicación inteligente?',
    'home.whyDescription': 'Obtén el máximo alcance para tu contenido con herramientas de publicación profesionales',
    'home.globalCoverage': 'Cobertura global integral',
    'home.globalCoverageDesc': 'Más de 1,171 sitios y foros de todo el mundo',
    'home.smartPublish': 'Publicación rápida e inteligente',
    'home.smartPublishDesc': 'Automatización completa del proceso de publicación con monitoreo en vivo',
    'home.security': 'Seguridad y confiabilidad',
    'home.securityDesc': 'Publicación segura con protección completa de tus datos',
    'home.start_now': 'Empezar ahora',
    'home.learn_more': 'Saber más',
    'home.features.title': 'Características principales',
    'home.features.automation': 'Automatización completa',
    'home.features.ai_powered': 'Impulsado por IA',
    'home.features.multi_platform': 'Multiplataforma',
    'home.features.analytics': 'Análisis avanzados',
    
    // Contact
    'contact.title': 'Contáctanos',
    'contact.email': 'Correo electrónico',
    'contact.whatsapp': 'WhatsApp',
    'contact.tiktok': 'TikTok',
    'contact.telegram': 'Telegram',
    'contact.social': 'Redes sociales',
    'contact.description': '¡Estamos aquí para ayudarte! Contáctanos a través de cualquiera de los siguientes métodos para obtener soporte y asistencia',
    'contact.emailDesc': 'Contáctanos por correo electrónico para consultas y soporte',
    'contact.whatsappDesc': 'Contacto instantáneo vía WhatsApp para soporte rápido',
    'contact.tiktokDesc': 'Síguenos en TikTok para las últimas actualizaciones',
    'contact.telegramDesc': 'Únete a nuestro canal de Telegram para soporte y asistencia',
    
    // Publishing
    'publish.title': 'Publicar contenido',
    'publish.url_placeholder': 'Ingresa la URL del video aquí...',
    'publish.analyze': 'Analizar',
    'publish.start_publishing': 'Comenzar publicación',
    'publish.status': 'Estado de publicación',
    'publish.success_sites': 'Sitios exitosos',
    'publish.failed_sites': 'Sitios fallidos',
    'publish.total_sites': 'Total de sitios',
    'publish.free_title': 'Publicación gratuita',
    'publish.requirements': 'Requisitos',
    'publish.follow_account': 'Seguir cuenta',
    'publish.watch_video': 'Ver video',
    'publish.like_video': 'Me gusta al video',
    'publish.comment_video': 'Comentar video',
    'publish.share_video': 'Compartir video',
    'publish.verify_requirements': 'Verificar requisitos',
    'publish.video_analysis': 'Análisis de video',
    'publish.custom_title': 'Título personalizado',
    'publish.custom_description': 'Descripción personalizada',
    'publish.custom_hashtags': 'Hashtags personalizados',
    'publish.free_description': 'Completa los requisitos simples y obtén publicación gratuita para tu video en más de 1000 sitios',
    'publish.used_today': 'Publicación gratuita usada',
    'publish.used_description': 'Has usado la publicación gratuita hoy. Puedes intentar de nuevo mañana.',
    'publish.verification_results': 'Resultados de verificación',
    'publish.follow_page': 'Seguir página',
    'publish.watch_complete': 'Ver video',
    'publish.like_complete': 'Me gusta al video',
    'publish.comment_complete': 'Comentar',
    'publish.share_complete': 'Compartir',
    
    // Language Selector
    'language.select': 'Seleccionar idioma',
    'language.arabic': 'العربية',
    'language.english': 'English',
    'language.french': 'Français',
    'language.spanish': 'Español',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && ['ar', 'en', 'fr', 'es'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Update document direction based on language
  useEffect(() => {
    const isRTL = language === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
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

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}