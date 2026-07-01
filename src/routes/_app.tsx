import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app/sidebar";
import { DemoBanner } from "@/components/app/demo-banner";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Demo Mode banner — only visible when DEMO_MODE is enabled */}
        <DemoBanner />
        <Outlet />
      </div>
    </div>
  );
}
