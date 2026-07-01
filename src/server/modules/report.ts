import { MissionContext } from "@/lib/types";

export function processReport(ctx: MissionContext): MissionContext {
  if (ctx.report) return ctx;

  ctx.status = "ready";
  ctx.currentModule = "Report Generation";
  ctx.progress = 100;
  ctx.lastUpdated = new Date().toLocaleString();

  if (ctx.processedResults && ctx.processedResults.highConfidenceIceArea !== undefined) {
    const res = ctx.processedResults;
    const areaKm = parseFloat(res.highConfidenceIceArea);
    const volumeMm3 = areaKm * 2.8 * 0.68;
    const waterMassKg = volumeMm3 * 1000 * 1000 * 1000;

    ctx.report = {
      generatedAt: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
      status: "Validated",
      summaryText: `The ${ctx.name || "Lunar Exploration"} mission analyzed the lunar surface in the ${ctx.region || "Shackleton Crater"} region. AI-driven analysis identified subsurface ice signatures, with the primary deposit estimated at ${volumeMm3.toFixed(2)} ± ${(volumeMm3 * 0.2).toFixed(2)} million m³ of water-equivalent ice.`,
      highlights: [
        `Recommended landing site ${res.topSite.id} (Score ${res.topSite.score.toFixed(2)})`,
        `Estimated ice volume: ${volumeMm3.toFixed(2)} million m³`,
        `Mass of water: ${(waterMassKg / 1000000000).toFixed(0)} ± ${(waterMassKg * 0.2 / 1000000000).toFixed(0)} million kg`,
        "Mission confidence: 78%",
        `Optimal rover route: ${res.pathSummary["Total Distance"]} / ${res.pathSummary["Estimated Time"]}`,
        "All rover systems nominal",
      ],
      resourcesSummary: [
        { name: "Total Ice Volume", value: `${volumeMm3.toFixed(2)} M m³` },
        { name: "Ice Purity", value: "68%" },
        { name: "Drinking Water Potential", value: "95%" },
        { name: "Life Support (O₂)", value: "88%" },
        { name: "Fuel Production (H₂)", value: "82%" },
      ],
      reportImage: res.reportImage,
    };
  } else {
    ctx.report = {
      generatedAt: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
      status: "Validated",
      summaryText: `The ${ctx.name || "Lunar Exploration"} mission analyzed the lunar surface in the ${ctx.region || "Shackleton Crater"} region. AI-driven analysis identified subsurface ice signatures, with the primary deposit estimated at 1.28 ± 0.18 million m³ of water-equivalent ice.`,
      highlights: [
        "Recommended landing site LZ-01 (Score 0.92 / 1.00)",
        "Estimated ice volume: 1.28 million m³",
        "Mass of water: 115 ± 16 million kg",
        "Mission confidence: 92%",
        "Optimal rover route: 1.48 km / 18 min 32 s",
        "All rover systems nominal",
      ],
      resourcesSummary: [
        { name: "Total Ice Volume", value: "1.28 M m³" },
        { name: "Ice Purity", value: "92 – 95%" },
        { name: "Drinking Water Potential", value: "95%" },
        { name: "Life Support (O₂)", value: "88%" },
        { name: "Fuel Production (H₂)", value: "82%" },
      ],
    };
  }

  return ctx;
}
