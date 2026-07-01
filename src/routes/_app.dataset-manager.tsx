import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/topbar";
import { Panel, StatusBadge } from "@/components/app/panel";
import { Database, ImageIcon, Mountain, Sun, FileText, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDatasetStatusFn, initializeDatasetsFn } from "@/server/api/endpoints";

export const Route = createFileRoute("/_app/dataset-manager")({
  head: () => ({ meta: [{ title: "Dataset Manager — LMDSS" }] }),
  component: DatasetManager,
});

function DatasetManager() {
  const queryClient = useQueryClient();

  const { data: datasets, isLoading } = useQuery({
    queryKey: ["datasetStatus"],
    queryFn: () => getDatasetStatusFn(),
  });

  const initializeMutation = useMutation({
    mutationFn: () => initializeDatasetsFn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasetStatus"] });
    },
  });

  // Calculate total size
  let totalSizeKB = 0;
  if (datasets) {
    for (const d of datasets) {
      const sizeVal = parseFloat(d.size.split(" ")[0]);
      if (!isNaN(sizeVal)) {
        totalSizeKB += sizeVal;
      }
    }
  }

  const allVerified = datasets ? datasets.every((d) => d.verified) : false;

  const getIcon = (type: string) => {
    switch (type) {
      case "imagery":
      case "optical":
        return ImageIcon;
      case "terrain":
      case "dem":
        return Mountain;
      case "illumination":
        return Sun;
      default:
        return FileText;
    }
  };

  return (
    <>
      <TopBar title="Dataset Manager" subtitle="Catalog of mission datasets, sources and integrity status" />
      <div className="space-y-6 p-4 sm:p-6">
        <Panel
          title="Loaded Datasets"
          action={
            <button
              onClick={() => initializeMutation.mutate()}
              disabled={initializeMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${initializeMutation.isPending ? "animate-spin" : ""}`} />
              Initialize & Verify Datasets
            </button>
          }
        >
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading dataset inventory...</div>
          ) : !datasets || datasets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-muted text-muted-foreground"><Database className="h-6 w-6" /></div>
              <div className="mt-3 text-sm font-semibold text-muted-foreground">No Datasets Loaded</div>
              <div className="mt-1 text-xs text-muted-foreground">Click "Initialize & Verify Datasets" to prepare the demonstration environment.</div>
            </div>
          ) : (
            <div className="grid gap-3">
              {datasets.map((d) => {
                const Icon = getIcon(d.type);
                return (
                  <div key={d.name} className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-background p-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Icon className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-foreground">{d.name}</div>
                      <div className="text-xs text-muted-foreground font-mono truncate" title={d.storagePath}>{d.file}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">Resolution: <span className="font-semibold text-foreground">{d.res}</span></div>
                    <div className="text-xs text-muted-foreground">Size: <span className="font-semibold text-foreground">{d.size}</span></div>
                    <StatusBadge tone={d.verified ? "success" : "destructive"}>
                      {d.verified ? "Verified" : "Failed"}
                    </StatusBadge>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Storage">
            <div className="text-3xl font-bold">
              {(totalSizeKB / 1024).toFixed(2)} <span className="text-base text-muted-foreground">/ 500 MB limit</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: datasets ? `${(totalSizeKB / (500 * 1024)) * 100}%` : "0%" }} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Pre-packaged demonstration cache usage</div>
          </Panel>
          <Panel title="Projection">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Projection</dt><dd className="font-semibold text-foreground">Polar Stereographic</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Datum</dt><dd className="font-semibold text-foreground">IAU Moon</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Resolution</dt><dd className="font-semibold text-foreground">0.25 m/pixel</dd></div>
            </dl>
          </Panel>
          <Panel title="Integrity">
            <div className="flex items-center gap-2">
              {allVerified ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-warning" />
              )}
              <div className={`text-sm font-semibold ${allVerified ? "text-success" : "text-warning"}`}>
                {allVerified ? "All datasets verified" : "Some datasets require initialization"}
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {allVerified
                ? "Checksums and headers verified against NASA/USGS manifests. Ready for offline demo."
                : "Run 'Initialize & Verify Datasets' to prepare files."}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
