import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { TopBar } from "@/components/app/topbar";
import { Panel, StatusBadge } from "@/components/app/panel";
import { MetricCard } from "@/components/app/metric-card";
import { FolderKanban, Plus, MapPin, Calendar, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getActiveMissionFn, resetMissionFn } from "@/server/api/endpoints";

export const Route = createFileRoute("/_app/mission-manager")({
  head: () => ({ meta: [{ title: "Mission Manager — LMDSS" }] }),
  component: MissionManager,
});

function MissionManager() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: context } = useQuery({
    queryKey: ["activeMission"],
    queryFn: () => getActiveMissionFn(),
  });

  const resetMutation = useMutation({
    mutationFn: () => resetMissionFn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeMission"] });
      navigate({ to: "/new-mission" });
    },
  });

  return (
    <>
      <TopBar title="Mission Manager" subtitle="Browse, resume or archive lunar missions" />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={FolderKanban} label="Total Missions" value={context ? 1 : 0} hint="Prototype session scope" />
          <MetricCard icon={MapPin} label="Active" value={context ? 1 : 0} hint="In-memory context state" hintTone="primary" iconClass="bg-primary-soft text-primary" />
          <MetricCard icon={Calendar} label="Completed" value={context?.status === "ready" ? 1 : 0} hint="" hintTone="success" iconClass="bg-success/15 text-success" />
          <MetricCard icon={Plus} label="Drafts" value={0} hint="" iconClass="bg-warning/20 text-warning-foreground" />
        </div>

        <Panel
          title="All Missions"
          action={
            <div className="flex gap-2">
              {context && (
                <button
                  onClick={() => resetMutation.mutate()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-muted"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear Session
                </button>
              )}
              <Link to="/new-mission" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                <Plus className="h-3.5 w-3.5" /> New
              </Link>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-3 py-2">Mission ID</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Region</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Progress</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {context ? (
                  <tr className="border-b border-border/60 hover:bg-muted/40">
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{context.id}</td>
                    <td className="px-3 py-3 font-semibold text-foreground">{context.name}</td>
                    <td className="px-3 py-3 text-muted-foreground">{context.region}</td>
                    <td className="px-3 py-3 text-muted-foreground">{context.lastUpdated}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-primary" style={{ width: `${context.progress}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{context.progress}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge tone="success">Active</StatusBadge>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">No Missions Found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}
