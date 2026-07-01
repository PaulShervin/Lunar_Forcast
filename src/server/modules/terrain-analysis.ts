import { MissionContext } from "@/lib/types";

export function processTerrainAnalysis(ctx: MissionContext): MissionContext {
  if (ctx.terrainAnalysis) return ctx;

  ctx.currentModule = "Terrain Analysis";
  ctx.progress = 45;
  ctx.lastUpdated = new Date().toLocaleString();

  const elevationProfile = Array.from({ length: 25 }, (_, i) => ({
    d: i,
    e: -2300 + Math.sin(i / 2) * 800 + Math.cos(i / 1.3) * 300,
  }));

  if (ctx.processedResults && ctx.processedResults.suitabilityScore !== undefined) {
    const res = ctx.processedResults;
    ctx.terrainAnalysis = {
      suitabilityScore: `${(parseFloat(res.suitabilityScore) * 100).toFixed(0)}%`,
      suitabilityBreakdown: {
        high: res.suitabilityBreakdown.high,
        moderate: res.suitabilityBreakdown.moderate,
        low: res.suitabilityBreakdown.low,
        unsuitable: res.suitabilityBreakdown.unsuitable,
      },
      elevationProfile: res.elevationProfile,
      hazards: res.hazards,
      hazardScore: res.hazardScore,
      slopeImage: res.slopeImage,
      hazardImage: res.hazardImage,
      safeRegions: res.safeRegions,
      distribution: [
        { name: "Safe", value: 68.3, color: "oklch(0.68 0.17 155)" },
        { name: "Hazard", value: 14.7, color: "oklch(0.78 0.16 60)" },
        { name: "Rough", value: 10.9, color: "oklch(0.72 0.14 50)" },
        { name: "Untraversable", value: 6.1, color: "oklch(0.62 0.22 25)" },
      ],
    };
  } else {
    ctx.terrainAnalysis = {
      suitabilityScore: "78%",
      suitabilityBreakdown: {
        high: "24.6 km² (38%)",
        moderate: "40.8 km² (40%)",
        low: "22.1 km² (17%)",
        unsuitable: "14.9 km² (5%)",
      },
      elevationProfile,
      hazards: [
        { label: "Large Rocks (>1m)", level: "Medium", count: 128, tone: "warning" },
        { label: "Crater Hazards", level: "Low", count: 37, tone: "success" },
        { label: "Steep Slopes (>15°)", level: "Low", count: 12, tone: "success" },
        { label: "Rough Terrain", level: "Medium", count: 85, tone: "warning" },
      ],
      hazardScore: "0.28 (Low)",
      safeRegions: [
        { id: "R1", area: 8.24, slope: 3.1, suitability: 92 },
        { id: "R2", area: 6.78, slope: 4.6, suitability: 88 },
        { id: "R3", area: 5.93, slope: 5.2, suitability: 85 },
        { id: "R4", area: 4.11, slope: 6.3, suitability: 79 },
        { id: "R5", area: 3.85, slope: 7.1, suitability: 75 },
      ],
      distribution: [
        { name: "Safe", value: 68.3, color: "oklch(0.68 0.17 155)" },
        { name: "Hazard", value: 14.7, color: "oklch(0.78 0.16 60)" },
        { name: "Rough", value: 10.9, color: "oklch(0.72 0.14 50)" },
        { name: "Untraversable", value: 6.1, color: "oklch(0.62 0.22 25)" },
      ],
    };
  }

  return ctx;

}
