import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, Search, AlertTriangle, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Verification() {
  const [selectedDeployment, setSelectedDeployment] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState<any>(null);
  const { toast } = useToast();

  const { data: deployments, isLoading } = useQuery({
    queryKey: ['/api/deployments'],
    enabled: true,
  });

  const handleAutomatedVerification = async (deploymentId: number) => {
    setIsVerifying(true);
    setVerificationResults(null);
    
    try {
      const response = await fetch('/api/verify-publishing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deploymentId,
          sitesToCheck: ['reddit.com', 'medium.com', 'tumblr.com', 'hackernews.com']
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.verification) {
        setVerificationResults(result);
        toast({
          title: "تم التحقق بنجاح",
          description: `تم التحقق من ${result.verification.verifiedSites?.length || 0} موقع`,
        });
      } else {
        throw new Error(result.message || 'فشل في التحقق');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "خطأ في التحقق",
        description: error instanceof Error ? error.message : "تعذر إجراء التحقق الآلي",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">نظام التحقق من النشر الحقيقي</h1>
          <p className="text-gray-600">
            تأكد من أن محتواك تم نشره فعلياً على المواقع المختلفة باستخدام أدوات التحقق المتقدمة
          </p>
        </div>

        <Tabs defaultValue="automated" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger value="automated" className="text-gray-900">التحقق الآلي</TabsTrigger>
            <TabsTrigger value="results" className="text-gray-900">النتائج</TabsTrigger>
          </TabsList>

          <TabsContent value="automated" className="space-y-6">
            {isVerifying && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center space-x-4">
                    <Search className="h-6 w-6 animate-spin text-blue-600" />
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-blue-900">جاري التحقق الآلي...</h3>
                      <p className="text-blue-700">يتم فحص المواقع والتأكد من النشر</p>
                      <Progress value={50} className="w-64 mt-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>اختر النشر للتحقق منه</CardTitle>
                <CardDescription>
                  حدد النشر الذي تريد التحقق من صحته آلياً
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-gray-600">جاري تحميل النشريات...</div>
                ) : deployments && Array.isArray(deployments) && deployments.length > 0 ? (
                  <div className="space-y-4">
                    {deployments.map((deployment: any) => (
                      <Card 
                        key={deployment.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedDeployment === deployment.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedDeployment(deployment.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-gray-900">النشر #{deployment.id}</h4>
                              <p className="text-sm text-gray-600">{deployment.repositoryUrl}</p>
                              <p className="text-xs text-gray-500">
                                {deployment.startedAt ? new Date(deployment.startedAt).toLocaleString('en-US') : 'غير محدد'}
                              </p>
                            </div>
                            <Badge variant={deployment.status === 'completed' ? 'default' : 'secondary'}>
                              {deployment.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">لا توجد نشريات متاحة للتحقق</p>
                    <p className="text-sm text-gray-500">قم بإنشاء نشر جديد أولاً</p>
                  </div>
                )}

                {selectedDeployment && (
                  <div className="mt-6">
                    <Button
                      onClick={() => handleAutomatedVerification(selectedDeployment)}
                      disabled={isVerifying}
                      className="w-full"
                      size="lg"
                    >
                      {isVerifying ? (
                        <>
                          <Search className="mr-2 h-4 w-4 animate-spin" />
                          جاري التحقق الآلي...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          بدء التحقق الآلي
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {verificationResults ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {verificationResults.verification.isPublished ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    نتائج التحقق
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {verificationResults.verification.verifiedSites?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">مواقع متحقق منها</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {verificationResults.verification.failedSites?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">مواقع فاشلة</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {verificationResults.verification.publishedUrls?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">روابط مؤكدة</div>
                      </CardContent>
                    </Card>
                  </div>

                  {verificationResults.report && (
                    <ScrollArea className="h-64 w-full border rounded p-4">
                      <pre className="text-sm whitespace-pre-wrap text-gray-800">
                        {verificationResults.report}
                      </pre>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">لا توجد نتائج تحقق</h3>
                  <p className="text-gray-500">قم بإجراء تحقق آلي لعرض النتائج هنا</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}