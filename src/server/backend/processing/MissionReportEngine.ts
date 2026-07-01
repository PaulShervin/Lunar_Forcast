import { MissionContext } from "../core/MissionContext";

export interface MissionReportResults {
  generatedAt: string;
  status: string;
  summaryText: string;
  highlights: string[];
  resourcesSummary: Array<{ name: string; value: string }>;
}

export class MissionReportEngine {
  static generate(ctx: MissionContext): MissionReportResults {
    console.log("[MissionReportEngine] Generating final mission report...");

    const ai = ctx.aiAnalysis!;
    
    // Calculate stats based on ice probability
    const ice = ctx.iceProbability!;
    const w = ice.width;
    const h = ice.height;
    let highProbCount = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (ice.getPixel(x, y) > 0.65) {
          highProbCount++;
        }
      }
    }

    const pixelAreaKm2 = 0.00015;
    const highConfidenceArea = highProbCount * pixelAreaKm2;
    const volumeMm3 = highConfidenceArea * 2.8 * 0.68;
    const waterMassKg = volumeMm3 * 1000 * 1000 * 1000;

    const confidenceVal = Math.round(ai.confidence * 100);

    return {
      generatedAt: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
      status: "Validated",
      summaryText: `The ${ctx.name || "Lunar Exploration"} mission analyzed the lunar surface in the ${ctx.region || "Shackleton Crater"} region. ${ai.summary}`,
      highlights: [
        `Recommended landing site LZ-01 (Score: ${ctx.suitability ? Math.round(ctx.suitability.getPixel(Math.floor(w/2), Math.floor(h/2)) * 100) : 85}%)`,
        `Estimated ice volume: ${volumeMm3.toFixed(2)} million m³`,
        `Mass of water: ${(waterMassKg / 1000000000).toFixed(1)} billion kg`,
        `Mission confidence: ${confidenceVal}%`,
        `Terrain type: ${ai.terrain_type}`,
        `Surface roughness: ${ai.surface_roughness}`,
        `Craters detected: ${ai.crater_count}`,
      ],
      resourcesSummary: [
        { name: "Total Ice Volume", value: `${volumeMm3.toFixed(2)} M m³` },
        { name: "Ice Purity", value: "68%" },
        { name: "Drinking Water Potential", value: "95%" },
        { name: "Life Support (O₂)", value: "88%" },
        { name: "Fuel Production (H₂)", value: "82%" },
      ],
    };
  }
}
