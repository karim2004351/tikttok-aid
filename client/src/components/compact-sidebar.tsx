import { useState, useContext } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Brain,
  Settings,
  BarChart3,
  Users,
  FileText,
  Globe,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Target,
  Video,
  Shield,
  Zap,
  MessageSquare,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import { LanguageSelector } from "@/components/language-selector";

interface NavigationItem {
  id: string;
  label: {
    ar: string;
    en: string;
  };
  icon: React.ElementType;
  href: string;
  badge?: {
    text: string;
    variant: "default" | "destructive" | "outline" | "secondary";
  };
  isNew?: boolean;
  subItems?: {
    label: { ar: string; en: string };
    href: string;
    icon: React.ElementType;
  }[];
}

const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: { ar: "لوحة التحكم", en: "Dashboard" },
    icon: Home,
    href: "/dashboard"
  },
  {
    id: "ai-recommendations",
    label: { ar: "التوصيات الذكية", en: "AI Recommendations" },
    icon: Brain,
    href: "/ai-recommendations",
    isNew: true,
    badge: { text: "AI", variant: "secondary" }
  },
  {
    id: "publishing",
    label: { ar: "النشر", en: "Publishing" },
    icon: Zap,
    href: "/publishing",
    subItems: [
      {
        label: { ar: "النشر السريع", en: "Quick Publish" },
        href: "/quick-publish",
        icon: Target
      },
      {
        label: { ar: "النشر المجاني", en: "Free Publish" },
        href: "/free-publish",
        icon: Sparkles
      }
    ]
  },
  {
    id: "video-analysis",
    label: { ar: "تحليل الفيديو", en: "Video Analysis" },
    icon: Video,
    href: "/video-analysis"
  },
  {
    id: "social-comments",
    label: { ar: "نشر التعليقات", en: "Social Comments" },
    icon: Users,
    href: "/social-comments",
    subItems: [
      {
        label: { ar: "النشر اليدوي", en: "Manual Publishing" },
        href: "/social-comments",
        icon: Target
      },
      {
        label: { ar: "النشر التلقائي", en: "Auto Publishing" },
        href: "/automated-comments",
        icon: Zap
      }
    ]
  },
  {
    id: "verification",
    label: { ar: "التحقق", en: "Verification" },
    icon: Shield,
    href: "/verification"
  },
  {
    id: "analytics",
    label: { ar: "التحليلات", en: "Analytics" },
    icon: BarChart3,
    href: "/analytics"
  },
  {
    id: "users",
    label: { ar: "المستخدمون", en: "Users" },
    icon: Users,
    href: "/users"
  },
  {
    id: "settings",
    label: { ar: "الإعدادات", en: "Settings" },
    icon: Settings,
    href: "/settings"
  }
];

export function CompactSidebar() {
  const [location] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSubMenu, setExpandedSubMenu] = useState<string | null>(null);
  const { language, setLanguage } = useLanguage();
  
  const isRTL = language === 'ar';
  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setExpandedSubMenu(null);
    }
  };

  const handleSubMenuToggle = (itemId: string) => {
    if (expandedSubMenu === itemId) {
      setExpandedSubMenu(null);
    } else {
      setExpandedSubMenu(itemId);
    }
  };

  const isActive = (href: string) => {
    return location === href || location.startsWith(href + "/");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isExpanded ? 280 : 64,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed top-0 z-50 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900",
          "border-r border-slate-700/50 backdrop-blur-sm",
          "lg:static lg:translate-x-0",
          isRTL ? "right-0" : "left-0",
          isExpanded ? "translate-x-0" : (isRTL ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0")
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <motion.div
            initial={false}
            animate={{ opacity: isExpanded ? 1 : 0 }}
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="text-white">
              <h1 className="text-lg font-bold">ContentPro</h1>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'منصة النشر الذكية' : 'Smart Publishing Platform'}
              </p>
            </div>
          </motion.div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            {isExpanded ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Language Selector */}
        <div className="p-4 border-b border-slate-700/50">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isExpanded ? (
              <LanguageSelector />
            ) : (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleLanguage}
                className="w-full border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 aspect-square"
              >
                <Globe className="h-4 w-4" />
              </Button>
            )}
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <div key={item.id}>
              {/* Main navigation item */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {item.subItems ? (
                  <button
                    onClick={() => handleSubMenuToggle(item.id)}
                    className={cn(
                      "w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2.5 rounded-lg transition-all duration-200",
                      "text-slate-300 hover:text-white hover:bg-slate-700/50",
                      expandedSubMenu === item.id && "bg-slate-700/30 text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {isExpanded && (
                      <>
                        <span className="flex-1 text-left rtl:text-right text-sm font-medium">
                          {item.label[language as keyof typeof item.label]}
                        </span>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          {item.badge && (
                            <Badge variant={item.badge.variant} className="text-xs px-1.5 py-0.5">
                              {item.badge.text}
                            </Badge>
                          )}
                          {item.isNew && (
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          )}
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transition-transform",
                              expandedSubMenu === item.id && "rotate-90"
                            )}
                          />
                        </div>
                      </>
                    )}
                  </button>
                ) : (
                  <Link href={item.href}>
                    <div
                      className={cn(
                        "flex items-center space-x-3 rtl:space-x-reverse px-3 py-2.5 rounded-lg transition-all duration-200",
                        "text-slate-300 hover:text-white hover:bg-slate-700/50",
                        isActive(item.href) && "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30"
                      )}
                      onClick={() => {
                        // Auto-collapse sidebar on mobile and for RTL languages
                        setIsExpanded(false);
                      }}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {isExpanded && (
                        <>
                          <span className="flex-1 text-sm font-medium">
                            {item.label[language as keyof typeof item.label]}
                          </span>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            {item.badge && (
                              <Badge variant={item.badge.variant} className="text-xs px-1.5 py-0.5">
                                {item.badge.text}
                              </Badge>
                            )}
                            {item.isNew && (
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </Link>
                )}
              </motion.div>

              {/* Sub-menu items */}
              <AnimatePresence>
                {item.subItems && expandedSubMenu === item.id && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-8 rtl:mr-8 rtl:ml-0 mt-2 space-y-1">
                      {item.subItems.map((subItem, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link href={subItem.href}>
                            <div
                              className={cn(
                                "flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg transition-all duration-200",
                                "text-slate-400 hover:text-white hover:bg-slate-700/30 text-sm",
                                isActive(subItem.href) && "bg-purple-600/20 text-purple-300"
                              )}
                            >
                              <subItem.icon className="h-4 w-4 flex-shrink-0" />
                              <span>{subItem.label[language as keyof typeof subItem.label]}</span>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Footer */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 border-t border-slate-700/50"
          >
            <div className="text-center text-xs text-slate-500">
              <p>{language === 'ar' ? 'إصدار' : 'Version'} 2.1.0</p>
              <p className="mt-1">
                {language === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered'}
              </p>
            </div>
          </motion.div>
        )}
      </motion.aside>
    </>
  );
}