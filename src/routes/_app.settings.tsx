import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/topbar";
import { Panel } from "@/components/app/panel";
import { Bell, Database, Cpu, Info, Save, Trash2, RefreshCcw, Satellite, FlaskConical, CheckCircle2, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getActiveMissionFn } from "@/server/api/endpoints";
import { useDemoMode } from "@/store/demo-store";


export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings & About — LMDSS" }] }),
  component: SettingsPage,
});

function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  return (
    <label className="relative inline-flex h-5 w-9 cursor-pointer items-center">
      <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="absolute inset-0 rounded-full bg-muted transition-colors peer-checked:bg-primary" />
      <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-soft transition-transform peer-checked:translate-x-4" />
    </label>
  );
}

function SettingsPage() {
  const { data: context } = useQuery({
    queryKey: ["activeMission"],
    queryFn: () => getActiveMissionFn(),
  });

  // Demo Mode toggle — isolated from production logic
  const { isDemo, toggleDemo } = useDemoMode();

  return (
    <>
      <TopBar title="Settings & About" subtitle="Application preferences, system info and quick actions" />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Preferences">
            <ul className="space-y-3 text-sm">
              {[
                ["Auto-save mission progress", true],
                ["Use metric units (km, kg)", true],
                ["High-contrast map labels", false],
                ["Show experimental features", false],
              ].map(([l, c]) => (
                <li key={l as string} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
                  <span>{l}</span><Toggle defaultChecked={c as boolean} />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Notifications" subtitle="Manage in-app and email alerts">
            <ul className="space-y-3 text-sm">
              {([
                ["Mission stage completed", true],
                ["Hazard alerts", true],
                ["Weekly mission digest", false],
              ] as const).map(([l, c]) => (
                <li key={l} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
                  <span className="flex items-center gap-2"><Bell className="h-4 w-4 text-primary" />{l}</span>
                  <Toggle defaultChecked={c} />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="System Information">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground flex items-center gap-2"><Cpu className="h-4 w-4" /> CPU</dt><dd className="font-semibold text-foreground">{context?.preprocessing ? "32% used" : "2% used"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground flex items-center gap-2"><Cpu className="h-4 w-4" /> Memory</dt><dd className="font-semibold text-foreground">{context?.preprocessing ? "2.8 / 7.9 GB" : "1.1 / 7.9 GB"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground flex items-center gap-2"><Database className="h-4 w-4" /> Storage</dt><dd className="font-semibold text-foreground">{context?.upload?.totalSize ? `${context.upload.totalSize} used` : "0 MB used"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Build Version</dt><dd className="font-mono text-foreground">1.0.0 (In-Memory Prototype)</dd></div>
            </dl>
          </Panel>

          <Panel title="Mission Information">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Mission Name</dt><dd className="font-semibold text-foreground">{context?.name || "No Mission Loaded"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Mission ID</dt><dd className="font-mono text-foreground">{context?.id || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Region</dt><dd className="font-semibold text-foreground">{context?.region || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Objective</dt><dd className="font-semibold text-foreground truncate max-w-[200px]" title={context?.objective}>{context?.objective || "—"}</dd></div>
            </dl>
          </Panel>

          <Panel title="Quick Actions">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Save, label: "Save State" },
                { icon: RefreshCcw, label: "Reset Pipeline" },
                { icon: Trash2, label: "Clear Cache" },
              ].map((q) => (
                <button key={q.label} className="rounded-xl border border-border bg-background p-4 text-center hover:border-primary">
                  <q.icon className="mx-auto h-5 w-5 text-primary" />
                  <div className="mt-2 text-sm font-bold">{q.label}</div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="About">
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-info text-white"><Satellite className="h-6 w-6" /></div>
              <div>
                <div className="text-base font-bold">Lunar Mission Decision Support System</div>
                <div className="text-xs text-muted-foreground">v1.0.0 · Built for Bharatiya Antariksh Hackathon</div>
                <p className="mt-2 text-sm text-muted-foreground">An AI-powered mission planning platform for analyzing Chandrayaan-2 data, identifying subsurface ice and producing safe landing & traversal plans.</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-primary"><Info className="h-3.5 w-3.5" /> © 2024 Team Stellaris</div>
              </div>
            </div>
          </Panel>

          {/* ── Demo Mode Configuration Panel ─────────────────────────────────
              This panel is part of Demo Mode only.
              TO REMOVE: delete this entire Panel block.
          ─────────────────────────────────────────────────────────────────── */}
          <Panel title="Demo Mode" subtitle="Hackathon presentation layer — bypasses real backend">
            <div className={`flex items-center justify-between rounded-xl border p-4 ${isDemo ? "border-amber-500/40 bg-amber-500/8" : "border-border bg-background"}`}>
              <div className="flex items-center gap-3">
                <div className={`grid h-10 w-10 place-items-center rounded-full ${isDemo ? "bg-amber-500/15 text-amber-500" : "bg-muted text-muted-foreground"}`}>
                  <FlaskConical className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Demo Mode</div>
                  <div className="text-xs text-muted-foreground">
                    {isDemo ? "Active — showing demonstration visualizations" : "Inactive — using real backend pipeline"}
                  </div>
                </div>
              </div>
              <button
                id="settings-demo-toggle"
                onClick={toggleDemo}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDemo ? "bg-amber-500" : "bg-muted"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-soft transition-transform ${isDemo ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            <ul className="mt-4 space-y-2 text-xs">
              {[
                {
                  icon: isDemo ? CheckCircle2 : XCircle,
                  tone: isDemo ? "text-success" : "text-muted-foreground",
                  text: "Demo Mode ON: loads images from public/demo-data/ — backend bypassed",
                },
                {
                  icon: isDemo ? XCircle : CheckCircle2,
                  tone: isDemo ? "text-muted-foreground" : "text-success",
                  text: "Production Mode OFF: uses Chandrayaan-2 datasets via Dataset Manager",
                },
              ].map((row) => (
                <li key={row.text} className="flex items-start gap-2">
                  <row.icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${row.tone}`} />
                  <span className="text-muted-foreground">{row.text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">Config flag: </span>
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono">VITE_DEMO_MODE=true|false</code>
              {" "}in <code className="font-mono">.env</code>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

