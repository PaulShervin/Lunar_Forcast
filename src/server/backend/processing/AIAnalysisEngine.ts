import * as fs from "node:fs";
import * as path from "node:path";
import { MissionContext } from "../core/MissionContext";
import { GeminiService, GeminiAnalysisResult } from "../services/GeminiService";

export class AIAnalysisEngine {
  static async analyze(ctx: MissionContext, radarFileName?: string): Promise<GeminiAnalysisResult> {
    console.log(`[AIAnalysisEngine] Starting AI analysis for mission ${ctx.id}...`);

    const workspacePath = path.resolve(`backend/uploads/mission-${ctx.id}/input`);
    const files = fs.readdirSync(workspacePath);

    // Find the uploaded image (radar or optical)
    const uploadedFile = files.find(
      (f) =>
        f !== "ohrc.tif" &&
        f !== "dem.tif" &&
        f !== "slope_map.tif" &&
        f !== "roughness_map.tif" &&
        f !== "illumination.tif" &&
        f !== "mission.json" &&
        (f.endsWith(".tif") || f.endsWith(".tiff") || f.endsWith(".png") || f.endsWith(".jpg") || f.endsWith(".jpeg"))
    );

    if (!uploadedFile) {
      console.warn("[AIAnalysisEngine] No uploaded image found in workspace. Using default fallback.");
      return this.getFallbackAnalysis();
    }

    const filePath = path.join(workspacePath, uploadedFile);
    const buffer = fs.readFileSync(filePath);

    // Determine MIME type
    let mimeType = "image/png";
    if (uploadedFile.endsWith(".jpg") || uploadedFile.endsWith(".jpeg")) {
      mimeType = "image/jpeg";
    } else if (uploadedFile.endsWith(".tif") || uploadedFile.endsWith(".tiff")) {
      mimeType = "image/tiff";
    }

    try {
      const result = await GeminiService.analyzeImage(buffer, mimeType);
      if (result) {
        ctx.aiAnalysis = result;
        ctx.aiAnalysisFallback = false;
        console.log("[AIAnalysisEngine] AI Analysis succeeded.");
        return result;
      }
    } catch (err: any) {
      console.error("[AIAnalysisEngine] Gemini Service call threw an error:", err.message);
    }

    // Fallback if Gemini fails
    console.warn("[AIAnalysisEngine] Gemini analysis failed. Enabling Limited Analysis Mode.");
    const fallback = this.getFallbackAnalysis();
    ctx.aiAnalysis = fallback;
    ctx.aiAnalysisFallback = true;
    return fallback;
  }

  private static getFallbackAnalysis(): GeminiAnalysisResult {
    return {
      terrain_type: "Polar Crater (Limited Analysis Mode)",
      crater_count: 5,
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
        { x: 50, y: 50, radius: 20 }, // Crater center is hazardous
        { x: 40, y: 65, radius: 12 }, // Boulders are hazardous
        { x: 60, y: 35, radius: 8 }
      ],
      shadow_regions: [
        { x: 50, y: 50, radius: 18 } // Inside crater is shadowed
      ],
      illumination_level: "Low",
      surface_roughness: "Moderate",
      possible_ice_regions: [
        { x: 50, y: 50, radius: 15 } // Shadows have ice probability
      ],
      confidence: 0.5,
      summary: "AI analysis unavailable. Limited analysis mode enabled. Craters, hazards, and safe regions estimated using default parameters."
    };
  }
}
