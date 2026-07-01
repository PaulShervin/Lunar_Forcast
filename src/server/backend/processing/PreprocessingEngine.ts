import { MissionContext } from "../core/MissionContext";
import { RasterLayer } from "../core/RasterLayer";

export class PreprocessingEngine {
  static process(ctx: MissionContext): void {
    ctx.preprocessedOhrc = this.cleanAndDenoise(ctx.alignedOhrc!);
    ctx.preprocessedDfsar = this.cleanAndDenoise(ctx.alignedDfsar!);
    ctx.preprocessedDem = this.cleanAndDenoise(ctx.alignedDem!);
    ctx.preprocessedIllum = this.cleanAndDenoise(ctx.alignedIllum!);
  }

  private static cleanAndDenoise(layer: RasterLayer): RasterLayer {
    const w = layer.width;
    const h = layer.height;
    const targetData = new Float32Array(w * h);

    // Apply basic cleaning (nodata mapping) and 3x3 median noise filter
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const neighbors: number[] = [];

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const val = layer.getPixel(nx, ny);
              if (!isNaN(val) && val > -9990) {
                neighbors.push(val);
              }
            }
          }
        }

        if (neighbors.length > 0) {
          neighbors.sort((a, b) => a - b);
          const median = neighbors[Math.floor(neighbors.length / 2)];
          targetData[y * w + x] = median;
        } else {
          targetData[y * w + x] = 0;
        }
      }
    }

    return new RasterLayer(layer.name + "_preprocessed", w, h, targetData, { ...layer.metadata });
  }
}
