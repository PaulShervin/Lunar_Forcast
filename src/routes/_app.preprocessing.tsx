import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app/topbar";
import { Panel, StatusBadge } from "@/components/app/panel";
import { ArrowLeft, ArrowRight, Loader2, Cpu, HardDrive, MemoryStick, CloudUpload, Circle, Check, AlertTriangle, Compass, FlaskConical } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPreprocessingDataFn, getDatasetPreviewFn } from "@/server/api/endpoints";
import { useDemoMode } from "@/store/demo-store";
import { DEMO_ASSETS, DEMO_ASSET_META } from "@/lib/demo-assets";

export const Route = createFileRoute("/_app/preprocessing")({
  head: () => ({ meta: [{ title: "Data Preprocessing — LMDSS" }] }),
  component: Preprocessing,
});


const metadataConfig: Record<string, { res: string; dim: string; crs: string }> = {
  radar: { res: "10 m/px", dim: "2048 x 4096 px", crs: "IAU_MOON_2015 / Polar" },
  imagery: { res: "0.25 m/px", dim: "8192 x 8192 px", crs: "IAU_MOON_2015 / Polar" },
  dem: { res: "5 m/px", dim: "4096 x 4096 px", crs: "IAU_MOON_2015 / Polar" },
  illumination: { res: "20 m/px", dim: "2048 x 2048 px", crs: "IAU_MOON_2015 / Polar" },
};

