import { useState, useRef } from 'react';
import { Share, Copy, Download, ExternalLink, Facebook, Twitter, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ShareData {
  title: string;
  url: string;
  description?: string;
  image?: string;
  platform?: string;
}

interface QuickShareWidgetProps {
  data: ShareData;
  className?: string;
}

export function QuickShareWidget({ data, className }: QuickShareWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();
  const shareRef = useRef<HTMLDivElement>(null);

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => shareToFacebook()
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      action: () => shareToTwitter()
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => shareToWhatsApp()
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => shareToTelegram()
    },
    {
      name: 'نسخ الرابط',
      icon: Copy,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: () => copyToClipboard()
    },
    {
      name: 'تحميل',
      icon: Download,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => downloadContent()
    }
  ];

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}&quote=${encodeURIComponent(data.title)}`;
    window.open(url, '_blank', 'width=600,height=400');
    trackShare('facebook');
  };

  const shareToTwitter = () => {
    const text = `${data.title} ${data.description ? '- ' + data.description : ''}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(data.url)}`;
    window.open(url, '_blank', 'width=600,height=400');
    trackShare('twitter');
  };

  const shareToWhatsApp = () => {
    const text = `${data.title}\n${data.description || ''}\n${data.url}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    trackShare('whatsapp');
  };

  const shareToTelegram = () => {
    const text = `${data.title}\n${data.description || ''}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    trackShare('telegram');
  };

  const copyToClipboard = async () => {
    try {
      const shareText = `${data.title}\n${data.description || ''}\n${data.url}`;
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "تم النسخ!",
        description: "تم نسخ معلومات المحتوى إلى الحافظة",
      });
      trackShare('clipboard');
    } catch (error) {
      toast({
        title: "خطأ في النسخ",
        description: "لم يتم نسخ المحتوى، حاول مرة أخرى",
        variant: "destructive"
      });
    }
  };

  const downloadContent = async () => {
    if (data.image) {
      try {
        const response = await fetch(data.image);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${data.title.slice(0, 30)}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "تم التحميل!",
          description: "تم تحميل الصورة بنجاح",
        });
        trackShare('download');
      } catch (error) {
        toast({
          title: "خطأ في التحميل",
          description: "لم يتم تحميل المحتوى، حاول مرة أخرى",
          variant: "destructive"
        });
      }
    } else {
      // تحميل معلومات نصية
      const shareText = `${data.title}\n${data.description || ''}\n${data.url}`;
      const blob = new Blob([shareText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${data.title.slice(0, 30)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "تم التحميل!",
        description: "تم تحميل معلومات المحتوى",
      });
      trackShare('download_text');
    }
  };

  const trackShare = (platform: string) => {
    // إرسال إحصائية المشاركة
    fetch('/api/track-share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform,
        contentUrl: data.url,
        contentTitle: data.title,
        timestamp: new Date().toISOString()
      })
    }).catch(console.error);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({
          title: data.title,
          text: data.description,
          url: data.url
        });
        trackShare('native_share');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast({
            title: "خطأ في المشاركة",
            description: "لم تتم المشاركة، جرب الطرق الأخرى",
            variant: "destructive"
          });
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`relative ${className}`} ref={shareRef}>
      <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
        <CardContent className="p-4">
          {/* عرض معلومات المحتوى */}
          <div className="flex items-start gap-3 mb-4">
            {data.image && (
              <img 
                src={data.image} 
                alt={data.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-1">
                {data.title}
              </h3>
              {data.description && (
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                  {data.description}
                </p>
              )}
              <div className="flex items-center gap-1 mt-2">
                <ExternalLink className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {data.url}
                </span>
              </div>
            </div>
          </div>

          {/* زر المشاركة الرئيسي */}
          <Button
            onClick={handleNativeShare}
            disabled={isSharing}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            <Share className="h-4 w-4 ml-2" />
            {isSharing ? 'جار المشاركة...' : 'مشاركة'}
          </Button>

          {/* خيارات المشاركة المتقدمة */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-2">
                {shareOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={option.action}
                    className={`${option.color} text-white p-3 rounded-lg flex flex-col items-center gap-1 transition-all duration-200 hover:scale-105 active:scale-95`}
                  >
                    <option.icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{option.name}</span>
                  </button>
                ))}
              </div>
              
              {/* معلومات إضافية */}
              <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between items-center">
                    <span>المنصة:</span>
                    <span className="font-medium">{data.platform || 'عام'}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span>تاريخ المشاركة:</span>
                    <span className="font-medium">{new Date().toLocaleDateString('en-US')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* رابط سريع للمزيد من الخيارات */}
          {!navigator.share && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              المزيد من خيارات المشاركة
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}