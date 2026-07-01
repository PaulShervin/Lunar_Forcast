import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app/topbar";
import { Panel, StatusBadge } from "@/components/app/panel";
import { MetricCard } from "@/components/app/metric-card";
import { ArrowLeft, ArrowRight, Battery, Clock, Route as RouteIcon, Gauge, Target, MapPin, AlertTriangle, Wifi, Snowflake, Info, ShieldAlert, FlaskConical } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getRoverNavigationDataFn } from "@/server/api/endpoints";
import { motion } from "framer-motion";
import { DEMO_ASSETS, DEMO_ASSET_META } from "@/lib/demo-assets";
import { useState } from "react";
import { useDemoMode } from "@/store/demo-store";

export const Route = createFileRoute("/_app/rover-navigation")({
  head: () => ({ meta: [{ title: "Rover Navigation — LMDSS" }] }),
  component: RoverNav,
});

// ── Demo Mode Component ──────────────────────────────────────────────────────
function DemoRoverNav() {
  const rov = {
    status: {
      battery: "72%",
      range: "2.41 km",
      time: "01:24:37",
      distance: "865 m",
      speed: "0.18 m/s",
    },
    currentObjective: {
      title: "Ice Deposit #1",
      desc: "Collect and analyze ice sample",
    },
    nextObjective: {
      title: "Ice Deposit #2",
      dist: "613 m",
    },
    commStatus: {
      rover: "Signal Strong",
      lander: "Signal Strong",
      link: "Strong",
    },
    pathSummary: {
      "Total Distance": "1.48 km",
      "Estimated Time": "18 min 32 sec",
      "Energy Required": "18.6 Wh",
      "Terrain Difficulty": "Moderate",
      "Path Feasibility": "High",
    },
    terrainLegend: [
      { c: "bg-success", t: "Safe Terrain", s: "Traversable area", v: "68.3%" },
      { c: "bg-warning", t: "Hazard Zone", s: "Steep slopes / Craters", v: "14.7%" },
      { c: "bg-muted-foreground", t: "Rough Terrain", s: "Slow movement", v: "10.9%" },
      { c: "bg-destructive", t: "Untraversable", s: "Avoid - High risk", v: "6.1%" },
    ],
    alerts: [
      { t: "Large Crater Ahead", d: "Distance: 42 m" },
      { t: "Steep Slope Detected", d: "Slope: 24°" },
    ],
  };

  return (
    <>
      <TopBar title="Rover Navigation" subtitle="Navigate from landing site to ice deposits safely and efficiently" />
      <div className="space-y-6 p-4 sm:p-6">

        {/* Live A* Navigation Dashboard */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Panel title="Rover Navigation Map (A* Live Output)" subtitle={
            <span className="flex flex-wrap items-center gap-3 text-[11px] mt-1">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> A* Planned Path</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> Crater Buffer Zones</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-info" /> Safe Regions</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-500" /> Adaptive Waypoints</span>
            </span>
          } padded={false}>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-b-2xl bg-[#080b0f] border-t border-border">
              {/* Demo Preprocessed GIS Background Image */}
              <img 
                src={DEMO_ASSETS.rover} 
                alt="Lunar Terrain Context" 
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute top-2 left-2 rounded bg-background/75 backdrop-blur px-2 py-1 text-[10px] font-mono">
                {DEMO_ASSET_META.rover.source}
              </div>
              <div className="absolute bottom-3 left-4 rounded-lg bg-background/85 backdrop-blur px-2.5 py-1.5 text-[10px] font-mono border border-border shadow-md">
                Grid: 300 x 200 px | Scale: 1px = 10m
              </div>
            </div>
          </Panel>

          {/* Sidebar Status & Diagnostics */}
          <div className="space-y-4">
            <Panel title={<span className="flex items-center justify-between">ROVER NAVIGATION HUD <span className="flex items-center gap-1 text-xs font-semibold text-success"><span className="h-2 w-2 rounded-full bg-success animate-pulse" /> Live</span></span>}>
              <div className="grid grid-cols-2 gap-4">
                <div><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Battery className="h-3.5 w-3.5" /> Battery</div><div className="text-2xl font-bold text-foreground">{rov.status.battery}</div><div className="text-[11px] text-muted-foreground">Range: {rov.status.range}</div></div>
                <div><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> Mission Time</div><div className="text-2xl font-mono font-bold text-foreground">{rov.status.time}</div></div>
                <div><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><RouteIcon className="h-3.5 w-3.5" /> Distance</div><div className="text-2xl font-bold text-foreground">{rov.status.distance}</div></div>
                <div><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Gauge className="h-3.5 w-3.5" /> Avg Speed</div><div className="text-2xl font-bold text-foreground">{rov.status.speed}</div></div>
              </div>
            </Panel>
            
            <Panel title="Current Objective">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-primary"><Target className="h-5 w-5" /></div>
                <div><div className="text-sm font-bold text-foreground">{rov.currentObjective.title}</div><div className="text-xs text-muted-foreground">{rov.currentObjective.desc}</div></div>
              </div>
              <div className="mt-3 border-t border-border pt-3">
                <div className="text-xs font-bold uppercase text-muted-foreground">Next Objective</div>
                <div className="mt-1 flex items-center gap-2 text-sm text-foreground"><Snowflake className="h-4 w-4 text-info" /> {rov.nextObjective.title} <span className="ml-auto text-muted-foreground">{rov.nextObjective.dist}</span></div>
              </div>
            </Panel>

            <Panel title="Communications Link">
              <div className="flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2"><Wifi className="h-4 w-4 text-success" /><div><div className="font-bold">ROVER</div><div className="text-success">{rov.commStatus.rover}</div></div></div>
                <div className="h-px flex-1 border-t border-dashed border-success" />
                <div className="flex items-center gap-2"><div className="text-right"><div className="font-bold">LANDER</div><div className="text-success">{rov.commStatus.lander}</div></div><Wifi className="h-4 w-4 text-success" /></div>
              </div>
            </Panel>
          </div>
        </div>

        {/* Cost Map diagnostics / Metrics Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Planetary Diagnostics Panel" className="lg:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-card border border-border/80 rounded-xl p-3.5">
                <div className="text-xs text-muted-foreground">Total Route Length</div>
                <div className="text-xl font-bold mt-1 text-foreground">1.48 km</div>
              </div>
              <div className="bg-card border border-border/80 rounded-xl p-3.5">
                <div className="text-xs text-muted-foreground">Traversal Cost (Grid sum)</div>
                <div className="text-xl font-bold mt-1 text-foreground">342</div>
              </div>
              <div className="bg-card border border-border/80 rounded-xl p-3.5">
                <div className="text-xs text-muted-foreground">Hazards Avoided (Bypassed)</div>
                <div className="text-xl font-bold mt-1 text-success">14</div>
              </div>
              <div className="bg-card border border-border/80 rounded-xl p-3.5">
                <div className="text-xs text-muted-foreground">Average Terrain Slope</div>
                <div className="text-xl font-bold mt-1 text-foreground">5.8°</div>
              </div>
              <div className="bg-card border border-border/80 rounded-xl p-3.5">
                <div className="text-xs text-muted-foreground">Maximum Slope</div>
                <div className="text-xl font-bold mt-1 text-warning">14.2°</div>
              </div>
              <div className="bg-card border border-border/80 rounded-xl p-3.5">
                <div className="text-xs text-muted-foreground">Safe Traversal Percentage</div>
                <div className="text-xl font-bold mt-1 text-success">94.8%</div>
              </div>
            </div>
          </Panel>

          <Panel title="Path Parameters Summary">
            <dl className="space-y-2 text-sm">
              {Object.entries(rov.pathSummary).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border/60 pb-1.5 last:border-0"><dt className="text-muted-foreground">{k}</dt><dd className="font-semibold text-foreground">{v}</dd></div>
              ))}
            </dl>
          </Panel>
        </div>

        {/* Legend and Active Warnings */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Terrain Legend (AI Classification)">
            <ul className="space-y-2 text-sm">
              {rov.terrainLegend.map((r) => (
                <li key={r.t} className="flex items-center gap-3">
                  <span className={`h-4 w-4 rounded ${r.c}`} />
                  <div className="flex-1"><div className="font-semibold">{r.t}</div><div className="text-xs text-muted-foreground">{r.s}</div></div>
                  <span className="font-bold text-foreground">{r.v}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title={<span className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-destructive" /> Active Hazard Warnings <span className="text-destructive">{rov.alerts.length}</span></span>}>
            <ul className="space-y-3">
              {rov.alerts.map((a) => (
                <li key={a.t} className="flex items-center gap-3 rounded-xl border border-border bg-warning/10 p-3">
                  <AlertTriangle className="h-5 w-5 text-warning-foreground" />
                  <div className="flex-1"><div className="text-sm font-bold text-foreground">{a.t}</div><div className="text-xs text-muted-foreground">{a.d}</div></div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/landing-optimization" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted"><ArrowLeft className="h-4 w-4" /> Back to Landing Optimization</Link>
          <Link to="/resource-estimation" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Continue to Resource Estimation <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </>
  );
}

function RoverNav() {
  const { isDemo } = useDemoMode();

  const { data: context } = useQuery({
    queryKey: ["roverNavigationData"],
    queryFn: () => getRoverNavigationDataFn(),
  });

  const [hoveredWp, setHoveredWp] = useState<any | null>(null);

  if (isDemo) {
    return <DemoRoverNav />;
  }

  if (!context) {
    return (
      <>
        <TopBar title="Rover Navigation" subtitle="Navigate from landing site to ice deposits safely and efficiently" />
        <div className="p-6 text-center">
          <Panel title="Awaiting Mission">
            <p className="text-sm text-muted-foreground">No active mission session found. Please initialize a new mission first.</p>
            <Link to="/new-mission" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Initialize Mission
            </Link>
          </Panel>
        </div>
      </>
    );
  }

  const rov = context.roverNavigation;
  const ai = context.aiAnalysis || {};
  const width = rov?.width || 300;
  const height = rov?.height || 200;

  // Scale functions to convert percentages to SVG pixel coordinates
  const scaleX = (pct: number) => (pct / 100) * width;
  const scaleY = (pct: number) => (pct / 100) * height;
  const scaleR = (pct: number) => (pct / 100) * Math.min(width, height);

  // Convert A* path coordinates to polyline string
  const getPolylinePoints = (points: Array<{ x: number; y: number }>) => {
    return points.map((p) => `${p.x},${p.y}`).join(" ");
  };

  const pathPoints = rov?.pathPoints || [];
  const waypoints = rov?.waypoints || [];

  return (
    <>
      <TopBar title="Rover Navigation" subtitle="Navigate from landing site to ice deposits safely and efficiently" />
      <div className="space-y-6 p-4 sm:p-6">

        {/* Live A* Navigation Dashboard */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Panel title="Rover Navigation Map (A* Live Output)" subtitle={
            <span className="flex flex-wrap items-center gap-3 text-[11px] mt-1">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> A* Planned Path</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> Crater Buffer Zones</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-info" /> Safe Regions</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-500" /> Adaptive Waypoints</span>
            </span>
          } padded={false}>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-b-2xl bg-[#080b0f] border-t border-border">
              {/* Preprocessed GIS Background Image */}
              <img 
                src={rov?.roverImage || DEMO_ASSETS.ohrc} 
                alt="Lunar Terrain Context" 
                className="absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-screen"
              />

              <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 h-full w-full">
                {/* 1. Safe Regions (Green dashed circles) */}
                {ai.safe_regions?.map((sr: any, idx: number) => (
                  <circle key={`safe-${idx}`} cx={scaleX(sr.x)} cy={scaleY(sr.y)} r={scaleR(sr.radius)} stroke="#22c55e" strokeWidth="1.2" strokeDasharray="3 4" fill="rgba(34, 197, 94, 0.02)" />
                ))}

                {/* 2. Forbidden Safety Zones (Orange dashed circles = Crater Radius + Margin) */}
                {ai.large_craters?.map((c: any, idx: number) => {
                  const safetyMargin = c.radius >= 18 ? 50 : c.radius >= 10 ? 30 : 15;
                  const safetyRadiusPct = c.radius + (safetyMargin / Math.min(width, height)) * 100;
                  return (
                    <circle key={`crater-${idx}`} cx={scaleX(c.x)} cy={scaleY(c.y)} r={scaleR(safetyRadiusPct)} stroke="#f97316" strokeWidth="1.2" strokeDasharray="4 3" fill="rgba(249, 115, 22, 0.03)" />
                  );
                })}

                {/* 3. Real A* Path Output */}
                {pathPoints.length > 1 && (
                  <polyline 
                    points={getPolylinePoints(pathPoints)} 
                    stroke="oklch(0.68 0.17 155)" 
                    strokeWidth="3.2" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="opacity-95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
                  />
                )}

                {/* 4. Interactive Adaptive Waypoints */}
                {waypoints.map((w: any, idx: number) => (
                  <g 
                    key={w.l}
                    onMouseEnter={() => setHoveredWp(w)}
                    onMouseLeave={() => setHoveredWp(null)}
                    className="cursor-pointer"
                  >
                    <circle 
                      cx={w.cx} 
                      cy={w.cy} 
                      r="7.5" 
                      fill="oklch(0.55 0.22 264)" 
                      stroke="#080b0f" 
                      strokeWidth="2" 
                      className="transition-all hover:scale-125 hover:fill-success"
                    />
                    <text 
                      x={w.cx + 9} 
                      y={w.cy + 3} 
                      fill="white" 
                      fontSize="8.5" 
                      fontWeight="800" 
                      className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
                    >
                      {w.l}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Waypoint Interactive Hover Card Overlay */}
              {hoveredWp && (
                <div 
                  className="absolute z-10 -translate-x-1/2 -translate-y-[115%] pointer-events-none rounded-xl border border-border bg-background/95 backdrop-blur-md p-3 shadow-xl w-48 text-xs font-sans transition-all duration-150 animate-in fade-in zoom-in-90"
                  style={{ 
                    left: `${(hoveredWp.cx / width) * 100}%`, 
                    top: `${(hoveredWp.cy / height) * 100}%` 
                  }}
                >
                  <div className="flex items-center gap-1.5 border-b border-border pb-1.5 mb-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="font-bold text-foreground text-sm">{hoveredWp.l} Detail Card</span>
                  </div>
                  <div className="space-y-1 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Distance:</span>
                      <span className="font-semibold text-foreground">{hoveredWp.distFromPrev}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Terrain:</span>
                      <span className={`font-semibold ${hoveredWp.difficulty === "Hard" ? "text-destructive" : hoveredWp.difficulty === "Moderate" ? "text-warning" : "text-success"}`}>{hoveredWp.difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ETA:</span>
                      <span className="font-mono text-foreground font-semibold">{hoveredWp.eta}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Coordinate readouts */}
              {rov?.landingSitePct && (
                <div className="absolute" style={{ left: `${rov.landingSitePct.x}%`, top: `${rov.landingSitePct.y}%` }}>
                  <div className="-translate-x-1/2 -translate-y-full flex flex-col items-center">
                    <div className="flex items-center gap-1 rounded bg-success/90 px-1.5 py-0.5 text-[8.5px] font-bold text-white shadow-lg">
                      <MapPin className="h-3 w-3" /> LANDING
                    </div>
                  </div>
                </div>
              )}

              {rov?.targetPct && (
                <div className="absolute" style={{ left: `${rov.targetPct.x}%`, top: `${rov.targetPct.y}%` }}>
                  <div className="-translate-x-1/2 -translate-y-full flex flex-col items-center">
                    <div className="flex items-center gap-1 rounded bg-destructive/95 px-1.5 py-0.5 text-[8.5px] font-bold text-white shadow-lg">
                      <Snowflake className="h-3 w-3" /> ICE TARGET
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute bottom-3 left-4 rounded-lg bg-background/85 backdrop-blur px-2.5 py-1.5 text-[10px] font-mono border border-border shadow-md">
                Grid: {width} x {height} px | Scale: 1px = 10m
              </div>
            </div>
          </Panel>

          {/* Sidebar Status & Diagnostics */}
          <div className="space-y-4">
            <Panel title={<span className="flex items-center justify-between">ROVER NAVIGATION HUD <span className="flex items-center gap-1 text-xs font-semibold text-success"><span className="h-2 w-2 rounded-full bg-success animate-pulse" /> Live</span></span>}>
              <div className="grid grid-cols-2 gap-4">
                <div><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Battery className="h-3.5 w-3.5" /> Battery</div><div className="text-2xl font-bold text-foreground">{rov?.status.battery || "—"}</div><div className="text-[11px] text-muted-foreground">Range: {rov?.status.range || "—"}</div></div>
                <div><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> Mission Time</div><div className="text-2xl font-mono font-bold text-foreground">{rov?.status.time || "—"}</div></div>
                <div><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><RouteIcon className="h-3.5 w-3.5" /> Distance</div><div className="text-2xl font-bold text-foreground">{rov?.status.distance || "—"}</div></div>
                <div><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Gauge className="h-3.5 w-3.5" /> Avg Speed</div><div className="text-2xl font-bold text-foreground">{rov?.status.speed || "—"}</div></div>
              </div>
            </Panel>
            
            <Panel title="Current Objective">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-primary"><Target className="h-5 w-5" /></div>
                <div><div className="text-sm font-bold text-foreground">{rov?.currentObjective.title || "—"}</div><div className="text-xs text-muted-foreground">{rov?.currentObjective.desc || "—"}</div></div>
              </div>
              <div className="mt-3 border-t border-border pt-3">
                <div className="text-xs font-bold uppercase text-muted-foreground">Next Objective</div>
                <div className="mt-1 flex items-center gap-2 text-sm text-foreground"><Snowflake className="h-4 w-4 text-info" /> {rov?.nextObjective.title || "—"} <span className="ml-auto text-muted-foreground">{rov?.nextObjective.dist || "—"}</span></div>
              </div>
            </Panel>

            <Panel title="Communications Link">
              <div className="flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2"><Wifi className="h-4 w-4 text-success" /><div><div className="font-bold">ROVER</div><div className="text-success">{rov?.commStatus.rover || "—"}</div></div></div>
                <div className="h-px flex-1 border-t border-dashed border-success" />
                <div className="flex items-center gap-2"><div className="text-right"><div className="font-bold">LANDER</div><div className="text-success">{rov?.commStatus.lander || "—"}</div></div><Wifi className="h-4 w-4 text-success" /></div>
              </div>
            </Panel>
          </div>
        </div>

        {/* Cost Map diagnostics / Metrics Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Planetary Diagnostics Panel" className="lg:col-span-2">
            {rov?.diagnostics ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border/80 rounded-xl p-3.5">
                  <div className="text-xs text-muted-foreground">Total Route Length</div>
                  <div className="text-xl font-bold mt-1 text-foreground">{rov.diagnostics.totalRouteLength}</div>
                </div>
                <div className="bg-card border border-border/80 rounded-xl p-3.5">
                  <div className="text-xs text-muted-foreground">Traversal Cost (Grid sum)</div>
                  <div className="text-xl font-bold mt-1 text-foreground">{rov.diagnostics.traversalCost}</div>
                </div>
                <div className="bg-card border border-border/80 rounded-xl p-3.5">
                  <div className="text-xs text-muted-foreground">Hazards Avoided (Bypassed)</div>
                  <div className="text-xl font-bold mt-1 text-success">{rov.diagnostics.hazardsAvoided}</div>
                </div>
                <div className="bg-card border border-border/80 rounded-xl p-3.5">
                  <div className="text-xs text-muted-foreground">Average Terrain Slope</div>
                  <div className="text-xl font-bold mt-1 text-foreground">{rov.diagnostics.averageTerrainSlope}</div>
                </div>
                <div className="bg-card border border-border/80 rounded-xl p-3.5">
                  <div className="text-xs text-muted-foreground">Maximum Slope</div>
                  <div className="text-xl font-bold mt-1 text-warning">{rov.diagnostics.maximumSlope}</div>
                </div>
                <div className="bg-card border border-border/80 rounded-xl p-3.5">
                  <div className="text-xs text-muted-foreground">Safe Traversal Percentage</div>
                  <div className="text-xl font-bold mt-1 text-success">{rov.diagnostics.safeTraversalPercentage}</div>
                </div>
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center">
                <span className="text-sm text-muted-foreground">Computing telemetry analytics...</span>
              </div>
            )}
          </Panel>

          <Panel title="Path Parameters Summary">
            <dl className="space-y-2 text-sm">
              {rov?.pathSummary && Object.entries(rov.pathSummary).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border/60 pb-1.5 last:border-0"><dt className="text-muted-foreground">{k}</dt><dd className="font-semibold text-foreground">{v}</dd></div>
              ))}
            </dl>
          </Panel>
        </div>

        {/* Legend and Active Warnings */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Terrain Legend (AI Classification)">
            <ul className="space-y-2 text-sm">
              {rov?.terrainLegend.map((r) => (
                <li key={r.t} className="flex items-center gap-3">
                  <span className={`h-4 w-4 rounded ${r.c}`} />
                  <div className="flex-1"><div className="font-semibold">{r.t}</div><div className="text-xs text-muted-foreground">{r.s}</div></div>
                  <span className="font-bold text-foreground">{r.v}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title={<span className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-destructive" /> Active Hazard Warnings <span className="text-destructive">{rov?.alerts.length || 0}</span></span>}>
            <ul className="space-y-3">
              {rov?.alerts.map((a) => (
                <li key={a.t} className="flex items-center gap-3 rounded-xl border border-border bg-warning/10 p-3">
                  <AlertTriangle className="h-5 w-5 text-warning-foreground" />
                  <div className="flex-1"><div className="text-sm font-bold text-foreground">{a.t}</div><div className="text-xs text-muted-foreground">{a.d}</div></div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/landing-optimization" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted"><ArrowLeft className="h-4 w-4" /> Back to Landing Optimization</Link>
          <Link to="/resource-estimation" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Continue to Resource Estimation <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </>
  );
}
