import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app/topbar";
import { Panel, StatusBadge } from "@/components/app/panel";
import { ArrowLeft, ArrowRight, AlertTriangle, FlaskConical } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getTerrainAnalysisDataFn } from "@/server/api/endpoints";
import { useDemoMode } from "@/store/demo-store";
import { DEMO_ASSETS, DEMO_ASSET_META } from "@/lib/demo-assets";

export const Route = createFileRoute("/_app/terrain-analysis")({
  head: () => ({ meta: [{ title: "Terrain Analysis — LMDSS" }] }),
  component: TerrainAnalysis,
});

// ── Demo Mode Component ──────────────────────────────────────────────────────
// TO REMOVE DEMO MODE: delete this DemoTerrainAnalysis function.
// ─────────────────────────────────────────────────────────────────────────────
function DemoTerrainAnalysis() {
  const demoDist = [
    { name: "Flat (0-5°)", value: 38, color: "oklch(0.55 0.22 264)" },
    { name: "Gentle (5-15°)", value: 29, color: "oklch(0.68 0.17 155)" },
    { name: "Moderate (15-30°)", value: 22, color: "oklch(0.78 0.16 75)" },
    { name: "Steep (>30°)", value: 11, color: "oklch(0.72 0.18 25)" },
  ];
  return (
    <>
      <TopBar title="Terrain Analysis" subtitle="Analyze lunar topography and identify safe and accessible regions" />
      <div className="space-y-6 p-4 sm:p-6">

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Slope Map (Degrees)" padded={false}>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-b-2xl">
              <img src={DEMO_ASSETS.terrain} alt="Slope Map" className="h-full w-full object-cover" />
              <div className="absolute top-2 left-2 rounded bg-background/75 backdrop-blur px-2 py-1 text-[10px] font-mono">{DEMO_ASSET_META.terrain.source}</div>
              <div className="absolute bottom-4 left-4 rounded-md bg-background/80 px-2 py-1 text-[11px] font-semibold">10 km</div>
            </div>
          </Panel>
          <Panel title="Hazard Assessment Map" padded={false}>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-b-2xl">
              <img src={DEMO_ASSETS.hazard} alt="Hazard Map" className="h-full w-full object-cover" />
              <div className="absolute top-2 left-2 rounded bg-background/75 backdrop-blur px-2 py-1 text-[10px] font-mono">{DEMO_ASSET_META.hazard.source}</div>
              <div className="absolute bottom-4 left-4 rounded-md bg-background/80 px-2 py-1 text-[11px] font-semibold">10 km</div>
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Terrain Suitability Overview">
            <div className="flex items-center gap-4">
              <div className="relative grid h-28 w-28 place-items-center">
                <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
                  <circle cx="50" cy="50" r="40" stroke="oklch(0.92 0.01 250)" strokeWidth="10" fill="none" />
                  <circle cx="50" cy="50" r="40" stroke="oklch(0.68 0.17 155)" strokeWidth="10" fill="none" strokeDasharray="195.8 251" strokeLinecap="round" />
                </svg>
                <div className="absolute text-center"><div className="text-2xl font-bold">78%</div><div className="text-[10px] text-success font-semibold">Good</div></div>
              </div>
              <ul className="flex-1 space-y-1.5 text-xs">
                <li className="flex justify-between"><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-success" />High Suitability</span><span className="font-semibold">38.2 km²</span></li>
                <li className="flex justify-between"><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-success/50" />Moderate</span><span className="font-semibold">29.4 km²</span></li>
                <li className="flex justify-between"><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-warning" />Low</span><span className="font-semibold">22.1 km²</span></li>
                <li className="flex justify-between"><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-destructive" />Unsuitable</span><span className="font-semibold">11.3 km²</span></li>
              </ul>
            </div>
          </Panel>
          <Panel title="Hazard Detection">
            <ul className="space-y-2 text-sm">
              {[{ label: "Impact Craters", level: "High", tone: "destructive" as const, count: "47" }, { label: "Steep Slopes", level: "Medium", tone: "warning" as const, count: "85" }, { label: "Large Boulders", level: "Medium", tone: "warning" as const, count: "128" }, { label: "Rough Terrain", level: "Low", tone: "success" as const, count: "241" }].map((h) => (
                <li key={h.label} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
                  <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning-foreground" /><span>{h.label}</span></div>
                  <div className="flex items-center gap-3"><StatusBadge tone={h.tone}>{h.level}</StatusBadge><span className="text-xs font-semibold">{h.count}</span></div>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-success/10 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Hazard Score</span>
              <span className="font-bold text-success">0.72 / 1.00</span>
            </div>
          </Panel>
          <Panel title="Top Safe Regions">
            <table className="w-full text-sm">
              <thead className="text-[10px] font-bold uppercase text-muted-foreground"><tr><th className="text-left">ID</th><th>Area (km²)</th><th>Slope</th><th>Suit.</th></tr></thead>
              <tbody>
                {[{ id: "SR-01", area: "3.8", slope: 3.2, suitability: 94 }, { id: "SR-02", area: "2.6", slope: 4.8, suitability: 88 }, { id: "SR-03", area: "1.9", slope: 6.1, suitability: 81 }].map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2 font-semibold text-foreground">{r.id}</td>
                    <td className="text-center text-foreground">{r.area}</td>
                    <td className="text-center text-foreground">{r.slope}°</td>
                    <td className="text-center"><StatusBadge tone="success">{r.suitability}%</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>

        <Panel title="Terrain Distribution">
          <div className="grid items-center gap-4 sm:grid-cols-2">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={demoDist} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2}>{demoDist.map((d) => <Cell key={d.name} fill={d.color} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
            <ul className="space-y-2 text-sm">
              {demoDist.map((d) => (<li key={d.name} className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: d.color }} />{d.name}</span><span className="font-semibold text-foreground">{d.value}%</span></li>))}
            </ul>
          </div>
        </Panel>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/radar-analysis" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted"><ArrowLeft className="h-4 w-4" /> Back to Radar Analysis</Link>
          <Link to="/landing-optimization" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Continue to Landing Optimization <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </>
  );
}

function TerrainAnalysis() {
  // ── Demo Mode branch ───────────────────────────────────────────────────
  // TO REMOVE: delete useDemoMode and the if (isDemo) block.
  const { isDemo } = useDemoMode();

  const { data: context } = useQuery({
    queryKey: ["terrainAnalysisData"],
    queryFn: () => getTerrainAnalysisDataFn(),
  });

  if (isDemo) {
    return <DemoTerrainAnalysis />;
  }

  if (!context) {
    return (
      <>
        <TopBar title="Terrain Analysis" subtitle="Analyze lunar topography and identify safe and accessible regions" />
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

  const ter = context.terrainAnalysis;

  return (
    <>
      <TopBar title="Terrain Analysis" subtitle="Analyze lunar topography and identify safe and accessible regions" />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_2.5fr_1.2fr]">
          <Panel title="Terrain Layers">
            <div className="space-y-2 text-sm">
              {["Slope Map", "Elevation (DEM)", "Roughness Map", "Curvature Map", "Hillshade", "Crater Density"].map((l, i) => (
                <label key={l} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted">
                  <input type="checkbox" defaultChecked={i < 3 || i === 4} className="accent-primary" />
                  <span className="text-foreground">{l}</span>
                </label>
              ))}
            </div>
            <div className="mt-5 space-y-3">
              <div>
                <div className="text-xs font-semibold text-muted-foreground">Visualization</div>
                <div className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm">Slope Map</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground">Color Scale</div>
                <div className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm">Spectral</div>
              </div>
              <div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Opacity</span><span className="font-semibold">85%</span></div>
                <input type="range" defaultValue={85} className="mt-1 w-full accent-primary" />
              </div>
            </div>
          </Panel>



          <Panel title="Slope Map (Degrees)" padded={false}>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-b-2xl bg-[#0b0d10]">
              {ter?.slopeImage ? (
                <img src={ter.slopeImage} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full" style={{ background: "radial-gradient(circle at 50% 50%, oklch(0.75 0.22 50) 0%, oklch(0.6 0.2 30) 12%, oklch(0.55 0.22 264) 35%, oklch(0.35 0.15 250) 70%, oklch(0.22 0.08 260) 100%)" }} />
              )}
              <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 30% 30%, transparent 40%, black 100%)" }} />
              <div className="absolute left-1/2 top-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-white/60" />
              <div className="absolute left-4 top-4 rounded-lg bg-background/80 backdrop-blur px-3 py-2 text-xs font-mono">
                <div>Lat: -89.35°</div><div>Lon: 23.45°</div><div>Elev: -2850 m</div><div>Slope: 3.2°</div>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex h-40 flex-col items-center text-[10px] text-white">
                <span>&gt;30</span>
                <div className="my-1 h-full w-3 rounded-full bg-gradient-to-b from-orange-400 via-yellow-300 to-blue-600" />
                <span>0</span>
              </div>
              <div className="absolute bottom-4 left-4 rounded-md bg-background/80 px-2 py-1 text-[11px] font-semibold">10 km</div>
            </div>
          </Panel>

          <Panel title="Terrain Suitability Overview">
            <div className="flex items-center gap-4">
              <div className="relative grid h-28 w-28 place-items-center">
                <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
                  <circle cx="50" cy="50" r="40" stroke="oklch(0.92 0.01 250)" strokeWidth="10" fill="none" />
                  <circle cx="50" cy="50" r="40" stroke="oklch(0.68 0.17 155)" strokeWidth="10" fill="none" strokeDasharray="195.8 251" strokeLinecap="round" />
                </svg>
                <div className="absolute text-center">
                  <div className="text-2xl font-bold">{ter?.suitabilityScore || "—"}</div>
                  <div className="text-[10px] text-success font-semibold">Good</div>
                </div>
              </div>
              <ul className="flex-1 space-y-1.5 text-xs">
                <li className="flex justify-between"><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-success" />High Suitability</span><span className="font-semibold">{ter?.suitabilityBreakdown.high || "—"}</span></li>
                <li className="flex justify-between"><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-success/50" />Moderate</span><span className="font-semibold">{ter?.suitabilityBreakdown.moderate || "—"}</span></li>
                <li className="flex justify-between"><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-warning" />Low</span><span className="font-semibold">{ter?.suitabilityBreakdown.low || "—"}</span></li>
                <li className="flex justify-between"><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-destructive" />Unsuitable</span><span className="font-semibold">{ter?.suitabilityBreakdown.unsuitable || "—"}</span></li>
              </ul>
            </div>
            <div className="mt-4 border-t border-border pt-3 text-sm">
              <div className="text-xs font-bold uppercase text-muted-foreground mb-2">Analysis Parameters</div>
              {[["Max Slope Threshold", "15°"], ["Max Roughness", "0.35"], ["Min Elevation", "-4500 m"], ["Illumination", "Balanced"]].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border/60 py-1.5"><span className="text-muted-foreground">{k}</span><span className="font-semibold">{v}</span></div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Terrain Profile">
            {ter?.elevationProfile ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={ter.elevationProfile}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" />
                  <XAxis dataKey="d" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="e" stroke="oklch(0.55 0.22 264)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[180px] items-center justify-center">
                <span className="text-sm text-muted-foreground">Generating elevation profile...</span>
              </div>
            )}
          </Panel>

          <Panel title="Hazard Detection">
            <ul className="space-y-2 text-sm">
              {ter?.hazards.map((h) => (
                <li key={h.label} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning-foreground" />
                    <span>{h.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge tone={h.tone}>{h.level}</StatusBadge>
                    <span className="text-xs font-semibold">{h.count}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-success/10 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Hazard Score</span>
              <span className="font-bold text-success">{ter?.hazardScore || "—"}</span>
            </div>
          </Panel>

          <Panel title="Top Safe Regions">
            <table className="w-full text-sm">
              <thead className="text-[10px] font-bold uppercase text-muted-foreground">
                <tr><th className="text-left">ID</th><th>Area (km²)</th><th>Slope</th><th>Suit.</th></tr>
              </thead>
              <tbody>
                {ter?.safeRegions.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2 font-semibold text-foreground">{r.id}</td>
                    <td className="text-center text-foreground">{r.area}</td>
                    <td className="text-center text-foreground">{r.slope}°</td>
                    <td className="text-center"><StatusBadge tone="success">{r.suitability}%</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>

        <Panel title="Terrain Distribution">
          {ter?.distribution ? (
            <div className="grid items-center gap-4 sm:grid-cols-2">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={ter.distribution} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {ter.distribution.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ul className="space-y-2 text-sm">
                {ter.distribution.map((d) => (
                  <li key={d.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: d.color }} />{d.name}</span>
                    <span className="font-semibold text-foreground">{d.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center">
              <span className="text-sm text-muted-foreground">Analyzing terrain distribution...</span>
            </div>
          )}
        </Panel>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/radar-analysis" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted"><ArrowLeft className="h-4 w-4" /> Back to Radar Analysis</Link>
          <Link to="/landing-optimization" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Continue to Landing Optimization <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </>
  );
}
