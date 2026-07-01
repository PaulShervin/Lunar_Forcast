import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app/topbar";
import { Panel } from "@/components/app/panel";
import { MetricCard } from "@/components/app/metric-card";
import { Gauge, BatteryCharging, Mountain, Wifi, Activity, FlaskConical } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getAnalyticsDataFn } from "@/server/api/endpoints";
import { useDemoMode } from "@/store/demo-store";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — LMDSS" }] }),
  component: Analytics,
});

const hazards = [
  { name: "Craters", count: 37 },
  { name: "Boulders", count: 128 },
  { name: "Slopes", count: 12 },
  { name: "Rough", count: 85 },
];

function Analytics() {
  const { isDemo } = useDemoMode();

  const { data: context } = useQuery({
    queryKey: ["analyticsData"],
    queryFn: () => getAnalyticsDataFn(),
  });

  if (!context) {
    return (
      <>
        <TopBar title="Analytics" subtitle="Executive overview of mission performance and conditions" />
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

  const an = context.analytics;

  return (
    <>
      <TopBar title="Analytics" subtitle="Executive overview of mission performance and conditions" />
      <div className="space-y-6 p-4 sm:p-6">

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={Gauge} label="Mission Success" value={an?.successProbability || "—"} hint="Predicted probability" hintTone="success" iconClass="bg-success/15 text-success" />
          <MetricCard icon={BatteryCharging} label="Energy Reserve" value={an?.energyReserve || "—"} hint="Nominal capacity" iconClass="bg-primary-soft text-primary" />
          <MetricCard icon={Mountain} label="Traversed Distance" value={an?.traversedDistance || "—"} hint="of 4.65 km planned" iconClass="bg-accent text-accent-foreground" />
          <MetricCard icon={Wifi} label="Comm Uptime" value={an?.commUptime || "—"} hint="Last 24h" hintTone="success" iconClass="bg-info/15 text-info" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Elevation Profile">
            {context.terrainAnalysis?.elevationProfile ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={context.terrainAnalysis.elevationProfile}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" />
                  <XAxis dataKey="d" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="e" stroke="oklch(0.55 0.22 264)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[220px] items-center justify-center">
                <span className="text-sm text-muted-foreground">Running topographic analysis...</span>
              </div>
            )}
          </Panel>

          <Panel title="Battery Trend">
            {context.missionSimulation?.energyCurve ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={context.missionSimulation.energyCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" />
                  <XAxis dataKey="t" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="battery" stroke="oklch(0.68 0.17 155)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[220px] items-center justify-center">
                <span className="text-sm text-muted-foreground">Loading power logs...</span>
              </div>
            )}
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Terrain Distribution">
            {context.terrainAnalysis?.distribution ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={context.terrainAnalysis.distribution} dataKey="value" innerRadius={45} outerRadius={80} paddingAngle={2}>
                    {context.terrainAnalysis.distribution.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[220px] items-center justify-center">
                <span className="text-sm text-muted-foreground">Loading terrain partitions...</span>
              </div>
            )}
          </Panel>

          <Panel title="Hazard Analysis">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hazards}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="oklch(0.78 0.16 60)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Mission Summary">
            <dl className="space-y-2 text-sm">
              {[
                ["Mission ID", context.id],
                ["Region", context.region],
                ["Area Analyzed", "102.45 km²"],
                ["Ice Volume", context.resourceEstimation?.volumeEstimate || "—"],
                ["Confidence", context.resourceEstimation?.stats.confidence || "—"]
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border/60 pb-1.5 last:border-0"><dt className="text-muted-foreground">{k}</dt><dd className="font-semibold text-foreground">{v}</dd></div>
              ))}
            </dl>
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Communication Status">
            <div className="space-y-3 text-sm">
              {an?.commStatus.map((c) => (
                <div key={c.name} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
                  <span className="flex items-center gap-2"><Wifi className="h-4 w-4 text-primary" /> {c.name}</span>
                  <span className={`font-semibold ${c.tone === "success" ? "text-success" : "text-foreground"}`}>{c.status}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="System Health">
            <div className="grid grid-cols-2 gap-3 text-xs">
              {an?.systemHealth.map((s) => (
                <div key={s.name} className="flex items-center justify-between rounded-lg border border-border bg-background p-2.5">
                  <span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-success" /> {s.name}</span>
                  <span className="font-semibold text-success">{s.status}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
