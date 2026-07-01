import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app/topbar";
import { Panel, StatusBadge } from "@/components/app/panel";
import { ArrowLeft, ArrowRight, Droplets, FlaskConical, Atom } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getResourceEstimationDataFn } from "@/server/api/endpoints";
import { useDemoMode } from "@/store/demo-store";
import { DEMO_ASSETS, DEMO_ASSET_META } from "@/lib/demo-assets";

export const Route = createFileRoute("/_app/resource-estimation")({
  head: () => ({ meta: [{ title: "Resource Estimation — LMDSS" }] }),
  component: ResourceEst,
});

// ── Demo Mode Component ──────────────────────────────────────────────────────
// TO REMOVE DEMO MODE: delete this DemoResourceEst function.
function DemoResourceEst() {
  const comp = [{name:"Water Ice",value:68,color:"oklch(0.55 0.22 264)"},{name:"Regolith",value:22,color:"oklch(0.65 0.08 260)"},{name:"Silicates",value:10,color:"oklch(0.78 0.16 75)"}];
  return (
    <>
      <TopBar title="Resource Estimation" subtitle="Estimate ice volume and available resources at the target location" />
      <div className="space-y-6 p-4 sm:p-6">

        <Panel>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2"><div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target: Ice Deposit #1</div><div className="mt-1 text-sm font-mono text-foreground">Lat: 0.00°N, Lon: 80.00°E</div><div className="text-sm text-foreground">Distance from Lander: <span className="font-bold">680 m</span></div></div>
            {[["Area","2.84 km²","muted"],["Avg. Ice Probability","68%","success"],["Max Depth","~4.2 m","muted"],["Confidence","High (78%)","success"]].map(([k,v,t])=>(<div key={k as string}><div className="text-xs font-semibold text-muted-foreground">{k}</div><div className="text-lg font-bold text-foreground">{v}</div></div>))}
          </div>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Ice Probability Map (Top View)" padded={false}>
            <div className="relative aspect-square w-full overflow-hidden rounded-b-2xl">
              <img src={DEMO_ASSETS.ice} alt="Ice Probability" className="h-full w-full object-cover" />
              <div className="absolute top-2 left-2 rounded bg-background/75 backdrop-blur px-1.5 py-0.5 text-[9px] font-mono">{DEMO_ASSET_META.ice.resolution}</div>
            </div>
          </Panel>
          <Panel title="Mission Summary Map" padded={false}>
            <div className="relative h-full min-h-64 overflow-hidden rounded-b-2xl">
              <img src={DEMO_ASSETS.report} alt="Mission Summary" className="h-full w-full object-cover" />
            </div>
          </Panel>
          <Panel title="Ice Resource Estimate">
            <div className="flex items-center gap-3 rounded-xl bg-primary-soft p-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary"><Droplets className="h-5 w-5" /></div>
              <div><div className="text-xs text-muted-foreground">Estimated Ice Volume</div><div className="text-xl font-bold text-foreground">18.6 ± 4.2 MT</div><div className="text-[11px] text-muted-foreground">(18,600,000 ± 4,200,000 m³)</div></div>
            </div>
            <div className="mt-3"><div className="text-xs text-muted-foreground">Mass of Water (H₂O)</div><div className="text-lg font-bold text-foreground">18.6 Million Tons</div></div>
            <div className="mt-5"><div className="text-sm font-bold mb-2">Resource Utilization Potential</div>
              {[{icon:Droplets,label:"Drinking Water",v:95},{icon:Atom,label:"Life Support (O₂)",v:88},{icon:FlaskConical,label:"Fuel Production (H₂)",v:82}].map((r)=>(
                <div key={r.label} className="mt-1.5">
                  <div className="flex items-center justify-between text-xs"><span className="flex items-center gap-1.5"><r.icon className="h-3.5 w-3.5 text-primary"/>{r.label}</span><span className="font-semibold text-foreground">{r.v}%</span></div>
                  <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{width:`${r.v}%`}} /></div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <Panel title="Volume Calculation Summary">
            <dl className="space-y-2 text-sm">{[["Surface Area","2.84 km²"],["Mean Depth","2.8 m"],["Bulk Density","900 kg/m³"],["Ice Fraction","68%"],["Total Volume","5.37 M m³"]].map(([k,v])=>(<div key={k} className="flex justify-between border-b border-border/60 pb-1.5 last:border-0"><dt className="text-muted-foreground">{k}</dt><dd className="font-semibold text-foreground">{v}</dd></div>))}</dl>
          </Panel>
          <Panel title="Composition Estimate">
            <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={comp} dataKey="value" innerRadius={45} outerRadius={75} paddingAngle={2}>{comp.map((c)=><Cell key={c.name} fill={c.color}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>
            <ul className="space-y-1 text-xs">{comp.map((c)=>(<li key={c.name} className="flex justify-between"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded" style={{background:c.color}}/>{c.name}</span><span className="font-semibold text-foreground">{c.value}%</span></li>))}</ul>
          </Panel>
          <Panel title="Comparison with Other Targets" className="lg:col-span-2">
            <table className="w-full text-sm"><thead className="text-[10px] font-bold uppercase text-muted-foreground"><tr><th className="text-left">Target ID</th><th>Volume (M m³)</th><th>Quality</th><th>Dist (km)</th></tr></thead>
              <tbody>{[{id:"Ice Dep. #1",volume:18.6,quality:92,dist:"0.68"},{id:"Ice Dep. #2",volume:11.2,quality:78,dist:"1.45"},{id:"Ice Dep. #3",volume:7.8,quality:65,dist:"2.10"}].map((t,i)=>(<tr key={t.id} className={`border-b border-border/60 last:border-0 ${i===0?"bg-success/10":""}`}><td className="py-2 font-semibold text-foreground">{t.id}</td><td className="text-center text-foreground">{t.volume}</td><td className="text-center"><StatusBadge tone={t.quality>=80?"success":t.quality>=60?"warning":"destructive"}>{t.quality}%</StatusBadge></td><td className="text-center text-foreground">{t.dist}</td></tr>))}</tbody>
            </table>
          </Panel>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/rover-navigation" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted"><ArrowLeft className="h-4 w-4" /> Back to Rover Navigation</Link>
          <Link to="/mission-simulation" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Continue to Mission Simulation <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </>
  );
}

function ResourceEst() {
  // ── Demo Mode branch ──────────────────────────────────────────
  // TO REMOVE: delete useDemoMode and the if (isDemo) block.
  const { isDemo } = useDemoMode();

  const { data: context } = useQuery({
    queryKey: ["resourceEstimationData"],
    queryFn: () => getResourceEstimationDataFn(),
  });

  if (isDemo) {
    return <DemoResourceEst />;
  }

  if (!context) {
    return (
      <>
        <TopBar title="Resource Estimation" subtitle="Estimate ice volume and available resources at the target location" />
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

  const res = context.resourceEstimation;

  return (
    <>
      <TopBar title="Resource Estimation" subtitle="Estimate ice volume and available resources at the target location" />
      <div className="space-y-6 p-4 sm:p-6">
        <Panel>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target: {res?.target.id || "—"}</div>
              <div className="mt-1 text-sm font-mono text-foreground">{res?.target.coord || "—"}</div>
              <div className="text-sm text-foreground">Distance from Lander: <span className="font-bold">{res?.target.dist || "—"}</span></div>
            </div>
            {[
              ["Area", res?.stats.area || "—", "muted"],
              ["Avg. Ice Probability", res?.stats.probability || "—", "success", "High"],
              ["Max Depth", res?.stats.depth || "—", "muted"],
              ["Confidence", res?.stats.confidence || "—", "success", "High"],
            ].map(([k, v, tone, hint]) => (
              <div key={k as string}>
                <div className="text-xs font-semibold text-muted-foreground">{k}</div>
                <div className="text-lg font-bold text-foreground">{v}</div>
                {hint && <div className={`text-xs font-semibold text-${tone === "success" ? "success" : "muted-foreground"}`}>{hint as string}</div>}
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr_1fr]">
          <Panel title="Ice Probability Map (Top View)" padded={false}>
            <div className="relative aspect-square w-full overflow-hidden rounded-b-2xl bg-[#0b0d10]">
              {res?.iceImage ? (
                <img src={res.iceImage} className="h-full w-full object-cover" />
              ) : (
                <div className="absolute left-1/2 top-1/2 h-3/5 w-3/5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-white/60"
                  style={{ background: "radial-gradient(circle, oklch(0.7 0.22 30) 0%, oklch(0.65 0.2 60) 25%, oklch(0.6 0.2 130) 50%, oklch(0.4 0.18 250 / 0.4) 80%, transparent 100%)" }} />
              )}
              <div className="absolute left-4 bottom-4 rounded-lg bg-background/85 backdrop-blur p-2 text-[10px] z-10">
                <div className="font-bold mb-1">Ice Probability</div>
                <div className="flex items-center gap-1">
                  <div className="h-12 w-3 rounded bg-gradient-to-b from-red-500 via-yellow-400 to-blue-700" />
                  <div className="flex flex-col justify-between h-12"><span>1.0</span><span>0.5</span><span>0.0</span></div>
                </div>
                <div className="mt-1">100 m</div>
              </div>
            </div>
          </Panel>

          <Panel title="Radar Depth Profile" padded={false}>
            <div className="relative h-full min-h-64 bg-[linear-gradient(to_bottom,oklch(0.95_0.01_250)_0%,oklch(0.95_0.01_250)_8%,oklch(0.78_0.18_220)_15%,oklch(0.65_0.22_240)_50%,oklch(0.35_0.15_260)_100%)] rounded-b-2xl overflow-hidden">
              <div className="absolute top-2 left-3 text-xs font-bold text-foreground">Cross-Section A–A′</div>
              <div className="absolute top-1/3 left-0 right-0 h-px border-t border-dashed border-white/60" />
              <div className="absolute top-1/3 right-3 -mt-3 text-[10px] font-bold text-white">Ice Layer</div>
            </div>
          </Panel>

          <Panel title="Ice Resource Estimate">
            <div className="flex items-center gap-3 rounded-xl bg-primary-soft p-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary"><Droplets className="h-5 w-5" /></div>
              <div>
                <div className="text-xs text-muted-foreground">Estimated Ice Volume</div>
                <div className="text-xl font-bold text-foreground">{res?.volumeEstimate || "—"}</div>
                <div className="text-[11px] text-muted-foreground">({res?.litersEstimate || "—"})</div>
              </div>
            </div>
            <div className="mt-3"><div className="text-xs text-muted-foreground">Mass of Water (H₂O)</div><div className="text-lg font-bold text-foreground">{res?.waterMass || "—"}</div></div>

            <div className="mt-5">
              <div className="text-sm font-bold mb-2">Ice Quality Indicators</div>
              <dl className="space-y-1.5 text-sm">
                {res?.qualityIndicators && Object.entries(res.qualityIndicators).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-semibold text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-4">
              <div className="text-sm font-bold mb-2">Resource Utilization Potential</div>
              {[
                { icon: Droplets, label: "Drinking Water", v: 95 },
                { icon: Atom, label: "Life Support (O₂)", v: 88 },
                { icon: FlaskConical, label: "Fuel Production (H₂)", v: 82 },
              ].map((r) => (
                <div key={r.label} className="mt-1.5">
                  <div className="flex items-center justify-between text-xs"><span className="flex items-center gap-1.5"><r.icon className="h-3.5 w-3.5 text-primary" />{r.label}</span><span className="font-semibold text-foreground">{r.v}%</span></div>
                  <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${r.v}%` }} /></div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <Panel title="Volume Calculation Summary">
            <dl className="space-y-2 text-sm">
              {res?.volumeSummary && Object.entries(res.volumeSummary).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border/60 pb-1.5 last:border-0"><dt className="text-muted-foreground">{k}</dt><dd className="font-semibold text-foreground">{v}</dd></div>
              ))}
            </dl>
          </Panel>
          <Panel title="Composition Estimate">
            {res?.composition ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={res.composition} dataKey="value" innerRadius={45} outerRadius={75} paddingAngle={2}>
                      {res.composition.map((c) => <Cell key={c.name} fill={c.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="space-y-1 text-xs">
                  {res.composition.map((c) => (
                    <li key={c.name} className="flex justify-between"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded" style={{ background: c.color }} />{c.name}</span><span className="font-semibold text-foreground">{c.value}%</span></li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="flex h-[180px] items-center justify-center">
                <span className="text-sm text-muted-foreground">Calculating composition...</span>
              </div>
            )}
          </Panel>
          <Panel title="Comparison with Other Targets" className="lg:col-span-2">
            <table className="w-full text-sm">
              <thead className="text-[10px] font-bold uppercase text-muted-foreground">
                <tr><th className="text-left">Target ID</th><th>Volume (M m³)</th><th>Quality</th><th>Dist (km)</th></tr>
              </thead>
              <tbody>
                {res?.targetsComparison.map((t, i) => (
                  <tr key={t.id} className={`border-b border-border/60 last:border-0 ${i === 0 ? "bg-success/10" : ""}`}>
                    <td className="py-2 font-semibold text-foreground">{t.id}</td>
                    <td className="text-center text-foreground">{t.volume}</td>
                    <td className="text-center"><StatusBadge tone={t.quality >= 80 ? "success" : t.quality >= 60 ? "warning" : "destructive"}>{t.quality}%</StatusBadge></td>
                    <td className="text-center text-foreground">{t.dist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>

        <Panel>
          <div className="flex items-start gap-3 rounded-xl bg-primary-soft/40 p-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">💡</div>
            <div>
              <div className="text-sm font-bold text-foreground">Analysis Insight</div>
              <div className="text-xs text-muted-foreground">Ice Deposit #1 shows high ice probability with good thickness and accessibility. Recommended for sample collection and further exploration.</div>
            </div>
          </div>
        </Panel>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/rover-navigation" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted"><ArrowLeft className="h-4 w-4" /> Back to Rover Navigation</Link>
          <Link to="/mission-simulation" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Continue to Mission Simulation <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </>
  );
}
