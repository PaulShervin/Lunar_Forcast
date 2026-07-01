import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { TopBar } from "@/components/app/topbar";
import { Panel, StatusBadge } from "@/components/app/panel";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMissionStore } from "@/store/mission-store";
import { motion, AnimatePresence } from "framer-motion";
import {
  createMissionFn,
  getActiveMissionFn,
  uploadPackageFn,
  initializeDemoMissionFn,
} from "@/server/api/endpoints";
import {
  UploadCloud,
  FileArchive,
  Check,
  Loader2,
  Shield,
  FileText,
  Image as ImageIcon,
  Mountain,
  Sun,
  FolderOpen,
  ArrowLeft,
  ArrowRight,
  Database,
  BadgeCheck,
  Gauge,
  Award,
  Layers,
  Rocket,
  Compass,
  Zap,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/_app/new-mission")({
  head: () => ({ meta: [{ title: "New Mission — LMDSS" }] }),
  component: NewMission,
});

const steps = [
  { n: 1, label: "Create Session", sub: "Initialize mission ID" },
  { n: 2, label: "Upload File", sub: "Upload DFSAR image" },
  { n: 3, label: "Process Package", sub: "Organize & align data" },
  { n: 4, label: "Mission Ready", sub: "Proceed to analysis" },
];

