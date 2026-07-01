import { Bell, HelpCircle, Settings, ChevronDown, FlaskConical, Satellite } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getActiveMissionFn } from "@/server/api/endpoints";
import { useDemoMode } from "@/store/demo-store";

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { data: context } = useQuery({
    queryKey: ["activeMission"],
    queryFn: () => getActiveMissionFn(),
  });

  // Demo Mode toggle — isolated from production logic
  const { isDemo, toggleDemo } = useDemoMode();

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md sm:px-6 print:hidden">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-foreground sm:text-xl">{title}</h1>
          {subtitle && <p className="hidden truncate text-sm text-muted-foreground sm:block">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">


          <div className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Mission</span>
            <span className="text-sm font-semibold text-foreground">
              {isDemo ? "Chandrayaan-2 Demo" : (context?.name || "No Mission")}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
          <button className="relative grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          </button>
          <button className="hidden sm:grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <HelpCircle className="h-[18px] w-[18px]" />
          </button>
          <button className="hidden sm:grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Settings className="h-[18px] w-[18px]" />
          </button>
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-1 py-1 pr-3">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">MP</div>
            <span className="hidden text-sm font-medium text-foreground sm:block">Mission Planner</span>
          </div>
        </div>
      </header>
      {!isDemo && context?.aiAnalysisFallback && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 print:hidden">
          <Satellite className="h-4 w-4 shrink-0 animate-pulse" />
          <span>AI analysis unavailable. Limited analysis mode enabled. Craters, hazards, and safe regions estimated using default parameters.</span>
        </div>
      )}
    </>
  );
}
