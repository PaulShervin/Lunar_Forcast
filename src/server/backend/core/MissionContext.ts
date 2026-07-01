import { RasterLayer } from "./RasterLayer";

export class MissionContext {
  public id: string;
  public name: string;
  public region: string;

  // Raw inputs
  public ohrc?: RasterLayer;
  public dfsar?: RasterLayer;
  public dem?: RasterLayer;
  public illumination?: RasterLayer;

  // Aligned inputs
  public alignedOhrc?: RasterLayer;
  public alignedDfsar?: RasterLayer;
  public alignedDem?: RasterLayer;
  public alignedIllum?: RasterLayer;

  // Preprocessed layers
  public preprocessedOhrc?: RasterLayer;
  public preprocessedDfsar?: RasterLayer;
  public preprocessedDem?: RasterLayer;
  public preprocessedIllum?: RasterLayer;

  // AI Analysis Results
  public aiAnalysis?: any;
  public aiAnalysisFallback?: boolean;

  // Derived Products & Masks
  public cpr?: RasterLayer;
  public dop?: RasterLayer;
  public slope?: RasterLayer;
  public aspect?: RasterLayer;
  public curvature?: RasterLayer;
  public roughness?: RasterLayer;
  public hillshade?: RasterLayer;
  public hazard?: RasterLayer;
  public iceProbability?: RasterLayer;
  public suitability?: RasterLayer;

  // AI-Derived Semantic Masks
  public craterMask?: RasterLayer;
  public boulderMask?: RasterLayer;
  public shadowMask?: RasterLayer;
  public flatMask?: RasterLayer;
  public hazardMask?: RasterLayer;
  public safeLandingMask?: RasterLayer;
  public terrainSegmentation?: RasterLayer;

  constructor(id: string, name: string, region: string) {
    this.id = id;
    this.name = name;
    this.region = region;
  }
}
