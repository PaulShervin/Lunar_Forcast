import * as crypto from "node:crypto";

export interface GeminiAnalysisResult {
  terrain_type: string;
  crater_count: number;
  large_craters: Array<{ x: number; y: number; radius: number }>;
  boulder_regions: Array<{ x: number; y: number; radius: number }>;
  safe_regions: Array<{ x: number; y: number; radius: number }>;
  hazard_regions: Array<{ x: number; y: number; radius: number }>;
  shadow_regions: Array<{ x: number; y: number; radius: number }>;
  illumination_level: string;
  surface_roughness: string;
  possible_ice_regions: Array<{ x: number; y: number; radius: number }>;
  confidence: number;
  summary: string;
}

export class GeminiService {
  private static cache = new Map<string, GeminiAnalysisResult>();

  static async analyzeImage(imageBuffer: Buffer, mimeType: string): Promise<GeminiAnalysisResult | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    const isPlaceholder = !apiKey || 
      apiKey.toLowerCase().includes("your_") || 
      apiKey.toLowerCase().includes("placeholder") || 
      apiKey.toLowerCase().includes("insert") || 
      apiKey.trim().length < 15;

    if (isPlaceholder) {
      console.warn("GEMINI_API_KEY is not configured or is a placeholder. Falling back to limited analysis mode.");
      return null;
    }

    // 1. Compute MD5 hash of image buffer for caching
    const hash = crypto.createHash("md5").update(imageBuffer).digest("hex");
    if (this.cache.has(hash)) {
      console.log(`[GeminiService] Cache hit for image hash: ${hash}`);
      return this.cache.get(hash)!;
    }

    const base64Data = imageBuffer.toString("base64");

    const prompt = `
      You are an expert planetary remote sensing scientist and lunar geologist.
      Analyze the provided high-resolution lunar surface image.
      Identify visible geological and operational features on the surface:
      1. Surface morphology and terrain type.
      2. Craters: Count them, and locate the center coordinates (x, y) and radius of the largest visible craters.
      3. Boulder fields or rocky clusters.
      4. Terrain roughness and illumination levels.
      5. Permanently Shadowed Regions (PSR) or dark craters.
      6. Flat, safe landing zones (smooth, level surfaces).
      7. Hazardous regions (steep crater walls, boulder fields, dense craters, deep shadows).
      8. Possible ice-bearing regions (e.g. shadowed areas inside polar craters).
      
      CRITICAL COORDINATE SPECIFICATION:
      For all coordinates (x, y) and radius, specify them as percentages of the image dimensions from 0 to 100.
      - (0, 0) is the TOP-LEFT corner of the image.
      - (100, 100) is the BOTTOM-RIGHT corner of the image.
      - X represents horizontal position (left-to-right).
      - Y represents vertical position (top-to-bottom).
      - Radius is specified as a percentage of the image width.
    `;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            terrain_type: { type: "STRING", description: "Primary geological terrain type (e.g., highland, mare, polar crater)" },
            crater_count: { type: "INTEGER", description: "Total number of visible craters in the scene" },
            large_craters: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  x: { type: "NUMBER", description: "Center X coordinate in percent (0-100)" },
                  y: { type: "NUMBER", description: "Center Y coordinate in percent (0-100)" },
                  radius: { type: "NUMBER", description: "Radius in percent (0-100)" }
                },
                required: ["x", "y", "radius"]
              }
            },
            boulder_regions: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  x: { type: "NUMBER", description: "Center X in percent (0-100)" },
                  y: { type: "NUMBER", description: "Center Y in percent (0-100)" },
                  radius: { type: "NUMBER", description: "Radius of influence in percent (0-100)" }
                },
                required: ["x", "y", "radius"]
              }
            },
            safe_regions: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  x: { type: "NUMBER", description: "Center X in percent (0-100)" },
                  y: { type: "NUMBER", description: "Center Y in percent (0-100)" },
                  radius: { type: "NUMBER", description: "Radius of safe zone in percent (0-100)" }
                },
                required: ["x", "y", "radius"]
              }
            },
            hazard_regions: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  x: { type: "NUMBER", description: "Center X in percent (0-100)" },
                  y: { type: "NUMBER", description: "Center Y in percent (0-100)" },
                  radius: { type: "NUMBER", description: "Radius of danger zone in percent (0-100)" }
                },
                required: ["x", "y", "radius"]
              }
            },
            shadow_regions: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  x: { type: "NUMBER", description: "Center X in percent (0-100)" },
                  y: { type: "NUMBER", description: "Center Y in percent (0-100)" },
                  radius: { type: "NUMBER", description: "Radius in percent (0-100)" }
                },
                required: ["x", "y", "radius"]
              }
            },
            illumination_level: { type: "STRING", description: "Qualitative level of sun illumination (High, Medium, Low, Shadowed)" },
            surface_roughness: { type: "STRING", description: "Qualitative surface roughness (Smooth, Moderate, Extremely Rough)" },
            possible_ice_regions: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  x: { type: "NUMBER", description: "Center X in percent (0-100)" },
                  y: { type: "NUMBER", description: "Center Y in percent (0-100)" },
                  radius: { type: "NUMBER", description: "Radius in percent (0-100)" }
                },
                required: ["x", "y", "radius"]
              }
            },
            confidence: { type: "NUMBER", description: "Geological interpretation confidence score (0.0 to 1.0)" },
            summary: { type: "STRING", description: "A detailed geological summary of the scene" }
          },
          required: [
            "terrain_type",
            "crater_count",
            "large_craters",
            "boulder_regions",
            "safe_regions",
            "hazard_regions",
            "shadow_regions",
            "illumination_level",
            "surface_roughness",
            "possible_ice_regions",
            "confidence",
            "summary"
          ]
        }
      }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    let attempts = 0;
    const maxAttempts = 3;
    let delay = 1000;

    const startTime = Date.now();

    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`[GeminiService] Sending request to Gemini (Attempt ${attempts}/${maxAttempts})...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }).finally(() => {
          clearTimeout(timeoutId);
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Gemini API error (HTTP ${response.status}): ${errText}`);
        }

        const json = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error("Empty response from Gemini API");
        }

        const result = JSON.parse(text) as GeminiAnalysisResult;

        // Log request success metadata
        const duration = Date.now() - startTime;
        console.log(`[GeminiService] Request succeeded. Duration: ${duration}ms, Confidence: ${result.confidence}`);

        // Store in cache
        this.cache.set(hash, result);
        return result;
      } catch (err: any) {
        console.error(`[GeminiService] Attempt ${attempts} failed:`, err.message);
        if (attempts >= maxAttempts) {
          break;
        }
        console.log(`[GeminiService] Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }

    console.warn("[GeminiService] Max retry attempts reached. Falling back to limited analysis mode.");
    return null;
  }
}
