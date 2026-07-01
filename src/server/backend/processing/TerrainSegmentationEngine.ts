import { MissionContext } from "../core/MissionContext";
import { RasterLayer, RasterMetadata } from "../core/RasterLayer";

export class TerrainSegmentationEngine {
  static segment(ctx: MissionContext): void {
    console.log("[TerrainSegmentationEngine] Starting terrain segmentation from AI analysis...");

    const dfsar = ctx.preprocessedDfsar!;
    const w = dfsar.width;
    const h = dfsar.height;
    const meta = { ...dfsar.metadata };

    // Initialize 2D float arrays for masks
    const craterData = new Float32Array(w * h);
    const boulderData = new Float32Array(w * h);
    const shadowData = new Float32Array(w * h);
    const flatData = new Float32Array(w * h);
    const hazardData = new Float32Array(w * h);
    const safeLandingData = new Float32Array(w * h);
    const segmentationData = new Float32Array(w * h);
    const iceProbData = new Float32Array(w * h);

    const ai = ctx.aiAnalysis!;

    // Helper to draw a circle on a Float32Array
    const drawCircle = (
      data: Float32Array,
      cx_pct: number,
      cy_pct: number,
      r_pct: number,
      val: number
    ) => {
      const cx = (cx_pct / 100) * w;
      const cy = (cy_pct / 100) * h;
      // Radius is a percentage of the minimum dimension to match the frontend
      const r = (r_pct / 100) * Math.min(w, h);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          if (dist <= r) {
            data[y * w + x] = Math.max(data[y * w + x], val);
          }
        }
      }
    };

    // 1. Draw Crater Mask
    for (const c of ai.large_craters) {
      drawCircle(craterData, c.x, c.y, c.radius, 1.0);
      drawCircle(segmentationData, c.x, c.y, c.radius, 1.0); // 1.0 = Crater
    }

    // 2. Draw Boulder Mask
    for (const b of ai.boulder_regions) {
      drawCircle(boulderData, b.x, b.y, b.radius, 1.0);
      drawCircle(segmentationData, b.x, b.y, b.radius, 2.0); // 2.0 = Boulder
    }

    // 3. Draw Shadow Region Mask
    for (const s of ai.shadow_regions) {
      drawCircle(shadowData, s.x, s.y, s.radius, 1.0);
    }

    // 4. Draw Flat Surface Mask
    for (const f of ai.safe_regions) {
      drawCircle(flatData, f.x, f.y, f.radius, 1.0);
      drawCircle(segmentationData, f.x, f.y, f.radius, 3.0); // 3.0 = Safe Flat
    }

    // 5. Draw Hazard Mask (Craters + Boulders + Hazard Regions)
    for (const hg of ai.hazard_regions) {
      drawCircle(hazardData, hg.x, hg.y, hg.radius, 1.0);
    }
    // Boulders are untraversable hazards, craters are high-cost terrain
    for (let i = 0; i < w * h; i++) {
      if (boulderData[i] > 0) {
        hazardData[i] = 1.0;
      } else if (craterData[i] > 0) {
        hazardData[i] = Math.max(hazardData[i], 0.4);
      }
    }

    // 6. Draw Safe Landing Mask (Flat surfaces minus Hazards)
    for (let i = 0; i < w * h; i++) {
      if (flatData[i] > 0 && hazardData[i] === 0) {
        safeLandingData[i] = 1.0;
      }
    }

    // 7. Draw Ice Probability Layer (Shadow regions + Possible Ice regions)
    for (const ice of ai.possible_ice_regions) {
      drawCircle(iceProbData, ice.x, ice.y, ice.radius, 0.85);
    }
    for (let i = 0; i < w * h; i++) {
      if (shadowData[i] > 0) {
        // High probability of ice in permanently shadowed areas
        iceProbData[i] = Math.max(iceProbData[i], 0.75);
      }
    }

    // Store in MissionContext
    ctx.craterMask = new RasterLayer("crater_mask", w, h, craterData, meta);
    ctx.boulderMask = new RasterLayer("boulder_mask", w, h, boulderData, meta);
    ctx.shadowMask = new RasterLayer("shadow_mask", w, h, shadowData, meta);
    ctx.flatMask = new RasterLayer("flat_mask", w, h, flatData, meta);
    ctx.hazardMask = new RasterLayer("hazard_mask", w, h, hazardData, meta);
    ctx.safeLandingMask = new RasterLayer("safe_landing_mask", w, h, safeLandingData, meta);
    ctx.terrainSegmentation = new RasterLayer("terrain_segmentation", w, h, segmentationData, meta);
    ctx.iceProbability = new RasterLayer("ice_probability", w, h, iceProbData, meta);

    console.log("[TerrainSegmentationEngine] Completed terrain segmentation.");
  }
}
