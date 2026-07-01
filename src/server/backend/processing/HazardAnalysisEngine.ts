import { MissionContext } from "../core/MissionContext";
import { RasterLayer } from "../core/RasterLayer";

export class HazardAnalysisEngine {
  static analyze(ctx: MissionContext): void {
    const slope = ctx.slope!;
    const roughness = ctx.roughness!;
    const illumination = ctx.preprocessedIllum!;
    const w = slope.width;
    const h = slope.height;

    const hazardData = new Float32Array(w * h);

    // Dynamic configurable weights
    const wSlope = 0.6;
    const wRough = 0.3;
    const wIllum = 0.1;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const s = slope.getPixel(x, y);
        const r = roughness.getPixel(x, y);
        const i = illumination.getPixel(x, y);

        const sNorm = Math.min(1.0, s / 30.0);
        const rNorm = Math.min(1.0, r / 15.0);
        const iNorm = 1.0 - i;

        let hazard = wSlope * sNorm + wRough * rNorm + wIllum * iNorm;

        // Slopes > 15 degrees are treated as completely unsafe
        if (s > 15.0) {
          hazard = 1.0;
        }

        hazardData[y * w + x] = Math.max(0.0, Math.min(1.0, hazard));
      }
    }

    ctx.hazard = new RasterLayer("hazard", w, h, hazardData, { ...slope.metadata });
  }
}
