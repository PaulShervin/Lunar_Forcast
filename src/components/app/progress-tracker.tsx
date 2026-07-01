import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { Stage } from "@/lib/types";

export function ProgressTracker({ stages }: { stages: Stage[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:gap-2">
        {stages.map((s, i) => (
          <div key={s.key} className="flex flex-1 min-w-[120px] items-center gap-2">
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <div
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors",
                  s.status === "completed" && "bg-success text-success-foreground",
                  s.status === "current" && "bg-primary text-primary-foreground ring-4 ring-primary/15",
                  s.status === "pending" && "bg-muted text-muted-foreground"
                )}
              >
                {s.status === "completed" ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <div className="min-w-0">
                <div className={cn(
                  "truncate text-xs font-semibold",
                  s.status === "current" ? "text-primary" : "text-foreground"
                )}>
                  {s.label}
                </div>
                <div className={cn(
                  "text-[10px] capitalize",
                  s.status === "completed" && "text-success",
                  s.status === "current" && "text-primary",
                  s.status === "pending" && "text-muted-foreground"
                )}>
                  {s.status === "current" ? "In Progress" : s.status}
                </div>
              </div>
            </motion.div>
            {i < stages.length - 1 && (
              <div className="hidden sm:block h-px w-6 shrink-0 bg-border" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
