/**
 * Demo Asset Registry
 * ─────────────────────────────────────────────────────────────────────────────
 * Central mapping of demo image paths served from public/demo-data/.
 * These are the ONLY files that Demo Mode touches — nothing in this file
 * is referenced by production pipeline code.
 *
 * Folder structure:
 *   public/demo-data/
 *     ohrc/          ohrc_image.png
 *     dfsar/         dfsar_image.png
 *     dem/           dem_image.png
 *     illumination/  illumination_image.png
 *     terrain/       slope_map.png, hazard_map.png
 *     ice/           ice_probability.png
 *     landing/       landing_analysis.png
 *     rover/         rover_navigation.png
 *     report/        mission_summary.png
 *
 * TO REMOVE DEMO MODE: delete this file entirely. No other file imports it
 * outside of Demo Mode branches.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const DEMO_ASSETS = {
  /** Panel 1 — OHRC Optical Image (Chandrayaan-2) */
  ohrc: "/demo-data/ohrc/ohrc_image.png",

  /** Panel 2 — DFSAR Radar Backscatter Image */
  dfsar: "/demo-data/dfsar/dfsar_image.png",

  /** Panel 3 — Digital Elevation Model (TMC-2) */
  dem: "/demo-data/dem/dem_image.png",

  /** Panel 4 — Solar Illumination Map */
  illumination: "/demo-data/illumination/illumination_image.png",

  /** Panel 5 — Slope Map (degrees) */
  terrain: "/demo-data/terrain/slope_map.png",

  /** Panel 6 — Hazard Assessment Map */
  hazard: "/demo-data/terrain/hazard_map.png",

  /** Panel 7 — Ice Probability Map (CPR + DOP) */
  ice: "/demo-data/ice/ice_probability.png",

  /** Panel 8 — Landing Site Analysis */
  landing: "/demo-data/landing/landing_analysis.png",

  /** Panel 9 — Rover Navigation & Path Planning */
  rover: "/demo-data/rover/rover_navigation.png",

  /** Panel 10 — Mission Summary & Resource Estimation */
  report: "/demo-data/report/mission_summary.png",
} as const;

export type DemoAssetKey = keyof typeof DEMO_ASSETS;

/** Metadata labels shown alongside each demo image. */
export const DEMO_ASSET_META: Record<
  DemoAssetKey,
  { label: string; source: string; resolution: string }
> = {
  ohrc: {
    label: "OHRC Optical Image",
    source: "Instrument: OHRC | Chandrayaan-2",
    resolution: "~0.25 m/pixel",
  },
  dfsar: {
    label: "DFSAR Radar Image",
    source: "Instrument: DFSAR | Mode: High Resolution",
    resolution: "~10 m/pixel",
  },
  dem: {
    label: "Digital Elevation Model",
    source: "Instrument: TMC-2 | Product: DEM",
    resolution: "~5 m/pixel",
  },
  illumination: {
    label: "Illumination Map",
    source: "Derived from: DEM + Sun Geometry",
    resolution: "~20 m/pixel",
  },
  terrain: {
    label: "Slope Map (Degrees)",
    source: "Derived from: DEM",
    resolution: "~5 m/pixel",
  },
  hazard: {
    label: "Hazard Map",
    source: "Derived from: Slope + Illumination + Crater Density",
    resolution: "~5 m/pixel",
  },
  ice: {
    label: "Ice Probability Map",
    source: "Derived from: DFSAR (CPR & DOP Analysis)",
    resolution: "~10 m/pixel",
  },
  landing: {
    label: "Landing Site Analysis",
    source: "Scoring: Slope, Illumination, Hazard, Ice",
    resolution: "~5 m/pixel",
  },
  rover: {
    label: "Rover Navigation & Path Planning",
    source: "A* Algorithm on DEM + Hazard Map",
    resolution: "~5 m/pixel",
  },
  report: {
    label: "Mission Summary & Resource Estimation",
    source: "Chandrayaan-2 Polar Exploration | Site A",
    resolution: "10 km radius",
  },
};
