                                                                                                                                import { MissionContext } from "@/lib/types";

export function processRoverNavigation(ctx: MissionContext): MissionContext {
  if (ctx.roverNavigation) return ctx;

  ctx.currentModule = "Rover Navigation";
  ctx.progress = 70;
  ctx.lastUpdated = new Date().toLocaleString();

  const elevationProfile = Array.from({ length: 25 }, (_, i) => ({
    d: i,
    e: -2300 + Math.sin(i / 2) * 800 + Math.cos(i / 1.3) * 300,
  }));

  if (ctx.processedResults && ctx.processedResults.roverStatus !== undefined) {
    const res = ctx.processedResults;
    ctx.roverNavigation = {
      waypoints: res.roverWaypoints,
      status: res.roverStatus,
      currentObjective: {
        title: "Ice Deposit #1",
        desc: "Traverse A* path to target coordinates",
      },
      nextObjective: {
        title: "Mission Complete",
        dist: "0 m",
      },
      commStatus: res.commStatus,
      elevationProfile: res.elevationProfile || elevationProfile,
      pathSummary: res.pathSummary,
      terrainLegend: [
        { c: "bg-success", t: "Safe Terrain", s: "Traversable area", v: "68.3%" },
        { c: "bg-warning", t: "Hazard Zone", s: "Steep slopes / Craters", v: "14.7%" },
        { c: "bg-muted-foreground", t: "Rough Terrain", s: "Slow movement", v: "10.9%" },
        { c: "bg-destructive", t: "Untraversable", s: "Avoid - High risk", v: "6.1%" },
      ],
      alerts: [
        { t: "A* Optimization Complete", d: "Optimal trajectory mapped avoiding steep gradients" }
      ],
      roverImage: res.roverImage,
      pathPoints: res.pathPoints,
      landingSitePct: res.landingSitePct,
      targetPct: res.targetPct,
      diagnostics: res.diagnostics,
      statistics: res.statistics,
      width: res.width,
      height: res.height,
    };
  } else {
    ctx.roverNavigation = {
      waypoints: [
        { cx: 320, cy: 160, l: "WP-1" },
        { cx: 420, cy: 195, l: "WP-2" },
        { cx: 520, cy: 245, l: "WP-3" },
        { cx: 600, cy: 320, l: "WP-5" },
      ],
      status: {
        battery: "72%",
        range: "2.41 km",
        time: "01:24:37",
        distance: "865 m",
        speed: "0.18 m/s",
      },
      currentObjective: {
        title: "Ice Deposit #1",
        desc: "Collect and analyze ice sample",
      },
      nextObjective: {
        title: "Ice Deposit #2",
        dist: "613 m",
      },
      commStatus: {
        rover: "Signal Strong",
        lander: "Signal Strong",
        link: "Strong",
      },
      elevationProfile,
      pathSummary: {
        "Total Distance": "1.48 km",
        "Estimated Time": "18 min 32 sec",
        "Energy Required": "18.6 Wh",
        "Terrain Difficulty": "Moderate",
        "Path Feasibility": "High",
      },
      terrainLegend: [
        { c: "bg-success", t: "Safe Terrain", s: "Traversable area", v: "68.3%" },
        { c: "bg-warning", t: "Hazard Zone", s: "Steep slopes / Craters", v: "14.7%" },
        { c: "bg-muted-foreground", t: "Rough Terrain", s: "Slow movement", v: "10.9%" },
        { c: "bg-destructive", t: "Untraversable", s: "Avoid - High risk", v: "6.1%" },
      ],
      alerts: [
        { t: "Large Crater Ahead", d: "Distance: 42 m" },
        { t: "Steep Slope Detected", d: "Slope: 24°" },
      ],
    };
  }

  return ctx;
}
