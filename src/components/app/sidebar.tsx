import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FolderPlus, FolderKanban, Database, Settings2,
  Radar, Mountain, Rocket, Navigation, Snowflake, Play,
  BarChart3, FileText, Settings, Satellite,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getActiveMissionFn } from "@/server/api/endpoints";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/new-mission", label: "New Mission", icon: FolderPlus },
  { to: "/preprocessing", label: "Preprocessing", icon: Settings2 },
  { to: "/radar-analysis", label: "Radar Analysis", icon: Radar },
  { to: "/terrain-analysis", label: "Terrain Analysis", icon: Mountain },
  { to: "/landing-optimization", label: "Landing Optimization", icon: Rocket },
  { to: "/rover-navigation", label: "Rover Navigation", icon: Navigation },
  { to: "/resource-estimation", label: "Resource Estimation", icon: Snowflake },
  { to: "/mission-simulation", label: "Mission Simulation", icon: Play },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/mission-report", label: "Mission Report", icon: FileText },
  { to: "/settings", label: "Settings & About", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  
  const { data: context } = useQuery({
    queryKey: ["activeMission"],
    queryFn: () => getActiveMissionFn(),
  });

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar print:hidden">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-info text-white shadow-soft">
          <Satellite className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-black tracking-tight text-foreground">LMDSS</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Lunar Mission DSS</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {items.map((it) => {
            const active = pathname === it.to;
            const Icon = it.icon;
            return (
              <li key={it.to}>
                <Link
                  to={it.to}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-sidebar-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="truncate">{it.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="m-3 rounded-xl border border-sidebar-border bg-gradient-to-br from-primary-soft to-background p-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Mission</span>
        </div>
        <div className="mt-1.5 text-sm font-bold text-foreground">{context?.name || "No Active Mission"}</div>
        <div className="text-[11px] text-muted-foreground">ID: {context?.id || "—"}</div>
      </div>
    </aside>
  );
}