function NewMission() {
  const setStoreMission = useMissionStore((s) => s.setMission);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Form states
  const [missionName, setMissionName] = useState("");
  const [missionObjective, setMissionObjective] = useState("");
  const [missionRegion, setMissionRegion] = useState("Shackleton Crater, South Pole");

  // Query to fetch the active mission context from server
  const { data: context, isLoading } = useQuery({
    queryKey: ["activeMission"],
    queryFn: () => getActiveMissionFn(),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "uploading" || status === "processing" ? 1000 : false;
    },
  });

  // Sync to Zustand global store whenever context changes
  useEffect(() => {
    if (context) {
      setStoreMission({
        id: context.id,
        name: context.name,
        region: context.region,
        status: context.status === "ready" ? "Ready" : "In Progress",
      });
    } else {
      setStoreMission({
        id: "",
        name: "",
        region: "",
        status: "",
      });
    }
  }, [context, setStoreMission]);

  // Mutation to create new mission
  const createMissionMutation = useMutation({
    mutationFn: (vars: { name: string; objective: string; region: string }) =>
      createMissionFn({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeMission"] });
    },
  });

  // Mutation to initialize demo mission instantly
  const initializeDemoMissionMutation = useMutation({
    mutationFn: () => initializeDemoMissionFn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeMission"] });
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadPackageMutation = useMutation({
    mutationFn: (formData: FormData) => uploadPackageFn({ data: formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeMission"] });
    },
    onError: (err) => {
      queryClient.invalidateQueries({ queryKey: ["activeMission"] });
      alert(err.message || "Upload failed");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    uploadPackageMutation.mutate(formData);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      uploadPackageMutation.mutate(formData);
    }
  };

  const triggerBrowse = () => {
    fileInputRef.current?.click();
  };

  // Determine current wizard step index
  let stepIndex = 0;
  if (context) {
    if (context.status === "created") {
      stepIndex = 1;
    } else if (context.status === "uploading" || context.status === "processing" || context.status === "error") {
      stepIndex = 2;
    } else if (context.status === "ready") {
      stepIndex = 3;
    }
  }

  return (
    <>
      <TopBar title="New Mission" subtitle="Upload mission package to begin analysis" />
      <div className="space-y-6 p-4 sm:p-6">
        {/* Steps */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center gap-1 overflow-x-auto sm:gap-2">
            {steps.map((s, i) => {
              const done = stepIndex > i;
              const current = stepIndex === i;
              return (
                <div key={s.n} className="flex flex-1 min-w-[140px] items-center gap-2">
                  <div className="flex flex-1 items-center gap-3">
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${done ? "bg-success text-success-foreground" : current ? "bg-primary text-primary-foreground ring-4 ring-primary/15" : "bg-muted text-muted-foreground"}`}>
                      {done ? <Check className="h-4 w-4" /> : s.n}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-foreground">{s.label}</div>
                      <div className="text-[11px] text-muted-foreground">{s.sub}</div>
                    </div>
                  </div>
                  {i < steps.length - 1 && <div className="hidden h-px w-6 shrink-0 border-t border-dashed border-border sm:block" />}
                </div>
              );
            })}
          </div>
        </div>

        {!context ? (
          /* Step 1: Create Session Form */
          <div className="grid gap-6 max-w-5xl mx-auto lg:grid-cols-2">
            <Panel title="Initialize Mission Session" subtitle="Provide the basic metadata to create a unique mission configuration.">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!missionName.trim()) return;
                  createMissionMutation.mutate({
                    name: missionName,
                    objective: missionObjective || "Explore Shackleton Crater for subsurface ice",
                    region: missionRegion,
                  });
                }}
                className="space-y-4 pt-2"
              >
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Mission Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shackleton Polar Survey"
                    value={missionName}
                    onChange={(e) => setMissionName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Mission Objective</label>
                  <textarea
                    placeholder="e.g. Find safe landing zones and quantify water ice volume using synthetic aperture radar data."
                    value={missionObjective}
                    onChange={(e) => setMissionObjective(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Target Lunar Region</label>
                  <select
                    value={missionRegion}
                    onChange={(e) => setMissionRegion(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="Shackleton Crater, South Pole">Shackleton Crater, South Pole (89.9° S, 0.0° E)</option>
                    <option value="Aitken Basin, Far Side">Aitken Basin, Far Side (53° S, 191° E)</option>
                    <option value="Mare Imbrium, North">Mare Imbrium, North (32.8° N, 15.6° W)</option>
                  </select>
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={createMissionMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    {createMissionMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Rocket className="h-4 w-4" />
                    )}
                    Initialize Mission Context
                  </button>
                </div>
              </form>
            </Panel>

            <Panel title="Instant Hackathon Demo Setup" subtitle="Skip manual configuration and immediately load our pre-packaged Shackleton Crater datasets.">
              <div className="flex flex-col items-center justify-center py-6 text-center h-full">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-success/15 text-success shadow-glow mb-4">
                  <Zap className="h-8 w-8" />
                </div>
                <div className="text-lg font-bold text-foreground">One-Click Demo Mission</div>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm leading-relaxed">
                  Loads pre-verified optical, DEM, slope, roughness, and illumination maps for Shackleton Crater automatically. 100% reliable for judging.
                </p>
                <button
                  type="button"
                  onClick={() => initializeDemoMissionMutation.mutate()}
                  disabled={initializeDemoMissionMutation.isPending}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-success px-6 py-3 text-sm font-bold text-success-foreground hover:opacity-95 disabled:opacity-50 shadow-soft"
                >
                  {initializeDemoMissionMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                  Initialize Demo Mission
                </button>
              </div>
            </Panel>
          </div>
        ) : (
          /* Step 2 & 3: Upload and Processing Details */
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr_1fr]">
            {/* Upload area or success card */}
            {context.upload.datasets.length > 0 ? (
              <Panel
                title={
                  <span className="flex items-center gap-2 text-success">
                    <BadgeCheck className="h-5 w-5 text-success" /> Workspace Configured
                  </span>
                }
                subtitle="The mission workspace has been successfully established and verified."
              >
                <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-full bg-success/20 blur-xl scale-125 animate-pulse" />
                    <div className="relative grid h-20 w-20 place-items-center rounded-full bg-success/15 text-success shadow-glow">
                      <Compass className="h-10 w-10 text-success" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">DFSAR Radar Dataset Ready</h3>
                  <p className="mt-2 max-w-xs text-xs text-muted-foreground leading-relaxed">
                    The radar backscatter imagery and all supporting environmental layers are pre-loaded and georeferenced.
                  </p>
                  
                  <div className="mt-6 rounded-full border border-success/30 bg-success/10 px-3.5 py-1 text-[11px] font-semibold text-success flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-ping" />
                    Awaiting Preprocessing
                  </div>
                </div>
              </Panel>
            ) : (
              <Panel
                title={
                  <span className="flex items-center gap-2">
                    <UploadCloud className="h-5 w-5 text-primary" /> Upload Radar Dataset
                  </span>
                }
                subtitle="Upload a single DFSAR radar image (.tif) to start the automatic pipeline mapping."
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".tif,.tiff"
                  className="hidden"
                />
                <motion.div
                  whileHover={{ scale: 1.002 }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary-soft/30 p-10 text-center cursor-pointer"
                  onClick={triggerBrowse}
                >
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
                    <FileArchive className="h-9 w-9" />
                  </div>
                  <div className="mt-4 text-lg font-bold text-foreground">Drag & Drop DFSAR Radar Image Here</div>
                  <div className="mt-1 text-sm text-muted-foreground">or</div>
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    <FolderOpen className="h-4 w-4" /> Browse Files
                  </button>
                  <div className="mt-4 text-xs text-muted-foreground">Supported format: .tif / .tiff</div>

                  <AnimatePresence>
                    {uploadPackageMutation.isPending && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 flex flex-col items-center justify-center gap-2"
                      >
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <div className="text-xs font-mono text-muted-foreground">
                          Uploading and storing DFSAR image...
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className="mt-5 rounded-xl border border-border bg-background p-3">
                  <div className="text-[11px] font-bold text-foreground">💡 How it works:</div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Upload a single radar scan. The backend will automatically match and pull the corresponding high-resolution OHRC optical overlay, DEM terrain layers, and illumination models from the pre-populated local repository.
                  </p>
                </div>
              </Panel>
            )}

            {/* Status pipeline */}
            <Panel title="Package Processing Status">
              <ul className="space-y-4">
                {context.upload.stages.map((p) => {
                  const done = p.status === "completed";
                  const active = p.status === "current";
                  const error = p.status === "error";

                  return (
                    <li key={p.key} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                          done
                            ? "bg-success text-success-foreground"
                            : active
                              ? "bg-primary-soft text-primary"
                              : error
                                ? "bg-destructive text-destructive-foreground"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {done ? (
                          <Check className="h-4 w-4" />
                        ) : active ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : error ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <Database className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 border-b border-dashed border-border/60 pb-3 last:border-0 last:pb-0">
                        <div className="text-sm font-semibold text-foreground">{p.label}</div>
                        <div className={`text-xs ${error ? "text-destructive font-semibold" : "text-muted-foreground"}`}>{p.sub}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                <Shield className="h-5 w-5 text-success" />
                <div>
                  <div className="text-sm font-semibold text-foreground">Secure & Verified</div>
                  <div className="text-xs text-muted-foreground">All uploaded data is processed locally.</div>
                </div>
              </div>
            </Panel>

            {/* Summary */}
            <Panel title="Mission Package Summary">
              {context.upload.datasets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-primary-soft/40 p-6 text-center">
                  <FolderOpen className="mx-auto h-10 w-10 text-primary/70" />
                  <div className="mt-2 text-sm font-bold text-foreground">No package uploaded yet</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Upload a radar dataset to inspect file summary.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl bg-primary-soft/40 p-4 text-center">
                    <Compass className="mx-auto h-8 w-8 text-primary" />
                    <div className="mt-2 text-sm font-bold text-foreground">Mission Workspace Assembled</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Total environment size: <span className="font-bold">{context.upload.totalSize}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">Discovered Datasets</div>
                    <ul className="mt-3 space-y-3">
                      {context.upload.datasets.map((d) => (
                        <li key={d.file} className="flex items-start gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-foreground truncate">{d.name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono truncate">{d.file}</div>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-semibold shrink-0">{d.size}</div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {context.processedResults?.metadata && (
                    <div className="mt-4 border-t border-border pt-4">
                      <div className="text-sm font-bold text-foreground">Uploaded File Metadata</div>
                      <div className="mt-2 rounded-xl bg-muted/40 p-3 space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between"><span className="text-muted-foreground">Type:</span> <span className="font-bold text-foreground">{context.processedResults.metadata.file_type}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Extension:</span> <span className="font-bold text-foreground">{context.processedResults.metadata.extension}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Dimensions:</span> <span className="font-bold text-foreground">{context.processedResults.metadata.width} x {context.processedResults.metadata.height} px</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Resolution:</span> <span className="font-bold text-foreground">{context.processedResults.metadata.resolution}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">CRS:</span> <span className="font-bold text-foreground truncate max-w-[150px]" title={context.processedResults.metadata.crs}>{context.processedResults.metadata.crs}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Projection:</span> <span className="font-bold text-foreground">{context.processedResults.metadata.projection}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Panel>
          </div>
        )}

        {/* Badges footer */}
        <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Gauge, label: "Optimized", sub: "Pre-processed for faster analysis", tone: "text-warning-foreground bg-warning/15" },
            { icon: BadgeCheck, label: "Validated", sub: "ISRO standard validation applied", tone: "text-success bg-success/15" },
            { icon: Layers, label: "Complete", sub: "All required datasets included", tone: "text-primary bg-primary-soft" },
            { icon: Award, label: "Reliable", sub: "High quality mission grade data", tone: "text-warning-foreground bg-warning/15" },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-full ${b.tone}`}>
                <b.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-foreground">{b.label}</div>
                <div className="text-xs text-muted-foreground">{b.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <Link
            to="/preprocessing"
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
              context?.status === "ready"
                ? "bg-primary text-primary-foreground hover:opacity-90 animate-pulse"
                : "bg-muted text-muted-foreground pointer-events-none"
            }`}
          >
            Continue to Preprocessing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
