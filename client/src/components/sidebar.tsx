import { Link, useLocation } from "wouter";
import { Rocket, Play, Activity, Settings, Menu, X, Globe, Shield, Bug } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", icon: Play, label: "النشر", active: location === "/dashboard" },
    { href: "/verification", icon: Shield, label: "التحقق من النشر", active: location === "/verification" },
    { href: "/tiktok", icon: Activity, label: "تيك توك", active: location === "/tiktok" },
    { href: "/admin/debug", icon: Bug, label: "تشخيص النظام", active: location === "/admin/debug" },
    { href: "/", icon: Globe, label: "الرئيسية", active: location === "/" },
  ];

  const logout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/';
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-slate-800 text-white hover:bg-slate-700"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-50
        w-64 bg-slate-800 border-l lg:border-r lg:border-l-0 border-slate-700 
        flex flex-col transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 lg:p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-white">منصة النشر</h1>
              <p className="text-xs lg:text-sm text-slate-400">لوحة الإدارة</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-3 lg:p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <span
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 lg:py-2 rounded-lg transition-colors cursor-pointer text-sm lg:text-base ${
                    item.active
                      ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                  }`}
                >
                  <Icon className="w-4 h-4 lg:w-4 lg:h-4" />
                  <span className={item.active ? "font-medium" : ""}>{item.label}</span>
                </span>
              </Link>
            );
          })}
          
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3 py-3 lg:py-2 rounded-lg transition-colors text-slate-400 hover:text-red-400 hover:bg-slate-700/50 text-sm lg:text-base mt-4"
          >
            <Settings className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </nav>

        <div className="p-3 lg:p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700/50">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <p className="text-xs lg:text-sm font-medium text-slate-200">حالة الخادم</p>
              <p className="text-xs text-slate-400">متصل - المنفذ 5000</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
