import { MissionContext } from "../core/MissionContext";
import { RasterLayer, RasterMetadata } from "../core/RasterLayer";

export class AlignmentEngine {
  static align(ctx: MissionContext): void {
    // Standardize target dimensions and grid mapping specs
    const targetWidth = 300;
    const targetHeight = 200;
    
    const commonMetadata: RasterMetadata = {
      projection: "Polar Stereographic",
      resolution: 10.0, // standardized to 10m/pixel
      bounds: { minX: -1500, maxX: 1500, minY: -1000, maxY: 1000 },
      crs: "IAU_MOON_2015",
      nodata: -9999
    };

    ctx.alignedOhrc = this.resample(ctx.ohrc!, targetWidth, targetHeight, commonMetadata);
    ctx.alignedDfsar = this.resample(ctx.dfsar!, targetWidth, targetHeight, commonMetadata);
    ctx.alignedDem = this.resample(ctx.dem!, targetWidth, targetHeight, commonMetadata);
    ctx.alignedIllum = this.resample(ctx.illumination!, targetWidth, targetHeight, commonMetadata);
  }

  private static resample(
    source: RasterLayer,
    targetWidth: number,
    targetHeight: number,
    targetMeta: RasterMetadata
  ): RasterLayer {
    const targetData = new Float32Array(targetWidth * targetHeight);
    
    // Perform bilinear resampling from source dimensions to target dimensions
    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const srcXf = (x / (targetWidth - 1)) * (source.width - 1);
        const srcYf = (y / (targetHeight - 1)) * (source.height - 1);

        const x0 = Math.floor(srcXf);
        const x1 = Math.min(source.width - 1, x0 + 1);
        const y0 = Math.floor(srcYf);
        const y1 = Math.min(source.height - 1, y0 + 1);

        const dx = srcXf - x0;
        const dy = srcYf - y0;

        const p00 = source.getPixel(x0, y0);
        const p10 = source.getPixel(x1, y0);
        const p01 = source.getPixel(x0, y1);
        const p11 = source.getPixel(x1, y1);

        const val = (1 - dx) * (1 - dy) * p00 +
                    dx * (1 - dy) * p10 +
                    (1 - dx) * dy * p01 +
                    dx * dy * p11;

        targetData[y * targetWidth + x] = val;
      }
    }

    return new RasterLayer(source.name + "_aligned", targetWidth, targetHeight, targetData, targetMeta);
  }
}
