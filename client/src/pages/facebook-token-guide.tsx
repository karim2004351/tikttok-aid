import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Key, Users, UserCheck } from "lucide-react";

export default function FacebookTokenGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            دليل أنواع مفاتيح Facebook API
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            كيفية الحصول على المفتاح المناسب للنشر على Facebook
          </p>
        </div>

        <div className="grid gap-6">
          {/* User Access Token */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <UserCheck className="h-6 w-6 text-blue-500" />
                <div>
                  <CardTitle className="text-xl">User Access Token</CardTitle>
                  <CardDescription>مفتاح المستخدم الشخصي</CardDescription>
                </div>
                <Badge variant="secondary">محدود</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">الاستخدامات:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>قراءة معلومات البروفايل الشخصي</li>
                  <li>النشر على البروفايل الشخصي (مع صلاحيات خاصة)</li>
                  <li>الوصول لقائمة الأصدقاء والإعدادات</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">الصلاحيات المطلوبة للنشر:</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">publish_to_groups</Badge>
                  <Badge variant="outline">user_posts</Badge>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>تحذير:</strong> النشر على البروفايل الشخصي محدود ويتطلب مراجعة Facebook
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Page Access Token */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-green-500" />
                <div>
                  <CardTitle className="text-xl">Page Access Token</CardTitle>
                  <CardDescription>مفتاح صفحة Facebook</CardDescription>
                </div>
                <Badge variant="default" className="bg-green-500">مُوصى به</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">الاستخدامات:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>النشر على صفحة Facebook</li>
                  <li>إدارة منشورات الصفحة</li>
                  <li>الرد على التعليقات والرسائل</li>
                  <li>تحليل إحصائيات الصفحة</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">الصلاحيات المطلوبة:</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">pages_manage_posts</Badge>
                  <Badge variant="outline">pages_read_engagement</Badge>
                  <Badge variant="outline">pages_show_list</Badge>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>الأفضل:</strong> هذا النوع مناسب للنشر التجاري والتسويقي
                </p>
              </div>
            </CardContent>
          </Card>

          {/* App Access Token */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Key className="h-6 w-6 text-purple-500" />
                <div>
                  <CardTitle className="text-xl">App Access Token</CardTitle>
                  <CardDescription>مفتاح التطبيق</CardDescription>
                </div>
                <Badge variant="secondary">للمطورين</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">الاستخدامات:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>إدارة إعدادات التطبيق</li>
                  <li>قراءة الإحصائيات العامة</li>
                  <li>عمليات النظام الداخلية</li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  هذا النوع غير مناسب للنشر المباشر على صفحات المستخدمين
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How to Get Page Access Token */}
          <Card className="border-2 border-blue-500">
            <CardHeader>
              <CardTitle className="text-xl text-blue-600 dark:text-blue-400">
                كيفية الحصول على Page Access Token
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">إنشاء تطبيق Facebook</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      انتقل إلى <a href="https://developers.facebook.com/apps" target="_blank" className="text-blue-500 underline">Facebook for Developers</a> وأنشئ تطبيق جديد
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">إضافة منتج Facebook Login</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      أضف منتج "Facebook Login" لتطبيقك
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">استخدام Graph API Explorer</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      انتقل إلى <a href="https://developers.facebook.com/tools/explorer/" target="_blank" className="text-blue-500 underline">Graph API Explorer</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <p className="font-medium">طلب الصلاحيات</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      اطلب صلاحيات: pages_manage_posts, pages_read_engagement, pages_show_list
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</div>
                  <div>
                    <p className="font-medium">الحصول على Page Token</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      استخدم الطلب: GET /me/accounts للحصول على مفاتيح صفحاتك
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">روابط مفيدة:</h4>
                <div className="space-y-2">
                  <a 
                    href="https://developers.facebook.com/apps" 
                    target="_blank"
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Facebook for Developers
                  </a>
                  <a 
                    href="https://developers.facebook.com/tools/explorer/" 
                    target="_blank"
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Graph API Explorer
                  </a>
                  <a 
                    href="https://developers.facebook.com/docs/pages/access-tokens" 
                    target="_blank"
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    دليل Page Access Tokens
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}