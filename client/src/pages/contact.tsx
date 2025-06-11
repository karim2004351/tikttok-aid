import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Mail, MessageCircle, Send, Phone } from "lucide-react";
import { Link } from "wouter";

export default function Contact() {
  const contactMethods = [
    {
      title: "البريد الإلكتروني",
      description: "تواصل معنا عبر البريد الإلكتروني للاستفسارات والدعم",
      icon: Mail,
      contact: "kleberphone@gmail.com",
      link: "mailto:kleberphone@gmail.com",
      color: "bg-blue-600"
    },
    {
      title: "واتساب",
      description: "تواصل فوري عبر واتساب لدعم سريع ومباشر",
      icon: MessageCircle,
      contact: "+33673140174",
      link: "https://wa.me/33673140174",
      color: "bg-green-600"
    },
    {
      title: "تيك توك",
      description: "تابعنا على تيك توك للحصول على آخر التحديثات",
      icon: Send,
      contact: "@karimnapoli13",
      link: "https://www.tiktok.com/@karimnapoli13?_t=ZN-8wlC2iJGYac&_r=1",
      color: "bg-gray-900"
    },
    {
      title: "تليجرام",
      description: "انضم إلى قناتنا على تليجرام للإشعارات المهمة",
      icon: Send,
      contact: "Telegram",
      link: "https://telegram.org/dl",
      color: "bg-blue-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-purple-400" />
              <h1 className="text-2xl font-bold">منصة النشر الذكي متعددة المنصات</h1>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-purple-600">
                الرئيسية
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6">تواصل معنا</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            نحن هنا لمساعدتك في جميع استفساراتك حول منصة النشر الذكي
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {contactMethods.map((method, index) => (
            <Card key={index} className="bg-gray-800/50 border-gray-700 hover:border-purple-500 transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center">
                <div className={`${method.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <method.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">{method.title}</CardTitle>
                <CardDescription className="text-gray-300">
                  {method.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-purple-400 font-semibold mb-4">{method.contact}</p>
                <a 
                  href={method.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button className={`w-full ${method.color} hover:opacity-90`}>
                    تواصل الآن
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Contact Info */}
        <div className="bg-gray-800/30 rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold mb-8">معلومات التواصل السريع</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <Mail className="h-12 w-12 text-blue-400 mb-4" />
              <h4 className="text-white font-semibold mb-2">البريد الإلكتروني</h4>
              <a href="mailto:kleberphone@gmail.com" className="text-blue-400 hover:underline">
                kleberphone@gmail.com
              </a>
            </div>
            
            <div className="flex flex-col items-center">
              <MessageCircle className="h-12 w-12 text-green-400 mb-4" />
              <h4 className="text-white font-semibold mb-2">واتساب</h4>
              <a href="https://wa.me/33673140174" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                +33673140174
              </a>
            </div>
            
            <div className="flex flex-col items-center">
              <Send className="h-12 w-12 text-gray-400 mb-4" />
              <h4 className="text-white font-semibold mb-2">تيك توك</h4>
              <a href="https://www.tiktok.com/@karimnapoli13?_t=ZN-8wlC2iJGYac&_r=1" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:underline">
                @karimnapoli13
              </a>
            </div>
            
            <div className="flex flex-col items-center">
              <Send className="h-12 w-12 text-blue-400 mb-4" />
              <h4 className="text-white font-semibold mb-2">تلغرام</h4>
              <a href="https://telegram.org/dl" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                Telegram
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold mb-4">الأسئلة الشائعة</h3>
          <p className="text-xl text-gray-300">
            إجابات على أكثر الأسئلة تكراراً حول منصة النشر الذكي
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">كيف يعمل النشر على 1100+ موقع؟</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                منصتنا تستخدم تقنيات الاتمتة المتقدمة لنشر محتواك على أكثر من 1100 موقع ومنتدى عالمي بضغطة واحدة، مع متابعة مباشرة لحالة النشر.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">هل النشر آمن؟</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                نعم، نحن نستخدم أعلى معايير الأمان ولا نحفظ كلمات المرور الخاصة بك. جميع العمليات مشفرة ومحمية.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">ما هي المواقع المدعومة؟</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                ندعم مواقع عربية وعالمية، منتديات متخصصة، منصات فيديو، مواقع إخبارية، وأكثر من 50 دولة مختلفة.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">كيف أحصل على الدعم؟</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                يمكنك التواصل معنا عبر واتساب، البريد الإلكتروني، أو تلغرام للحصول على دعم فوري ومساعدة شخصية.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Globe className="h-6 w-6 text-purple-400" />
            <span className="text-xl font-bold">منصة النشر الذكي</span>
          </div>
          <p className="text-gray-400 mb-4">
            المنصة الرائدة لنشر المحتوى على أكثر من 1100 موقع ومنتدى عالمي
          </p>
          <p className="text-gray-500">
            &copy; 2024 منصة النشر الذكي. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}