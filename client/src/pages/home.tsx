import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Globe, Shield, Zap, Users, TrendingUp, Star, Eye, BarChart3, Mail, MessageCircle, Send } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 md:py-6">
        <nav className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Globe className="h-6 w-6 md:h-8 md:w-8 text-purple-400" />
            <h1 className="text-lg md:text-2xl font-bold">منصة النشر الذكي متعددة المنصات</h1>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link href="/auth-login">
              <Button className="bg-blue-600 text-white hover:bg-blue-700 border-0 text-sm md:text-base px-3 md:px-4">
                تسجيل الدخول
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="text-white hover:bg-purple-600 text-sm md:text-base px-3 md:px-4">
                تواصل معنا
              </Button>
            </Link>
            <a href="https://karimnapoli13.com/" target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-600 text-white hover:bg-green-700 border-0 text-sm md:text-base px-3 md:px-4">
                خدمات أخرى
                <ArrowRight className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 md:mb-6 bg-purple-600 text-white px-4 md:px-6 py-2 text-sm md:text-lg">
            أكثر من 1,171 موقع ومنتدى متاح
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent leading-tight">
            انشر محتواك على العالم كله
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed">
            منصة النشر الذكي تمكنك من نشر فيديوهاتك ومحتواك على أكثر من 1100 موقع ومنتدى عالمي بضغطة واحدة. وصل إلى ملايين المشاهدين حول العالم.
          </p>
          <div className="flex flex-col gap-4 justify-center items-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/video-analysis-dashboard">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 md:px-12 py-6 md:py-8 text-xl md:text-2xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  📊 تحليل الفيديو المتقدم
                </Button>
              </Link>
              <Link href="/real-free-publish">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 md:px-12 py-6 md:py-8 text-xl md:text-2xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  🚀 انشر مجاناً الآن
                </Button>
              </Link>
              <Link href="/followers-live-stream">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 md:px-12 py-6 md:py-8 text-xl md:text-2xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  👥 متابعين البث المباشر
                </Button>
              </Link>
            </div>
            
            <div className="mt-6">
              <p className="text-gray-400 text-sm md:text-base mb-4">أو تواصل معنا للحصول على خدمات متقدمة</p>
              <Link href="/contact">
                <Button 
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 px-6 py-3 text-lg font-semibold shadow-lg"
                >
                  تواصل معنا
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h3 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">لماذا منصة النشر الذكي؟</h3>
            <p className="text-base md:text-xl text-gray-300 max-w-3xl mx-auto">
              اكتشف المزايا الفريدة التي تجعل منصتنا الخيار الأمثل لنشر محتواك وتوسيع نطاق وصولك
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Globe className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <CardTitle className="text-white text-lg md:text-xl">وصول عالمي واسع</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300 text-sm md:text-base">
                  اوصل إلى أكثر من 1,171 موقع ومنتدى حول العالم بنقرة واحدة فقط
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <CardTitle className="text-white text-lg md:text-xl">سرعة وكفاءة</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300 text-sm md:text-base">
                  تكنولوجيا متطورة تضمن النشر السريع والفعال على جميع المنصات
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <CardTitle className="text-white text-lg md:text-xl">أمان وموثوقية</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300 text-sm md:text-base">
                  حماية متقدمة لمحتواك مع ضمانات الخصوصية والأمان التام
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h3 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">ميزات متقدمة</h3>
            <p className="text-base md:text-xl text-gray-300 max-w-3xl mx-auto">
              استفد من مجموعة شاملة من الأدوات والميزات المصممة لتعزيز تواجدك الرقمي
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <h4 className="text-white text-base md:text-lg font-semibold mb-2">تحليلات متقدمة</h4>
              <p className="text-gray-300 text-sm md:text-base">
                تقارير مفصلة عن أداء المحتوى ومعدلات التفاعل
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-teal-500 to-green-500 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <h4 className="text-white text-base md:text-lg font-semibold mb-2">إدارة الجمهور</h4>
              <p className="text-gray-300 text-sm md:text-base">
                أدوات ذكية لفهم وإدارة جمهورك المستهدف
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <h4 className="text-white text-base md:text-lg font-semibold mb-2">تحسين الوصول</h4>
              <p className="text-gray-300 text-sm md:text-base">
                استراتيجيات ذكية لزيادة المشاهدات والتفاعل
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <h4 className="text-white text-base md:text-lg font-semibold mb-2">محتوى مميز</h4>
              <p className="text-gray-300 text-sm md:text-base">
                أدوات تحسين المحتوى لضمان الجودة والتميز
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-purple-900 to-blue-900">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">ابدأ رحلتك اليوم</h3>
          <p className="text-base md:text-xl text-gray-200 mb-8 md:mb-12 max-w-2xl mx-auto">
            انضم إلى آلاف المبدعين الذين يثقون بمنصتنا لنشر محتواهم والوصول إلى جمهور أوسع
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/real-free-publish">
              <Button 
                size="lg" 
                className="bg-white text-purple-900 hover:bg-gray-100 px-8 md:px-12 py-6 md:py-8 text-lg md:text-xl font-bold shadow-2xl"
              >
                ابدأ النشر المجاني
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-purple-900 px-8 md:px-12 py-6 md:py-8 text-lg md:text-xl font-bold"
              >
                تواصل معنا
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4 md:mb-6">
            <Globe className="h-6 w-6 md:h-8 md:w-8 text-purple-400 mr-2" />
            <h4 className="text-lg md:text-2xl font-bold">منصة النشر الذكي متعددة المنصات</h4>
          </div>
          <p className="text-gray-400 text-sm md:text-base mb-4">
            نحو مستقبل أفضل للنشر الرقمي والتواصل العالمي
          </p>
          <div className="flex justify-center space-x-4 rtl:space-x-reverse">
            <Link href="/">
              <Button variant="ghost" className="text-gray-400 hover:text-white text-sm">
                الرئيسية
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="text-gray-400 hover:text-white text-sm">
                تواصل معنا
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}