import { MissionContext } from "../core/MissionContext";
import { RasterLayer } from "../core/RasterLayer";

export interface RadarAnalysisResults {
  meanCpr: number;
  meanDop: number;
  radarSignal: Array<{ t: number; low: number; high: number }>;
}

export class RadarAnalysisEngine {
  static analyze(ctx: MissionContext): RadarAnalysisResults {
    const dfsar = ctx.preprocessedDfsar!;
    const w = dfsar.width;
    const h = dfsar.height;

    const cprData = new Float32Array(w * h);
    const dopData = new Float32Array(w * h);

    let totalCpr = 0;
    let totalDop = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const val = dfsar.getPixel(x, y);

        // CPR circular polarization ratio: High intensity scatter yields high CPR. Range [0.1, 1.8]
        const cpr = 0.1 + val * 1.4 + Math.sin((x * y) / 2000) * 0.05;
        const finalCpr = Math.max(0.0, Math.min(1.8, cpr));
        cprData[y * w + x] = finalCpr;
        totalCpr += finalCpr;

        // DOP Degree of Polarization: Low coherence on rough surfaces. Range [0.15, 0.95]
        const dop = 0.95 - val * 0.7 - Math.cos((x + y) / 1200) * 0.06;
        const finalDop = Math.max(0.0, Math.min(1.0, dop));
        dopData[y * w + x] = finalDop;
        totalDop += finalDop;
      }
    }

    const meanCpr = totalCpr / (w * h);
    const meanDop = totalDop / (w * h);

    ctx.cpr = new RasterLayer("cpr", w, h, cprData, { ...dfsar.metadata });
    ctx.dop = new RasterLayer("dop", w, h, dopData, { ...dfsar.metadata });

    // Generate backscatter delay signal log graph along a horizontal transect slice
    const radarSignal: Array<{ t: number; low: number; high: number }> = [];
    const steps = 30;
    const yTransect = Math.floor(h / 2);
    for (let i = 0; i <= steps; i++) {
      const x = Math.floor((i / steps) * (w - 1));
      const val = dfsar.getPixel(x, yTransect);

      const lowFreqDb = -45 + val * 35;
      const highFreqDb = -38 + val * 33 + Math.sin(i / 2.0) * 3;

      radarSignal.push({
        t: Math.floor((i / steps) * 4500),
        low: Math.round(lowFreqDb * 10) / 10,
        high: Math.round(highFreqDb * 10) / 10,
      });
    }

    return {
      meanCpr,
      meanDop,
      radarSignal,
    };
  }
}
