import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Mail, Lock, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AuthLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    displayName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await apiRequest('POST', '/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      if (data.success) {
        // حفظ الـ token في localStorage
        localStorage.setItem('authToken', data.token);
        
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `أهلاً بك ${data.user.displayName}`,
        });

        // الانتقال إلى لوحة التحكم الشخصية
        setLocation('/user-dashboard');
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await apiRequest('POST', '/api/auth/register', {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        displayName: formData.displayName || formData.username
      });

      if (data.success) {
        // حفظ الـ token في localStorage
        localStorage.setItem('authToken', data.token);
        
        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: `أهلاً بك ${data.user.displayName}`,
        });

        // الانتقال إلى لوحة التحكم الشخصية
        setLocation('/user-dashboard');
      } else {
        toast({
          title: "خطأ في إنشاء الحساب",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Globe className="h-8 w-8 text-purple-400" />
              <h1 className="text-2xl font-bold">منصة النشر الذكي</h1>
            </div>
          </Link>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-2xl mb-2">
                {isRegistering ? "إنشاء حساب جديد" : "تسجيل الدخول"}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {isRegistering 
                  ? "انضم إلى منصة النشر الذكي واستمتع بمميزات حصرية"
                  : "أهلاً بعودتك إلى منصة النشر الذكي"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email/Password Form */}
              <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4 mb-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                  />
                </div>
                
                {isRegistering && (
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      اسم المستخدم
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="أدخل اسم المستخدم"
                      required
                    />
                  </div>
                )}
                
                {isRegistering && (
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      الاسم الكامل (اختياري)
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="أدخل كلمة المرور"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold disabled:opacity-50"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  {isLoading ? "جاري التحميل..." : (isRegistering ? "إنشاء حساب جديد" : "تسجيل الدخول")}
                </Button>
              </form>



              {/* Toggle between Login and Register */}
              <div className="text-center mt-4">
                <span className="text-gray-400 text-sm">
                  {isRegistering ? "لديك حساب بالفعل؟ " : "ليس لديك حساب؟ "}
                </span>
                <button 
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setFormData({ email: '', username: '', password: '', displayName: '' });
                  }}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                >
                  {isRegistering ? "تسجيل الدخول" : "إنشاء حساب جديد"}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <div className="mt-8">
            <h3 className="text-center text-white text-lg font-semibold mb-4">مميزات التسجيل</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                <h4 className="text-white font-semibold mb-2">حفظ تقدمك</h4>
                <p className="text-gray-300 text-sm">احتفظ بسجل جميع منشوراتك وتحليلاتك</p>
              </div>
              
              <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                <h4 className="text-white font-semibold mb-2">مميزات حصرية</h4>
                <p className="text-gray-300 text-sm">احصل على وصول مبكر للميزات الجديدة</p>
              </div>
              
              <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                <h4 className="text-white font-semibold mb-2">دعم مخصص</h4>
                <p className="text-gray-300 text-sm">تواصل مباشر مع فريق الدعم</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link href="/">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                العودة إلى الصفحة الرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}