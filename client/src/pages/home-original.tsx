import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Globe, Shield, Zap, Users, TrendingUp, Star, Eye, BarChart3 } from "lucide-react";
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
              
              <Link href="/free-publish">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 md:px-12 py-6 md:py-8 text-xl md:text-2xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  🚀 انشر مجاناً الآن
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-4">
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
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-slate-900 px-6 py-3 text-lg"
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
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              احصل على أقصى وصول لمحتواك مع أدوات النشر الاحترافية
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <Card className="bg-white/10 backdrop-blur-md border-0 text-white">
              <CardHeader className="text-center">
                <Globe className="h-16 w-16 md:h-20 md:w-20 text-blue-400 mx-auto mb-4" />
                <CardTitle className="text-xl md:text-2xl mb-3">تغطية عالمية شاملة</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-center text-base md:text-lg">
                  أكثر من 1,171 موقع ومنتدى من جميع أنحاء العالم
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-0 text-white">
              <CardHeader className="text-center">
                <Zap className="h-16 w-16 md:h-20 md:w-20 text-yellow-400 mx-auto mb-4" />
                <CardTitle className="text-xl md:text-2xl mb-3">نشر سريع وذكي</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-center text-base md:text-lg">
                  اتمتة كاملة لعملية النشر مع متابعة مباشرة
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-0 text-white">
              <CardHeader className="text-center">
                <Shield className="h-16 w-16 md:h-20 md:w-20 text-green-400 mx-auto mb-4" />
                <CardTitle className="text-xl md:text-2xl mb-3">أمان وموثوقية</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-center text-base md:text-lg">
                  نشر آمن مع حماية كاملة لبياناتك
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h3 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">الميزات الرئيسية</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <div className="bg-blue-500/20 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-10 w-10 text-blue-400" />
              </div>
              <h4 className="text-xl font-bold mb-2">أتمتة كاملة</h4>
              <p className="text-gray-300">نشر تلقائي بدون تدخل يدوي</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-500/20 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Star className="h-10 w-10 text-purple-400" />
              </div>
              <h4 className="text-xl font-bold mb-2">مدعوم بالذكاء الاصطناعي</h4>
              <p className="text-gray-300">تحليل ذكي وتوصيات محتوى</p>
            </div>

            <div className="text-center">
              <div className="bg-green-500/20 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-10 w-10 text-green-400" />
              </div>
              <h4 className="text-xl font-bold mb-2">متعدد المنصات</h4>
              <p className="text-gray-300">نشر على جميع المنصات الرئيسية</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-500/20 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-10 w-10 text-orange-400" />
              </div>
              <h4 className="text-xl font-bold mb-2">تحليلات متقدمة</h4>
              <p className="text-gray-300">تتبع الأداء والمشاهدات</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-white/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-6xl font-bold text-blue-400 mb-2">1,171+</div>
              <div className="text-lg md:text-xl text-gray-300">موقع ومنتدى</div>
            </div>
            <div>
              <div className="text-4xl md:text-6xl font-bold text-green-400 mb-2">50M+</div>
              <div className="text-lg md:text-xl text-gray-300">مشاهدة شهرية</div>
            </div>
            <div>
              <div className="text-4xl md:text-6xl font-bold text-purple-400 mb-2">10K+</div>
              <div className="text-lg md:text-xl text-gray-300">مستخدم نشط</div>
            </div>
            <div>
              <div className="text-4xl md:text-6xl font-bold text-yellow-400 mb-2">99.9%</div>
              <div className="text-lg md:text-xl text-gray-300">معدل التشغيل</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-5xl font-bold mb-6">ابدأ النشر الآن</h3>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            انضم إلى آلاف المستخدمين الذين يثقون بمنصتنا لنشر محتواهم على العالم
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/free-publish">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 text-xl font-bold"
              >
                ابدأ الآن مجاناً
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 text-xl font-bold"
              >
                تواصل معنا
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}