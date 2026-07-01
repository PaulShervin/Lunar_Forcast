import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app/topbar";
import { Panel, StatusBadge } from "@/components/app/panel";
import { MetricCard } from "@/components/app/metric-card";
import { Activity, Snowflake, Gauge, BarChart3, Check, Info, ArrowLeft, ArrowRight, FlaskConical } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getRadarAnalysisDataFn } from "@/server/api/endpoints";
import { useDemoMode } from "@/store/demo-store";
import { DEMO_ASSETS } from "@/lib/demo-assets";

export const Route = createFileRoute("/_app/radar-analysis")({
  head: () => ({ meta: [{ title: "Radar Intelligence Engine — LMDSS" }] }),
  component: RadarAnalysis,
});

// ── Demo Mode Component ──────────────────────────────────────────────────────
function DemoRadarAnalysis() {
  const panels = [
    { n: 1, title: "Circular Polarization Ratio (CPR)", asset: "dfsar" as const, desc: "Circular polarization ratio mapping highlights possible sub-surface scattering profiles.", stat: "Mean CPR: 0.28" },
    { n: 2, title: "Degree of Polarization (DOP)", asset: "dem" as const, desc: "DOP measures coherent polarizations, helping index surface roughness.", stat: "Mean DOP: 0.55" },
    { n: 3, title: "Ice Probability Map", asset: "ice" as const, desc: "Blended confidence overlay highlighting polar region water ice deposits.", stat: "High Confidence Area: 1.23 km²" },
  ];
  return (
    <>
      <TopBar title="Radar Intelligence Engine" subtitle="Process DFSAR data to generate CPR, DOP and Ice Probability Maps" />
      <div className="space-y-6 p-4 sm:p-6">

        <Panel title="Radar Data Processing" subtitle="DFSAR instrument data — Circular Polarization Ratio and Ice Probability analysis"
          action={
            <div className="hidden gap-3 md:flex">
              {[["Dataset", "DFSAR Level 1B"], ["Frequency", "60 / 150 MHz"], ["Polarization", "HH"], ["Resolution", "~10 m/pixel"]].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-border bg-background px-3 py-1.5">
                  <div className="text-[10px] font-bold uppercase text-muted-foreground">{k}</div>
                  <div className="text-xs font-semibold text-foreground">{v}</div>
                </div>
              ))}
            </div>
          }
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {panels.map((c) => (
              <div key={c.n} className="rounded-xl border border-border bg-background overflow-hidden">
                <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-primary-soft text-primary text-xs font-bold">{c.n}</div>
                  <div className="text-sm font-bold text-foreground">{c.title}</div>
                  <Info className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="relative h-56 w-full overflow-hidden bg-[#0b0d10]">
                  <img src={DEMO_ASSETS[c.asset === "dfsar" ? "dfsar" : c.asset === "dem" ? "dem" : "ice"]} alt={c.title} className="h-full w-full object-cover" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex h-32 flex-col items-center text-[10px] text-white/85 bg-[#0b0d10]/75 backdrop-blur rounded px-1.5 py-1 z-10 border border-white/10 shadow-soft">
                    <span>{c.n === 1 ? "1.5" : c.n === 2 ? "1.0" : "1.0"}</span>
                    <div className={`my-1 h-full w-2 rounded-full ${
                      c.n === 1 
                        ? "bg-gradient-to-b from-white to-black" 
                        : c.n === 2 
                          ? "bg-gradient-to-b from-red-500 via-yellow-400 to-blue-600" 
                          : "bg-gradient-to-b from-blue-400 to-transparent"
                    }`} />
                    <span>0.0</span>
                  </div>
                </div>
                <div className="px-3 py-3">
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-success/10 px-2 py-1.5">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success"><Check className="h-3 w-3" /> Processed</span>
                    <span className="text-xs font-semibold text-foreground">{c.stat}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Panel title="Radar Signal Profile">
            <div className="flex h-[260px] items-center justify-center">
              <span className="text-sm text-muted-foreground">Demo: Live radar signal chart available in production mode.</span>
            </div>
          </Panel>
          <div className="space-y-4">
            <MetricCard icon={Activity} label="Total Area Analyzed" value="102.45 km²" iconClass="bg-primary-soft text-primary" />
            <MetricCard icon={Snowflake} label="High Confidence Ice Area" value="12.6 km²" hint="(12.3%)" hintTone="success" iconClass="bg-success/15 text-success" />
            <MetricCard icon={Gauge} label="Average Ice Probability" value="0.38" iconClass="bg-warning/20 text-warning-foreground" />
            <MetricCard icon={BarChart3} label="Radar Data Quality" value="98.2%" hintTone="success" iconClass="bg-accent text-accent-foreground" />
          </div>
        </div>

        <Panel title="Algorithm Info">
          <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {["CPR Computation", "DOP Analysis", "Ice Detection Model", "Speckle Filtering", "Geocoding", "Output Generation"].map((alg) => (
              <div key={alg} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
                <span className="text-muted-foreground">{alg}</span>
                <StatusBadge tone="success">Completed</StatusBadge>
              </div>
            ))}
          </div>
        </Panel>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/preprocessing" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted"><ArrowLeft className="h-4 w-4" /> Back to Preprocessing</Link>
          <Link to="/terrain-analysis" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Continue to Terrain Analysis <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </>
  );
}

function RadarAnalysis() {
  const { isDemo } = useDemoMode();

  const { data: context } = useQuery({
    queryKey: ["radarAnalysisData"],
    queryFn: () => getRadarAnalysisDataFn(),
  });

  if (isDemo) {
    return <DemoRadarAnalysis />;
  }

  if (!context) {
    return (
      <>
        <TopBar title="Radar Intelligence Engine" subtitle="Process DFSAR data to generate CPR, DOP and Ice Probability Maps" />
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

  const isPreprocessed = context.preprocessing?.summary.completedCount === "6 / 6";
  if (!isPreprocessed) {
    return (
      <>
        <TopBar title="Radar Intelligence Engine" subtitle="Process DFSAR data to generate CPR, DOP and Ice Probability Maps" />
        <div className="p-6 text-center">
          <Panel title="Preprocessing Required">
            <p className="text-sm text-muted-foreground">Preprocessing has not been completed. Please complete all preprocessing stages before starting radar analysis.</p>
            <Link to="/preprocessing" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Go to Preprocessing
            </Link>
          </Panel>
        </div>
      </>
    );
  }

  const rad = context.radarAnalysis;

  return (
    <>
      <TopBar title="Radar Intelligence Engine" subtitle="Process DFSAR data to generate CPR, DOP and Ice Probability Maps" />
      <div className="space-y-6 p-4 sm:p-6">
        <Panel title="Radar Data Processing" subtitle="Dual-frequency radar analysis to detect subsurface ice signatures"
          action={
            <div className="hidden gap-3 md:flex">
              {[["Dataset", "DFSAR Level 1B"], ["Frequency", "60 / 150 MHz"], ["Polarization", "HH"], ["Resolution", "~10 m/pixel"]].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-border bg-background px-3 py-1.5">
                  <div className="text-[10px] font-bold uppercase text-muted-foreground">{k}</div>
                  <div className="text-xs font-semibold text-foreground">{v}</div>
                </div>
              ))}
            </div>
          }
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              { n: 1, title: "Circular Polarization Ratio (CPR)", hue: "oklch(0.75 0.2 30)", desc: "High CPR values indicate potential depolarization caused by volume scattering from ice.", mean: `Mean CPR: ${rad?.meanCpr || "—"}` },
              { n: 2, title: "Degree of Polarization (DOP)", hue: "oklch(0.6 0.22 300)", desc: "Low DOP values indicate multiple scattering from rough surfaces or ice-bearing regolith.", mean: `Mean DOP: ${rad?.meanDop || "—"}` },
              { n: 3, title: "Ice Probability Map", hue: "oklch(0.7 0.2 150)", desc: "Combined CPR and DOP analysis to estimate subsurface ice probability.", mean: `High Confidence Area: ${rad?.highConfidenceIceArea || "—"}` },
            ].map((c) => (
              <div key={c.n} className="rounded-xl border border-border bg-background overflow-hidden">
                <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-primary-soft text-primary text-xs font-bold">{c.n}</div>
                  <div className="text-sm font-bold text-foreground">{c.title}</div>
                  <Info className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="relative h-56 w-full overflow-hidden bg-[#0b0d10]">
                  {c.n === 1 && rad?.cprImage ? (
                    <img src={rad.cprImage} className="h-full w-full object-cover" alt="CPR Raster Map" />
                  ) : c.n === 2 && rad?.dopImage ? (
                    <img src={rad.dopImage} className="h-full w-full object-cover" alt="DOP Raster Map" />
                  ) : c.n === 3 && rad?.iceImage ? (
                    <img src={rad.iceImage} className="h-full w-full object-cover" alt="Ice Probability Map" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground font-mono bg-card/10">
                      Generating raster layer...
                    </div>
                  )}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex h-32 flex-col items-center text-[10px] text-white/85 bg-[#0b0d10]/75 backdrop-blur rounded px-1.5 py-1 z-10 border border-white/10 shadow-soft">
                    <span>{c.n === 1 ? "1.5" : c.n === 2 ? "1.0" : "1.0"}</span>
                    <div className={`my-1 h-full w-2 rounded-full ${
                      c.n === 1 
                        ? "bg-gradient-to-b from-white to-black" 
                        : c.n === 2 
                          ? "bg-gradient-to-b from-red-500 via-yellow-400 to-blue-600" 
                          : "bg-gradient-to-b from-blue-400 to-transparent"
                    }`} />
                    <span>0.0</span>
                  </div>
                </div>
                <div className="px-3 py-3">
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-success/10 px-2 py-1.5">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success"><Check className="h-3 w-3" /> Processed</span>
                    <span className="text-xs font-semibold text-foreground">{c.mean}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Panel title="Radar Signal Profile">
            {rad?.radarSignal ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={rad.radarSignal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" />
                  <XAxis dataKey="t" tick={{ fontSize: 11 }} label={{ value: "Two-way Travel Time (ns)", position: "insideBottom", offset: -5, fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: "Backscatter (dB)", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="low" stroke="oklch(0.55 0.22 264)" strokeWidth={2} dot={false} name="60 MHz (Low)" />
                  <Line type="monotone" dataKey="high" stroke="oklch(0.72 0.16 60)" strokeWidth={2} dot={false} name="150 MHz (High)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[260px] items-center justify-center">
                <span className="text-sm text-muted-foreground">Running radar signal analysis...</span>
              </div>
            )}
          </Panel>
          <div className="space-y-4">
            <MetricCard icon={Activity} label="Total Area Analyzed" value={rad?.totalAreaAnalysed || "102.45 km²"} iconClass="bg-primary-soft text-primary" />
            <MetricCard 
              icon={Snowflake} 
              label="High Confidence Ice Area" 
              value={rad?.highConfidenceIceArea || "—"} 
              hint={`(${rad && rad.totalAreaAnalysed && rad.highConfidenceIceArea ? ((parseFloat(rad.highConfidenceIceArea) / parseFloat(rad.totalAreaAnalysed)) * 100).toFixed(1) : "12.3"}%)`} 
              hintTone="success" 
              iconClass="bg-success/15 text-success" 
            />
            <MetricCard icon={Gauge} label="Average Ice Probability" value={rad?.avgIceProbability || "0.38"} iconClass="bg-warning/20 text-warning-foreground" />
            <MetricCard icon={BarChart3} label="Radar Data Quality" value={rad?.dataQuality || "—"} hintTone="success" iconClass="bg-accent text-accent-foreground" />
          </div>
        </div>

        <Panel title="Algorithm Info">
          <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {rad?.algorithms.map((alg) => (
              <div key={alg.name} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
                <span className="text-muted-foreground">{alg.name}</span>
                <StatusBadge tone="success">{alg.status}</StatusBadge>
              </div>
            ))}
          </div>
        </Panel>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/preprocessing" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted"><ArrowLeft className="h-4 w-4" /> Back to Preprocessing</Link>
          <Link to="/terrain-analysis" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Continue to Terrain Analysis <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </>
  );
}
