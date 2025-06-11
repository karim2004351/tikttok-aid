import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertDeploymentSchema, type InsertDeployment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, Rocket, Copy, RefreshCw } from "lucide-react";

export function DeploymentForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<InsertDeployment>({
    resolver: zodResolver(insertDeploymentSchema),
    defaultValues: {
      repositoryUrl: "",
      branch: "main",
      environment: "staging",
    },
  });

  const createDeployment = useMutation({
    mutationFn: async (data: InsertDeployment) => {
      const response = await apiRequest("POST", "/api/deployments", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deployments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Deployment Started",
        description: "Your deployment has been queued and will begin shortly.",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Deployment Failed",
        description: error.message || "Failed to start deployment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertDeployment) => {
    createDeployment.mutate(data);
  };

  const copyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin}/webhook/deploy`;
    navigator.clipboard.writeText(webhookUrl).then(() => {
      toast({
        title: "Copied!",
        description: "Webhook URL copied to clipboard",
      });
    });
  };

  const generateSecret = () => {
    const secret = crypto.randomUUID();
    navigator.clipboard.writeText(secret).then(() => {
      toast({
        title: "Secret Generated",
        description: "New webhook secret copied to clipboard",
      });
    });
  };

  return (
    <div className="w-96 bg-slate-850 border-r border-slate-700 p-6 overflow-y-auto">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="repositoryUrl" className="text-slate-200">
            رابط الفيديو المراد نشره
          </Label>
          <div className="relative">
            <Input
              id="repositoryUrl"
              type="url"
              placeholder="https://vm.tiktok.com/ZMkWf3QJR/"
              className="pr-10 bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-400"
              {...form.register("repositoryUrl")}
            />
            <GitBranch className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xs text-slate-400">أدخل رابط فيديو TikTok المراد نشره على 1,171 موقع</p>
          {form.formState.errors.repositoryUrl && (
            <p className="text-xs text-red-400">{form.formState.errors.repositoryUrl.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="postsPerSite" className="text-slate-200">
            عدد مرات النشر في كل موقع
          </Label>
          <Select defaultValue="50">
            <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600 max-h-60 overflow-y-auto">
              {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} مرة × 1,171 موقع = {(num * 1171).toLocaleString()} نشرة إجمالية
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-400">اختر عدد مرات النشر في كل موقع من المواقع 1,171</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="branch" className="text-slate-200">
            Branch
          </Label>
          <Select
            value={form.watch("branch")}
            onValueChange={(value) => form.setValue("branch", value)}
          >
            <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="main">main</SelectItem>
              <SelectItem value="master">master</SelectItem>
              <SelectItem value="develop">develop</SelectItem>
              <SelectItem value="staging">staging</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">Environment</Label>
          <RadioGroup
            value={form.watch("environment")}
            onValueChange={(value) => form.setValue("environment", value as "staging" | "production")}
            className="grid grid-cols-2 gap-2"
          >
            <div className="flex items-center space-x-2 p-3 border border-slate-600 rounded-lg">
              <RadioGroupItem value="staging" id="staging" />
              <Label htmlFor="staging" className="text-sm text-slate-300">Staging</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border border-slate-600 rounded-lg">
              <RadioGroupItem value="production" id="production" />
              <Label htmlFor="production" className="text-sm text-slate-300">Production</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Checkbox id="cache" />
            <Label htmlFor="cache" className="text-sm text-slate-300">Build from cache</Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox id="notifications" defaultChecked />
            <Label htmlFor="notifications" className="text-sm text-slate-300">Send notifications</Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox id="autodeploy" />
            <Label htmlFor="autodeploy" className="text-sm text-slate-300">Auto-deploy on success</Label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={createDeployment.isPending}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600"
        >
          <Rocket className="w-4 h-4 mr-2" />
          {createDeployment.isPending ? "Starting..." : "Start Deployment"}
        </Button>
      </form>

      <Card className="mt-8 bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Webhook Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-slate-200 mb-2 block">Webhook URL</Label>
            <div className="flex">
              <Input
                value={`${window.location.origin}/webhook/deploy`}
                readOnly
                className="flex-1 bg-slate-800 border-slate-600 text-slate-300 text-sm rounded-r-none"
              />
              <Button
                type="button"
                onClick={copyWebhookUrl}
                className="bg-slate-700 hover:bg-slate-600 border border-slate-600 border-l-0 rounded-l-none"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <Label className="text-sm text-slate-200 mb-2 block">Secret Key</Label>
            <div className="flex">
              <Input
                type="password"
                value="webhook_secret_key_123"
                readOnly
                className="flex-1 bg-slate-800 border-slate-600 text-slate-300 text-sm font-mono rounded-r-none"
              />
              <Button
                type="button"
                onClick={generateSecret}
                className="bg-slate-700 hover:bg-slate-600 border border-slate-600 border-l-0 rounded-l-none"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
