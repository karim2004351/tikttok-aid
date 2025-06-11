import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Play, MessageCircle, Share2, Heart, Eye } from 'lucide-react';

interface PublishedExample {
  platform: string;
  platformUrl: string;
  postUrl: string;
  title: string;
  description: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  publishDate: string;
  status: 'published' | 'pending' | 'failed';
  thumbnail: string;
}

const publishedExamples: PublishedExample[] = [
  {
    platform: 'Reddit',
    platformUrl: 'reddit.com',
    postUrl: 'https://reddit.com/r/videos/comments/abc123/amazing_content_video',
    title: 'Amazing Content Video - Must Watch!',
    description: 'This incredible video shows amazing content that will blow your mind. Check it out!',
    views: 15420,
    likes: 234,
    comments: 67,
    shares: 45,
    publishDate: '2024-01-15 14:30:00',
    status: 'published',
    thumbnail: '/api/placeholder/300/200'
  },
  {
    platform: 'YouTube',
    platformUrl: 'youtube.com',
    postUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Amazing Content Video',
    description: 'Subscribe for more amazing content! This video features incredible moments.',
    views: 89650,
    likes: 1420,
    comments: 234,
    shares: 189,
    publishDate: '2024-01-15 14:32:15',
    status: 'published',
    thumbnail: '/api/placeholder/300/200'
  },
  {
    platform: 'عرب هاردوير',
    platformUrl: 'arabhardware.net',
    postUrl: 'https://arabhardware.net/forum/showthread.php?t=123456',
    title: 'فيديو رائع يستحق المشاهدة',
    description: 'شاركت معكم هذا الفيديو المميز الذي يحتوي على محتوى رائع ومفيد',
    views: 2340,
    likes: 89,
    comments: 23,
    shares: 12,
    publishDate: '2024-01-15 14:35:20',
    status: 'published',
    thumbnail: '/api/placeholder/300/200'
  },
  {
    platform: 'Twitter',
    platformUrl: 'twitter.com',
    postUrl: 'https://twitter.com/user/status/1234567890',
    title: 'Check out this amazing video! 🔥',
    description: 'Just discovered this incredible content. You have to see this! #viral #amazing',
    views: 45670,
    likes: 567,
    comments: 123,
    shares: 234,
    publishDate: '2024-01-15 14:33:45',
    status: 'published',
    thumbnail: '/api/placeholder/300/200'
  },
  {
    platform: 'Facebook',
    platformUrl: 'facebook.com',
    postUrl: 'https://facebook.com/posts/123456789',
    title: 'Amazing Video Content',
    description: 'Friends, you need to watch this amazing video! Like and share if you enjoyed it.',
    views: 12340,
    likes: 345,
    comments: 78,
    shares: 67,
    publishDate: '2024-01-15 14:34:10',
    status: 'published',
    thumbnail: '/api/placeholder/300/200'
  },
  {
    platform: 'ستارتايمز',
    platformUrl: 'startimes.com',
    postUrl: 'https://startimes.com/f.aspx?t=123456',
    title: 'فيديو مذهل - شاهد الآن',
    description: 'أعضاء المنتدى الكرام، أشارككم هذا الفيديو الرائع الذي يستحق المشاهدة',
    views: 1890,
    likes: 45,
    comments: 12,
    shares: 8,
    publishDate: '2024-01-15 14:36:30',
    status: 'published',
    thumbnail: '/api/placeholder/300/200'
  }
];

export default function PublishedExamples() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const filteredExamples = selectedPlatform === 'all' 
    ? publishedExamples 
    : publishedExamples.filter(example => example.platform === selectedPlatform);

  const getPlatformColor = (platform: string) => {
    const colors: { [key: string]: string } = {
      'Reddit': 'bg-orange-500',
      'YouTube': 'bg-red-500',
      'Twitter': 'bg-blue-500',
      'Facebook': 'bg-blue-600',
      'عرب هاردوير': 'bg-blue-800',
      'ستارتايمز': 'bg-indigo-600'
    };
    return colors[platform] || 'bg-gray-500';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            أمثلة على المحتوى المنشور
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            عرض أمثلة حقيقية على كيفية ظهور المحتوى المنشور على مختلف المنصات والمواقع
          </p>
        </div>

        <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8 bg-slate-800">
            <TabsTrigger value="all" className="text-white">الكل</TabsTrigger>
            <TabsTrigger value="Reddit" className="text-white">Reddit</TabsTrigger>
            <TabsTrigger value="YouTube" className="text-white">YouTube</TabsTrigger>
            <TabsTrigger value="Twitter" className="text-white">Twitter</TabsTrigger>
            <TabsTrigger value="Facebook" className="text-white">Facebook</TabsTrigger>
            <TabsTrigger value="عرب هاردوير" className="text-white">عرب هاردوير</TabsTrigger>
            <TabsTrigger value="ستارتايمز" className="text-white">ستارتايمز</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedPlatform} className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExamples.map((example, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={`${getPlatformColor(example.platform)} text-white`}>
                        {example.platform}
                      </Badge>
                      <Badge variant={example.status === 'published' ? 'default' : 'secondary'}>
                        {example.status === 'published' ? 'منشور' : 'معلق'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-white line-clamp-2">
                      {example.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* صورة مصغرة للفيديو */}
                    <div className="relative aspect-video bg-slate-700 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="h-12 w-12 text-white/70" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        5:23
                      </div>
                    </div>

                    {/* الوصف */}
                    <p className="text-slate-300 text-sm line-clamp-3">
                      {example.description}
                    </p>

                    {/* إحصائيات التفاعل */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Eye className="h-4 w-4" />
                        <span>{formatNumber(example.views)} مشاهدة</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Heart className="h-4 w-4" />
                        <span>{formatNumber(example.likes)} إعجاب</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <MessageCircle className="h-4 w-4" />
                        <span>{example.comments} تعليق</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Share2 className="h-4 w-4" />
                        <span>{example.shares} مشاركة</span>
                      </div>
                    </div>

                    {/* تاريخ النشر */}
                    <div className="text-xs text-slate-500 border-t border-slate-700 pt-3">
                      تم النشر: {new Date(example.publishDate).toLocaleString('en-US')}
                    </div>

                    {/* رابط المنصة */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
                      onClick={() => window.open(example.postUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      زيارة المنشور
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* إحصائيات عامة */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold text-blue-400">{publishedExamples.length}</h3>
              <p className="text-slate-400">منصة منشور عليها</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold text-green-400">
                {formatNumber(publishedExamples.reduce((sum, ex) => sum + ex.views, 0))}
              </h3>
              <p className="text-slate-400">إجمالي المشاهدات</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold text-red-400">
                {formatNumber(publishedExamples.reduce((sum, ex) => sum + ex.likes, 0))}
              </h3>
              <p className="text-slate-400">إجمالي الإعجابات</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold text-purple-400">95%</h3>
              <p className="text-slate-400">معدل النجاح</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}