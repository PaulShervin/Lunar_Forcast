import { MissionContext } from "@/lib/types";

export function processAnalytics(ctx: MissionContext): MissionContext {
  if (ctx.analytics) return ctx;

  ctx.currentModule = "Analytics";
  ctx.progress = 100;
  ctx.lastUpdated = new Date().toLocaleString();

  if (ctx.processedResults && ctx.processedResults.suitabilityScore !== undefined) {
    const res = ctx.processedResults;
    ctx.analytics = {
      successProbability: `${(parseFloat(res.suitabilityScore) * 100).toFixed(0)}%`,
      energyReserve: "82%",
      traversedDistance: res.pathSummary["Total Distance"],
      commUptime: "99.9%",
      commStatus: [
        { name: "Orbiter Link", status: res.commStatus.rover, tone: "success" },
        { name: "DSN Uplink", status: res.commStatus.lander, tone: "success" },
        { name: "Link State", status: res.commStatus.link, tone: "success" },
        { name: "Packet Loss", status: "0.00%", tone: "success" },
      ],
      systemHealth: [
        { name: "Mobility", status: "Nominal" },
        { name: "Navigation", status: "Nominal" },
        { name: "Comm", status: "Nominal" },
        { name: "Payload", status: "Nominal" },
        { name: "Thermal", status: "Nominal" },
        { name: "Power", status: "Nominal" },
      ],
    };
  } else {
    ctx.analytics = {
      successProbability: "92%",
      energyReserve: "64%",
      traversedDistance: "1.82 km",
      commUptime: "99.7%",
      commStatus: [
        { name: "Orbiter Link", status: "Strong", tone: "success" },
        { name: "DSN Uplink", status: "Stable", tone: "success" },
        { name: "Latency", status: "1.28 s", tone: "muted" },
        { name: "Packet Loss", status: "0.04%", tone: "success" },
      ],
      systemHealth: [
        { name: "Mobility", status: "Nominal" },
        { name: "Navigation", status: "Nominal" },
        { name: "Comm", status: "Nominal" },
        { name: "Payload", status: "Nominal" },
        { name: "Thermal", status: "Nominal" },
        { name: "Power", status: "Nominal" },
      ],
    };
  }

  return ctx;
}
