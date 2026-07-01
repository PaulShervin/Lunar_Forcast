import { MissionContext } from "@/lib/types";

export function processResourceEstimation(ctx: MissionContext): MissionContext {
  if (ctx.resourceEstimation) return ctx;

  ctx.currentModule = "Resource Estimation";
  ctx.progress = 85;
  ctx.lastUpdated = new Date().toLocaleString();
  if (ctx.processedResults && ctx.processedResults.highConfidenceIceArea !== undefined) {
    const res = ctx.processedResults;
    if (res.resourceEstimation) {
      ctx.resourceEstimation = {
        ...res.resourceEstimation,
        iceImage: res.iceImage
      };
    } else {
      const areaKm = parseFloat(res.highConfidenceIceArea);
      const volumeMm3 = areaKm * 2.8 * 0.68;
      const litersMillion = volumeMm3 * 1000;
      const waterMassKg = litersMillion * 1000000;

      ctx.resourceEstimation = {
        target: {
          id: "Ice Deposit #1",
          coord: "Lat: -88.72° S, Lon: -45.18° E",
          dist: res.pathSummary["Total Distance"],
        },
        stats: {
          area: res.highConfidenceIceArea,
          probability: res.meanCpr.toFixed(2),
          depth: "~2.8 m",
          confidence: "78%",
        },
        volumeEstimate: `${volumeMm3.toFixed(2)} ± ${(volumeMm3 * 0.2).toFixed(2)} million m³`,
        litersEstimate: `${litersMillion.toFixed(0)} ± ${(litersMillion * 0.2).toFixed(0)} million liters`,
        waterMass: `${(waterMassKg / 1000000).toFixed(0)} ± ${(waterMassKg * 0.2 / 1000000).toFixed(0)} million kg`,
        qualityIndicators: {
          "Purity (Estimated)": "68%",
          "Regolith Coverage": "Low (0.2 – 0.5 m)",
          "Ice Layer Continuity": "Good",
          "Ice Accessibility": "High",
        },
        utilization: [
          { label: "Drinking Water", v: 95 },
          { icon: "atom", label: "Life Support (O₂)", v: 88 },
          { icon: "flask", label: "Fuel Production (H₂)", v: 82 },
        ],
        volumeSummary: {
          "Analyzed Area": res.highConfidenceIceArea,
          "Average Ice Thickness": "2.8 m",
          "Total Ice Volume": `${volumeMm3.toFixed(2)} million m³`,
          "Uncertainty": `± ${(volumeMm3 * 0.2).toFixed(2)} million m³`,
          "Confidence Level": "High",
        },
        composition: [
          { name: "H₂O (Ice)", value: 68, color: "oklch(0.55 0.22 264)" },
          { name: "Regolith / Dust", value: 22, color: "oklch(0.7 0.18 50)" },
          { name: "Others", value: 10, color: "oklch(0.6 0.02 260)" },
        ],
        targetsComparison: [
          { id: "Ice Deposit #1", volume: volumeMm3.toFixed(2), quality: 92, dist: parseFloat(res.pathSummary["Total Distance"]) },
          { id: "Ice Deposit #2", volume: (volumeMm3 * 0.6).toFixed(2), quality: 76, dist: parseFloat(res.pathSummary["Total Distance"]) * 1.5 },
        ],
        iceImage: res.iceImage,
      };
    }
  } else {
    ctx.resourceEstimation = {
      target: {
        id: "Ice Deposit #1",
        coord: "Lat: -88.72° S, Lon: -45.18° E",
        dist: "1.48 km",
      },
      stats: {
        area: "0.85 km²",
        probability: "0.72",
        depth: "3.42 m",
        confidence: "92%",
      },
      volumeEstimate: "1.28 ± 0.18 million m³",
      litersEstimate: "128 ± 18 million liters",
      waterMass: "115 ± 16 million kg",
      qualityIndicators: {
        "Purity (Estimated)": "92 – 95%",
        "Regolith Coverage": "Low (0.3 – 0.8 m)",
        "Ice Layer Continuity": "Good",
        "Ice Accessibility": "High",
      },
      utilization: [
        { label: "Drinking Water", v: 95 },
        { icon: "atom", label: "Life Support (O₂)", v: 88 },
        { icon: "flask", label: "Fuel Production (H₂)", v: 82 },
      ],
      volumeSummary: {
        "Analyzed Area": "0.85 km²",
        "Average Ice Thickness": "2.56 m",
        "Total Ice Volume": "1.28 million m³",
        "Uncertainty": "± 0.18 million m³",
        "Confidence Level": "92% (High)",
      },
      composition: [
        { name: "H₂O (Ice)", value: 92.4, color: "oklch(0.55 0.22 264)" },
        { name: "Regolith / Dust", value: 6.1, color: "oklch(0.7 0.18 50)" },
        { name: "Others", value: 1.5, color: "oklch(0.6 0.02 260)" },
      ],
      targetsComparison: [
        { id: "Ice Deposit #1", volume: "1.28 ± 0.18", quality: 92, dist: 1.48 },
        { id: "Ice Deposit #2", volume: "0.74 ± 0.12", quality: 76, dist: 2.61 },
        { id: "Ice Deposit #3", volume: "0.45 ± 0.09", quality: 61, dist: 3.87 },
        { id: "Ice Deposit #4", volume: "0.31 ± 0.07", quality: 54, dist: 4.92 },
      ],
    };
  }

  return ctx;

}
