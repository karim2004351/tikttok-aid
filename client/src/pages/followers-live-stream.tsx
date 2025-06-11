import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Users, Gift, Calendar, MessageCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function FollowersLiveStream() {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const followersCount = 30;

  // إرسال الطلب مباشرة لواتساب المدير
  const sendToWhatsApp = () => {
    if (!username || !preferredTime) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء اسم المستخدم والوقت المفضل",
        variant: "destructive",
      });
      return;
    }

    const adminWhatsApp = "+33673140174"; // رقم المدير
    const message = `🔴 طلب متابعين جديد

👤 اسم المستخدم: ${username}
👥 عدد المتابعين المطلوب: ${followersCount}
⏰ الوقت المفضل: ${preferredTime}
📅 تاريخ الطلب: ${new Date().toLocaleString('en-US')}

يرجى تأكيد الطلب والبدء في إضافة المتابعين.`;

    const whatsappUrl = `https://wa.me/${adminWhatsApp.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
    
    // فتح واتساب
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "تم توجيهك لواتساب",
      description: "أرسل الرسالة للمدير مباشرة",
    });
  };

  const timeOptions = [
    "الآن فوراً",
    "خلال ساعة",
    "خلال ساعتين", 
    "خلال 3 ساعات",
    "خلال 6 ساعات",
    "خلال 12 ساعة",
    "غداً",
    "خلال يومين"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Users className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              طلب متابعين البث المباشر
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            املأ البيانات التالية للحصول على 30 متابع مجاني
          </p>
        </motion.div>

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-purple-200 dark:border-purple-700 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Gift className="h-6 w-6" />
                نموذج طلب المتابعين
              </CardTitle>
              <CardDescription className="text-purple-100">
                خدمة مجانية لزيادة متابعين البث المباشر
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {/* Username Input */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-lg font-medium flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  اسم المستخدم في تيك توك
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم فقط (بدون @)"
                  className="text-lg h-12 border-2 border-purple-200 focus:border-purple-500"
                />
                <p className="text-sm text-gray-500">
                  مثال: username (بدون @ أو الرابط الكامل)
                </p>
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <Label className="text-lg font-medium flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  الوقت المفضل لبدء إضافة المتابعين
                </Label>
                <Select value={preferredTime} onValueChange={setPreferredTime}>
                  <SelectTrigger className="text-lg h-12 border-2 border-purple-200 focus:border-purple-500">
                    <SelectValue placeholder="اختر الوقت المفضل" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Followers Count Display */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-lg font-bold text-green-700 dark:text-green-400">
                      عدد المتابعين: {followersCount} متابع
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      مجاناً بشكل كامل
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                <Clock className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800 dark:text-orange-200">
                  <strong>ملاحظة:</strong> يمكن استخدام هذه الخدمة مرة واحدة فقط كل أسبوع. 
                  للحصول على متابعين إضافيين، اتصل بالمدير.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="pt-4"
              >
                <Button
                  onClick={sendToWhatsApp}
                  className="w-full h-14 text-xl font-bold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg"
                  disabled={!username || !preferredTime}
                >
                  <MessageCircle className="ml-3 h-6 w-6" />
                  احصل على 30 متابع مجاناً
                </Button>
              </motion.div>

              {/* Contact Info */}
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4 border-t">
                <p>سيتم إرسال طلبك مباشرة للمدير عبر واتساب</p>
                <p>ستحصل على رد خلال ساعات قليلة</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}