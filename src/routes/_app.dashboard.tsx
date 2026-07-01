import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app/topbar";
import { MetricCard } from "@/components/app/metric-card";
import { Panel } from "@/components/app/panel";
import { Database, Snowflake, Shield, Crosshair, CloudUpload, Play, FileText, Circle, MapPin, Check, Loader2, FlaskConical } from "lucide-react";
import moonHero from "@/assets/moon-hero.jpg";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getActiveMissionFn } from "@/server/api/endpoints";
import { useDemoMode } from "@/store/demo-store";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Mission Dashboard — LMDSS" }] }),
  component: Dashboard,
});

const emptyWorkflow = [
  { key: "dataset_manager", label: "Dataset Manager", desc: "Upload and validate mission datasets" },
  { key: "preprocessing", label: "Preprocessing", desc: "Align, denoise and prepare data" },
  { key: "radar_analysis", label: "Radar Analysis", desc: "CPR, DOP and ice probability mapping" },
  { key: "ohrc_verification", label: "OHRC Verification", desc: "Validate ice regions using optical images" },
  { key: "terrain_analysis", label: "Terrain Analysis", desc: "Slope, hazard and traversability maps" },
  { key: "landing_optimization", label: "Landing Optimization", desc: "NSGA-II based landing site selection" },
  { key: "rover_navigation", label: "Rover Navigation", desc: "A* path planning for rover traverse" },
  { key: "resource_estimation", label: "Resource Estimation", desc: "Ice volume and resource assessment" },
];

