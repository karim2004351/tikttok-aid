import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/language-context";
import ProtectedRoute from "@/components/ProtectedRoute";
import MaintenanceCheck from "@/components/MaintenanceCheck";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Contact from "@/pages/contact";
import TikTokManager from "@/pages/tiktok-manager";
import AuthLogin from "@/pages/auth-login";
import UserDashboard from "@/pages/user-dashboard";
import VideoUploadAnalyzer from "@/pages/video-upload-analyzer";
import EnhancedVideoAnalyzer from "@/pages/enhanced-video-analyzer";
import OptimalPostingTime from "@/pages/optimal-posting-time";
import RealOptimalPostingTime from "@/pages/real-optimal-posting-time";
import HashtagGenerator from "@/pages/hashtag-generator";
import AdminUsersDashboard from "@/pages/admin-users-dashboard";
import RealFreePublish from "@/pages/real-free-publish";
import FreePublish from "@/pages/free-publish";
import Verification from "@/pages/verification";
import PublishedExamples from "@/pages/published-examples";
import Login from "@/pages/login";
import AdminSimple from "@/pages/admin-simple";
import SitesControlSimple from "@/pages/sites-control-simple";
import SimpleSitesManager from "@/pages/simple-sites-manager";
import AdminApprovalDashboard from "@/pages/admin-approval-dashboard";
import NavigationHub from "@/pages/navigation-hub";
import SitesManagerWithReview from "@/pages/sites-manager-with-review";
import QuickPublish from "@/pages/quick-publish";
import QuickPublishNew from "@/pages/quick-publish-new";
import QuickPublishSimple from "@/pages/quick-publish-simple";
import FastPublish from "@/pages/fast-publish";
import FacebookTokenGuide from "@/pages/facebook-token-guide";
import VideoAnalysisDashboard from "@/pages/video-analysis-dashboard";
import TargetVideoInspector from "@/pages/target-video-inspector";
import EnhancedFreePublish from "@/pages/enhanced-free-publish";
import AIRecommendationsPage from "@/pages/ai-recommendations";
import AdminPanel from "@/pages/admin-panel";
import SocialCommentsPage from "@/pages/social-comments";
import AutomatedCommentsPage from "@/pages/automated-comments";
import ManualPublishing from "@/pages/manual-publishing";
import FollowersLiveStream from "@/pages/followers-live-stream";
import AdvancedFeaturesDashboard from "@/pages/advanced-features-dashboard";
import ComprehensiveFeaturesShowcase from "@/pages/comprehensive-features-showcase";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <MaintenanceCheck>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/contact" component={Contact} />
        <Route path="/auth-login" component={AuthLogin} />
        <Route path="/login" component={AuthLogin} />
        <Route path="/user-dashboard" component={UserDashboard} />
        <Route path="/video-upload-analyzer" component={EnhancedVideoAnalyzer} />
        <Route path="/enhanced-video-analyzer" component={EnhancedVideoAnalyzer} />
        <Route path="/optimal-posting-time" component={RealOptimalPostingTime} />
        <Route path="/optimal-posting-time-old" component={OptimalPostingTime} />
        <Route path="/hashtag-generator" component={HashtagGenerator} />
        <Route path="/admin-users-dashboard" component={AdminUsersDashboard} />
        <Route path="/free-publish" component={FreePublish} />
        <Route path="/real-free-publish" component={RealFreePublish} />
        <Route path="/enhanced-free-publish" component={EnhancedFreePublish} />
        <Route path="/quick-publish" component={QuickPublish} />
        <Route path="/quick-publish-new" component={QuickPublishNew} />
        <Route path="/quick-publish-simple" component={QuickPublishSimple} />
        <Route path="/fast-publish" component={FastPublish} />
        <Route path="/facebook-token-guide" component={FacebookTokenGuide} />
        <Route path="/admin/login" component={Login} />
        <Route path="/dashboard">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard-old">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/tiktok">
          <ProtectedRoute>
            <TikTokManager />
          </ProtectedRoute>
        </Route>
        <Route path="/tiktok-manager">
          <ProtectedRoute>
            <TikTokManager />
          </ProtectedRoute>
        </Route>
        <Route path="/verification" component={Verification} />
        <Route path="/examples" component={PublishedExamples} />
        <Route path="/published-examples" component={PublishedExamples} />
        <Route path="/admin" component={AdminSimple} />
        <Route path="/admin-simple" component={AdminSimple} />
        <Route path="/video-analysis-dashboard" component={VideoAnalysisDashboard} />
        <Route path="/target-video-inspector" component={TargetVideoInspector} />
        <Route path="/ai-recommendations">
          <ProtectedRoute>
            <AIRecommendationsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin-panel">
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        </Route>
        <Route path="/social-comments">
          <ProtectedRoute>
            <SocialCommentsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/automated-comments">
          <ProtectedRoute>
            <AutomatedCommentsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/manual-publishing">
          <ProtectedRoute>
            <ManualPublishing />
          </ProtectedRoute>
        </Route>
        <Route path="/followers-live-stream" component={FollowersLiveStream} />
        <Route path="/advanced-features" component={AdvancedFeaturesDashboard} />
        <Route path="/features-showcase" component={ComprehensiveFeaturesShowcase} />
        <Route path="/sites-control" component={SitesManagerWithReview} />
        <Route path="/sites-control-simple" component={SitesManagerWithReview} />
        <Route path="/sites-manager" component={SimpleSitesManager} />
        <Route path="/simple-sites" component={SimpleSitesManager} />
        <Route path="/sites-control-old" component={SitesControlSimple} />
        <Route path="/admin-approval">
          <ProtectedRoute>
            <AdminApprovalDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/approval-dashboard">
          <ProtectedRoute>
            <AdminApprovalDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/posts-review">
          <ProtectedRoute>
            <AdminApprovalDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/review-posts" component={AdminApprovalDashboard} />
        <Route path="/admin-review" component={AdminApprovalDashboard} />
        <Route path="/navigation" component={NavigationHub} />
        <Route path="/nav" component={NavigationHub} />
        <Route path="/hub" component={NavigationHub} />
        <Route component={NotFound} />
      </Switch>
    </MaintenanceCheck>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
