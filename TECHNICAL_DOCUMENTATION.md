# TECHNICAL DOCUMENTATION: LUNAR MISSION DECISION SUPPORT SYSTEM (LMDSS)
## ARCHITECTURE, ALGORITHMS, API SCHEMAS, AND DEPLOYMENT SPECIFICATIONS

LMDSS is a mission-planning and decision-support system designed to automate site evaluation, hazard analysis, path finding, and resource mapping in the lunar South Pole region (around Shackleton Crater). This document details every layer of the system.

---

## SECTION 1: ARCHITECTURAL DESIGN & DATAFLOWS

### 1.1 Overview
LMDSS uses an SSR (Server-Side Rendering) framework powered by **TanStack Start** and **Nitro**. Computational engines reside on the backend, while the client operates as a rich dashboard containing grid maps, chart visualizers, and interactive setup guides.

```
+---------------------------------------------------------------------------------+
|                               CLIENT (React 19)                                 |
|                                                                                 |
|  [Interactive Maps] <--- [Zustand Stores] <--- [React Query (1s Polling)]       |
+---------------------------------------------------------------------------------+
                                      |
                                      |  (RPC / REST HTTP Calls)
                                      v
+---------------------------------------------------------------------------------+
|                            SERVER (Nitro / Node.js)                             |
|                                                                                 |
|  [Custom HTTP Router (server.ts)]                                               |
|         |                                                                       |
|         +---> [Multipart /api/upload Manager]                                   |
|         |                                                                       |
|         +---> [RPC Router (TanStack Start Entry)]                               |
|                     |                                                           |
|                     +---> [Mission Manager] (In-Memory Session Store)           |
|                                 |                                               |
|                                 v                                               |
|                     [Mission Pipeline Orchestrator]                             |
|                                 |                                               |
|    +----------------------------+----------------------------+                  |
|    |                            |                            |                  |
|    v                            v                            v                  |
|  [Radar Engine]              [Terrain Engine]             [Landing Engine]      |
|  - Circular Polariz.         - Gradient Slope             - NSGA-II Weights     |
|  - Degree of Polariz.        - Lola DEM Processing        - Scoring Model       |
|    |                            |                            |                  |
|    +----------------------------+----------------------------+                  |
|                                 |                                               |
|                                 v                                               |
|                           [A* Path Router]                                      |
|                           - Slope Penalties                                     |
|                           - Solar-Weighted Heuristics                           |
|                                 |                                               |
|                                 v                                               |
|                           [Resource Estimator]                                  |
|                           - Ice Volume & Purity                                 |
|                           - Solar Power Yields                                  |
|                                 |                                               |
|                                 v                                               |
|                           [Gemini AI Report]                                    |
|                                                                                 |
+---------------------------------------------------------------------------------+
```

### 1.2 SSR Lifecycle & Hydration Flow
1. **Initial Request**: When a user accesses any page, the Nitro server intercepts the request.
2. **Server-Side Render (SSR)**: The server resolves the router context, injects the QueryClient, executes loaders, and renders React components into static HTML.
3. **HTML Streaming**: The HTML template is sent to the browser along with JS/CSS resource bundles.
4. **Hydration**: The browser parses the document, loads the script bundles, maps React event listeners to DOM elements, and initializes Zustand and React Query clients.

---

## SECTION 2: COMPREHENSIVE FILE MAP & MODULE RESPONSIBILITY

### 2.1 Server and Routing Entry Points
- [src/server.ts](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/server.ts): The main entry point for the backend. Parses incoming requests, manages API routers, and handles errors.
- [src/entry-server.tsx](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/entry-server.tsx): Server-side entry script that creates the HTML stream and runs SSR.
- [src/entry-client.tsx](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/entry-client.tsx): Client-side entry script that hydrates the browser-side React application.