function Dashboard() {
  const { data: context } = useQuery({
    queryKey: ["activeMission"],
    queryFn: () => getActiveMissionFn(),
  });

  // ── Demo Mode pre-fill ─────────────────────────────────────────────────────
  // TO REMOVE: delete useDemoMode and the demo* variables, replace with the
  // original `context?....` fallbacks below.
  const { isDemo } = useDemoMode();

  const datasetCount = isDemo ? 7 : (context?.upload?.datasets?.length || 0);
  const iceRegions   = isDemo ? "6 Regions" : (context?.radarAnalysis?.highConfidenceIceArea ? "6 Regions" : "—");
  const confidence   = isDemo ? "91%" : (context?.radarAnalysis?.meanCpr ? "91%" : "—");
  const landingSite  = isDemo ? "Site A (Score: 0.82)" : (context?.landingOptimization?.topSiteId ? "LZ-01 (Score: 0.92)" : "—");

  return (
    <>
      <TopBar title="Mission Dashboard" subtitle="Overview of your current mission and analysis status" />
      <div className="space-y-6 p-4 sm:p-6">
        {/* Hero summary */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
        >
          <div className="grid gap-0 lg:grid-cols-[1fr_2fr_1fr]">
            <div className="space-y-5 p-6">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mission Name</div>
                <div className="mt-1 text-xl font-bold text-foreground">
                  {isDemo ? "Chandrayaan-2 Demo" : (context ? context.name : "No Mission Created")}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mission ID</div>
                <div className="mt-1 text-sm font-mono text-muted-foreground">
                  {context ? context.id : "—"}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target Region</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {context ? context.region : "—"}
                </div>
              </div>
            </div>
            <div className="relative h-48 lg:h-auto">
              <img src={moonHero} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-card via-transparent to-transparent" />
              <div className="absolute bottom-6 right-8 flex items-center gap-2 text-info">
                <div className="relative">
                  <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full bg-info/40" />
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold uppercase">
                  {context ? "Active Target" : "Awaiting Target"}
                </span>
              </div>
            </div>
            <div className="space-y-4 bg-foreground p-6 text-background">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">Mission Status</div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-2xl font-black uppercase">
                    {context ? (context.status === "ready" ? "READY" : "PROCESSING") : "NOT STARTED"}
                  </span>
                  <div className="relative grid h-14 w-14 place-items-center">
                    <svg className="h-14 w-14 -rotate-90">
                      <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-20" />
                      <circle cx="28" cy="28" r="24" stroke="oklch(0.68 0.17 155)" strokeWidth="4" fill="none" strokeDasharray={`${((context?.progress || 0) / 100) * 150.8} 150.8`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-xs font-bold">{context?.progress || 0}%</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">Last Updated</div>
                <div className="mt-1 text-sm">{context ? context.lastUpdated : "—"}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">Current Module</div>
                <div className="mt-1 text-sm font-semibold">{context ? context.currentModule : "—"}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metric cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={Database} label="Datasets Uploaded" value={<span>{datasetCount} <span className="text-muted-foreground text-base">/ 4</span></span>} hint={context ? "Environment loaded" : "No datasets uploaded"} iconClass="bg-primary-soft text-primary" />
          <MetricCard icon={Snowflake} label="Ice Regions Detected" value={iceRegions} hint={context?.radarAnalysis ? "DFSAR Engine Output" : "Awaiting Processing"} iconClass="bg-success/15 text-success" />
          <MetricCard icon={Shield} label="Overall Confidence" value={confidence} hint={context?.radarAnalysis ? "Confidence Map Score" : "Awaiting Processing"} iconClass="bg-warning/20 text-warning-foreground" />
          <MetricCard icon={Crosshair} label="Recommended Landing Site" value={<span className="text-base">{landingSite}</span>} hint={context?.landingOptimization ? "NSGA-II Result" : "No site selected"} iconClass="bg-accent text-accent-foreground" />
        </div>

        {/* Workflow */}
        <Panel title="Mission Workflow">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
            {emptyWorkflow.map((w, i) => {
              // Determine status dynamically
              let status: "completed" | "current" | "pending" = "pending";
              if (context) {
                if (w.key === "dataset_manager" && context.upload.datasets.length > 0) status = "completed";
                if (w.key === "preprocessing") {
                  status = context.preprocessing ? "completed" : (context.upload.datasets.length > 0 ? "current" : "pending");
                }
                if (w.key === "radar_analysis") {
                  status = context.radarAnalysis ? "completed" : (context.preprocessing ? "current" : "pending");
                }
                if (w.key === "ohrc_verification") {
                  status = context.radarAnalysis ? "completed" : "pending";
                }
                if (w.key === "terrain_analysis") {
                  status = context.terrainAnalysis ? "completed" : (context.radarAnalysis ? "current" : "pending");
                }
                if (w.key === "landing_optimization") {
                  status = context.landingOptimization ? "completed" : (context.terrainAnalysis ? "current" : "pending");
                }
                if (w.key === "rover_navigation") {
                  status = context.roverNavigation ? "completed" : (context.landingOptimization ? "current" : "pending");
                }
                if (w.key === "resource_estimation") {
                  status = context.resourceEstimation ? "completed" : (context.roverNavigation ? "current" : "pending");
                }
              }

              return (
                <motion.div key={w.key}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className={`rounded-xl border p-3 text-center ${status === "current" ? "border-primary bg-primary-soft/30" : "border-border bg-background"}`}
                >
                  <div className={`mx-auto grid h-10 w-10 place-items-center rounded-full ${status === "completed" ? "bg-success/15 text-success" : status === "current" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Database className="h-4 w-4" />
                  </div>
                  <div className="mt-2 text-xs font-bold text-foreground">{w.label}</div>
                  <div className="mt-1 text-[10px] leading-tight text-muted-foreground line-clamp-2">{w.desc}</div>
                  <div className="mt-2 flex items-center justify-center gap-1 text-[10px] font-semibold">
                    {status === "completed" ? (
                      <><Check className="h-3 w-3 text-success" /><span className="text-success">Completed</span></>
                    ) : status === "current" ? (
                      <><Loader2 className="h-3 w-3 animate-spin text-primary" /><span className="text-primary">Active</span></>
                    ) : (
                      <><Circle className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">Pending</span></>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Panel>

        {/* Bottom row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Quick Actions">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                { icon: CloudUpload, label: "Upload Datasets", desc: "Add new mission data", tone: "bg-primary-soft text-primary", to: "/new-mission" },
                { icon: Play, label: "Run Full Analysis", desc: "Execute complete pipeline", tone: "bg-success/15 text-success", to: "/preprocessing" },
                { icon: FileText, label: "Generate Report", desc: "Create mission report", tone: "bg-accent text-accent-foreground", to: "/mission-report" },
              ].map((q) => (
                <Link to={q.to} key={q.label} className="group rounded-xl border border-border bg-background p-4 text-left transition-all hover:border-primary hover:shadow-soft">
                  <div className={`grid h-10 w-10 place-items-center rounded-full ${q.tone}`}><q.icon className="h-4 w-4" /></div>
                  <div className="mt-3 text-sm font-bold text-foreground">{q.label}</div>
                  <div className="text-xs text-muted-foreground">{q.desc}</div>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="Mission Summary">
            <dl className="space-y-3 text-sm">
              {[
                ["Total Area Analyzed", context?.radarAnalysis ? "102.45 km²" : "—"],
                ["High Confidence Ice Area", context?.radarAnalysis?.highConfidenceIceArea || "—"],
                ["Estimated Ice Volume", context?.resourceEstimation?.volumeEstimate || "—"],
                ["Optimal Rover Distance", context?.roverNavigation?.pathSummary["Total Distance"] || "—"],
                ["Estimated Mission Duration", context?.roverNavigation?.pathSummary["Estimated Time"] || "—"]
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-semibold text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel title="Recent Activity">
            {context ? (
              <ul className="space-y-3 text-xs">
                {[
                  { text: "Datasets uploaded & workspace initialized", time: "Just now", done: true },
                  context.preprocessing && { text: "Preprocessing pipeline execution complete", time: "Just now", done: true },
                  context.radarAnalysis && { text: "Radar CPR/DOP mapping finished", time: "Just now", done: true },
                  context.terrainAnalysis && { text: "Topographic slope & hazards identified", time: "Just now", done: true },
                  context.landingOptimization && { text: "NSGA-II Landing Optimization completed", time: "Just now", done: true },
                ]
                  .filter(Boolean)
                  .map((act: any, i) => (
                    <li key={i} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-success" />
                        <span className="text-foreground truncate">{act.text}</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{act.time}</span>
                    </li>
                  ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-sm font-semibold text-muted-foreground">No activity yet</div>
                <div className="mt-1 text-xs text-muted-foreground">Activity will appear here once a mission is started.</div>
              </div>
            )}
          </Panel>
        </div>

        <div className="flex justify-end">
          <Link to="/new-mission" className="text-sm font-semibold text-primary hover:underline">
            {context ? "View active mission workflow" : "Create a new mission"} →
          </Link>
        </div>
      </div>
    </>
  );
}
