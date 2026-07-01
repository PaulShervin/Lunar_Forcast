import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app/topbar";
import { Panel, StatusBadge } from "@/components/app/panel";
import { Printer, Download, FileText, Check, AlertTriangle, FlaskConical, Satellite } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getMissionReportDataFn } from "@/server/api/endpoints";
import { useDemoMode } from "@/store/demo-store";
import { DEMO_ASSETS } from "@/lib/demo-assets";

export const Route = createFileRoute("/_app/mission-report")({
  head: () => ({ meta: [{ title: "Mission Report — LMDSS" }] }),
  component: Report,
});

// ── Demo Mode Component ──────────────────────────────────────────────────────
// TO REMOVE DEMO MODE: delete this DemoReport function.
function DemoReport() {
  const sections = [
    { title: "1. Mission Overview", content: "Mission Chandrayaan-2 Polar Exploration targets the lunar south pole near Shackleton Crater. The primary objective is to confirm the presence of water ice in permanently shadowed regions (PSRs) and assess its extraction viability for future ISRO missions." },
    { title: "2. Data Sources & Processing", content: "OHRC optical imagery (0.25 m/px), DFSAR radar backscatter (10 m/px), TMC-2 DEM (5 m/px), and solar illumination modeling were processed through a full pipeline including radiometric correction, co-registration, and speckle filtering." },
    { title: "3. Terrain Analysis", content: "Slope analysis confirms 38% of the target area is flat (≤5°). Hazard analysis identified 47 craters, 85 steep slope zones, and 128 boulder fields. 78% of the area is classified as suitable terrain for rover operations." },
    { title: "4. Landing Site Recommendation", content: "Site A (Score: 0.82) is optimal based on the lowest slope (3.2°), highest illumination (82%), proximity to ice deposits (680 m), and absence of major hazards. Site A offers 3.8 km² of safe terrain." },
    { title: "5. Water Ice Resources", content: "CPR and DOP analysis of DFSAR data identified three high-probability ice deposits. Primary target at Lat 0.00°N, Lon 80.00°E has an estimated volume of 18.6 ± 4.2 million tons of water ice at ~2.8 m depth (Confidence: High — 78%)." },
    { title: "6. Rover Navigation Plan", content: "A* algorithm computed optimal traverse from Site A to Ice Deposit #1 (1.92 km, 1.35 hrs). Path avoids Crater C-12 rim and Boulder Field B-04. Energy cost: 38%. Six waypoints defined with real-time hazard avoidance." },
    { title: "7. Conclusion", content: "This analysis confirms the scientific and operational viability of a lunar south pole water ice extraction mission. The identified landing site, ice deposits, and rover path form a comprehensive, data-driven mission plan ready for operational deployment." },
  ];
  return (
    <>
      <TopBar title="Mission Report" subtitle="Generate a professional, exportable mission summary" />
      <div className="space-y-6 p-4 sm:p-6">

        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          {/* Left column: summary card */}
          <div className="space-y-4">
            <Panel title="Mission Summary">
              <div className="flex items-center gap-3 rounded-xl bg-primary-soft p-3 mb-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15">
                  <Satellite className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-foreground">Chandrayaan-2</div>
                  <div className="text-xs text-muted-foreground">Polar Exploration</div>
                </div>
              </div>
              <dl className="space-y-2 text-sm">
                {[["Landing Site","Site A"],["Suitability Score","0.82"],["Avg. Ice Probability","68%"],["Estimated Ice Volume","18.6 MT"],["Rover Mission Feasibility","Yes"],["Confidence Level","High (78%)"]].map(([k,v]) => (
                  <div key={k} className="flex justify-between border-b border-border/60 pb-1.5 last:border-0">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-semibold text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
            <Panel title="Key Findings">
              <ul className="space-y-2">
                {["Ice confirmed at 3 high-probability zones","Primary site: 18.6 MT water ice","Site A is safe, illuminated and accessible","Rover path: 1.92 km to primary ice zone","Data quality: 98.2% pass rate"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />{f}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* Right column: mission summary map */}
          <Panel title="Mission Summary Map" padded={false}>
            <div className="relative min-h-96 w-full overflow-hidden rounded-b-2xl">
              <img src={DEMO_ASSETS.report} alt="Mission Summary" className="h-full w-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent p-6">
                <div className="text-base font-bold text-foreground">Chandrayaan-2 Polar Exploration Mission</div>
                <div className="text-sm text-muted-foreground">Lunar South Pole — Ice Extraction Feasibility Study</div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Full report narrative */}
        <Panel title="Full Mission Report" subtitle="Auto-generated from pipeline analysis outputs">
          <div className="space-y-6">
            {sections.map((s) => (
              <div key={s.title} className="border-b border-border/60 pb-4 last:border-0">
                <h3 className="mb-2 text-sm font-bold text-foreground">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.content}</p>
              </div>
            ))}
          </div>
        </Panel>

        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link to="/mission-simulation" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted">
            Back to Mission Simulation
          </Link>
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted">
              <Printer className="h-4 w-4" /> Print
            </button>
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
              <Download className="h-4 w-4" /> Export Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Report() {
  // ── Demo Mode branch ──────────────────────────────────────────────────────
  // TO REMOVE: delete useDemoMode and the if (isDemo) block.
  const { isDemo } = useDemoMode();

  const { data: context } = useQuery({
    queryKey: ["missionReportData"],
    queryFn: () => getMissionReportDataFn(),
  });

  if (isDemo) {
    return <DemoReport />;
  }

  if (!context) {
    return (
      <>
        <TopBar title="Mission Report" subtitle="Generate a professional, exportable mission summary" />
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

  const rep = context.report;

  return (
    <>
      <TopBar title="Mission Report" subtitle="Generate a professional, exportable mission summary" />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground"><FileText className="h-6 w-6" /></div>
            <div>
              <div className="text-xl font-bold">{context.name} — Final Report</div>
              <div className="text-xs text-muted-foreground">{context.id} · Generated {rep?.generatedAt || "Just now"}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted"><Printer className="h-4 w-4" /> Print</button>
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"><Download className="h-4 w-4" /> Export PDF</button>
          </div>
        </div>

        <div className="mx-auto max-w-4xl space-y-6 rounded-2xl border border-border bg-card p-8 shadow-soft print:shadow-none">
          <header className="border-b border-border pb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-primary">Indian Space Research Organisation</div>
            <h2 className="mt-1 text-2xl font-black">Lunar Mission — Final Decision Report</h2>
            <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
              <div><span className="text-muted-foreground">Mission ID:</span> <span className="font-semibold text-foreground">{context.id}</span></div>
              <div><span className="text-muted-foreground">Region:</span> <span className="font-semibold text-foreground">{context.region}</span></div>
              <div><span className="text-muted-foreground">Status:</span> <StatusBadge tone="success">{rep?.status || "Validated"}</StatusBadge></div>
            </div>
          </header>

          <section>
            <h3 className="text-base font-bold mb-2">1. Mission Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {rep?.summaryText}
            </p>
          </section>

          <section>
            <h3 className="text-base font-bold mb-2">2. Key Highlights</h3>
            <ul className="grid gap-2 sm:grid-cols-2 text-sm">
              {rep?.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />{h}</li>
              ))}
            </ul>
          </section>



          <section>
            <h3 className="text-base font-bold mb-2">3. Route Map</h3>
            <div className="aspect-[16/7] rounded-xl bg-[#0b0d10] flex items-center justify-center overflow-hidden">
              {rep?.reportImage ? (
                <img src={rep.reportImage} className="h-full w-full object-cover" />
              ) : (
                <span className="rounded-lg bg-background/80 backdrop-blur px-4 py-2 text-sm font-semibold text-muted-foreground">A* Path Navigation Loaded</span>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-base font-bold mb-2">4. Resource Summary</h3>
            <table className="w-full text-sm">
              <tbody>
                {rep?.resourcesSummary.map((item: any) => {
                  const k = Array.isArray(item) ? item[0] : (item?.name || "");
                  const v = Array.isArray(item) ? item[1] : (item?.value || "");
                  return (
                    <tr key={k} className="border-b border-border/60">
                      <td className="py-2 text-muted-foreground">{k}</td>
                      <td className="py-2 text-right font-semibold text-foreground">{v}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <section>
            <h3 className="text-base font-bold mb-2">5. System Health</h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {["Mobility", "Navigation", "Comm", "Payload", "Thermal", "Power"].map((s) => (
                <div key={s} className="flex items-center justify-between rounded border border-border bg-background px-2 py-1.5"><span>{s}</span><span className="text-success font-semibold">Nominal</span></div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-base font-bold mb-2">6. Hazard Summary</h3>
            <ul className="space-y-1.5 text-sm">
              {[
                ["Large Boulders", "128", "Medium"],
                ["Crater Hazards", "37", "Low"],
                ["Steep Slopes (>15°)", "12", "Low"],
                ["Rough Terrain", "85", "Medium"],
              ].map(([t, c, l]) => (
                <li key={t} className="flex items-center justify-between border-b border-border/60 pb-1.5">
                  <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning-foreground" /> {t}</span>
                  <span><span className="mr-3 text-muted-foreground">{c}</span><StatusBadge tone={l === "Low" ? "success" : "warning"}>{l}</StatusBadge></span>
                </li>
              ))}
            </ul>
          </section>

          <footer className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
            © 2024 LMDSS · Generated by Lunar Mission Decision Support System · For internal mission planning use only.
          </footer>
        </div>
      </div>
    </>
  );
}
