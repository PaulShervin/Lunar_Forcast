import Jimp from "jimp";
import { RasterLayer } from "../core/RasterLayer";

export class RasterRenderer {
  static async renderGrayscale(layer: RasterLayer, maxVal: number = 1.0): Promise<Jimp> {
    const w = layer.width;
    const h = layer.height;
    const img = new Jimp(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const val = layer.getPixel(x, y);
        const norm = Math.min(1.0, Math.max(0.0, val / maxVal));
        const byte = Math.floor(norm * 255);
        img.setPixelColor(Jimp.rgbaToInt(byte, byte, byte, 255), x, y);
      }
    }
    return img;
  }

  static async renderFalseColor(layer: RasterLayer): Promise<Jimp> {
    const w = layer.width;
    const h = layer.height;
    const img = new Jimp(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const val = layer.getPixel(x, y);
        const norm = Math.min(1.0, Math.max(0.0, val));
        let r = 0, g = 0, b = 0;
        if (norm < 0.33) {
          const t = norm / 0.33;
          r = 30;
          g = Math.floor(30 + t * 150);
          b = Math.floor(180 - t * 80);
        } else if (norm < 0.66) {
          const t = (norm - 0.33) / 0.33;
          r = Math.floor(30 + t * 180);
          g = 180;
          b = Math.floor(100 - t * 80);
        } else {
          const t = (norm - 0.66) / 0.34;
          r = 210;
          g = Math.floor(180 - t * 140);
          b = 20;
        }
        img.setPixelColor(Jimp.rgbaToInt(r, g, b, 255), x, y);
      }
    }
    return img;
  }

  static async renderIceProbability(ice: RasterLayer, ohrc: Jimp): Promise<Jimp> {
    const w = ice.width;
    const h = ice.height;
    const img = ohrc.clone();
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const p = ice.getPixel(x, y);
        if (p > 0.35) {
          const ohrcColor = ohrc.getPixelColor(x, y);
          const ohrcRgba = Jimp.intToRGBA(ohrcColor);

          const alpha = (p - 0.35) / 0.65;
          const r = Math.floor(ohrcRgba.r * (1.0 - alpha * 0.7));
          const g = Math.floor(ohrcRgba.g * (1.0 - alpha * 0.35));
          const b = Math.min(255, Math.floor(ohrcRgba.b * (1.0 - alpha * 0.1) + alpha * 190));

          img.setPixelColor(Jimp.rgbaToInt(r, g, b, 255), x, y);
        }
      }
    }
    return img;
  }

  static async renderSlopeMap(slope: RasterLayer): Promise<Jimp> {
    const w = slope.width;
    const h = slope.height;
    const img = new Jimp(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const val = slope.getPixel(x, y);
        let r = 0, g = 0, b = 0;
        if (val > 15.0) {
          r = 230; g = 40; b = 40;
        } else if (val > 8.0) {
          r = 225; g = 180; b = 30;
        } else {
          r = 45; g = 180; b = 90;
        }
        img.setPixelColor(Jimp.rgbaToInt(r, g, b, 255), x, y);
      }
    }
    return img;
  }

  static async renderHazardMap(hazard: RasterLayer): Promise<Jimp> {
    const w = hazard.width;
    const h = hazard.height;
    const img = new Jimp(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const val = hazard.getPixel(x, y);
        let r = 0, g = 0, b = 0;
        if (val > 0.75) {
          r = 230; g = 40; b = 40;
        } else if (val > 0.4) {
          r = 225; g = 180; b = 30;
        } else {
          r = 45; g = 180; b = 90;
        }
        img.setPixelColor(Jimp.rgbaToInt(r, g, b, 255), x, y);
      }
    }
    return img;
  }

  static async renderLandingOptimized(suitability: RasterLayer, ohrc: Jimp, candidateSites: any[]): Promise<Jimp> {
    const w = suitability.width;
    const h = suitability.height;
    const img = ohrc.clone();

    for (const site of candidateSites) {
      const cx = site.x;
      const cy = site.y;
      const r = 6;
      const ringColor = site.id === "LZ-01" ? Jimp.rgbaToInt(68, 220, 100, 255) : Jimp.rgbaToInt(235, 120, 20, 255);
      for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
          if (x >= 0 && x < w && y >= 0 && y < h) {
            const d = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
            if (d >= r - 1.5 && d <= r + 0.5) {
              img.setPixelColor(ringColor, x, y);
            }
          }
        }
      }
    }
    return img;
  }

  static async renderRoverPath(ohrc: Jimp, pathPoints: Array<{ x: number; y: number }>, waypoints: any[], start: any): Promise<Jimp> {
    const w = ohrc.bitmap.width;
    const h = ohrc.bitmap.height;
    const img = ohrc.clone();

    const pathColor = Jimp.rgbaToInt(245, 205, 30, 255);
    for (const p of pathPoints) {
      for (let dy = -1; dy <= 0; dy++) {
        for (let dx = -1; dx <= 0; dx++) {
          const nx = p.x + dx;
          const ny = p.y + dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            img.setPixelColor(pathColor, nx, ny);
          }
        }
      }
    }

    const drawCircle = (imgObj: Jimp, cx: number, cy: number, r: number, color: number) => {
      for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
          if (x >= 0 && x < w && y >= 0 && y < h) {
            const d = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
            if (d <= r) {
              imgObj.setPixelColor(color, x, y);
            }
          }
        }
      }
    };

    for (const wp of waypoints) {
      drawCircle(img, wp.cx, wp.cy, 4, Jimp.rgbaToInt(235, 120, 20, 255));
    }

    drawCircle(img, start.x, start.y, 6, Jimp.rgbaToInt(68, 220, 100, 255));

    if (pathPoints.length > 0) {
      const end = pathPoints[pathPoints.length - 1];
      drawCircle(img, end.x, end.y, 6, Jimp.rgbaToInt(40, 200, 245, 255));
    }

    return img;
  }
}
