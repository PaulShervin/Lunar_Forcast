import Jimp from "jimp";

export interface RasterMetadata {
  projection: string;
  resolution: number; // In meters per pixel
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  crs: string; // Coordinate Reference Reference System (e.g. IAU_MOON_2015)
  nodata?: number;
}

export class RasterLayer {
  constructor(
    public name: string,
    public width: number,
    public height: number,
    public data: Float32Array,
    public metadata: RasterMetadata
  ) {}

  static fromJimp(name: string, image: Jimp, metadata: RasterMetadata): RasterLayer {
    const w = image.bitmap.width;
    const h = image.bitmap.height;
    const data = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const color = image.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(color);
        const val = (rgba.r + rgba.g + rgba.b) / (3 * 255);
        data[y * w + x] = val;
      }
    }
    return new RasterLayer(name, w, h, data, metadata);
  }

  getPixel(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return this.metadata.nodata !== undefined ? this.metadata.nodata : 0;
    }
    return this.data[y * this.width + x];
  }

  setPixel(x: number, y: number, val: number): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.data[y * this.width + x] = val;
    }
  }

  clone(): RasterLayer {
    const clonedData = new Float32Array(this.data);
    return new RasterLayer(
      this.name,
      this.width,
      this.height,
      clonedData,
      { ...this.metadata, bounds: { ...this.metadata.bounds } }
    );
  }
}
