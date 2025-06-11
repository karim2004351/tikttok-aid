import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  User, 
  Calendar,
  Globe,
  MessageSquare,
  Image,
  Video,
  FileText
} from 'lucide-react';

interface PendingPost {
  id: string;
  title: string;
  content: string;
  author: string;
  targetSite: string;
  category: string;
  submittedAt: string;
  type: 'text' | 'image' | 'video' | 'link';
  status: 'pending' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  images?: string[];
  videoUrl?: string;
  linkUrl?: string;
}

export default function AdminApprovalDashboard() {
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<PendingPost[]>([
    {
      id: '1',
      title: 'إعلان عن منتج جديد',
      content: 'نحن متحمسون لإطلاق منتجنا الجديد الذي سيغير طريقة عملكم. تابعوا معنا للحصول على آخر التحديثات والعروض الخاصة.',
      author: 'أحمد محمد',
      targetSite: 'فيسبوك',
      category: 'تجاري',
      submittedAt: '2025-01-05T10:30:00',
      type: 'text',
      status: 'pending',
      priority: 'high'
    },
    {
      id: '2',
      title: 'مشاركة مقال تقني',
      content: 'مقال رائع حول أحدث تطورات الذكاء الاصطناعي وتأثيرها على مستقبل التكنولوجيا. يستحق القراءة والمشاركة.',
      author: 'سارة أحمد',
      targetSite: 'لينكد إن',
      category: 'تقني',
      submittedAt: '2025-01-05T09:15:00',
      type: 'link',
      status: 'pending',
      priority: 'medium',
      linkUrl: 'https://example.com/ai-article'
    },
    {
      id: '3',
      title: 'فيديو تعريفي بالشركة',
      content: 'فيديو قصير يعرف بخدماتنا ورؤيتنا للمستقبل. نأمل أن ينال إعجابكم ويساعد في نشر رسالتنا.',
      author: 'محمد علي',
      targetSite: 'يوتيوب',
      category: 'تسويق',
      submittedAt: '2025-01-05T08:45:00',
      type: 'video',
      status: 'pending',
      priority: 'high',
      videoUrl: 'company-intro.mp4'
    },
    {
      id: '4',
      title: 'صور من المؤتمر التقني',
      content: 'مشاركة أهم اللحظات من المؤتمر التقني الذي حضرناه الأسبوع الماضي. لقاءات مثمرة وأفكار رائعة.',
      author: 'فاطمة خالد',
      targetSite: 'إنستغرام',
      category: 'أحداث',
      submittedAt: '2025-01-05T07:20:00',
      type: 'image',
      status: 'pending',
      priority: 'low',
      images: ['conference1.jpg', 'conference2.jpg', 'conference3.jpg']
    },
    {
      id: '5',
      title: 'تحديث حول خدماتنا',
      content: 'نود إعلامكم بآخر التحديثات على خدماتنا والميزات الجديدة التي أضفناها لتحسين تجربتكم معنا.',
      author: 'عمر حسن',
      targetSite: 'تويتر',
      category: 'إعلانات',
      submittedAt: '2025-01-04T16:30:00',
      type: 'text',
      status: 'pending',
      priority: 'medium'
    }
  ]);

  const [selectedPost, setSelectedPost] = useState<PendingPost | null>(null);

  const handleApproval = (postId: string, status: 'approved' | 'rejected') => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, status } : post
    ));

    const post = posts.find(p => p.id === postId);
    toast({
      title: status === 'approved' ? "تمت الموافقة على المنشور" : "تم رفض المنشور",
      description: `${post?.title} - ${post?.targetSite}`,
    });

    if (selectedPost?.id === postId) {
      setSelectedPost(null);
    }
  };

  const pendingPosts = posts.filter(post => post.status === 'pending');
  const approvedPosts = posts.filter(post => post.status === 'approved');
  const rejectedPosts = posts.filter(post => post.status === 'rejected');

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'link': return <Globe className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA') + ' ' + date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">لوحة مراجعة المنشورات</h1>
          <p className="text-lg text-gray-600">مراجعة والموافقة على المنشورات المعلقة</p>
        </div>

        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-orange-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{pendingPosts.length}</h3>
              <p className="text-gray-600">في الانتظار</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{approvedPosts.length}</h3>
              <p className="text-gray-600">تم قبولها</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{rejectedPosts.length}</h3>
              <p className="text-gray-600">تم رفضها</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{posts.length}</h3>
              <p className="text-gray-600">إجمالي المنشورات</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* قائمة المنشورات المعلقة */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  المنشورات في الانتظار ({pendingPosts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingPosts.map((post) => (
                  <Card 
                    key={post.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPost?.id === post.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedPost(post)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          {getPostTypeIcon(post.type)}
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(post.priority)}>
                            {post.priority === 'high' ? 'عالية' : post.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                          </Badge>
                          <Badge variant="outline">{post.category}</Badge>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.content}</p>
                      
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {post.author}
                          </div>
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {post.targetSite}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(post.submittedAt)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPost(post);
                          }}
                        >
                          <Eye className="h-3 w-3 ml-1" />
                          مراجعة
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {pendingPosts.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد منشورات في الانتظار</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* تفاصيل المنشور المحدد */}
          <div>
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  تفاصيل المنشور
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPost ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{selectedPost.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={getPriorityColor(selectedPost.priority)}>
                          أولوية {selectedPost.priority === 'high' ? 'عالية' : selectedPost.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                        </Badge>
                        <Badge variant="outline">{selectedPost.category}</Badge>
                        <Badge variant="outline">{selectedPost.targetSite}</Badge>
                      </div>
                    </div>

                    <div>
                      <label className="font-medium block mb-2">المحتوى:</label>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md text-sm">
                        {selectedPost.content}
                      </p>
                    </div>

                    {selectedPost.linkUrl && (
                      <div>
                        <label className="font-medium block mb-2">الرابط:</label>
                        <p className="text-blue-600 text-sm break-all">{selectedPost.linkUrl}</p>
                      </div>
                    )}

                    {selectedPost.images && (
                      <div>
                        <label className="font-medium block mb-2">الصور:</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedPost.images.map((image, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {image}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPost.videoUrl && (
                      <div>
                        <label className="font-medium block mb-2">الفيديو:</label>
                        <p className="text-purple-600 text-sm">{selectedPost.videoUrl}</p>
                      </div>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>الكاتب: {selectedPost.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>تاريخ الإرسال: {formatDate(selectedPost.submittedAt)}</span>
                      </div>
                    </div>

                    {selectedPost.status === 'pending' && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          onClick={() => handleApproval(selectedPost.id, 'approved')}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 ml-2" />
                          موافقة
                        </Button>
                        <Button
                          onClick={() => handleApproval(selectedPost.id, 'rejected')}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 ml-2" />
                          رفض
                        </Button>
                      </div>
                    )}

                    {selectedPost.status !== 'pending' && (
                      <div className="pt-4 border-t">
                        <Badge className={selectedPost.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}>
                          {selectedPost.status === 'approved' ? 'تمت الموافقة' : 'مرفوض'}
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">اختر منشوراً لعرض التفاصيل</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* معلومات إضافية */}
        <Card className="mt-8 bg-purple-50/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-purple-900">تعليمات المراجعة:</h3>
            <ul className="space-y-2 text-purple-800 text-sm">
              <li>• راجع المحتوى للتأكد من مطابقته لسياسات الموقع</li>
              <li>• تحقق من جودة النص والصور والروابط</li>
              <li>• انتبه للأولوية عند مراجعة المنشورات</li>
              <li>• المنشورات المرفوضة يمكن للمستخدم تعديلها وإعادة إرسالها</li>
              <li>• المنشورات المقبولة سيتم نشرها تلقائياً على المنصة المحددة</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}