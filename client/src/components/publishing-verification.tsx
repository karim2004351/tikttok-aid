import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, Search, AlertTriangle, ExternalLink, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface VerificationResult {
  isPublished: boolean;
  verifiedSites: string[];
  failedSites: string[];
  screenshots: string[];
  publishedUrls: string[];
  siteDetails: {
    [siteName: string]: {
      attempted: number;
      successful: number;
      failed: number;
      successRate: number;
    };
  };
  verificationDetails: {
    totalAttempted: number;
    successfulPublications: number;
    failureRate: number;
    timestamp: string;
    postsPerSite: number;
    totalPosts: number;
  };
}

interface PublishingVerificationProps {
  deploymentId: number;
  onVerificationComplete?: (result: VerificationResult) => void;
}

export function PublishingVerification({ deploymentId, onVerificationComplete }: PublishingVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verificationReport, setVerificationReport] = useState<string>("");
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const { toast } = useToast();

  // المواقع المتاحة للتحقق
  const availableSites = [
    "reddit.com", "twitter.com", "facebook.com", "youtube.com", "instagram.com",
    "linkedin.com", "pinterest.com", "tumblr.com", "medium.com", "wordpress.com"
  ];

  const handleStartVerification = async () => {
    if (selectedSites.length === 0) {
      toast({
        title: "اختر المواقع",
        description: "يجب اختيار موقع واحد على الأقل للتحقق",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('/api/verify-publishing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deploymentId,
          sitesToCheck: selectedSites
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setVerificationResult(result.verification);
        setVerificationReport(result.report);
        onVerificationComplete?.(result.verification);
        
        toast({
          title: "تم التحقق بنجاح",
          description: `تم التحقق من ${result.verification.verifiedSites.length} موقع بنجاح`,
        });
      } else {
        toast({
          title: "فشل التحقق",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر إجراء التحقق من النشر",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const toggleSiteSelection = (site: string) => {
    setSelectedSites(prev => 
      prev.includes(site) 
        ? prev.filter(s => s !== site)
        : [...prev, site]
    );
  };

  const calculateSuccessRate = () => {
    if (!verificationResult) return 0;
    const { totalAttempted, successfulPublications } = verificationResult.verificationDetails;
    return totalAttempted > 0 ? (successfulPublications / totalAttempted) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            التحقق من النشر الحقيقي
          </CardTitle>
          <CardDescription>
            تحقق من أن محتواك تم نشره فعلياً على المواقع المختلفة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* اختيار المواقع للتحقق */}
          <div>
            <h4 className="text-sm font-medium mb-3">اختر المواقع للتحقق منها:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {availableSites.map((site) => (
                <Button
                  key={site}
                  variant={selectedSites.includes(site) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSiteSelection(site)}
                  className="text-xs"
                >
                  {site}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* زر بدء التحقق */}
          <Button
            onClick={handleStartVerification}
            disabled={isVerifying || selectedSites.length === 0}
            className="w-full"
            size="lg"
          >
            {isVerifying ? (
              <>
                <Search className="mr-2 h-4 w-4 animate-spin" />
                جاري التحقق من النشر...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                بدء التحقق من النشر
              </>
            )}
          </Button>

          {/* عرض حالة التحقق */}
          {isVerifying && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                جاري التحقق من النشر على المواقع المحددة. قد تستغرق هذه العملية بضع دقائق...
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* نتائج التحقق */}
      {verificationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {verificationResult.isPublished ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              نتائج التحقق
            </CardTitle>
            <CardDescription>
              تم في: {new Date(verificationResult.verificationDetails.timestamp).toLocaleString('en-US')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* الإحصائيات العامة */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {verificationResult.verificationDetails.successfulPublications}
                  </div>
                  <div className="text-sm text-gray-600">نشر ناجح</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {verificationResult.verificationDetails.totalAttempted}
                  </div>
                  <div className="text-sm text-gray-600">إجمالي المحاولات</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {calculateSuccessRate().toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">معدل النجاح</div>
                </CardContent>
              </Card>
            </div>

            {/* شريط التقدم */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">معدل نجاح التحقق</span>
                <span className="text-sm text-gray-600">{calculateSuccessRate().toFixed(1)}%</span>
              </div>
              <Progress value={calculateSuccessRate()} className="h-2" />
            </div>

            <Separator />

            {/* المواقع التي تم التحقق منها */}
            {verificationResult.verifiedSites.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 text-green-600 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  المواقع المتحقق منها ({verificationResult.verifiedSites.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {verificationResult.verifiedSites.map((site, index) => (
                    <Badge key={index} variant="default" className="justify-start p-2">
                      <CheckCircle className="mr-2 h-3 w-3" />
                      {site}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* المواقع التي فشل التحقق منها */}
            {verificationResult.failedSites.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 text-red-600 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  المواقع التي فشل التحقق منها ({verificationResult.failedSites.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {verificationResult.failedSites.map((site, index) => (
                    <Badge key={index} variant="destructive" className="justify-start p-2">
                      <XCircle className="mr-2 h-3 w-3" />
                      {site}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* الروابط المتحقق منها */}
            {verificationResult.publishedUrls.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  الروابط المتحقق منها
                </h4>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {verificationResult.publishedUrls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 bg-gray-50 rounded text-sm hover:bg-gray-100 transition-colors"
                      >
                        <ExternalLink className="inline mr-2 h-3 w-3" />
                        {url}
                      </a>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* لقطات الشاشة */}
            {verificationResult.screenshots.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  لقطات الشاشة ({verificationResult.screenshots.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {verificationResult.screenshots.map((screenshot, index) => (
                    <img
                      key={index}
                      src={screenshot}
                      alt={`لقطة شاشة ${index + 1}`}
                      className="w-full h-48 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* التقرير المفصل */}
      {verificationReport && (
        <Card>
          <CardHeader>
            <CardTitle>التقرير المفصل</CardTitle>
            <CardDescription>تقرير شامل عن عملية التحقق</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <pre className="text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded">
                {verificationReport}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}