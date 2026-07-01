import { MissionContext } from "@/lib/types";

export function processMissionSimulation(ctx: MissionContext): MissionContext {
  // Always regenerate or initialize simulation results to keep them in sync with current mission workspace
  ctx.currentModule = "Mission Simulation";
  ctx.progress = 95;
  ctx.lastUpdated = new Date().toLocaleString();

  const w = ctx.preprocessedDem?.width || 800;
  const h = ctx.preprocessedDem?.height || 450;

  // Coordinate conversion from Gemini percentages (0-100) to actual raster pixel coordinates
  const scaleX = (pct: number) => Math.round((pct / 100) * w);
  const scaleY = (pct: number) => Math.round((pct / 100) * h);
  const scaleR = (pct: number) => Math.round((pct / 100) * Math.min(w, h));

  const ai = ctx.aiAnalysis || {
    large_craters: [
      { x: 50, y: 50, radius: 20 },
      { x: 25, y: 30, radius: 10 },
      { x: 75, y: 70, radius: 8 }
    ],
    boulder_regions: [
      { x: 40, y: 65, radius: 12 },
      { x: 60, y: 35, radius: 8 }
    ],
    safe_regions: [
      { x: 15, y: 75, radius: 15 },
      { x: 80, y: 25, radius: 12 }
    ],
    hazard_regions: [
      { x: 50, y: 50, radius: 20 },
      { x: 40, y: 65, radius: 12 },
      { x: 60, y: 35, radius: 8 }
    ]
  };

  const craters = (ai.large_craters || []).map((c: any) => ({
    x: scaleX(c.x),
    y: scaleY(c.y),
    radius: scaleR(c.radius)
  }));

  const boulderRegions = (ai.boulder_regions || []).map((b: any) => ({
    x: scaleX(b.x),
    y: scaleY(b.y),
    radius: scaleR(b.radius)
  }));

  const safeRegions = (ai.safe_regions || []).map((s: any) => ({
    x: scaleX(s.x),
    y: scaleY(s.y),
    radius: scaleR(s.radius)
  }));

  const hazards = (ai.hazard_regions || []).map((hz: any) => ({
    x: scaleX(hz.x),
    y: scaleY(hz.y),
    radius: scaleR(hz.radius)
  }));

  const landingSite = ctx.processedResults?.landingOptimization?.topSite || { x: scaleX(15), y: scaleY(75) };
  
  const pathPoints = ctx.processedResults?.roverNavigation?.pathPoints || [
    { x: landingSite.x, y: landingSite.y },
    { x: scaleX(30), y: scaleY(60) },
    { x: scaleX(45), y: scaleY(40) },
    { x: scaleX(60), y: scaleY(30) },
    { x: scaleX(80), y: scaleY(25) }
  ];

  const target = {
    x: pathPoints[pathPoints.length - 1].x,
    y: pathPoints[pathPoints.length - 1].y
  };

  const formattedWaypoints = (ctx.processedResults?.roverNavigation?.waypoints || []).map((wp: any) => ({
    id: wp.l,
    x: wp.cx,
    y: wp.cy
  }));

  const distanceVal = ctx.processedResults?.roverNavigation?.pathSummary?.["Total Distance"] || "1.48 km";
  const distance = parseFloat(distanceVal) * 1000; // converted to meters

  const timeStr = ctx.processedResults?.roverNavigation?.pathSummary?.["Estimated Time"] || "18m 32s";
  let estTimeMin = 18;
  if (timeStr.includes("h")) {
    const parts = timeStr.split("h");
    estTimeMin = parseFloat(parts[0]) * 60;
    if (parts[1] && parts[1].includes("m")) {
      estTimeMin += parseFloat(parts[1].split("m")[0]);
    }
  } else if (timeStr.includes("m")) {
    estTimeMin = parseFloat(timeStr.split("m")[0]);
  }

  const batteryCurve = Array.from({ length: 30 }, (_, i) => ({
    t: i,
    battery: 100 - i * 1.2 - Math.sin(i / 3) * 2,
  }));

  ctx.missionSimulation = {
    width: w,
    height: h,
    landingSite,
    target,
    waypoints: formattedWaypoints,
    pathPoints,
    hazards,
    craters,
    safeRegions,
    boulderRegions,
    distance,
    estimatedTime: estTimeMin,
    energyCurve: batteryCurve,
    backgroundImage: ctx.processedResults?.terrainAnalysis?.slopeImage || null,
    environment: {
      "Surface Temperature": "-183 °C",
      "Illumination": ctx.processedResults?.landingOptimization?.topSite 
        ? `${ctx.processedResults.landingOptimization.topSite.illum}%` 
        : "89%",
      "Solar Elevation": "12.4°",
      "Comm Delay": "1.28 sec",
      "Dust Activity": "Low",
    },
    systems: [
      { name: "Mobility System", status: "Nominal" },
      { name: "Navigation System", status: "Nominal" },
      { name: "Communication", status: "Nominal" },
      { name: "Science Payload", status: "Nominal" },
      { name: "Thermal System", status: "Nominal" },
      { name: "Power System", status: "Nominal" },
    ],
    collection: {
      target: "Water Ice (H₂O)",
      estimated: ctx.processedResults?.resourceEstimation?.waterMass || "115 ± 16 M kg"
    }
  };

  return ctx;
}
