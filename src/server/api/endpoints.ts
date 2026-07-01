import { createServerFn } from "@tanstack/react-start";
import { MissionManager } from "../mission-manager";
import { DatasetManager } from "../dataset-manager";

// Expose server function to get dataset status
export const getDatasetStatusFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const { DatasetManager } = await import("../dataset-manager");
    return DatasetManager.getStatus();
  });

// Expose server function to initialize datasets
export const initializeDatasetsFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const { DatasetManager } = await import("../dataset-manager");
    return DatasetManager.initialize();
  });

// Helper function to generate GIS-style SVGs
function generateGisSvg(type: string, processed: boolean): string {
  let content = "";
  
  if (type === "radar") {
    content = `
      <!-- Radar grid and contours -->
      <rect width="300" height="200" fill="#0b0f13" />
      <g stroke="#2a3a4a" stroke-width="0.5" opacity="0.6">
        <line x1="30" y1="0" x2="30" y2="200" />
        <line x1="90" y1="0" x2="90" y2="200" />
        <line x1="150" y1="0" x2="150" y2="200" />
        <line x1="210" y1="0" x2="210" y2="200" />
        <line x1="270" y1="0" x2="270" y2="200" />
        <line x1="0" y1="40" x2="300" y2="40" />
        <line x1="0" y1="100" x2="300" y2="100" />
        <line x1="0" y1="160" x2="300" y2="160" />
      </g>
      <defs>
        <radialGradient id="rad-c1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#4f6f8f" stop-opacity="0.85" />
          <stop offset="50%" stop-color="#2a3a4a" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#0b1116" stop-opacity="0.9" />
        </radialGradient>
      </defs>
      <circle cx="150" cy="100" r="60" fill="url(#rad-c1)" stroke="#6f8faf" stroke-width="${processed ? "1.5" : "1"}" stroke-dasharray="${processed ? "0" : "3 3"}" />
      <circle cx="130" cy="90" r="30" fill="none" stroke="#5f7faf" stroke-width="0.75" />
      <path d="M 120 120 Q 140 140 170 110" fill="none" stroke="#6f8faf" stroke-width="0.75" />
      ${!processed ? `
      <!-- Noise filter -->
      <filter id="noise-filter">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0.45 0.45 0.45 0 0" />
        <feBlend mode="screen" in="SourceGraphic" in2="noise" />
      </filter>
      <rect width="300" height="200" fill="none" filter="url(#noise-filter)" opacity="0.7" />
      ` : ""}
    `;
  } else if (type === "imagery" || type === "optical") {
    content = `
      <!-- Optical imagery with craters -->
      <rect width="300" height="200" fill="${processed ? "#121212" : "#222222"}" />
      <g stroke="#ffffff" stroke-width="0.5" opacity="0.1">
        <line x1="50" y1="0" x2="50" y2="200" />
        <line x1="150" y1="0" x2="150" y2="200" />
        <line x1="250" y1="0" x2="250" y2="200" />
        <line x1="0" y1="50" x2="300" y2="50" />
        <line x1="0" y1="150" x2="300" y2="150" />
      </g>
      <defs>
        <radialGradient id="opt-c1" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="${processed ? "#ffffff" : "#777777"}" />
          <stop offset="40%" stop-color="${processed ? "#888888" : "#444444"}" />
          <stop offset="85%" stop-color="${processed ? "#111111" : "#1a1a1a"}" />
          <stop offset="100%" stop-color="#050505" />
        </radialGradient>
      </defs>
      <circle cx="150" cy="100" r="55" fill="url(#opt-c1)" />
      <circle cx="90" cy="70" r="12" fill="url(#opt-c1)" opacity="0.85" />
      <circle cx="210" cy="130" r="18" fill="url(#opt-c1)" opacity="0.85" />
      <circle cx="230" cy="60" r="6" fill="url(#opt-c1)" opacity="0.7" />
    `;
  } else if (type === "terrain" || type === "dem") {
    if (processed) {
      content = `
        <defs>
          <radialGradient id="dem-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ff0055" />
            <stop offset="25%" stop-color="#ff9900" />
            <stop offset="50%" stop-color="#33cc33" />
            <stop offset="75%" stop-color="#0066ff" />
            <stop offset="100%" stop-color="#06030c" />
          </radialGradient>
        </defs>
        <rect width="300" height="200" fill="url(#dem-grad)" />
        <circle cx="150" cy="100" r="80" fill="none" stroke="white" stroke-opacity="0.2" stroke-width="0.5" />
        <circle cx="150" cy="100" r="60" fill="none" stroke="white" stroke-opacity="0.25" stroke-width="0.5" />
        <circle cx="150" cy="100" r="40" fill="none" stroke="white" stroke-opacity="0.25" stroke-width="0.5" />
        <circle cx="150" cy="100" r="20" fill="none" stroke="white" stroke-opacity="0.3" stroke-width="0.5" />
        <g transform="translate(10, 110)" font-family="monospace" font-size="7" fill="white">
          <rect width="8" height="70" fill="none" stroke="white" stroke-width="0.5" />
          <linearGradient id="leg-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stop-color="#06030c" />
            <stop offset="25%" stop-color="#0066ff" />
            <stop offset="50%" stop-color="#33cc33" />
            <stop offset="75%" stop-color="#ff9900" />
            <stop offset="100%" stop-color="#ff0055" />
          </linearGradient>
          <rect x="0" y="0" width="8" height="70" fill="url(#leg-grad)" />
          <text x="12" y="6">Elev (m)</text>
          <text x="12" y="16">-1200</text>
          <text x="12" y="34">-2400</text>
          <text x="12" y="52">-3600</text>
          <text x="12" y="68">-4800</text>
        </g>
      `;
    } else {
      content = `
        <rect width="300" height="200" fill="#06030c" />
        <g opacity="0.85">
      `;
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 15; c++) {
          const rx = c * 20;
          const ry = r * 20;
          const dist = Math.sqrt((r - 5) ** 2 + (c - 7.5) ** 2);
          let color = "#06030c";
          if (dist < 2) color = "#ff0055";
          else if (dist < 4) color = "#ff9900";
          else if (dist < 6) color = "#33cc33";
          else if (dist < 8) color = "#0066ff";
          content += `<rect x="${rx}" y="${ry}" width="20" height="20" fill="${color}" stroke="#000" stroke-width="0.25" opacity="0.6" />`;
        }
      }
      content += `</g>`;
    }
  } else if (type === "illumination") {
    if (processed) {
      content = `
        <defs>
          <radialGradient id="illum-clean-g" cx="45%" cy="45%" r="65%">
            <stop offset="0%" stop-color="#ffcc00" stop-opacity="0.95" />
            <stop offset="25%" stop-color="#ff7700" stop-opacity="0.65" />
            <stop offset="60%" stop-color="#441100" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#030303" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="300" height="200" fill="#030303" />
        <rect width="300" height="200" fill="url(#illum-clean-g)" />
        <g transform="translate(10, 140)" font-family="monospace" font-size="7" fill="white">
          <rect width="45" height="6" fill="none" stroke="white" stroke-width="0.5" />
          <linearGradient id="il-leg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#030303" />
            <stop offset="50%" stop-color="#ff7700" />
            <stop offset="100%" stop-color="#ffcc00" />
          </linearGradient>
          <rect width="45" height="6" fill="url(#il-leg)" />
          <text x="0" y="-3">Sun %</text>
          <text x="0" y="14">0%</text>
          <text x="32" y="14">100%</text>
        </g>
      `;
    } else {
      content = `
        <rect width="300" height="200" fill="#030303" />
        <defs>
          <radialGradient id="il-raw-g" cx="45%" cy="45%" r="40%">
            <stop offset="0%" stop-color="#b38600" stop-opacity="0.75" />
            <stop offset="100%" stop-color="#030303" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="300" height="200" fill="url(#il-raw-g)" />
        <circle cx="135" cy="90" r="3" fill="#ffcc00" opacity="0.9" />
        <circle cx="150" cy="120" r="2" fill="#ffcc00" opacity="0.7" />
        <circle cx="170" cy="80" r="4.5" fill="#ffcc00" opacity="0.8" />
        <circle cx="110" cy="110" r="2.5" fill="#ffcc00" opacity="0.65" />
        <circle cx="190" cy="95" r="3.5" fill="#ffcc00" opacity="0.7" />
      `;
    }
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="100%" height="100%">
      ${content}
      <g font-family="monospace" font-size="7" fill="#8f9faf" opacity="0.8">
        <text x="5" y="45">-89.2° S</text>
        <text x="5" y="105">-89.5° S</text>
        <text x="5" y="165">-89.8° S</text>
        <text x="92" y="195" text-anchor="middle">30.0° E</text>
        <text x="150" y="195" text-anchor="middle">45.0° E</text>
        <text x="210" y="195" text-anchor="middle">60.0° E</text>
      </g>
      <g transform="translate(275, 25)" stroke="white" stroke-width="1" fill="none">
        <circle r="10" stroke-opacity="0.3" />
        <path d="M 0 -12 L 3 -2 L 0 0 L -3 -2 Z" fill="white" stroke="none" />
        <path d="M 0 12 L 2 2 L 0 0 L -2 2 Z" fill="#8f9faf" stroke="none" opacity="0.6" />
        <text x="-3" y="-14" font-family="sans-serif" font-size="8" font-weight="bold" fill="white" stroke="none">N</text>
      </g>
      <g transform="translate(220, 180)" font-family="monospace" font-size="7" fill="white">
        <rect width="60" height="3" fill="white" stroke="black" stroke-width="0.5" />
        <rect x="30" width="30" height="3" fill="black" />
        <text x="0" y="-4">0</text>
        <text x="22" y="-4">250</text>
        <text x="45" y="-4">500 m</text>
      </g>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg.trim()).toString("base64")}`;
}

// Expose server function to get dynamically generated dataset previews
export const getDatasetPreviewFn = createServerFn({ method: "POST" })
  .validator((data: { type: string; processed: boolean }) => data)
  .handler(async ({ data }) => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const { default: Jimp } = await import("jimp");
    const { MissionManager } = await import("../mission-manager");

    const ctx = MissionManager.getActiveMission();
    if (!ctx) return null;

    let pngName = "";
    if (data.type === "radar") pngName = "dfsar_preview.png";
    else if (data.type === "imagery" || data.type === "optical") pngName = "ohrc_preview.png";
    else if (data.type === "terrain" || data.type === "dem") pngName = "dem_preview.png";
    else if (data.type === "illumination") pngName = "illumination_preview.png";
    // 1. Try to return the processed PNG first (for both raw and processed if they exist!)
    if (pngName) {
      const previewPath = path.resolve(`backend/uploads/mission-${ctx.id}/processed`, pngName);
      if (fs.existsSync(previewPath)) {
        try {
          const buffer = fs.readFileSync(previewPath);
          return `data:image/png;base64,${buffer.toString("base64")}`;
        } catch (err) {
          console.warn("Failed to read processed PNG preview", err);
        }
      }
    }

    // 2. Otherwise (or as fallback), get the raw input file path
    let filePath = "";
    const inputDir = path.resolve(`backend/uploads/mission-${ctx.id}/input`);
    
    if (data.type === "radar") {
      const radarDataset = ctx.upload.datasets.find((d) => d.type === "radar");
      const radarFileName = radarDataset ? radarDataset.file : "dfsar_demo_input.tif";
      filePath = path.join(inputDir, radarFileName);
    } else if (data.type === "imagery" || data.type === "optical") {
      filePath = path.join(inputDir, "ohrc.tif");
      if (!fs.existsSync(filePath)) filePath = "data/optical/south_pole_optical.tif";
    } else if (data.type === "terrain" || data.type === "dem") {
      filePath = path.join(inputDir, "dem.tif");
      if (!fs.existsSync(filePath)) filePath = "data/dem/south_pole_dem.tif";
    } else if (data.type === "illumination") {
      filePath = path.join(inputDir, "illumination.tif");
      if (!fs.existsSync(filePath)) filePath = "data/illumination/illumination_map.tif";
    }

    // 3. If file exists, convert to PNG on the fly if it is TIF, or return directly
    const resolvedPath = path.resolve(filePath);
    if (fs.existsSync(resolvedPath)) {
      if (resolvedPath.endsWith(".tif") || resolvedPath.endsWith(".tiff")) {
        try {
          const img = await Jimp.read(resolvedPath);
          img.resize(400, Jimp.AUTO);
          const buffer = await img.getBufferAsync(Jimp.MIME_PNG);
          return `data:image/png;base64,${buffer.toString("base64")}`;
        } catch (err) {
          console.error("Failed to convert TIF to PNG on the fly:", err);
        }
      } else {
        try {
          const buffer = fs.readFileSync(resolvedPath);
          const ext = path.extname(resolvedPath).replace(".", "");
          return `data:image/${ext === "jpg" ? "jpeg" : ext === "png" ? "png" : "gif"};base64,${buffer.toString("base64")}`;
        } catch (err) {
          console.error("Failed to read raw preview file:", err);
        }
      }
    }

    // 4. Final fallback: return the placeholder SVG
    return generateGisSvg(data.type, data.processed);
  });

// Helper to ensure there is always a valid active demo mission context
export async function ensureActiveDemoContext() {
  const fs = await import("node:fs");
  const path = await import("node:path");

  let ctx = MissionManager.getActiveMission();
  if (ctx) {
    const workspacePath = path.resolve(`backend/uploads/mission-${ctx.id}`);
    const inputDir = path.join(workspacePath, "input");
    if (fs.existsSync(inputDir) && fs.existsSync(path.join(inputDir, "dem.tif"))) {
      return ctx;
    }
  }

  const { DatasetManager } = await import("../dataset-manager");

  DatasetManager.initialize();
  const meta = DatasetManager.get_metadata();

  const name = meta?.mission_name || "Shackleton Polar Exploration";
  const objective = meta?.description || "Automatically prepared demonstration mission";
  const region = meta?.target_region || "Lunar South Pole";
  const mission = MissionManager.createMission(name, objective, region);

  const workspacePath = path.resolve(`backend/uploads/mission-${mission.id}`);
  const inputDir = path.join(workspacePath, "input");
  const processedDir = path.join(workspacePath, "processed");
  const outputsDir = path.join(workspacePath, "outputs");
  const metadataDir = path.join(workspacePath, "metadata");

  fs.mkdirSync(inputDir, { recursive: true });
  fs.mkdirSync(processedDir, { recursive: true });
  fs.mkdirSync(outputsDir, { recursive: true });
  fs.mkdirSync(metadataDir, { recursive: true });

  // Copy demo datasets
  fs.copyFileSync(DatasetManager.get_demo_radar(), path.join(inputDir, "dfsar_demo_input.tif"));
  fs.copyFileSync(DatasetManager.get_optical_image(), path.join(inputDir, "ohrc.tif"));
  fs.copyFileSync(DatasetManager.get_dem(), path.join(inputDir, "dem.tif"));
  fs.copyFileSync(path.resolve("data/terrain/slope_map.tif"), path.join(inputDir, "slope_map.tif"));
  fs.copyFileSync(path.resolve("data/terrain/roughness_map.tif"), path.join(inputDir, "roughness_map.tif"));
  fs.copyFileSync(DatasetManager.get_illumination(), path.join(inputDir, "illumination.tif"));
  fs.copyFileSync(path.resolve("data/metadata/mission.json"), path.join(inputDir, "mission.json"));

  mission.upload.datasets = [
    { name: "DFSAR Demo Input", file: "dfsar_demo_input.tif", size: "10 KB", res: "10 m/px", status: "Validated", type: "radar" },
    { name: "High-resolution Optical Imagery", file: "ohrc.tif", size: "12 KB", res: "0.25 m/px", status: "Validated", type: "imagery" },
    { name: "Digital Elevation Model (DEM)", file: "dem.tif", size: "15 KB", res: "5 m/px", status: "Validated", type: "terrain" },
    { name: "Terrain Slope Map", file: "slope_map.tif", size: "8 KB", res: "5 m/px", status: "Validated", type: "terrain" },
    { name: "Terrain Roughness Map", file: "roughness_map.tif", size: "8 KB", res: "5 m/px", status: "Validated", type: "terrain" },
    { name: "Illumination Map", file: "illumination.tif", size: "8 KB", res: "20 m/px", status: "Validated", type: "illumination" },
    { name: "Mission Metadata", file: "mission.json", size: "1 KB", res: "—", status: "Validated", type: "metadata" }
  ];

  mission.upload.totalSize = "62 KB";

  mission.upload.stages = [
    { key: "upload", label: "Upload File", sub: "Demo package pre-loaded", status: "completed" },
    { key: "locate", label: "Locate Supporting Datasets", sub: "Datasets matched", status: "completed" },
    { key: "validate", label: "Dataset Validation", sub: "All 6 datasets validated", status: "completed" },
    { key: "workspace", label: "Initialize Workspace", sub: "Workspace initialized", status: "completed" }
  ];

  mission.status = "ready";
  mission.progress = 10;

  mission.processedResults = {
    metadata: {
      file_type: "GeoTIFF Demo Raster",
      extension: ".tif",
      file_size: 63,
      width: 300,
      height: 200,
      crs: "IAU_MOON_2015",
      resolution: "10.0 m/px",
      projection: "Polar Stereographic",
      bounding_box: { minX: -1500, maxX: 1500, minY: -1000, maxY: 1000 }
    }
  };

  const uploadLog = {
    mission_id: mission.id,
    upload_time: new Date().toISOString(),
    original_filename: "dfsar_demo_input.tif",
    stored_filename: "dfsar_demo_input.tif",
    storage_path: path.join(inputDir, "dfsar_demo_input.tif"),
    validation_result: "Success",
    workspace_creation_status: "Success",
    dataset_matching_status: "Success",
    mission_initialization_status: "Success",
  };
  fs.writeFileSync(path.join(metadataDir, "upload_log.json"), JSON.stringify(uploadLog, null, 2));

  MissionManager.updateContext(mission);
  return mission;
}

// Expose server function to initialize a demo mission directly
export const initializeDemoMissionFn = createServerFn({ method: "POST" })
  .handler(async () => {
    return ensureActiveDemoContext();
  });

export const createMissionFn = createServerFn({ method: "POST" })
  .validator((data: { name: string; objective: string; region: string }) => data)
  .handler(async ({ data }) => {
    const { default: path } = await import("node:path");
    const { default: fs } = await import("node:fs");

    const mission = MissionManager.createMission(data.name, data.objective, data.region);

    const workspacePath = path.resolve(`backend/uploads/mission-${mission.id}`);
    fs.mkdirSync(path.join(workspacePath, "input"), { recursive: true });
    fs.mkdirSync(path.join(workspacePath, "processed"), { recursive: true });
    fs.mkdirSync(path.join(workspacePath, "outputs"), { recursive: true });
    fs.mkdirSync(path.join(workspacePath, "metadata"), { recursive: true });

    return mission;
  });

export const getActiveMissionFn = createServerFn({ method: "GET" })
  .handler(async () => {
    return MissionManager.getActiveMission();
  });

export async function handleUploadPipeline(file: File): Promise<any> {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { MissionManager } = await import("../mission-manager");
  const { DatasetManager } = await import("../dataset-manager");
  const { ValidationEngine } = await import("../backend/processing/ValidationEngine");

  const ctx = MissionManager.getActiveMission();
  if (!ctx) {
    throw new Error("No active mission session found. Please initialize a mission first.");
  }

  const workspacePath = path.resolve(`backend/uploads/mission-${ctx.id}`);
  const inputDir = path.join(workspacePath, "input");
  const processedDir = path.join(workspacePath, "processed");
  const outputsDir = path.join(workspacePath, "outputs");
  const metadataDir = path.join(workspacePath, "metadata");

  fs.mkdirSync(inputDir, { recursive: true });
  fs.mkdirSync(processedDir, { recursive: true });
  fs.mkdirSync(outputsDir, { recursive: true });
  fs.mkdirSync(metadataDir, { recursive: true });

  let originalName = file.name;
  let storedName = originalName;
  let targetPath = path.join(inputDir, storedName);

  if (fs.existsSync(targetPath)) {
    const ext = path.extname(originalName);
    const base = path.basename(originalName, ext);
    storedName = `${base}_${Date.now()}${ext}`;
    targetPath = path.join(inputDir, storedName);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(targetPath, buffer);

  if (!fs.existsSync(targetPath)) {
    ctx.status = "error";
    ctx.upload.stages[0].status = "error";
    ctx.upload.stages[0].sub = "Upload verification failed - file not saved.";
    MissionManager.updateContext(ctx);
    throw new Error("File upload failed: could not write to disk.");
  }

  ctx.upload.stages[0].status = "completed";
  ctx.upload.stages[0].sub = `Stored ${storedName} (${(buffer.length / 1024).toFixed(1)} KB)`;
  ctx.upload.stages[1].status = "current";
  MissionManager.updateContext(ctx);

  await new Promise((resolve) => setTimeout(resolve, 600));

  let meta: any = null;
  try {
    meta = ValidationEngine.inspectAndValidate(targetPath);
    ctx.upload.stages[2].status = "completed";
    ctx.upload.stages[2].sub = `Validated ${meta.file_type} (${meta.width}x${meta.height})`;
  } catch (err: any) {
    ctx.status = "error";
    ctx.upload.stages[2].status = "error";
    ctx.upload.stages[2].sub = err.message;
    MissionManager.updateContext(ctx);

    const uploadLog = {
      mission_id: ctx.id,
      upload_time: new Date().toISOString(),
      original_filename: originalName,
      stored_filename: storedName,
      storage_path: targetPath,
      validation_result: "Failed: " + err.message,
      workspace_creation_status: "Success",
      dataset_matching_status: "Pending",
      mission_initialization_status: "Failed",
    };
    fs.writeFileSync(path.join(metadataDir, "upload_log.json"), JSON.stringify(uploadLog, null, 2));

    throw err;
  }

  await new Promise((resolve) => setTimeout(resolve, 600));

  try {
    DatasetManager.initialize();
    fs.copyFileSync(DatasetManager.get_optical_image(), path.join(inputDir, "ohrc.tif"));
    fs.copyFileSync(DatasetManager.get_dem(), path.join(inputDir, "dem.tif"));
    fs.copyFileSync(path.resolve("data/terrain/slope_map.tif"), path.join(inputDir, "slope_map.tif"));
    fs.copyFileSync(path.resolve("data/terrain/roughness_map.tif"), path.join(inputDir, "roughness_map.tif"));
    fs.copyFileSync(DatasetManager.get_illumination(), path.join(inputDir, "illumination.tif"));
    fs.copyFileSync(path.resolve("data/metadata/mission.json"), path.join(inputDir, "mission.json"));

    ctx.upload.stages[1].status = "completed";
    ctx.upload.stages[1].sub = "Matched and copied 5 supporting datasets";
  } catch (err: any) {
    ctx.status = "error";
    ctx.upload.stages[1].status = "error";
    ctx.upload.stages[1].sub = "Dataset Matching Failed: " + err.message;
    MissionManager.updateContext(ctx);
    throw err;
  }

  await new Promise((resolve) => setTimeout(resolve, 600));

  ctx.upload.stages[3].status = "completed";
  ctx.upload.stages[3].sub = `Workspace mission-${ctx.id} initialized`;

  const actualFiles = fs.readdirSync(inputDir);
  ctx.upload.datasets = actualFiles.map((file) => {
    let type = "unknown";
    let name = file;
    let res = "—";
    if (file === "ohrc.tif") { type = "imagery"; name = "High-resolution Optical Imagery"; res = "0.25 m/px"; }
    else if (file === "dem.tif") { type = "dem"; name = "Digital Elevation Model (DEM)"; res = "5 m/px"; }
    else if (file === "slope_map.tif") { type = "terrain"; name = "Terrain Slope Map"; res = "5 m/px"; }
    else if (file === "roughness_map.tif") { type = "terrain"; name = "Terrain Roughness Map"; res = "5 m/px"; }
    else if (file === "illumination.tif") { type = "illumination"; name = "Illumination Map"; res = "20 m/px"; }
    else if (file === "mission.json") { type = "metadata"; name = "Mission Metadata"; }
    else if (file === storedName) { type = "radar"; name = "DFSAR Radar Dataset"; res = meta.resolution; }

    const fStats = fs.statSync(path.join(inputDir, file));
    return {
      name,
      file,
      size: `${(fStats.size / 1024).toFixed(1)} KB`,
      res,
      status: "Validated",
      type,
    };
  });

  let totalBytes = 0;
  for (const f of actualFiles) {
    totalBytes += fs.statSync(path.join(inputDir, f)).size;
  }
  ctx.upload.totalSize = `${(totalBytes / 1024).toFixed(1)} KB`;

  ctx.processedResults = {
    ...ctx.processedResults,
    metadata: meta,
  };

  ctx.status = "ready";
  ctx.progress = 10;
  MissionManager.updateContext(ctx);

  const uploadLog = {
    mission_id: ctx.id,
    upload_time: new Date().toISOString(),
    original_filename: originalName,
    stored_filename: storedName,
    storage_path: targetPath,
    validation_result: "Success",
    workspace_creation_status: "Success",
    dataset_matching_status: "Success",
    mission_initialization_status: "Success",
  };
  fs.writeFileSync(path.join(metadataDir, "upload_log.json"), JSON.stringify(uploadLog, null, 2));

  console.log("=== UPLOAD PIPELINE LOG ===");
  console.log(JSON.stringify(uploadLog, null, 2));

  return {
    mission_id: ctx.id,
    stored_path: targetPath,
    file_size: buffer.length,
    dataset_type: meta.file_type,
    upload_status: "success",
  };
}

export const uploadPackageFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data }) => {
    const file = data.get("file") as File | null;
    if (!file) {
      throw new Error("No file uploaded");
    }
    return handleUploadPipeline(file);
  });

export const getPreprocessingDataFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const ctx = await ensureActiveDemoContext();
    const { processPreprocessing } = await import("../modules/preprocessing");
    return await processPreprocessing(ctx);
  });

export const getRadarAnalysisDataFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const ctx = await ensureActiveDemoContext();
    ctx.radarAnalysis = undefined;
    const { processPreprocessing } = await import("../modules/preprocessing");
    const { processRadarAnalysis } = await import("../modules/radar-analysis");
    await processPreprocessing(ctx);
    return processRadarAnalysis(ctx);
  });

export const getTerrainAnalysisDataFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const ctx = await ensureActiveDemoContext();
    ctx.terrainAnalysis = undefined;
    const { processPreprocessing } = await import("../modules/preprocessing");
    const { processRadarAnalysis } = await import("../modules/radar-analysis");
    const { processTerrainAnalysis } = await import("../modules/terrain-analysis");
    await processPreprocessing(ctx);
    processRadarAnalysis(ctx);
    return processTerrainAnalysis(ctx);
  });

export const getLandingOptimizationDataFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const ctx = await ensureActiveDemoContext();
    ctx.landingOptimization = undefined;
    const { processPreprocessing } = await import("../modules/preprocessing");
    const { processRadarAnalysis } = await import("../modules/radar-analysis");
    const { processTerrainAnalysis } = await import("../modules/terrain-analysis");
    const { processLandingOptimization } = await import("../modules/landing-optimization");
    await processPreprocessing(ctx);
    processRadarAnalysis(ctx);
    processTerrainAnalysis(ctx);
    return processLandingOptimization(ctx);
  });

export const getRoverNavigationDataFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const ctx = await ensureActiveDemoContext();
    ctx.terrainAnalysis = undefined;
    ctx.landingOptimization = undefined;
    ctx.roverNavigation = undefined;
    ctx.resourceEstimation = undefined;
    ctx.missionSimulation = undefined;

    const { processPreprocessing } = await import("../modules/preprocessing");
    const { processRadarAnalysis } = await import("../modules/radar-analysis");
    const { processTerrainAnalysis } = await import("../modules/terrain-analysis");
    const { processLandingOptimization } = await import("../modules/landing-optimization");
    const { processRoverNavigation } = await import("../modules/rover-navigation");
    await processPreprocessing(ctx);
    processRadarAnalysis(ctx);
    processTerrainAnalysis(ctx);
    processLandingOptimization(ctx);
    return processRoverNavigation(ctx);
  });

export const getResourceEstimationDataFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const ctx = await ensureActiveDemoContext();
    ctx.resourceEstimation = undefined;
    const { processPreprocessing } = await import("../modules/preprocessing");
    const { processRadarAnalysis } = await import("../modules/radar-analysis");
    const { processTerrainAnalysis } = await import("../modules/terrain-analysis");
    const { processLandingOptimization } = await import("../modules/landing-optimization");
    const { processRoverNavigation } = await import("../modules/rover-navigation");
    const { processResourceEstimation } = await import("../modules/resource-estimation");
    await processPreprocessing(ctx);
    processRadarAnalysis(ctx);
    processTerrainAnalysis(ctx);
    processLandingOptimization(ctx);
    processRoverNavigation(ctx);
    return processResourceEstimation(ctx);
  });

export const getMissionSimulationDataFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const ctx = await ensureActiveDemoContext();
    const { processPreprocessing } = await import("../modules/preprocessing");
    const { processRadarAnalysis } = await import("../modules/radar-analysis");
    const { processTerrainAnalysis } = await import("../modules/terrain-analysis");
    const { processLandingOptimization } = await import("../modules/landing-optimization");
    const { processRoverNavigation } = await import("../modules/rover-navigation");
    const { processResourceEstimation } = await import("../modules/resource-estimation");
    const { processMissionSimulation } = await import("../modules/mission-simulation");

    ctx.terrainAnalysis = undefined;
    ctx.landingOptimization = undefined;
    ctx.roverNavigation = undefined;
    ctx.resourceEstimation = undefined;
    ctx.missionSimulation = undefined;

    const { MissionPipeline } = await import("../backend/processing/MissionPipeline");
    ctx.processedResults = await MissionPipeline.runPipeline(true, ctx.name, ctx.region);

    await processPreprocessing(ctx);
    processRadarAnalysis(ctx);
    processTerrainAnalysis(ctx);
    processLandingOptimization(ctx);
    processRoverNavigation(ctx);
    processResourceEstimation(ctx);
    return processMissionSimulation(ctx);
  });

export const getAnalyticsDataFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const ctx = await ensureActiveDemoContext();
    ctx.analytics = undefined;
    const { processPreprocessing } = await import("../modules/preprocessing");
    const { processRadarAnalysis } = await import("../modules/radar-analysis");
    const { processTerrainAnalysis } = await import("../modules/terrain-analysis");
    const { processLandingOptimization } = await import("../modules/landing-optimization");
    const { processRoverNavigation } = await import("../modules/rover-navigation");
    const { processResourceEstimation } = await import("../modules/resource-estimation");
    const { processMissionSimulation } = await import("../modules/mission-simulation");
    const { processAnalytics } = await import("../modules/analytics");
    await processPreprocessing(ctx);
    processRadarAnalysis(ctx);
    processTerrainAnalysis(ctx);
    processLandingOptimization(ctx);
    processRoverNavigation(ctx);
    processResourceEstimation(ctx);
    processMissionSimulation(ctx);
    return processAnalytics(ctx);
  });

export const getMissionReportDataFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const ctx = await ensureActiveDemoContext();
    ctx.report = undefined;
    const { processPreprocessing } = await import("../modules/preprocessing");
    const { processRadarAnalysis } = await import("../modules/radar-analysis");
    const { processTerrainAnalysis } = await import("../modules/terrain-analysis");
    const { processLandingOptimization } = await import("../modules/landing-optimization");
    const { processRoverNavigation } = await import("../modules/rover-navigation");
    const { processResourceEstimation } = await import("../modules/resource-estimation");
    const { processMissionSimulation } = await import("../modules/mission-simulation");
    const { processAnalytics } = await import("../modules/analytics");
    const { processReport } = await import("../modules/report");
    await processPreprocessing(ctx);
    processRadarAnalysis(ctx);
    processTerrainAnalysis(ctx);
    processLandingOptimization(ctx);
    processRoverNavigation(ctx);
    processResourceEstimation(ctx);
    processMissionSimulation(ctx);
    processAnalytics(ctx);
    return processReport(ctx);
  });

export const resetMissionFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const { default: path } = await import("node:path");
    const { default: fs } = await import("node:fs");

    MissionManager.reset();
    const workspacePath = path.resolve("data/workspace");
    if (fs.existsSync(workspacePath)) {
      fs.rmSync(workspacePath, { recursive: true, force: true });
    }
    return { success: true };
  });

// Automatically initialize datasets on server startup (Server-only check)
if (typeof window === "undefined") {
  import("../dataset-manager").then(({ DatasetManager }) => {
    DatasetManager.initialize();
  });
}
