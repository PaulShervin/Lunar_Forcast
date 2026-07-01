import * as fs from "node:fs";
import * as path from "node:path";

export interface DatasetStatus {
  name: string;
  file: string;
  type: string;
  exists: boolean;
  verified: boolean;
  size: string;
  storagePath: string;
  res: string;
  version: string;
  lastUpdated: string;
}

export class DatasetManager {
  private static baseDir = path.resolve("data");

  private static datasetConfig = [
    { name: "High-resolution Optical Imagery", file: "optical/south_pole_optical.tif", type: "optical", res: "0.25 m/px", content: "Demonstration optical overlay - Shackleton Crater (NASA LRO/LROC)" },
    { name: "Digital Elevation Model (DEM)", file: "dem/south_pole_dem.tif", type: "dem", res: "5 m/px", content: "Demonstration Digital Elevation Model (LOLA DEM)" },
    { name: "Terrain Slope Map", file: "terrain/slope_map.tif", type: "terrain", res: "5 m/px", content: "Derived Slope Map in degrees (0-45)" },
    { name: "Terrain Roughness Map", file: "terrain/roughness_map.tif", type: "terrain", res: "5 m/px", content: "Derived Roughness Map factor (0.0-1.0)" },
    { name: "Illumination Map", file: "illumination/illumination_map.tif", type: "illumination", res: "20 m/px", content: "Lunar Illumination Map - Annual Average (NASA LRO)" },
    { name: "DFSAR Demonstration Input", file: "sample_inputs/dfsar_demo_input.tif", type: "radar", res: "10 m/px", content: "Demonstration radar input placeholder (DFSAR HH/HV simulation)" }
  ];

  public static initialize(): { success: boolean; message: string } {
    try {
      // 1. Create directory structure
      const dirs = [
        "",
        "optical",
        "dem",
        "terrain",
        "illumination",
        "metadata",
        "sample_inputs",
        "cache",
        "downloads"
      ];

      for (const d of dirs) {
        const dirPath = path.join(this.baseDir, d);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      }

      // 2. Generate mission.json if not present
      const metadataPath = path.join(this.baseDir, "metadata/mission.json");
      if (!fs.existsSync(metadataPath)) {
        const missionJson = {
          mission_name: "Shackleton Polar Exploration",
          mission_id: "LMDSS-DEMO-001",
          target_region: "Lunar South Pole",
          target_crater: "Shackleton Crater",
          description: "Automatically prepared demonstration mission",
          source: "NASA LRO + USGS Public Data"
        };
        fs.writeFileSync(metadataPath, JSON.stringify(missionJson, null, 2));
      }

      // 3. Generate datasets if not present
      for (const dc of this.datasetConfig) {
        const filePath = path.join(this.baseDir, dc.file);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, `${dc.content}\n`);
        }
      }

      return { success: true, message: "Dataset Manager initialized successfully. All demonstration files prepared." };
    } catch (e: any) {
      return { success: false, message: `Initialization failed: ${e.message}` };
    }
  }

  public static getStatus(): DatasetStatus[] {
    this.initialize(); // Ensure dirs and files exist

    const lastUpdatedStr = new Date().toLocaleString();

    const statuses: DatasetStatus[] = this.datasetConfig.map((dc) => {
      const filePath = path.join(this.baseDir, dc.file);
      const exists = fs.existsSync(filePath);
      let verified = false;
      let sizeStr = "0 KB";

      if (exists) {
        try {
          const stats = fs.statSync(filePath);
          sizeStr = `${(stats.size / 1024).toFixed(1)} KB`;
          // Simple verification: file is readable and size > 0
          const content = fs.readFileSync(filePath, "utf-8");
          verified = content.length > 0;
        } catch (err) {
          verified = false;
        }
      }

      return {
        name: dc.name,
        file: path.basename(dc.file),
        type: dc.type,
        exists,
        verified,
        size: sizeStr,
        storagePath: filePath,
        res: dc.res,
        version: "1.0.0 (Local Demo)",
        lastUpdated: lastUpdatedStr
      };
    });

    // Add metadata file status
    const metadataPath = path.join(this.baseDir, "metadata/mission.json");
    const metaExists = fs.existsSync(metadataPath);
    let metaVerified = false;
    let metaSize = "0 KB";
    if (metaExists) {
      try {
        const stats = fs.statSync(metadataPath);
        metaSize = `${(stats.size / 1024).toFixed(1)} KB`;
        const content = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
        metaVerified = typeof content.mission_id === "string";
      } catch (err) {
        metaVerified = false;
      }
    }

    statuses.push({
      name: "Mission Metadata",
      file: "mission.json",
      type: "metadata",
      exists: metaExists,
      verified: metaVerified,
      size: metaSize,
      storagePath: metadataPath,
      res: "—",
      version: "1.0.0 (Local Demo)",
      lastUpdated: lastUpdatedStr
    });

    return statuses;
  }

  // Getters for other modules
  public static get_optical_image(): string {
    return path.join(this.baseDir, "optical/south_pole_optical.tif");
  }

  public static get_dem(): string {
    return path.join(this.baseDir, "dem/south_pole_dem.tif");
  }

  public static get_illumination(): string {
    return path.join(this.baseDir, "illumination/illumination_map.tif");
  }

  public static get_metadata(): any {
    const filePath = path.join(this.baseDir, "metadata/mission.json");
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
    return null;
  }

  public static get_demo_radar(): string {
    return path.join(this.baseDir, "sample_inputs/dfsar_demo_input.tif");
  }
}
