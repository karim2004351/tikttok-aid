import { AutomatedCommentsBrowser } from "@/components/automated-comments-browser";
import { CompactSidebar } from "@/components/compact-sidebar";

export default function AutomatedCommentsPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex">
      <CompactSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <AutomatedCommentsBrowser />
        </div>
      </main>
    </div>
  );
}