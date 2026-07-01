import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app/topbar";
import { Panel, StatusBadge } from "@/components/app/panel";
import { ArrowLeft, ArrowRight, Check, MapPin, FlaskConical } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getLandingOptimizationDataFn } from "@/server/api/endpoints";
import { useDemoMode } from "@/store/demo-store";
import { DEMO_ASSETS, DEMO_ASSET_META } from "@/lib/demo-assets";

export const Route = createFileRoute("/_app/landing-optimization")({
  head: () => ({ meta: [{ title: "Landing Optimization — LMDSS" }] }),
  component: LandingOpt,
});

// ── Demo Mode Component ──────────────────────────────────────────────────────
// TO REMOVE DEMO MODE: delete this DemoLandingOpt function.
function DemoLandingOpt() {
  const demoRadar = [{axis:"Slope",v:0.92},{axis:"Illumination",v:0.85},{axis:"Hazard",v:0.88},{axis:"Ice Proximity",v:0.78},{axis:"Accessibility",v:0.90}];
  const demoSites = [
    {id:"Site A",score:0.82,area:"3.8 km²",slope:3.2,illum:"82%",hazard:"Low",dist:"0.8"},
    {id:"Site B",score:0.74,area:"2.6 km²",slope:4.8,illum:"76%",hazard:"Low",dist:"1.2"},
    {id:"Site C",score:0.63,area:"1.9 km²",slope:7.1,illum:"61%",hazard:"Medium",dist:"2.1"},
  ];
  return (
    <>
      <TopBar title="Landing Optimization" subtitle="Identify and rank optimal landing sites based on multi-parameter analysis" />
      <div className="space-y-6 p-4 sm:p-6">

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Panel title="Landing Site Selection Map" padded={false}>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-b-2xl">
              <img src={DEMO_ASSETS.landing} alt="Landing Site Analysis" className="h-full w-full object-cover" />
              <div className="absolute top-2 left-2 rounded bg-background/75 backdrop-blur px-2 py-1 text-[9px] font-mono">{DEMO_ASSET_META.landing.source}</div>
            </div>
          </Panel>
          <Panel title="Top Landing Site">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success"><Check className="h-6 w-6" /></div>
              <div><div className="text-2xl font-black text-foreground">Site A</div><StatusBadge tone="success">Best Site</StatusBadge></div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs text-muted-foreground">Suitability Score</div><div className="text-lg font-bold">0.82</div></div>
              <div><div className="text-xs text-muted-foreground">Area</div><div className="text-lg font-bold">3.8 km²</div></div>
            </div>
            <div className="mt-5"><div className="text-sm font-bold mb-2">Key Advantages</div>
              <ul className="space-y-1.5 text-sm">{["Lowest slope gradient (3.2°)","Best illumination (82%)","Proximity to ice deposits","No major hazards detected"].map((a)=>(<li key={a} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-success"/>{a}</li>))}</ul>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={demoRadar}><PolarGrid stroke="oklch(0.92 0.01 250)"/><PolarAngleAxis dataKey="axis" tick={{fontSize:10}}/><PolarRadiusAxis tick={false} axisLine={false}/><Radar dataKey="v" stroke="oklch(0.55 0.22 264)" fill="oklch(0.55 0.22 264)" fillOpacity={0.25}/></RadarChart>
            </ResponsiveContainer>
          </Panel>
        </div>

        <Panel title="Candidate Landing Sites">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground"><tr className="border-b border-border"><th className="px-3 py-2">Rank</th><th className="px-3 py-2">Site ID</th><th className="px-3 py-2">Suitability</th><th className="px-3 py-2">Area (km²)</th><th className="px-3 py-2">Avg. Slope (°)</th><th className="px-3 py-2">Illumination (%)</th><th className="px-3 py-2">Hazard</th><th className="px-3 py-2">Dist. to Crater (km)</th></tr></thead>
              <tbody>{demoSites.map((s,i)=>(<tr key={s.id} className="border-b border-border/60 hover:bg-muted/40"><td className="px-3 py-2.5 text-foreground">{i+1}</td><td className="px-3 py-2.5 font-bold text-foreground">{s.id}</td><td className="px-3 py-2.5"><StatusBadge tone={s.score>=0.8?"success":s.score>=0.5?"warning":"destructive"}>{s.score.toFixed(2)}</StatusBadge></td><td className="px-3 py-2.5 text-foreground">{s.area}</td><td className="px-3 py-2.5 text-foreground">{s.slope}</td><td className="px-3 py-2.5 text-foreground">{s.illum}</td><td className="px-3 py-2.5"><StatusBadge tone={s.hazard==="Low"?"success":s.hazard==="Medium"?"warning":"destructive"}>{s.hazard}</StatusBadge></td><td className="px-3 py-2.5 text-foreground">{s.dist}</td></tr>))}</tbody>
            </table>
          </div>
        </Panel>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/terrain-analysis" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted"><ArrowLeft className="h-4 w-4" /> Back to Terrain Analysis</Link>
          <Link to="/rover-navigation" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Continue to Rover Navigation <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </>
  );
}

const suitabilityLegend = [
  ["bg-success", "0.80–1.00 (High)"],
  ["bg-success/60", "0.60–0.80 (Good)"],
  ["bg-warning", "0.40–0.60 (Moderate)"],
  ["bg-warning/70", "0.20–0.40 (Low)"],
  ["bg-destructive", "0.00–0.20 (Unsuitable)"],
];

const siteColor = (s: number) => s >= 0.8 ? "oklch(0.68 0.17 155)" : s >= 0.6 ? "oklch(0.78 0.18 100)" : s >= 0.4 ? "oklch(0.78 0.16 75)" : s >= 0.2 ? "oklch(0.72 0.18 50)" : "oklch(0.62 0.22 25)";

function LandingOpt() {
  // ── Demo Mode branch ───────────────────────────────────────────
  // TO REMOVE: delete useDemoMode and the if (isDemo) block.
  const { isDemo } = useDemoMode();

  const { data: context } = useQuery({
    queryKey: ["landingOptimizationData"],
    queryFn: () => getLandingOptimizationDataFn(),
  });

  if (isDemo) {
    return <DemoLandingOpt />;
  }

  if (!context) {
    return (
      <>
        <TopBar title="Landing Optimization" subtitle="Identify and rank optimal landing sites based on multi-parameter analysis" />
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

  const opt = context.landingOptimization;

  return (
    <>
      <TopBar title="Landing Optimization" subtitle="Identify and rank optimal landing sites based on multi-parameter analysis" />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Panel title="Landing Site Selection" subtitle="Optimal sites are selected based on slope, roughness, illumination, hazards and accessibility." padded={false}>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-b-2xl bg-[#0b0d10]">
              {opt?.landingImage ? (
                <img src={opt.landingImage} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-[radial-gradient(circle_at_30%_40%,oklch(0.6_0.04_260),oklch(0.18_0.03_260))]">
                  <div className="absolute inset-0 opacity-50 mix-blend-overlay" style={{ background: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"30\" cy=\"30\" r=\"5\" fill=\"black\" opacity=\".4\"/><circle cx=\"60\" cy=\"55\" r=\"8\" fill=\"black\" opacity=\".3\"/><circle cx=\"75\" cy=\"30\" r=\"4\" fill=\"black\" opacity=\".4\"/></svg>')" }} />
                </div>
              )}
              <div className="absolute left-4 top-4 rounded-lg bg-background/85 backdrop-blur p-3 text-[11px] z-10">
                <div className="font-bold mb-1">Suitability Score</div>
                {suitabilityLegend.map(([c, l]) => (
                  <div key={l} className="flex items-center gap-2"><span className={`h-3 w-3 rounded ${c}`} />{l}</div>
                ))}
              </div>

              
              {opt?.candidateSites.map((m, idx) => {
                // Approximate coordinate mapping for visual representation
                const positions = [
                  { x: "35%", y: "30%" },
                  { x: "62%", y: "40%" },
                  { x: "50%", y: "48%" },
                  { x: "28%", y: "60%" },
                  { x: "58%", y: "70%" }
                ];
                const pos = positions[idx] || { x: "50%", y: "50%" };
                return (
                  <div key={m.id} className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-full" style={{ left: pos.x, top: pos.y }}>
                    <div className="rounded-md bg-foreground/80 px-2 py-0.5 text-[10px] font-bold text-background whitespace-nowrap">
                      {m.id} <span className="opacity-80">Score: {m.score}</span>
                    </div>
                    <MapPin className="h-6 w-6 -mt-1" style={{ color: siteColor(m.score), fill: siteColor(m.score) }} />
                  </div>
                );
              })}

              <div className="absolute bottom-3 left-4 rounded bg-background/80 px-2 py-1 text-[11px] font-semibold">10 km</div>
              <div className="absolute bottom-3 right-4 rounded bg-background/80 px-2 py-1 text-[11px] font-mono">Lat: -88.72° Lon: -45.18°</div>
            </div>
          </Panel>

          <Panel title="Top Landing Site">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success"><Check className="h-6 w-6" /></div>
              <div>
                <div className="text-2xl font-black text-foreground">{opt?.topSiteId || "—"}</div>
                <StatusBadge tone="success">Best Site</StatusBadge>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs text-muted-foreground">Suitability Score</div><div className="text-lg font-bold">{opt?.topSiteScore || "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">Area</div><div className="text-lg font-bold">{opt?.topSiteArea || "—"}</div></div>
            </div>
            <div className="mt-5">
              <div className="text-sm font-bold mb-2">Key Advantages</div>
              <ul className="space-y-1.5 text-sm">
                {opt?.advantages.map((a) => (
                  <li key={a} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-success" />{a}</li>
                ))}
              </ul>
            </div>
            {opt?.radarChartData && (
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={opt.radarChartData}>
                  <PolarGrid stroke="oklch(0.92 0.01 250)" />
                  <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis tick={false} axisLine={false} />
                  <Radar dataKey="v" stroke="oklch(0.55 0.22 264)" fill="oklch(0.55 0.22 264)" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </Panel>
        </div>

        <Panel title="Candidate Landing Sites">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-3 py-2">Rank</th>
                  <th className="px-3 py-2">Site ID</th>
                  <th className="px-3 py-2">Suitability</th>
                  <th className="px-3 py-2">Area (km²)</th>
                  <th className="px-3 py-2">Avg. Slope (°)</th>
                  <th className="px-3 py-2">Illumination (%)</th>
                  <th className="px-3 py-2">Hazard</th>
                  <th className="px-3 py-2">Dist. to Crater (km)</th>
                </tr>
              </thead>
              <tbody>
                {opt?.candidateSites.map((s, i) => (
                  <tr key={s.id} className="border-b border-border/60 hover:bg-muted/40">
                    <td className="px-3 py-2.5 text-foreground">{i + 1}</td>
                    <td className="px-3 py-2.5 font-bold text-foreground">{s.id}</td>
                    <td className="px-3 py-2.5"><StatusBadge tone={s.score >= 0.8 ? "success" : s.score >= 0.5 ? "warning" : "destructive"}>{s.score.toFixed(2)}</StatusBadge></td>
                    <td className="px-3 py-2.5 text-foreground">{s.area}</td>
                    <td className="px-3 py-2.5 text-foreground">{s.slope}</td>
                    <td className="px-3 py-2.5 text-foreground">{s.illum}</td>
                    <td className="px-3 py-2.5"><StatusBadge tone={s.hazard === "Low" ? "success" : s.hazard === "Medium" ? "warning" : "destructive"}>{s.hazard}</StatusBadge></td>
                    <td className="px-3 py-2.5 text-foreground">{s.dist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/terrain-analysis" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted"><ArrowLeft className="h-4 w-4" /> Back to Terrain Analysis</Link>
          <Link to="/rover-navigation" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Continue to Rover Navigation <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </>
  );
}
