# 🚀 Lunar Mission Decision Support System (LMDSS)

[![Build Status](https://img.shields.io/badge/Build-Passing-success.svg?style=flat-square)](#)
[![React Version](https://img.shields.io/badge/React-19.2-blue.svg?style=flat-square)](#)
[![Tailwind Version](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8.svg?style=flat-square)](#)
[![Framework](https://img.shields.io/badge/Framework-TanStack%20Start-ff4154.svg?style=flat-square)](#)
[![Theme](https://img.shields.io/badge/Theme-ISRO%20Space%20Inspired-0d1117.svg?style=flat-square)](#)

An AI-powered, multi-criteria decision support and analytics platform designed to ingest raw **Chandrayaan-2** planetary datasets, identify subsurface water-ice deposits, optimize landing coordinates, and plot safe rover traversal trajectories on the lunar south pole.

Developed as an end-to-end analytical dashboard for space exploration, safety evaluation, and route planning.

---

## 🗺️ System Architecture Flow

The following diagram illustrates how planetary raw sensor inputs are aligned, processed, and piped into the decision support modules to output the final mission report:

```
[Raw Datasets] ──► DFSAR (Radar)  ──► Radar Intelligence (CPR, DOP) ──┐
               ──► DEM (Elevation)──► Terrain Analysis (Slope, Rugged)──┼─► [Landing Site Selection]
               ──► OHRC (Optical) ──► Ice & Resource Estimation      ──┤             │
               ──► Solar Map      ──► Illumination Profiles          ──┘             ▼
                                                                             [Rover path A*]
                                                                                     │
                                                                                     ▼
                                                                             [Mission Report]
```

---

## 🛠️ Core Features & Analytical Engines

### 1. Data Preprocessing Pipeline
- **Automatic Spatial Co-registration**: Aligns multiple heterogeneous planetary datasets (resolution range: 0.25 m/px to 20 m/px) onto a common coordinate system (**IAU_MOON_2015 / Polar**).
- **Automated Validation**: Integrates 6 stages of processing (file validation, radiometric correction, geometric correction, spatial alignment, speckle noise filtering, and GeoTIFF output generation).

### 2. Radar Intelligence Engine
- **DFSAR Processing**: Ingests Dual Frequency Synthetic Aperture Radar data.
- **Subsurface Assessment**: Computes Circular Polarization Ratio (CPR) and Degree of Polarization (DOP) to locate high-probability subsurface water-ice deposits.

### 3. Terrain Analysis Engine
- **DEM Profiling**: Ingests Digital Elevation Models to calculate slope gradients, ruggedness index, and elevation metrics.
- **Hazard Segmentation**: Categorizes steep slopes (> 15 degrees), crater boundaries, and rocky obstacles into a traversability cost grid.

### 4. Landing Site Optimization
- **Multi-Objective Ranking**: Filters candidates to evaluate optimal landing sites based on slope limits, CPR water-ice presence, thermal solar illumination, Earth communication line-of-sight, and surface roughness.
- **Ranked Candidates**: Provides detailed scoring for candidate sites, enabling mission planners to select the safest location.

### 5. Rover Navigation Traversal Trajectory
- **Dynamic Traversability Engine**: Employs an A* pathfinding algorithm on a cost-weighted terrain grid.
- **Risk Avoidance**: Computes optimal safety-critical rover paths from the chosen landing site to targeted water-ice deposits, incorporating slope-based traversal speed multipliers.

### 6. Resource & Volume Estimation
- **Geostatistical Models**: Evaluates estimated depth, total volume (in cubic meters), and weight of available water-ice resources at selected coordinates.

### 7. Clean Mission Report & PDF Export
- **Print Optimization**: Includes a customized print-ready layout that hides control panels, sidebars, and navigation headers, generating a clean and professional document.

---

## 💻 Technology Stack

- **Frontend Core**: React 19 (TypeScript), Zustand (State Management), TailwindCSS v4, Framer Motion (Transitions).
- **Routing & SSR**: TanStack Start (routing, server-side data loading, hydration).
- **Visualization**: Recharts (interactive performance/health analytics charts), Lucide React (Icons).
- **Backend Core**: TypeScript server modules for raster rendering, safety validation, path computation, and ISRO metadata storage.

---

## 🚀 Local Setup & Installation

### Prerequisites
- **Node.js** (v18 or higher) or **Bun** installed on your local machine.

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/PaulShervin/Lunar_Forcast.git
   cd Lunar_Forcast
   ```

2. **Install Dependencies**:
   Using npm:
   ```bash
   npm install
   ```
   Or using bun:
   ```bash
   bun install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory:
   ```env
   # Demo Mode Flag (set to true to run on pre-packaged hackathon datasets)
   VITE_DEMO_MODE=true

   # Google Gemini API Key (optional fallback for AI-driven terrain reports)
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open http://localhost:5173 in your browser to view the application.

5. **Build for Production**:
   ```bash
   npm run build
   npm run preview
   ```

---

## 📂 Project Structure

```
Lunar_Forcast/
├── public/                 # Pre-packaged demo dataset assets
├── src/
│   ├── components/
│   │   ├── app/            # Application layout, sidebar, and TopBar
│   │   └── ui/             # Core UI primitives (buttons, tables, panels)
│   ├── routes/             # TanStack file-based application routing
│   │   ├── _app.tsx        # Main application layout wrapper
│   │   ├── _app.dashboard.tsx
│   │   ├── _app.preprocessing.tsx
│   │   ├── _app.radar-analysis.tsx
│   │   ├── _app.terrain-analysis.tsx
│   │   ├── _app.landing-optimization.tsx
│   │   ├── _app.rover-navigation.tsx
│   │   ├── _app.resource-estimation.tsx
│   │   ├── _app.mission-report.tsx
│   │   └── _app.analytics.tsx
│   ├── server/             # Backend endpoints and analytical processors
│   │   ├── api/
│   │   └── modules/        # Module processing engines (radar, terrain, etc.)
│   ├── store/              # Zustand global application state variables
│   └── styles.css          # Styling system and Tailwind configurations
├── .env                    # Environment configuration
└── vite.config.ts          # Vite bundler parameters
```

---

## 📄 License

This project is licensed under the MIT License — see the local configuration for permissions. Built for the **Bharatiya Antariksh Hackathon**. Developed by **Team Stellaris**.
