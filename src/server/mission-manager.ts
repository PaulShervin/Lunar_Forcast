import { MissionContext } from "@/lib/types";

export class MissionManager {
  private static activeContext: MissionContext | null = null;

  public static getActiveMission(): MissionContext | null {
    return this.activeContext;
  }

  public static createMission(name: string, objective: string, region: string): MissionContext {
    const id = `LM-${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    
    this.activeContext = {
      id,
      name,
      objective,
      region,
      status: "created",
      progress: 0,
      lastUpdated: new Date().toLocaleString(),
      currentModule: "Upload",
      upload: {
        stages: [
          { key: "upload", label: "Upload File", sub: "Waiting for DFSAR image...", status: "pending" },
          { key: "locate", label: "Locate Supporting Datasets", sub: "Awaiting upload...", status: "pending" },
          { key: "validate", label: "Dataset Validation", sub: "Awaiting upload...", status: "pending" },
          { key: "workspace", label: "Initialize Workspace", sub: "Awaiting upload...", status: "pending" },
        ],
        datasets: [],
        totalSize: "0 MB"
      }
    };
    return this.activeContext;
  }

  public static updateContext(update: Partial<MissionContext>) {
    if (this.activeContext) {
      this.activeContext = { ...this.activeContext, ...update } as MissionContext;
    }
  }

  public static reset() {
    this.activeContext = null;
  }
}
