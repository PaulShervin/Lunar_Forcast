import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function MetricCard({
  icon: Icon, label, value, hint, hintTone = "muted", iconClass,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  hintTone?: "muted" | "success" | "primary" | "warning";
  iconClass?: string;
}) {
  const toneClass = {
    muted: "text-muted-foreground",
    success: "text-success",
    primary: "text-primary",
    warning: "text-warning-foreground",
  }[hintTone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-soft"
    >
      <div className="flex items-start gap-4">
        <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl", iconClass ?? "bg-primary-soft text-primary")}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
          {hint && <div className={cn("mt-1 text-xs font-medium", toneClass)}>{hint}</div>}
        </div>
      </div>
    </motion.div>
  );
}
