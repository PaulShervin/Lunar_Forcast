export type StageStatus = "completed" | "current" | "pending" | "error";

export interface Stage {
  key: string;
  label: string;
  status: StageStatus;
  path: string;
}

export interface MissionContext {
  id: string;
  name: string;
  objective: string;
  region: string;
  status: "created" | "uploading" | "processing" | "ready" | "error";
  progress: number;
  lastUpdated: string;
  currentModule: string;
  error_message?: string;
  processedResults?: any;
  preprocessedOhrc?: any;
  preprocessedDfsar?: any;
  preprocessedDem?: any;
  preprocessedIllum?: any;
  aiAnalysis?: any;
  aiAnalysisFallback?: boolean;

  // Sections populated by individual backend modules
  upload: {
    stages: Array<{ key: string; label: string; sub: string; status: StageStatus }>;
    datasets: Array<{ name: string; file: string; size: string; res: string; status: string; type: string }>;
    totalSize: string;
  };

  preprocessing?: {
    stages: Array<{ key: string; label: string; sub: string; status: "completed" | "current" | "pending" }>;
    summary: { completedCount: string; dataVolume: string; elapsedTime: string; leftTime: string; integrity: string };
    datasets: Array<{
      name: string;
      file: string;
      size: string;
      status: string;
      steps: Record<string, string>;
      type?: string;
      preview?: {
        rawLabel: string;
        rawVisual: string;
        processedLabel: string;
        processedVisual: string;
      };
    }>;
    systemPerf: { cpu: string; ram: string; io: string };
  };
  radarAnalysis?: {
    meanCpr: string;
    meanDop: string;
    highConfidenceIceArea: string;
    dataQuality: string;
    radarSignal: Array<{ t: number; low: number; high: number }>;
    algorithms: Array<{ name: string; status: string }>;
    cprImage?: string;
    dopImage?: string;
    iceImage?: string;
    totalAreaAnalysed?: string;
    avgIceProbability?: string;
  };
  terrainAnalysis?: {
    suitabilityScore: string;
    suitabilityBreakdown: { high: string; moderate: string; low: string; unsuitable: string };
    elevationProfile: Array<{ d: number; e: number }>;
    hazards: Array<{ label: string; level: string; count: number; tone: "success" | "warning" | "destructive" }>;
    hazardScore: string;
    slopeImage?: string;
    hazardImage?: string;

    safeRegions: Array<{ id: string; area: number; slope: number; suitability: number }>;
    distribution: Array<{ name: string; value: number; color: string }>;
  };
  landingOptimization?: {
    topSiteId: string;
    topSiteScore: string;
    topSiteArea: string;
    advantages: string[];
    radarChartData: Array<{ axis: string; v: number }>;
    candidateSites: Array<{ id: string; score: number; area: number; slope: number; illum: number; hazard: string; dist: number }>;
    landingImage?: string;
  };
  roverNavigation?: {
    waypoints: Array<{
      cx: number;
      cy: number;
      l: string;
      distFromPrev: string;
      difficulty: string;
      eta: string;
    }>;
    status: { battery: string; range: string; time: string; distance: string; speed: string };
    currentObjective: { title: string; desc: string };
    nextObjective: { title: string; dist: string };
    commStatus: { rover: string; lander: string; link: string };
    elevationProfile: Array<{ d: number; e: number }>;
    pathSummary: Record<string, string>;
    terrainLegend: Array<{ c: string; t: string; s: string; v: string }>;
    alerts: Array<{ t: string; d: string }>;
    roverImage?: string;
    pathPoints?: Array<{ x: number; y: number }>;
    landingSitePct?: { x: number; y: number };
    targetPct?: { x: number; y: number };
    width?: number;
    height?: number;
    diagnostics?: {
      totalRouteLength: string;
      traversalCost: number;
      hazardsAvoided: number;
      averageTerrainSlope: string;
      maximumSlope: string;
      safeTraversalPercentage: string;
      estimatedEnergyUsage: string;
    };
    statistics?: {
      distance: string;
      energy: string;
      eta: string;
      hazardsAvoided: string;
      averageSlope: string;
    };
  };
  resourceEstimation?: {
    target: { id: string; coord: string; dist: string };
    stats: { area: string; probability: string; depth: string; confidence: string };
    volumeEstimate: string;
    litersEstimate: string;
    waterMass: string;
    qualityIndicators: Record<string, string>;
    utilization: Array<{ label: string; v: number; icon?: any }>;
    volumeSummary: Record<string, string>;
    composition: Array<{ name: string; value: number; color: string }>;
    targetsComparison: Array<{ id: string; volume: string; quality: number; dist: number }>;
    iceImage?: string;
  };
  missionSimulation?: any;
  analytics?: {
    successProbability: string;
    energyReserve: string;
    traversedDistance: string;
    commUptime: string;
    commStatus: Array<{ name: string; status: string; tone: string }>;
    systemHealth: Array<{ name: string; status: string }>;
  };
  report?: {
    generatedAt: string;
    status: string;
    summaryText: string;
    highlights: string[];
    resourcesSummary: Array<{ name: string; value: string }>;
    reportImage?: string;

  };
}
