import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { 
  Settings, 
  CheckCircle, 
  Globe, 
  FileText, 
  BarChart3, 
  Users,
  Shield,
  MessageSquare,
  Eye,
  Upload
} from 'lucide-react';

export default function NavigationHub() {
  const sections = [
    {
      title: "إدارة المواقع والمنصات",
      description: "تحكم في إعدادات المواقع ونوع المستخدمين",
      icon: Settings,
      color: "bg-blue-500",
      links: [
        { name: "إدارة المواقع", path: "/sites-control-simple", description: "28 موقع ومنصة شاملة" },
        { name: "إدارة المواقع المبسطة", path: "/simple-sites", description: "واجهة مبسطة" }
      ]
    },
    {
      title: "مراجعة المنشورات",
      description: "موافقة أو رفض المنشورات المعلقة",
      icon: CheckCircle,
      color: "bg-purple-500",
      links: [
        { name: "لوحة مراجعة المنشورات", path: "/review-posts", description: "مراجعة وموافقة المدير" },
        { name: "مراجعة المدير", path: "/admin-review", description: "نظام الموافقة" }
      ]
    },
    {
      title: "النشر والمحتوى",
      description: "نشر المحتوى على المنصات المختلفة",
      icon: Upload,
      color: "bg-green-500",
      links: [
        { name: "النشر المجاني", path: "/free-publish", description: "نشر مجاني بدون قيود" },
        { name: "النشر السريع", path: "/quick-publish", description: "نشر سريع ومباشر" }
      ]
    },
    {
      title: "تحليل الفيديوهات",
      description: "تحليل وفهم محتوى الفيديوهات",
      icon: BarChart3,
      color: "bg-orange-500",
      links: [
        { name: "تحليل الفيديوهات", path: "/video-analysis-dashboard", description: "تحليل شامل للفيديوهات" },
        { name: "فحص الفيديو المستهدف", path: "/target-video-inspector", description: "فحص تفصيلي" }
      ]
    },
    {
      title: "الإدارة والتحكم",
      description: "أدوات الإدارة والتحكم في النظام",
      icon: Shield,
      color: "bg-red-500",
      links: [
        { name: "لوحة الإدارة", path: "/admin-simple", description: "إدارة عامة للنظام" },
        { name: "لوحة التحكم", path: "/dashboard", description: "لوحة تحكم شاملة" }
      ]
    },
    {
      title: "المميزات المتقدمة",
      description: "مميزات إضافية ونظم ذكية",
      icon: Eye,
      color: "bg-indigo-500",
      links: [
        { name: "التوصيات الذكية", path: "/ai-recommendations", description: "توصيات بالذكاء الاصطناعي" },
        { name: "التعليقات الاجتماعية", path: "/social-comments", description: "إدارة التعليقات" },
        { name: "المتابعين والبث المباشر", path: "/followers-live-stream", description: "إدارة المتابعين" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">مركز التنقل الشامل</h1>
          <p className="text-xl text-gray-600">الوصول السريع لجميع أجزاء النظام</p>
        </div>

        {/* الأقسام */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <Card key={index} className="bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${section.color}`}>
                    <section.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <Link key={linkIndex} href={link.path}>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-right h-auto p-4 hover:bg-gray-50"
                    >
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{link.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{link.description}</div>
                      </div>
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* روابط سريعة إضافية */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-gray-900">
              روابط سريعة أخرى
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/contact">
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 ml-2" />
                  تواصل معنا
                </Button>
              </Link>
              
              <Link href="/examples">
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 ml-2" />
                  أمثلة منشورة
                </Button>
              </Link>
              
              <Link href="/verification">
                <Button variant="outline" className="w-full">
                  <Shield className="h-4 w-4 ml-2" />
                  التحقق
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="outline" className="w-full">
                  <Globe className="h-4 w-4 ml-2" />
                  الصفحة الرئيسية
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* معلومات النظام */}
        <Card className="mt-8 bg-gray-50/80">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">معلومات مهمة:</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold mb-2">مراجعة المنشورات:</h4>
                <ul className="space-y-1">
                  <li>• عندما تكون "يتطلب الموافقة" مفعلة</li>
                  <li>• المنشورات تذهب لقائمة انتظار المدير</li>
                  <li>• المدير يراجع ويوافق أو يرفض</li>
                  <li>• المنشورات المقبولة تنشر تلقائياً</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">إدارة المواقع:</h4>
                <ul className="space-y-1">
                  <li>• 28 موقع ومنصة متاحة</li>
                  <li>• تحكم في نوع المستخدم (مدير/مستخدم/كلاهما)</li>
                  <li>• تحديد عدد المنشورات اليومية</li>
                  <li>• تفعيل/إلغاء النشر المجاني</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}