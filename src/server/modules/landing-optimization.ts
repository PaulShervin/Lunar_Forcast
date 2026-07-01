import { MissionContext } from "@/lib/types";

export function processLandingOptimization(ctx: MissionContext): MissionContext {
  if (ctx.landingOptimization) return ctx;

  ctx.currentModule = "Landing Optimization";
  ctx.progress = 60;
  ctx.lastUpdated = new Date().toLocaleString();

  if (ctx.processedResults && ctx.processedResults.topSite !== undefined) {
    const res = ctx.processedResults;
    ctx.landingOptimization = {
      topSiteId: res.topSite.id,
      topSiteScore: `${res.topSite.score.toFixed(2)} / 100`,
      topSiteArea: `${res.topSite.area} m²`,
      advantages: [
        `Extremely gentle slope (${res.topSite.slope}°)`,
        `High illumination (${res.topSite.illum}%)`,
        "Low hazard density",
        "Near-flat and accessible terrain",
        "Good communication visibility",
      ],
      radarChartData: [
        { axis: "Slope", v: Math.floor(100 - res.topSite.slope * 3) },
        { axis: "Roughness", v: 88 },
        { axis: "Illumination", v: res.topSite.illum },
        { axis: "Accessibility", v: 84 },
        { axis: "Hazard", v: 90 },
      ],
      candidateSites: res.candidateSites,
      landingImage: res.landingImage,
    };
  } else {
    ctx.landingOptimization = {
      topSiteId: "LZ-01",
      topSiteScore: "0.92 / 1.00",
      topSiteArea: "3.24 km²",
      advantages: [
        "Very gentle slope (1.2°)",
        "High illumination (89%)",
        "Low hazard density",
        "Near-flat and accessible terrain",
        "Good communication visibility",
      ],
      radarChartData: [
        { axis: "Slope", v: 95 },
        { axis: "Roughness", v: 88 },
        { axis: "Illumination", v: 92 },
        { axis: "Accessibility", v: 84 },
        { axis: "Hazard", v: 90 },
      ],
      candidateSites: [
        { id: "LZ-01", score: 0.92, area: 3.24, slope: 1.2, illum: 89, hazard: "Low", dist: 12.4 },
        { id: "LZ-02", score: 0.88, area: 2.91, slope: 1.85, illum: 83, hazard: "Low", dist: 14.7 },
        { id: "LZ-03", score: 0.63, area: 4.10, slope: 3.42, illum: 68, hazard: "Medium", dist: 18.9 },
        { id: "LZ-04", score: 0.48, area: 2.25, slope: 4.76, illum: 55, hazard: "Medium", dist: 21.3 },
        { id: "LZ-05", score: 0.21, area: 1.87, slope: 8.32, illum: 41, hazard: "High", dist: 27.6 },
      ],
    };
  }

  return ctx;
}