### 2.2 Route Component Files (`src/routes/`)
- [__root.tsx](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/routes/__root.tsx): Top-level root layout. Injects global stylesheets, headers, and houses the global `ErrorComponent` which displays the interactive collapsible **Technical Details (Debug Log)**.
- [_app.tsx](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/routes/_app.tsx): Primary layout containing sidebar navigation.
- [_app.dashboard.tsx](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/routes/_app.dashboard.tsx): Summary screen presenting active session status, summary statistics, and navigation workflow links.
- [_app.new-mission.tsx](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/routes/_app.new-mission.tsx): Creation wizard to initialize new missions or select demo mode datasets.
- [_app.preprocessing.tsx](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/routes/_app.preprocessing.tsx): Preprocessing page. Visualizes raw DFSAR radar grids.
- [_app.radar-analysis.tsx](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/routes/_app.radar-analysis.tsx): Renders CPR and DOP maps. Displays charts analyzing scattering properties.
- [_app.terrain-analysis.tsx](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/routes/_app.terrain-analysis.tsx): Evaluates LOLA slope calculations. Renders caution and hazard indicators on grid maps.
- [_app.landing-optimization.tsx](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/routes/_app.landing-optimization.tsx): PresentsNSGA-II multi-objective candidate landing zones. Plots radar attributes.
- [_app.rover-navigation.tsx](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/routes/_app.rover-navigation.tsx): Plots A* route planning. Visualizes height metrics along the path.
- [_app.resource-estimation.tsx](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/routes/_app.resource-estimation.tsx): Calculates estimated water ice content and monthly solar energy levels.
- [_app.mission-report.tsx](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/routes/_app.mission-report.tsx): Compiles the final report card. Implements printable layout wrappers.
- [_app.settings.tsx](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/routes/_app.settings.tsx): Interface settings, Gemini API configurations, and Demo Mode toggles.

### 2.3 Shared Layouts and Global State
- [src/components/app/sidebar.tsx](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/components/app/sidebar.tsx): Main dashboard navigation panel.
- [src/components/app/topbar.tsx](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/components/app/topbar.tsx): Dashboard page header, displaying active mission name and target region.
- [src/store/mission-store.ts](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/store/mission-store.ts): Global Zustand state for tracking the active mission ID and title.
- [src/store/demo-store.ts](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/store/demo-store.ts): Global Zustand state for toggling system-wide Demo Mode behaviors.