function GisMapCard({ d, isDone }: { d: any; isDone: boolean }) {
  const [viewMode, setViewMode] = useState<"raw" | "processed">("raw");

  // Determine type fallback
  let dType = d.type;
  if (!dType) {
    const lower = d.name.toLowerCase();
    if (lower.includes("radar") || lower.includes("dfsar")) dType = "radar";
    else if (lower.includes("optical") || lower.includes("image") || lower.includes("ohrc")) dType = "imagery";
    else if (lower.includes("elevation") || lower.includes("dem") || lower.includes("heightmap")) dType = "dem";
    else if (lower.includes("illumination") || lower.includes("sun")) dType = "illumination";
  }

  // Auto-switch to processed once completed
  useEffect(() => {
    if (isDone) {
      setViewMode("processed");
    }
  }, [isDone]);

  // Query to fetch the preview image from the backend dynamically
  const { data: previewUrl, isLoading, isError } = useQuery({
    queryKey: ["datasetPreview", dType, viewMode],
    queryFn: () => getDatasetPreviewFn({ data: { type: dType, processed: viewMode === "processed" } }),
    retry: false,
  });

  const meta = metadataConfig[dType] || { res: "—", dim: "—", crs: "—" };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background flex flex-col justify-between shadow-soft">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 bg-card">
        <div className="text-xs font-bold text-foreground truncate max-w-[130px]" title={d.name}>{d.name}</div>
        <div className="flex items-center gap-1.5">
          <div className="flex rounded-md bg-muted p-0.5 text-[10px] font-semibold">
            <button
              onClick={() => setViewMode("raw")}
              className={`rounded px-1.5 py-0.5 transition-colors ${viewMode === "raw" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Raw
            </button>
            <button
              onClick={() => setViewMode("processed")}
              disabled={!isDone && d.status !== "Completed"}
              className={`rounded px-1.5 py-0.5 transition-colors ${
                viewMode === "processed"
                  ? "bg-background text-foreground shadow-sm"
                  : !isDone && d.status !== "Completed"
                    ? "opacity-40 cursor-not-allowed text-muted-foreground"
                    : "text-muted-foreground"
              }`}
            >
              Processed
            </button>
          </div>
          <StatusBadge tone={d.status === "Completed" ? "success" : d.status === "Processing" ? "warning" : "muted"}>
            {d.status}
          </StatusBadge>
        </div>
      </div>

      {/* GIS Image Viewport (70% height) */}
      <div className="relative aspect-[4/3] w-full bg-[#0b0d10] flex items-center justify-center border-b border-border overflow-hidden">
        {viewMode === "processed" && !isDone && d.status !== "Completed" ? (
          <div className="text-center p-4">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary mb-2" />
            <div className="text-xs font-bold text-muted-foreground">Waiting for Processing...</div>
          </div>
        ) : isLoading ? (
          <div className="text-center p-4">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isError || !previewUrl ? (
          <div className="text-center p-4">
            <AlertTriangle className="mx-auto h-6 w-6 text-destructive mb-2" />
            <div className="text-xs font-bold text-foreground">Preview Unavailable</div>
            <div className="text-[10px] text-muted-foreground mt-1">Dataset file missing or corrupted</div>
          </div>
        ) : (
          <img src={previewUrl} alt={`${d.name} ${viewMode} preview`} className="h-full w-full object-cover" />
        )}
      </div>

      {/* GIS Metadata Panel (30% height) */}
      <div className="p-3 bg-card/40 space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 border-b border-border/60 pb-2">
          <div>
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Resolution</div>
            <div className="font-semibold text-foreground">{meta.res}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Dimensions</div>
            <div className="font-semibold text-foreground truncate">{meta.dim}</div>
          </div>
          <div className="col-span-2 pt-1">
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Coordinate System</div>
            <div className="font-semibold text-foreground truncate" title={meta.crs}>{meta.crs}</div>
          </div>
        </div>

        {/* Steps and file info */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">File Size</span>
            <span className="font-semibold text-foreground">{d.size}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Steps Completed</span>
            <span className="font-semibold text-success">
              {Object.values(d.steps).filter((s) => s === "Completed").length} / 5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Demo Mode Component ──────────────────────────────────────────────────────
// TO REMOVE DEMO MODE: delete this entire DemoPreprocessing function.
// ─────────────────────────────────────────────────────────────────────────────
const demoDatasets = [
  { key: "ohrc" as const,        name: "OHRC Optical Image",          type: "imagery",     res: "0.25 m/px", dim: "8192 x 8192 px", crs: "IAU_MOON_2015 / Polar", size: "12 KB" },
  { key: "dfsar" as const,       name: "DFSAR Radar Backscatter",     type: "radar",       res: "10 m/px",   dim: "2048 x 4096 px", crs: "IAU_MOON_2015 / Polar", size: "10 KB" },
  { key: "dem" as const,         name: "Digital Elevation Model",     type: "dem",         res: "5 m/px",    dim: "4096 x 4096 px", crs: "IAU_MOON_2015 / Polar", size: "15 KB" },
  { key: "illumination" as const, name: "Solar Illumination Map",     type: "illumination", res: "20 m/px",  dim: "2048 x 2048 px", crs: "IAU_MOON_2015 / Polar", size: "8 KB"  },
];

const demoStages = [
  { label: "File Validation",    sub: "Format and integrity check",   status: "completed" },
  { label: "Radiometric Corr.",  sub: "Sensor calibration applied",   status: "completed" },
  { label: "Geometric Corr.",    sub: "Orthorectification complete",   status: "completed" },
  { label: "Co-registration",   sub: "Datasets spatially aligned",    status: "completed" },
  { label: "Noise Filtering",    sub: "Speckle & artifact removal",    status: "completed" },
  { label: "Output Generation",  sub: "GeoTIFF exports ready",         status: "completed" },
];

function DemoPreprocessing() {
  return (
    <>
      <TopBar title="Data Preprocessing" subtitle="Preparing and aligning all datasets for accurate analysis" />
      <div className="space-y-6 p-4 sm:p-6">

        <div className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">
          <Panel title="Preprocessing Pipeline" subtitle="All 6 stages completed on demonstration dataset package.">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {demoStages.map((p, i) => (
                <motion.div key={p.label}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-border bg-background p-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-success/15 text-success">
                    <Check className="h-4 w-4" />
                  </div>
                  <div className="mt-2 text-sm font-bold text-foreground">{p.label}</div>
                  <div className="mt-1 text-[11px] leading-tight text-muted-foreground">{p.sub}</div>
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-success">
                    <Check className="h-3 w-3" /> Completed
                  </div>
                </motion.div>
              ))}
            </div>
          </Panel>

          <Panel title="Preprocessing Summary">
            <div className="flex items-center gap-5">
              <div className="relative grid h-24 w-24 place-items-center">
                <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
                  <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
                  <circle cx="50" cy="50" r="42" stroke="oklch(0.68 0.17 155)" strokeWidth={8} fill="none"
                    strokeDasharray="264 264" strokeLinecap="round" />
                </svg>
                <div className="absolute text-center">
                  <div className="text-xl font-bold text-success">100%</div>
                  <div className="text-[10px] font-semibold text-success">Done</div>
                </div>
              </div>
              <dl className="flex-1 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Processed Files</dt><dd className="font-semibold text-foreground">6 / 6</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Data Volume</dt><dd className="font-semibold text-foreground">62 KB</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Time Elapsed</dt><dd className="font-mono text-foreground">00:04:32</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Est. Time Left</dt><dd className="font-mono text-foreground">00:00:00</dd></div>
              </dl>
            </div>
            <div className="mt-4 rounded-xl border border-border bg-background p-3">
              <div className="text-xs"><span className="font-semibold text-foreground">Data Integrity:</span>{" "}
                <span className="font-semibold text-success">100% — All checks passed</span></div>
              <div className="text-[11px] text-muted-foreground">All datasets spatially aligned to IAU_MOON_2015 / Polar.</div>
            </div>
          </Panel>
        </div>

        <Panel title="Dataset Processing Status" subtitle="Individual dataset previews from Chandrayaan-2 instruments">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {demoDatasets.map((d, i) => (
              <motion.div key={d.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="overflow-hidden rounded-xl border border-border bg-background shadow-soft">
                <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 bg-card">
                  <div className="text-xs font-bold text-foreground truncate max-w-[130px]">{d.name}</div>
                  <StatusBadge tone="success">Completed</StatusBadge>
                </div>
                <div className="relative aspect-[4/3] w-full bg-[#0b0d10] overflow-hidden border-b border-border">
                  <img src={DEMO_ASSETS[d.key]} alt={d.name} className="h-full w-full object-cover" />
                  <div className="absolute top-2 left-2 rounded bg-background/75 backdrop-blur px-1.5 py-0.5 text-[9px] font-mono text-foreground">
                    {DEMO_ASSET_META[d.key].source}
                  </div>
                </div>
                <div className="p-3 bg-card/40 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 border-b border-border/60 pb-2">
                    <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Resolution</div><div className="font-semibold text-foreground">{d.res}</div></div>
                    <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Dimensions</div><div className="font-semibold text-foreground truncate">{d.dim}</div></div>
                    <div className="col-span-2 pt-1"><div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Coordinate System</div><div className="font-semibold text-foreground truncate">{d.crs}</div></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]"><span className="text-muted-foreground">File Size</span><span className="font-semibold text-foreground">{d.size}</span></div>
                    <div className="flex justify-between text-[11px]"><span className="text-muted-foreground">Steps Completed</span><span className="font-semibold text-success">5 / 5</span></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Processing Information">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Projection</dt><dd className="font-semibold text-foreground">Polar Stereographic</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Datum</dt><dd className="font-semibold text-foreground">IAU Moon 2015</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Resolution</dt><dd className="font-semibold text-foreground">0.25 m/pixel</dd></div>
            </dl>
          </Panel>
          <Panel title="System Performance">
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div><Cpu className="mx-auto h-5 w-5 text-primary" /><div className="mt-1 font-semibold text-foreground">42%</div></div>
              <div><MemoryStick className="mx-auto h-5 w-5 text-primary" /><div className="mt-1 font-semibold text-foreground">3.1 GB</div></div>
              <div><HardDrive className="mx-auto h-5 w-5 text-primary" /><div className="mt-1 font-semibold text-foreground">245 MB/s</div></div>
            </div>
          </Panel>
          <Panel title="Auto-Save">
            <div className="flex items-center gap-3">
              <CloudUpload className="h-9 w-9 text-primary" />
              <div>
                <div className="text-sm font-semibold text-foreground">Auto-Save Enabled</div>
                <div className="text-xs text-muted-foreground">Changes are being saved automatically.</div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/new-mission" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted"><ArrowLeft className="h-4 w-4" /> Back to New Mission</Link>
          <Link to="/radar-analysis" className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90">Continue to Quality Check <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </>
  );
}

function Preprocessing() {
  // ── Demo Mode branch ────────────────────────────────────────────────────
  // TO REMOVE: delete the useDemoMode line and the if (isDemo) block below.
  const { isDemo } = useDemoMode();

  const { data: context } = useQuery({
    queryKey: ["preprocessingData"],
    queryFn: () => getPreprocessingDataFn(),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      const completed = query.state.data?.preprocessing?.summary.completedCount === "6 / 6";
      return status === "processing" && !completed ? 1000 : false;
    },
  });

  if (isDemo) {
    return <DemoPreprocessing />;
  }

  if (!context) {
    return (
      <>
        <TopBar title="Data Preprocessing" subtitle="Preparing and aligning all datasets for accurate analysis" />
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

  const prep = context.preprocessing;
  const isDone = prep?.summary.completedCount === "6 / 6";

  return (
    <>
      <TopBar title="Data Preprocessing" subtitle="Preparing and aligning all datasets for accurate analysis" />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">
          <Panel title="Preprocessing Pipeline" subtitle="Processing mission package data to ensure quality and alignment across all datasets.">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {prep ? (
                prep.stages.map((p, i) => {
                  const done = p.status === "completed";
                  const active = p.status === "current";
                  return (
                    <motion.div key={p.label}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className={`rounded-xl border p-3 ${active ? "border-primary bg-primary-soft/20" : "border-border bg-background"}`}>
                      <div className={`grid h-10 w-10 place-items-center rounded-full ${done ? "bg-success/15 text-success" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {done ? <Check className="h-4 w-4" /> : active ? <Loader2 className="h-4 w-4 animate-spin" /> : <Circle className="h-4 w-4" />}
                      </div>
                      <div className="mt-2 text-sm font-bold text-foreground">{p.label}</div>
                      <div className="mt-1 text-[11px] leading-tight text-muted-foreground">{p.sub}</div>
                      <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold">
                        {done ? (
                          <span className="text-success inline-flex items-center gap-1"><Check className="h-3 w-3" /> Completed</span>
                        ) : active ? (
                          <span className="text-primary inline-flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Running</span>
                        ) : (
                          <span className="text-muted-foreground">Waiting</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full py-8 text-center text-muted-foreground">Running pipeline...</div>
              )}
            </div>
          </Panel>

          <Panel title="Preprocessing Summary">
            <div className="flex items-center gap-5">
              <div className="relative grid h-24 w-24 place-items-center">
                <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
                  <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
                  <circle cx="50" cy="50" r="42" stroke={isDone ? "oklch(0.68 0.17 155)" : "oklch(0.55 0.22 264)"} strokeWidth={8} fill="none" 
                    strokeDasharray={`${(prep ? (parseFloat(prep.summary.completedCount.split(" ")[0]) / 6) * 264 : 0)} 264`} strokeLinecap="round" />
                </svg>
                <div className="absolute text-center">
                  <div className={`text-xl font-bold ${isDone ? "text-success" : "text-primary"}`}>
                    {prep ? `${Math.round((parseFloat(prep.summary.completedCount.split(" ")[0]) / 6) * 100)}%` : "0%"}
                  </div>
                  <div className={`text-[10px] font-semibold ${isDone ? "text-success" : "text-primary"}`}>
                    {isDone ? "Done" : "Processing"}
                  </div>
                </div>
              </div>
              <dl className="flex-1 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Processed Files</dt>
                  <dd className="font-semibold text-foreground">{prep?.summary.completedCount || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Data Volume</dt>
                  <dd className="font-semibold text-foreground">{prep?.summary.dataVolume || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Time Elapsed</dt>
                  <dd className="font-mono text-foreground">{prep?.summary.elapsedTime || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Est. Time Left</dt>
                  <dd className="font-mono text-foreground">{prep?.summary.leftTime || "—"}</dd>
                </div>
              </dl>
            </div>
            <div className="mt-4 rounded-xl border border-border bg-background p-3">
              <div className="text-xs">
                <span className="font-semibold text-foreground">Data Integrity:</span>{" "}
                <span className={`font-semibold ${isDone ? "text-success" : "text-warning-foreground"}`}>{prep?.summary.integrity || "—"}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                {isDone ? "All checks passed. Spatially aligned." : "Verifying coordinate system matching..."}
              </div>
            </div>
          </Panel>
        </div>

        <Panel title="Dataset Processing Status" subtitle="Individual dataset preprocessing progress and preview">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {prep?.datasets.map((d) => (
              <GisMapCard key={d.name} d={d} isDone={isDone} />
            ))}
          </div>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Processing Information">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Projection</dt><dd className="font-semibold text-foreground">Polar Stereographic</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Datum</dt><dd className="font-semibold text-foreground">IAU Moon</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Resolution</dt><dd className="font-semibold text-foreground">0.25 m/pixel</dd></div>
            </dl>
          </Panel>
          <Panel title="System Performance">
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div><Cpu className="mx-auto h-5 w-5 text-primary" /><div className="mt-1 font-semibold text-foreground">{prep?.systemPerf.cpu || "—"}</div></div>
              <div><MemoryStick className="mx-auto h-5 w-5 text-primary" /><div className="mt-1 font-semibold text-foreground">{prep?.systemPerf.ram || "—"}</div></div>
              <div><HardDrive className="mx-auto h-5 w-5 text-primary" /><div className="mt-1 font-semibold text-foreground">{prep?.systemPerf.io || "—"}</div></div>
            </div>
          </Panel>
          <Panel title="Auto-Save">
            <div className="flex items-center gap-3">
              <CloudUpload className="h-9 w-9 text-primary" />
              <div>
                <div className="text-sm font-semibold text-foreground">Auto-Save Enabled</div>
                <div className="text-xs text-muted-foreground">Changes are being saved automatically.</div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/new-mission" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted"><ArrowLeft className="h-4 w-4" /> Back to New Mission</Link>
          <Link to="/radar-analysis"
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${isDone ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-muted text-muted-foreground pointer-events-none"}`}>
            Continue to Quality Check <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
