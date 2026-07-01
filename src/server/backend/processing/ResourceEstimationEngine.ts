import { MissionContext } from "../core/MissionContext";

export interface ResourceEstimationResults {
  target: { id: string; coord: string; dist: string };
  stats: { area: string; probability: string; depth: string; confidence: string };
  volumeEstimate: string;
  litersEstimate: string;
  waterMass: string;
  qualityIndicators: Record<string, string>;
  utilization: Array<{ label: string; v: number }>;
  volumeSummary: Record<string, string>;
  composition: Array<{ name: string; value: number; color: string }>;
  targetsComparison: Array<{ id: string; volume: string; quality: number; dist: number }>;
}

export class ResourceEstimationEngine {
  static estimate(ctx: MissionContext): ResourceEstimationResults {
    const ice = ctx.iceProbability!;
    const w = ice.width;
    const h = ice.height;

    let totalProb = 0;
    let highProbCount = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const val = ice.getPixel(x, y);
        totalProb += val;
        if (val > 0.65) {
          highProbCount++;
        }
      }
    }

    const pixelAreaKm2 = 0.00015;
    const highConfidenceArea = highProbCount * pixelAreaKm2;
    
    // Depth: standard average 2.8m regolith depth
    const avgDepthMeters = 2.8;
    // Volume: area * depth * average water equivalence purity (68%)
    const volumeMm3 = highConfidenceArea * avgDepthMeters * 0.68;
    const litersBillions = volumeMm3 * 1.0;
    const waterMassKg = volumeMm3 * 1000 * 1000 * 1000;

    return {
      target: { id: "LZ-01-A", coord: "89.45°S, 120.3°E", dist: "320 m" },
      stats: {
        area: `${highConfidenceArea.toFixed(2)} km²`,
        probability: `${(totalProb / (w * h) * 100).toFixed(1)}%`,
        depth: `${avgDepthMeters} m`,
        confidence: "82.4%",
      },
      volumeEstimate: `${volumeMm3.toFixed(2)} million m³`,
      litersEstimate: `${litersBillions.toFixed(2)}B Liters`,
      waterMass: `${(waterMassKg / 1000000).toFixed(1)}M Metric Tons`,
      qualityIndicators: {
        "Regolith Purity": "68%",
        "Overburden Thickness": "0.45 m",
        "Ice Consolidation": "High",
        "Volatile Mix": "95.2% H2O, 4.8% CO2/NH3",
      },
      utilization: [
        { label: "Water Recovery", v: 92 },
        { label: "O2 Production", v: 85 },
        { label: "H2 Fuel Potential", v: 78 },
      ],
      volumeSummary: {
        "Total Volatiles": `${(volumeMm3 * 1.1).toFixed(2)} million m³`,
        "Recoverable Water": `${volumeMm3.toFixed(2)} million m³`,
        "Secondary Yields": `${(volumeMm3 * 0.05).toFixed(2)} million m³`,
      },
      composition: [
        { name: "Pure Water Ice", value: 68, color: "oklch(0.55 0.22 264)" },
        { name: "Regolith Matrix", value: 27, color: "oklch(0.45 0.05 260)" },
        { name: "Carbon Dioxide Ice", value: 3.5, color: "oklch(0.72 0.16 60)" },
        { name: "Other Volatiles", value: 1.5, color: "oklch(0.8 0.1 140)" },
      ],
      targetsComparison: [
        { id: "LZ-01-A", volume: `${volumeMm3.toFixed(2)}M m³`, quality: 88, dist: 320 },
        { id: "LZ-02-B", volume: `${(volumeMm3 * 0.45).toFixed(2)}M m³`, quality: 72, dist: 890 },
        { id: "LZ-03-C", volume: `${(volumeMm3 * 0.25).toFixed(2)}M m³`, quality: 64, dist: 1450 },
      ],
    };
  }
}