### 2.4 Server Operations & Pipeline Module Functions (`src/server/`)
- [dataset-manager.ts](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/server/dataset-manager.ts): Validates local dataset availability. Generates fallback mock binary rasters at startup.
- [mission-manager.ts](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/server/mission-manager.ts): Simple static class managing current active session parameters in memory.
- [api/endpoints.ts](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/server/api/endpoints.ts): Exposes server functions to the frontend. Implements file copies for demo initialization.
- [backend/processing/DatasetLoader.ts](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/server/backend/processing/DatasetLoader.ts): Reads raster files from the workspace folder, falling back to cached demo assets.
- [backend/processing/ValidationEngine.ts](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/server/backend/processing/ValidationEngine.ts): Runs data validation on uploaded packages.
- [backend/processing/MissionPipeline.ts](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/server/backend/processing/MissionPipeline.ts): Coordinates the execution order of all analytical steps.
- [backend/services/GeminiService.ts](file:///e:/lunar-mission-planner-main/lunar-mission-planner-main/src/server/backend/services/GeminiService.ts): Connects to the Gemini API using structured JSON schemas.

---

## SECTION 3: MATHEMATICAL & ALGORITHMIC SPECIFICATIONS

### 3.1 Radar Polarimetric Engine (`src/server/backend/processing/MissionPipeline.ts`)
The system analyzes polarimetric synthetic aperture radar datasets using CPR (Circular Polarization Ratio) and DOP (Degree of Polarization) computations.

#### 1. Circular Polarization Ratio (CPR)
CPR is computed by taking the ratio of Left-Left circular polarization to Left-Right circular polarization:
$$\text{CPR}(x, y) = \frac{I_{LL}(x, y)}{I_{LR}(x, y)}$$
- **Volume Scattering (Ice)**: Backscatter returns with same-sense polarization ($LL$). Higher ice presence results in elevated CPR values (> 0.65).
- **Surface Scattering (Rock/Dust)**: Backscatter returns primarily with opposite-sense polarization ($LR$), yielding lower CPR values (< 0.4).

#### 2. Degree of Polarization (DOP)
DOP measures the polarization state of the returned radar waves:
$$\text{DOP}(x, y) = \sqrt{1 - 4 \cdot \frac{I_{LL} \cdot I_{LR} - |I_{cross}|^2}{(I_{LL} + I_{LR})^2}}$$
- **Low DOP (< 0.3)** suggests volume scattering (like ice).
- **High DOP (> 0.7)** suggests surface scattering.

---

### 3.2 Terrain Slope & Hazard Matrix (`src/server/backend/processing/MissionPipeline.ts`)
Local slope angles are calculated using height differences in the LOLA Digital Elevation Model (DEM) across neighboring cells.

#### 1. Horn's Slope Formulation
For each elevation cell $(x, y)$, the rate of change in the East-West ($dz/dx$) and North-South ($dz/dy$) directions is calculated:
$$\frac{dz}{dx} = \frac{(z_{x+1, y-1} + 2z_{x+1, y} + z_{x+1, y+1}) - (z_{x-1, y-1} + 2z_{x-1, y} + z_{x-1, y+1})}{8 \cdot \text{CellSize}}$$
$$\frac{dz}{dy} = \frac{(z_{x-1, y+1} + 2z_{x, y+1} + z_{x+1, y+1}) - (z_{x-1, y-1} + 2z_{x, y-1} + z_{x+1, y-1})}{8 \cdot \text{CellSize}}$$

The local slope angle in degrees is calculated as:
$$\theta = \arctan\left(\sqrt{\left(\frac{dz}{dx}\right)^2 + \left(\frac{dz}{dy}\right)^2}\right) \times \frac{180}{\pi}$$

#### 2. Hazard Overlay Map Classification
- **Safe Zone (Green)**: $\theta \le 10^{\circ}$ and surface roughness $\le 0.3$.
- **Caution Zone (Orange)**: $10^{\circ} < \theta \le 15^{\circ}$ or surface roughness between $0.3$ and $0.6$.
- **Hazard Zone (Red)**: $\theta > 15^{\circ}$ or surface roughness $> 0.6$. Traversal through these cells is blocked.

---

### 3.3 Landing Site Multi-Objective Optimization (`src/server/backend/processing/MissionPipeline.ts`)
Finding candidate landing zones is modeled as a multi-objective optimization problem. Candidate sites are evaluated based on their coordinates $(x,y)$:

$$\text{Score}(x, y) = w_1 \cdot \text{SlopeScore}(x, y) + w_2 \cdot \text{IlluminationScore}(x, y) - w_3 \cdot \text{HazardScore}(x, y) - w_4 \cdot \text{IceProximity}(x, y)$$

Where:
- **SlopeScore**: Inverse linear mapping of slope values up to $15^{\circ}$.
- **IlluminationScore**: Percentage of yearly illumination hours.
- **HazardScore**: Local density of hazard-classified pixels.
- **IceProximity**: Euclidean distance to the nearest verified water ice deposit.
- **Weights**: Default configuration: $w_1 = 0.4$, $w_2 = 0.3$, $w_3 = 0.2$, $w_4 = 0.1$.

---

### 3.4 Rover Pathfinding Engine (`src/server/backend/processing/MissionPipeline.ts`)
The rover route planner uses a custom weighted A* pathfinding algorithm.

#### 1. Evaluation Function
$$f(n) = g(n) + h(n)$$
Where:
- $g(n)$ is the cost from start to node $n$.
- $h(n)$ is the heuristic cost from node $n$ to the target.

#### 2. Weighted Cost Calculation
The movement cost from cell $u$ to cell $v$ is calculated based on distance and local terrain slope:
$$Cost(u \to v) = \text{Distance}(u, v) \times \left(1 + \alpha \cdot \text{Slope}(v)^2\right)$$
- If $\text{Slope}(v) > 15^{\circ}$, $Cost(u \to v) = \infty$ (impassable barrier).
- $\alpha = 0.05$ (weight factor for steep slopes).

---

### 3.5 Resource & Energy Estimation (`src/server/backend/processing/MissionPipeline.ts`)

#### 1. Subsurface Water-Ice Mass
$$M_{ice} = A_{cpr} \times D \times P \times \rho_{ice}$$
Where:
- $A_{cpr}$: Surface area of cells with CPR $> 0.65$ ($\text{m}^2$).
- $D$: Estimated soil depth overlay (default $= 2.0\text{ m}$).
- $P$: Average water-ice purity factor (default $= 0.056$ or $5.6\%$).
- $\rho_{ice}$: Density of ice-lunar regolith mixture ($\approx 917\text{ kg/m}^3$).

#### 2. Solar Energy Generation
$$E_{solar} = P_{rated} \times H_{illum} \times \eta \times N_{panels}$$
Where:
- $P_{rated}$: Peak panel output (default $= 0.25\text{ kW}$).
- $H_{illum}$: Total illumination hours for the selected target coordinate.
- $\eta$: Efficiency drop factor due to dust accumulation ($\approx 0.85$).
- $N_{panels}$: Panel count (default $= 4$ panels).

---

## SECTION 4: CLIENT-SERVER API SCHEMAS

### 4.1 REST Endpoints

#### 1. Binary File Upload
- **Method**: `POST`
- **Path**: `/api/upload`
- **Request Headers**: `Content-Type: multipart/form-data`
- **Request Body**:
  ```
  file: [Binary File Stream (.tif)]
  ```
- **Response Headers**: `Content-Type: application/json`
- **Response (Success 200)**:
  ```json
  {
    "status": "success",
    "filename": "dfsar_demo_input_1623910.tif",
    "size": "10.4 KB"
  }
  ```
- **Response (Error 500)**:
  ```json
  {
    "error": "No active mission session found. Please initialize a mission first."
  }
  ```

---

#### 2. Run Pipeline Processing
- **Method**: `POST`
- **Path**: `/api/analyze`
- **Response Headers**: `Content-Type: application/json`
- **Response (Success 200)**:
  ```json
  {
    "status": "success",
    "aiAnalysis": "The landing area LZ-01 exhibits safety parameters...",
    "aiAnalysisFallback": false
  }
  ```

---

#### 3. Fetch Terrain Overlays
- **Method**: `GET`
- **Path**: `/api/terrain`
- **Response Headers**: `Content-Type: application/json`
- **Response (Success 200)**:
  ```json
  {
    "resolution": "5.0 m/px",
    "averageSlope": 4.82,
    "hazardPercentage": 12.45,
    "slopeHistogram": [
      { "bin": "0-3°", "count": 124 },
      { "bin": "3-6°", "count": 284 }
    ]
  }
  ```

---

#### 4. Fetch Optimized Landing Zones
- **Method**: `GET`
- **Path**: `/api/landing`
- **Response Headers**: `Content-Type: application/json`
- **Response (Success 200)**:
  ```json
  {
    "topSiteId": "LZ-01",
    "topSiteScore": "0.92 / 1.00",
    "topSiteArea": "3.24 km²",
    "advantages": [
      "Very gentle slope (1.2°)",
      "High illumination (89%)"
    ],
    "candidateSites": [
      { "id": "LZ-01", "score": 0.92, "area": 3.24, "slope": 1.2, "illum": 89, "hazard": "Low", "dist": 12.4 }
    ]
  }
  ```

---

### 4.2 RPC Functions (TanStack Server Functions)
RPC functions are invoked like standard Javascript functions but executed on the server.

#### 1. createMissionFn
- **Signature**: `createMissionFn({ name: string, objective: string, region: string })`
- **Returns**: `MissionContext` object containing the generated mission configuration.

#### 2. getActiveMissionFn
- **Signature**: `getActiveMissionFn()`
- **Returns**: The current `MissionContext` object (or `null` if no active session exists).

#### 3. initializeDemoMissionFn
- **Signature**: `initializeDemoMissionFn()`
- **Returns**: A preconfigured `MissionContext` loaded with Shackleton Crater demo statistics.

---

## SECTION 5: DEPLOYMENT SPECIFICATIONS

LMDSS is packaged as a lightweight, production-ready bundle.

### 5.1 Compilation & Build Output
1. The compilation command (`vite build` / `npm run build`) triggers the Vite compiler.
2. Vite compiles the client assets and saves them to `dist/client`.
3. The Nitro plugin (`nitro/vite`) compiles the backend files and merges the client assets into a single directory:
   - **`.output/server/index.mjs`**: The main Node.js web server.
   - **`.output/public/`**: Stores optimized client JS/CSS bundles and assets.

---

### 5.2 Render Configuration
The repository includes a `render.yaml` configuration for Render deployment:

```yaml
services:
  - type: web
    name: lunar-forecast
    runtime: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: VITE_DEMO_MODE
        value: "true"
```

- **Build Phase**: Resolves dependencies and builds the bundle.
- **Run Phase**: Runs `node .output/server/index.mjs`. The server automatically binds to `0.0.0.0` and listens on Render's injected `$PORT` env variable.

---

## SECTION 6: TROUBLESHOOTING & SSR DEBUG INTERRUPTS

- **Port Binding Conflicts**: If port `3000` is already in use locally, launch the server using `PORT=4000 npm run start`.
- **File System Permissions**: Ensure the application folder has write permissions so the backend can create the `backend/uploads` directory.
- **Client-Side Debugging**: If the application crashes, the global `ErrorComponent` will display a collapsible panel showing the error message and stack trace directly in the browser.
