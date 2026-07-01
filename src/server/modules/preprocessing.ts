import { MissionContext } from "@/lib/types";

export async function processPreprocessing(ctx: MissionContext): Promise<MissionContext> {
  if (ctx.preprocessing && ctx.preprocessing.summary.completedCount === "6 / 6") {
    return ctx;
  }

  if (!ctx.preprocessing) {
    ctx.status = "processing";
    ctx.currentModule = "Preprocessing";
    ctx.progress = 12;

    ctx.preprocessing = {
      stages: [
        { key: "noise", label: "Noise Reduction", sub: "Removing speckle noise from radar data", status: "current" },
        { key: "geo", label: "Georeferencing", sub: "Aligning all datasets to lunar coordinate system", status: "pending" },
        { key: "resample", label: "Resampling", sub: "Standardizing resolution to 0.25 m/pixel", status: "pending" },
        { key: "norm", label: "Normalization", sub: "Normalizing pixel values across datasets", status: "pending" },
        { key: "align", label: "Layer Alignment", sub: "Aligning layers for pixel-level accuracy", status: "pending" },
        { key: "prep", label: "Data Fusion Prep", sub: "Preparing datasets for multi-source analysis", status: "pending" },
      ],
      summary: {
        completedCount: "0 / 6",
        dataVolume: "4.82 GB",
        elapsedTime: "00:00:02",
        leftTime: "00:00:10",
        integrity: "Verifying...",
      },
      datasets: [
        {
          name: "DFSAR Radar Data",
          file: ctx.upload.datasets.find((d) => d.type === "radar")?.file || "dfsar_demo_input.tif",
          size: "2.48 GB",
          status: "Processing",
          type: "radar",
          steps: { "Noise Reduction": "Running", "Georeferencing": "Waiting", "Resampling": "Waiting", "Normalization": "Waiting", "Quality Check": "Waiting" },
          preview: {
            rawLabel: "Raw Radar (Speckled)",
            rawVisual: "repeating-radial-gradient(circle, #333, #333 4px, #111 4px, #111 8px)",
            processedLabel: "Denoised Radar",
            processedVisual: "radial-gradient(circle, #445566 20%, #112233 80%)"
          }
        },
        {
          name: "High-resolution Optical Imagery",
          file: "ohrc.tif",
          size: "1.32 GB",
          status: "Waiting",
          type: "imagery",
          steps: { "Noise Reduction": "Waiting", "Georeferencing": "Waiting", "Resampling": "Waiting", "Normalization": "Waiting", "Quality Check": "Waiting" },
          preview: {
            rawLabel: "Raw Optical (Dull)",
            rawVisual: "linear-gradient(135deg, #444, #222)",
            processedLabel: "Contrast-Normalized",
            processedVisual: "linear-gradient(135deg, #bbb, #222)"
          }
        },
        {
          name: "Digital Elevation Model (DEM)",
          file: "dem.tif",
          size: "860 MB",
          status: "Waiting",
          type: "dem",
          steps: { "Noise Reduction": "Waiting", "Georeferencing": "Waiting", "Resampling": "Waiting", "Normalization": "Waiting", "Quality Check": "Waiting" },
          preview: {
            rawLabel: "Raw DEM (Unaligned)",
            rawVisual: "radial-gradient(circle at 20% 20%, #442255, #110522)",
            processedLabel: "Aligned Heightmap",
            processedVisual: "radial-gradient(circle at 50% 50%, #8844aa, #110522)"
          }
        },
        {
          name: "Illumination Map",
          file: "illumination.tif",
          size: "415 MB",
          status: "Waiting",
          type: "illumination",
          steps: { "Noise Reduction": "Waiting", "Georeferencing": "Waiting", "Resampling": "Waiting", "Normalization": "Waiting", "Quality Check": "Waiting" },
          preview: {
            rawLabel: "Raw Sunlight Ratio",
            rawVisual: "linear-gradient(90deg, #443311, #111)",
            processedLabel: "Normalized Scale (0-1)",
            processedVisual: "linear-gradient(90deg, #ffcc00, #111)"
          }
        }
      ],
      systemPerf: {
        cpu: "45%",
        ram: "2.1 / 7.9 GB",
        io: "92 MB/s",
      },
    };

    return ctx;
  }

  const prep = ctx.preprocessing;
  const currentIdx = prep.stages.findIndex((s) => s.status === "current");

  if (currentIdx !== -1) {
    const stage = prep.stages[currentIdx];
    stage.status = "completed";

    // Update datasets steps
    if (currentIdx === 0) {
      prep.datasets[0].steps["Noise Reduction"] = "Completed";
      prep.datasets[0].steps["Georeferencing"] = "Running";
    } else if (currentIdx === 1) {
      prep.datasets[0].steps["Georeferencing"] = "Completed";
      prep.datasets[0].steps["Resampling"] = "Running";
      prep.datasets[1].status = "Processing";
      prep.datasets[1].steps["Noise Reduction"] = "Completed";
      prep.datasets[1].steps["Georeferencing"] = "Running";
    } else if (currentIdx === 2) {
      prep.datasets[0].steps["Resampling"] = "Completed";
      prep.datasets[0].steps["Normalization"] = "Running";
      prep.datasets[1].steps["Georeferencing"] = "Completed";
      prep.datasets[1].steps["Resampling"] = "Running";
      prep.datasets[2].status = "Processing";
      prep.datasets[2].steps["Noise Reduction"] = "Completed";
      prep.datasets[2].steps["Georeferencing"] = "Running";
    } else if (currentIdx === 3) {
      prep.datasets[0].steps["Normalization"] = "Completed";
      prep.datasets[1].steps["Resampling"] = "Completed";
      prep.datasets[1].steps["Normalization"] = "Running";
      prep.datasets[2].steps["Georeferencing"] = "Completed";
      prep.datasets[2].steps["Resampling"] = "Running";
      prep.datasets[3].status = "Processing";
      prep.datasets[3].steps["Noise Reduction"] = "Completed";
    } else if (currentIdx === 4) {
      prep.datasets[0].steps["Quality Check"] = "Completed";
      prep.datasets[1].steps["Normalization"] = "Completed";
      prep.datasets[1].steps["Quality Check"] = "Running";
      prep.datasets[2].steps["Resampling"] = "Completed";
      prep.datasets[2].steps["Normalization"] = "Running";
      prep.datasets[3].steps["Georeferencing"] = "Completed";
      prep.datasets[3].steps["Resampling"] = "Running";
    }

    if (currentIdx + 1 < prep.stages.length) {
      prep.stages[currentIdx + 1].status = "current";
      prep.summary.completedCount = `${currentIdx + 1} / 6`;
      prep.summary.elapsedTime = `00:00:0${(currentIdx + 2) * 2}`;
      prep.summary.leftTime = `00:00:0${(6 - currentIdx - 2) * 2}`;
    } else {
      prep.summary.completedCount = "6 / 6";
      prep.summary.elapsedTime = "00:00:12";
      prep.summary.leftTime = "00:00:00";
      prep.summary.integrity = "Passed";

      for (const d of prep.datasets) {
        d.status = "Completed";
        for (const k of Object.keys(d.steps)) {
          d.steps[k] = "Completed";
        }
      }

      const radarDataset = ctx.upload.datasets.find((d) => d.type === "radar");
      const radarFileName = radarDataset ? radarDataset.file : "dfsar_demo_input.tif";
      const isDemo = radarFileName === "dfsar_demo_input.tif";

      const { MissionPipeline } = await import("../backend/processing/MissionPipeline");
      ctx.processedResults = await MissionPipeline.runPipeline(
        isDemo,
        ctx.name,
        ctx.region,
        radarFileName
      );

      ctx.status = "ready";
      ctx.progress = 20;
      ctx.currentModule = "Radar Analysis";
    }
  }

  const seconds = new Date().getSeconds();
  prep.systemPerf = {
    cpu: `${30 + (seconds % 45)}%`,
    ram: `${(2.1 + (seconds % 8) / 10).toFixed(1)} / 7.9 GB`,
    io: `${75 + (seconds % 40)} MB/s`,
  };

  return ctx;
}
