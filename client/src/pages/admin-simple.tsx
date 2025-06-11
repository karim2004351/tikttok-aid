import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, LogOut, Zap, Rocket, Settings, BarChart3, Users, Globe2, Target, Monitor } from "lucide-react";
import { Link } from "wouter";

export default function AdminSimple() {
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <nav className="container mx-auto px-4 py-4">
          {/* Mobile Header */}
          <div className="flex flex-col space-y-4 md:hidden">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Globe className="h-6 w-6 text-purple-400" />
                <h1 className="text-lg font-bold text-white">لوحة التحكم</h1>
              </div>
              <Button 
                onClick={handleLogout}
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-red-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <a href="/quick-publish-new" className="flex-1">
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-sm">
                  <Zap className="h-4 w-4 ml-1" />
                  النشر السريع
                </Button>
              </a>
              <Link href="/" className="flex-1">
                <Button variant="ghost" className="w-full text-white hover:bg-purple-600 text-sm">
                  العودة للموقع
                </Button>
              </Link>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Globe className="h-8 w-8 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">لوحة التحكم الإدارية</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/quick-publish-new">
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                  <Zap className="h-4 w-4 ml-2" />
                  النشر السريع
                </Button>
              </a>
              <Link href="/">
                <Button variant="ghost" className="text-white hover:bg-purple-600">
                  العودة للموقع
                </Button>
              </Link>
              <Button 
                onClick={handleLogout}
                variant="ghost" 
                className="text-white hover:bg-red-600"
              >
                <LogOut className="h-4 w-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* الإدارة الشاملة */}
        <Card className="mb-8 bg-gray-800/40 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white text-right flex items-center justify-end">
              <Globe2 className="h-6 w-6 text-purple-400 ml-2" />
              الإدارة الشاملة
            </CardTitle>
            <CardDescription className="text-gray-300">الوصول لجميع أدوات الإدارة الشاملة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a href="/quick-publish-new" className="block">
                <Card className="bg-purple-800/30 border-purple-600 hover:bg-purple-800/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <h4 className="text-white font-medium mb-1">النشر السريع</h4>
                    <p className="text-gray-400 text-xs">نشر سريع ومتقدم</p>
                  </CardContent>
                </Card>
              </a>
              
              <a href="/published-examples" className="block">
                <Card className="bg-cyan-800/30 border-cyan-600 hover:bg-cyan-800/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                    <h4 className="text-white font-medium mb-1">أمثلة منشورة</h4>
                    <p className="text-gray-400 text-xs">عرض المحتوى المنشور</p>
                  </CardContent>
                </Card>
              </a>
              
              <a href="/sites-control" className="block">
                <Card className="bg-green-800/30 border-green-600 hover:bg-green-800/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Monitor className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <h4 className="text-white font-medium mb-1">التحكم بالمواقع</h4>
                    <p className="text-gray-400 text-xs">إدارة وتنظيم المواقع</p>
                  </CardContent>
                </Card>
              </a>
              
              <a href="/dashboard" className="block">
                <Card className="bg-blue-800/30 border-blue-600 hover:bg-blue-800/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Settings className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <h4 className="text-white font-medium mb-1">لوحة القيادة</h4>
                    <p className="text-gray-400 text-xs">لوحة التحكم الرئيسية</p>
                  </CardContent>
                </Card>
              </a>
              
              <a href="/tiktok-manager" className="block">
                <Card className="bg-teal-800/30 border-teal-600 hover:bg-teal-800/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Globe className="h-8 w-8 text-teal-400 mx-auto mb-2" />
                    <h4 className="text-white font-medium mb-1">مدير تيك توك</h4>
                    <p className="text-gray-400 text-xs">إدارة حسابات تيك توك</p>
                  </CardContent>
                </Card>
              </a>
              
              <a href="/contact" className="block">
                <Card className="bg-pink-800/30 border-pink-600 hover:bg-pink-800/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-pink-400 mx-auto mb-2" />
                    <h4 className="text-white font-medium mb-1">اتصل بنا</h4>
                    <p className="text-gray-400 text-xs">تواصل مع فريق الدعم</p>
                  </CardContent>
                </Card>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* أدوات النشر */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <a href="/quick-publish-new" className="block">
            <Card className="bg-blue-900/20 border-blue-700 hover:bg-blue-900/30 transition-colors cursor-pointer">
              <CardContent className="p-4 md:p-6 flex items-center space-x-4">
                <Rocket className="h-8 w-8 md:h-12 md:w-12 text-blue-400 flex-shrink-0" />
                <div className="text-right flex-1">
                  <h3 className="text-white font-medium text-lg mb-1">النشر السريع المتقدم</h3>
                  <p className="text-gray-400 text-sm">تحليل ذكي ونشر تلقائي إلى 1,173 موقع ومنتدى</p>
                </div>
              </CardContent>
            </Card>
          </a>

          <a href="/free-publish" className="block">
            <Card className="bg-green-900/20 border-green-700 hover:bg-green-900/30 transition-colors cursor-pointer">
              <CardContent className="p-4 md:p-6 flex items-center space-x-4">
                <Zap className="h-8 w-8 md:h-12 md:w-12 text-green-400 flex-shrink-0" />
                <div className="text-right flex-1">
                  <h3 className="text-white font-medium text-lg mb-1">النشر المجاني</h3>
                  <p className="text-gray-400 text-sm">نشر مجاني للمحتوى عبر المنصات</p>
                </div>
              </CardContent>
            </Card>
          </a>

          <a href="/fast-publish" className="block">
            <Card className="bg-orange-900/20 border-orange-700 hover:bg-orange-900/30 transition-colors cursor-pointer">
              <CardContent className="p-4 md:p-6 flex items-center space-x-4">
                <Target className="h-8 w-8 md:h-12 md:w-12 text-orange-400 flex-shrink-0" />
                <div className="text-right flex-1">
                  <h3 className="text-white font-medium text-lg mb-1">النشر السريع</h3>
                  <p className="text-gray-400 text-sm">نشر فوري وسريع للمحتوى</p>
                </div>
              </CardContent>
            </Card>
          </a>

          <a href="/verification" className="block">
            <Card className="bg-purple-900/20 border-purple-700 hover:bg-purple-900/30 transition-colors cursor-pointer">
              <CardContent className="p-4 md:p-6 flex items-center space-x-4">
                <Settings className="h-8 w-8 md:h-12 md:w-12 text-purple-400 flex-shrink-0" />
                <div className="text-right flex-1">
                  <h3 className="text-white font-medium text-lg mb-1">التحقق والمراجعة</h3>
                  <p className="text-gray-400 text-sm">التحقق من العمليات والنتائج</p>
                </div>
              </CardContent>
            </Card>
          </a>
        </div>

      </main>
    </div>
  );
}