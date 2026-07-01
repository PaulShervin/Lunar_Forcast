import { MissionContext } from "../core/MissionContext";
import { RasterLayer } from "../core/RasterLayer";

export interface IceDetectionResults {
  highConfidenceIceArea: string;
  avgIceProbability: string;
  totalAreaAnalysed: string;
}

export class IceDetectionEngine {
  static detect(ctx: MissionContext): IceDetectionResults {
    const illumination = ctx.preprocessedIllum!;
    const cpr = ctx.cpr!;
    const dop = ctx.dop!;
    const slope = ctx.slope!;
    const w = illumination.width;
    const h = illumination.height;

    const iceData = new Float32Array(w * h);
    let highConfidenceCount = 0;
    let totalProb = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // PSR Shadow detection (shadowed region is where illumination is low)
        const sun = illumination.getPixel(x, y);
        const psr = 1.0 - sun;

        const cprVal = cpr.getPixel(x, y);
        const dopVal = dop.getPixel(x, y);

        const normalizedCpr = Math.min(1.0, cprVal / 1.6);
        const inverseDop = 1.0 - dopVal;

        // Ice presence probability: 40% shadow (PSR), 35% CPR volume scattering, 25% DOP inverse coherence
        let probability = psr * 0.4 + normalizedCpr * 0.35 + inverseDop * 0.25;

        // Apply slope regolith stability check
        const sVal = slope.getPixel(x, y);
        if (sVal > 18.0) {
          probability *= 0.4;
        } else if (sVal > 12.0) {
          probability *= 0.7;
        }

        const finalProb = Math.max(0.0, Math.min(1.0, probability));
        iceData[y * w + x] = finalProb;
        totalProb += finalProb;

        if (finalProb > 0.65) {
          highConfidenceCount++;
        }
      }
    }

    ctx.iceProbability = new RasterLayer("iceProbability", w, h, iceData, { ...illumination.metadata });

    const pixelAreaKm2 = 0.00015;
    const highConfidenceIceArea = `${(highConfidenceCount * pixelAreaKm2).toFixed(2)} km²`;
    const avgIceProbability = (totalProb / (w * h)).toFixed(2);
    const totalAreaAnalysed = `${(w * h * pixelAreaKm2).toFixed(2)} km²`;

    return {
      highConfidenceIceArea,
      avgIceProbability,
      totalAreaAnalysed,
    };
  }
}
