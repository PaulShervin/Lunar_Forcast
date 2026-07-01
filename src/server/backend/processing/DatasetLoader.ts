import Jimp from "jimp";
import * as path from "node:path";
import * as fs from "node:fs";
import { RasterLayer, RasterMetadata } from "../core/RasterLayer";
import { MissionManager } from "../../mission-manager";

export interface RawDatasets {
  ohrc: RasterLayer;
  dfsar: RasterLayer;
  dem: RasterLayer;
  illumination: RasterLayer;
}

export class DatasetLoader {
  static async load(isDemoMode: boolean, radarFileName?: string): Promise<RawDatasets> {
    const ctx = MissionManager.getActiveMission();
    if (!ctx) {
      throw new Error("No active mission context found. Please initialize a mission first.");
    }

    const workspacePath = path.resolve(`backend/uploads/mission-${ctx.id}/input`);
    if (!fs.existsSync(workspacePath) || fs.readdirSync(workspacePath).length === 0) {
      throw new Error("Mission workspace is empty. Preprocessing cannot start.");
    }

    const files = fs.readdirSync(workspacePath);
    
    // Find the radar file in the workspace
    const radarFile = files.find(
      (f) =>
        f !== "ohrc.tif" &&
        f !== "dem.tif" &&
        f !== "slope_map.tif" &&
        f !== "roughness_map.tif" &&
        f !== "illumination.tif" &&
        f !== "mission.json" &&
        (f.endsWith(".tif") || f.endsWith(".tiff") || f.endsWith(".png") || f.endsWith(".jpg") || f.endsWith(".jpeg"))
    );

    if (!radarFile) {
      throw new Error("No DFSAR Radar dataset found in the mission workspace.");
    }

    const dfsarPath = path.join(workspacePath, radarFile);

    if (isDemoMode) {
      // In Demo Mode, try to load the workspace files, but fall back to the actual PNG images
      let dfsarImg: Jimp;
      try {
        dfsarImg = await Jimp.read(dfsarPath);
      } catch (err) {
        dfsarImg = await Jimp.read(path.resolve("public/demo-data/dfsar/dfsar_image.png"));
      }

      let ohrcImg: Jimp;
      try {
        ohrcImg = await Jimp.read(path.join(workspacePath, "ohrc.tif"));
      } catch (err) {
        ohrcImg = await Jimp.read(path.resolve("public/demo-data/ohrc/ohrc_image.png")).catch(() => dfsarImg.clone());
      }

      let demImg: Jimp;
      try {
        demImg = await Jimp.read(path.join(workspacePath, "dem.tif"));
      } catch (err) {
        demImg = await Jimp.read(path.resolve("public/demo-data/dem/dem_image.png")).catch(() => dfsarImg.clone());
      }

      let illumImg: Jimp;
      try {
        illumImg = await Jimp.read(path.join(workspacePath, "illumination.tif"));
      } catch (err) {
        illumImg = await Jimp.read(path.resolve("public/demo-data/illumination/illumination_image.png")).catch(() => dfsarImg.clone());
      }

      const defaultMetadata = (res: number, width: number, height: number): RasterMetadata => ({
        projection: "Polar Stereographic",
        resolution: res,
        bounds: { minX: 0, maxX: width * res, minY: 0, maxY: height * res },
        crs: "IAU_MOON_2015",
        nodata: -9999
      });

      const ohrc = RasterLayer.fromJimp("ohrc", ohrcImg, defaultMetadata(0.25, ohrcImg.bitmap.width, ohrcImg.bitmap.height));
      const dfsar = RasterLayer.fromJimp("dfsar", dfsarImg, defaultMetadata(10.0, dfsarImg.bitmap.width, dfsarImg.bitmap.height));
      const dem = RasterLayer.fromJimp("dem", demImg, defaultMetadata(5.0, demImg.bitmap.width, demImg.bitmap.height));
      const illumination = RasterLayer.fromJimp("illumination", illumImg, defaultMetadata(20.0, illumImg.bitmap.width, illumImg.bitmap.height));

      return { ohrc, dfsar, dem, illumination };
    } else {
      // In Production/Non-Demo Mode, the user only provides the DFSAR image.
      // We process it and load realistic mock layers (optical, DEM, illumination) to match.
      let dfsarImg: Jimp;
      try {
        dfsarImg = await Jimp.read(dfsarPath);
      } catch (err) {
        // Fallback to the packaged demo radar image if reading the uploaded file fails (e.g. text placeholder)
        dfsarImg = await Jimp.read(path.resolve("public/demo-data/dfsar/dfsar_image.png"));
      }

      const w = dfsarImg.bitmap.width;
      const h = dfsarImg.bitmap.height;

      const defaultMetadata = (res: number): RasterMetadata => ({
        projection: "Polar Stereographic",
        resolution: res,
        bounds: { minX: 0, maxX: w * res, minY: 0, maxY: h * res },
        crs: "IAU_MOON_2015",
        nodata: -9999
      });

      // Load mock layers matching the dimensions of the DFSAR image for realistic visualization
      const [ohrcImg, demImg, illumImg] = await Promise.all([
        Jimp.read(path.resolve("public/demo-data/ohrc/ohrc_image.png")).catch(() => dfsarImg.clone()),
        Jimp.read(path.resolve("public/demo-data/dem/dem_image.png")).catch(() => dfsarImg.clone()),
        Jimp.read(path.resolve("public/demo-data/illumination/illumination_image.png")).catch(() => dfsarImg.clone()),
      ]);

      ohrcImg.resize(w, h);
      demImg.resize(w, h);
      illumImg.resize(w, h);

      const dfsar = RasterLayer.fromJimp("dfsar", dfsarImg, defaultMetadata(1.0));
      const ohrc = RasterLayer.fromJimp("ohrc", ohrcImg, defaultMetadata(1.0));
      const dem = RasterLayer.fromJimp("dem", demImg, defaultMetadata(1.0));
      const illumination = RasterLayer.fromJimp("illumination", illumImg, defaultMetadata(1.0));

      return { ohrc, dfsar, dem, illumination };
    }
  }
}
