import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import { Globe, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LanguageSwitch() {
  const { language, setLanguage, direction } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="outline"
      size="sm"
      className={cn(
        "border-slate-600 text-slate-300 hover:bg-slate-700/50 transition-all duration-300",
        "flex items-center gap-2 min-w-[80px]",
        direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">
        {language === 'ar' ? 'EN' : 'عربي'}
      </span>
    </Button>
  );
}