import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      // Handle POST /api/upload
      if (url.pathname === "/api/upload" && request.method === "POST") {
        try {
          const formData = await request.formData();
          const file = formData.get("file") as File | null;
          if (!file) {
            return new Response(JSON.stringify({ error: "No file uploaded" }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }

          const { handleUploadPipeline } = await import("./server/api/endpoints");
          const result = await handleUploadPipeline(file);
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      }

      // Handle POST /api/analyze
      if (url.pathname === "/api/analyze" && request.method === "POST") {
        try {
          const { MissionManager } = await import("./server/mission-manager");
          const mctx = MissionManager.getActiveMission();
          if (!mctx) {
            return new Response(JSON.stringify({ error: "No active mission context found" }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }

          const radarDataset = mctx.upload.datasets.find((d) => d.type === "radar");
          const radarFileName = radarDataset ? radarDataset.file : "dfsar_demo_input.tif";
          const isDemo = radarFileName === "dfsar_demo_input.tif";

          const { MissionPipeline } = await import("./server/backend/processing/MissionPipeline");
          mctx.processedResults = await MissionPipeline.runPipeline(
            isDemo,
            mctx.name,
            mctx.region,
            radarFileName
          );
          mctx.status = "ready";

          return new Response(JSON.stringify({
            status: "success",
            aiAnalysis: mctx.processedResults.aiAnalysis,
            aiAnalysisFallback: mctx.processedResults.aiAnalysisFallback,
          }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      }

      // Handle GET /api/terrain
      if (url.pathname === "/api/terrain" && request.method === "GET") {
        const { MissionManager } = await import("./server/mission-manager");
        const mctx = MissionManager.getActiveMission();
        if (!mctx || !mctx.processedResults) {
          return new Response(JSON.stringify({ error: "No processed terrain results found" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
        return new Response(JSON.stringify(mctx.processedResults.terrainAnalysis), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      // Handle GET /api/landing
      if (url.pathname === "/api/landing" && request.method === "GET") {
        const { MissionManager } = await import("./server/mission-manager");
        const mctx = MissionManager.getActiveMission();
        if (!mctx || !mctx.processedResults) {
          return new Response(JSON.stringify({ error: "No processed landing results found" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
        return new Response(JSON.stringify(mctx.processedResults.landingOptimization), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      // Handle GET /api/navigation
      if (url.pathname === "/api/navigation" && request.method === "GET") {
        const { MissionManager } = await import("./server/mission-manager");
        const mctx = MissionManager.getActiveMission();
        if (!mctx || !mctx.processedResults) {
          return new Response(JSON.stringify({ error: "No processed navigation results found" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
        return new Response(JSON.stringify(mctx.processedResults.roverNavigation), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      // Handle GET /api/report
      if (url.pathname === "/api/report" && request.method === "GET") {
        const { MissionManager } = await import("./server/mission-manager");
        const mctx = MissionManager.getActiveMission();
        if (!mctx || !mctx.processedResults) {
          return new Response(JSON.stringify({ error: "No processed mission report found" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
        return new Response(JSON.stringify(mctx.processedResults.missionReport), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      // Handle GET /api/mission/{mission_id}
      if (url.pathname.startsWith("/api/mission/") && request.method === "GET") {
        const parts = url.pathname.split("/");
        const missionId = parts[parts.length - 1];

        const { MissionManager } = await import("./server/mission-manager");
        const fs = await import("node:fs");
        const path = await import("node:path");

        const mctx = MissionManager.getActiveMission();
        if (!mctx || mctx.id !== missionId) {
          return new Response(JSON.stringify({ error: `Mission ${missionId} not found` }), {
            status: 404,
            headers: { "content-type": "application/json" },
          });
        }

        const workspacePath = `backend/uploads/mission-${mctx.id}`;
        const inputDir = path.resolve(workspacePath, "input");
        const uploadedFiles = fs.existsSync(inputDir) ? fs.readdirSync(inputDir) : [];

        const metadata = mctx.processedResults?.metadata || null;

        return new Response(
          JSON.stringify({
            workspace_path: workspacePath,
            uploaded_files: uploadedFiles,
            processing_status: mctx.status,
            validation_status: mctx.upload.stages.find((s) => s.key === "validate")?.status || "pending",
            dataset_metadata: metadata,
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          }
        );
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
