import { MissionContext } from "../core/MissionContext";
import { RasterLayer } from "../core/RasterLayer";

export interface LandingSite {
  id: string;
  x: number;
  y: number;
  score: number;
  area: number;
  slope: number;
  illum: number;
  hazard: string;
  dist: number;
}

export interface LandingOptimizationResults {
  topSite: LandingSite;
  candidateSites: LandingSite[];
}

export class LandingOptimizationEngine {
  static optimize(ctx: MissionContext): LandingOptimizationResults {
    console.log("[LandingOptimizationEngine] Running landing suitability optimization...");

    const dem = ctx.preprocessedDem!;
    const slope = ctx.slope!;
    
    // Consume AI-derived semantic masks
    const hazardMask = ctx.hazardMask!;
    const safeLandingMask = ctx.safeLandingMask!;
    const ice = ctx.iceProbability!;
    const illumination = ctx.preprocessedIllum!;

    const w = dem.width;
    const h = dem.height;

    const suitabilityData = new Float32Array(w * h);

    // Weights: 40% flatness (safe landing), 30% hazard avoidance, 10% illumination, 20% ice proximity
    const w_flatness = 0.4;
    const w_hazard = 0.3;
    const w_illum = 0.1;
    const w_ice = 0.2;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const isFlat = safeLandingMask.getPixel(x, y); // 1.0 if flat/safe, 0.0 otherwise
        const isHazard = hazardMask.getPixel(x, y);   // 1.0 if hazard, 0.0 otherwise
        const illumVal = illumination.getPixel(x, y);
        const iceVal = ice.getPixel(x, y);
        const slopeVal = slope.getPixel(x, y);

        const flatnessScore = isFlat;
        const hazardScore = 1.0 - isHazard;

        let score = (flatnessScore * w_flatness) + (hazardScore * w_hazard) + (illumVal * w_illum) + (iceVal * w_ice);

        // Disqualify if it's directly on a hazard or slope is too steep (> 15 degrees)
        if (isHazard > 0.5 || slopeVal > 15.0) {
          score = 0.0;
        }

        suitabilityData[y * w + x] = Math.max(0.0, Math.min(1.0, score));
      }
    }

    ctx.suitability = new RasterLayer("suitability", w, h, suitabilityData, { ...dem.metadata });

    // Pick candidates based on Gemini's safe regions
    const candidateSites: LandingSite[] = [];
    const safeZones = ctx.aiAnalysis?.safe_regions || [];
    let idCounter = 1;

    for (const zone of safeZones) {
      const sx = Math.max(0, Math.min(w - 1, Math.floor((zone.x / 100) * w)));
      const sy = Math.max(0, Math.min(h - 1, Math.floor((zone.y / 100) * h)));
      
      const sVal = slope.getPixel(sx, sy);
      const hVal = hazardMask.getPixel(sx, sy);
      const iVal = illumination.getPixel(sx, sy);
      const score = suitabilityData[sy * w + sx];

      candidateSites.push({
        id: `LZ-0${idCounter++}`,
        x: sx,
        y: sy,
        score: Math.round(score * 100),
        area: Math.round(Math.PI * Math.max(10, (zone.radius / 100) * w) ** 2), // Area in sq. meters
        slope: parseFloat(sVal.toFixed(1)),
        illum: Math.round(iVal * 100),
        hazard: hVal > 0.6 ? "High" : hVal > 0.3 ? "Moderate" : "Low",
        dist: Math.round(150 + (1.0 - score) * 800),
      });
    }

    // Fallback if no safe zones returned
    if (candidateSites.length === 0) {
      const fallbackCoords = [
        { x: Math.floor(w * 0.45), y: Math.floor(h * 0.55) },
        { x: Math.floor(w * 0.65), y: Math.floor(h * 0.35) },
        { x: Math.floor(w * 0.25), y: Math.floor(h * 0.45) },
        { x: Math.floor(w * 0.55), y: Math.floor(h * 0.75) },
        { x: Math.floor(w * 0.75), y: Math.floor(h * 0.65) },
      ];
      for (const pt of fallbackCoords) {
        const sx = pt.x;
        const sy = pt.y;
        const sVal = slope.getPixel(sx, sy);
        const hVal = hazardMask.getPixel(sx, sy);
        const iVal = illumination.getPixel(sx, sy);
        const score = suitabilityData[sy * w + sx];

        candidateSites.push({
          id: `LZ-0${idCounter++}`,
          x: sx,
          y: sy,
          score: Math.round(score * 100),
          area: 500,
          slope: parseFloat(sVal.toFixed(1)),
          illum: Math.round(iVal * 100),
          hazard: hVal > 0.6 ? "High" : hVal > 0.3 ? "Moderate" : "Low",
          dist: Math.round(150 + (1.0 - score) * 800),
        });
      }
    }

    // Sort by suitability score descending
    candidateSites.sort((a, b) => b.score - a.score);

    console.log(`[LandingOptimizationEngine] Top landing site selected: ${candidateSites[0].id} at (${candidateSites[0].x}, ${candidateSites[0].y})`);

    return {
      topSite: candidateSites[0],
      candidateSites,
    };
  }
}
