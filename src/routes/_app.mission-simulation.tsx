import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app/topbar";
import { Panel, StatusBadge } from "@/components/app/panel";
import { ArrowLeft, ArrowRight, Battery, Clock, Gauge, Hourglass, Check, MapPin } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getMissionSimulationDataFn } from "@/server/api/endpoints";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { DEMO_ASSETS } from "@/lib/demo-assets";

export const Route = createFileRoute("/_app/mission-simulation")({
  head: () => ({ meta: [{ title: "Mission Simulation — LMDSS" }] }),
  component: MissionSim,
});

function MissionSim() {
  const { data: context, isLoading } = useQuery({
    queryKey: ["missionSimulationData"],
    queryFn: () => getMissionSimulationDataFn(),
    refetchOnWindowFocus: false,
  });

  const defaultSimData = {
    width: 800,
    height: 450,
    landingSite: { x: 80, y: 250 },
    target: { x: 704, y: 270 },
    waypoints: [
      { id: "Landing", x: 80, y: 250 },
      { id: "W0", x: 180, y: 160 },
      { id: "W1", x: 290, y: 110 },
      { id: "W2", x: 410, y: 95 },
      { id: "W3", x: 530, y: 110 },
      { id: "W4", x: 630, y: 170 },
      { id: "Target", x: 704, y: 270 },
    ],
    pathPoints: [],
    hazards: [
      { x: 450, y: 235, radius: 75 },
      { x: 210, y: 260, radius: 45 },
      { x: 530, y: 300, radius: 35 }
    ],
    craters: [
      { x: 450, y: 235, radius: 75 },
      { x: 210, y: 260, radius: 45 }
    ],
    safeRegions: [
      { x: 100, y: 220, radius: 40 },
      { x: 700, y: 280, radius: 35 }
    ],
    boulderRegions: [
      { x: 300, y: 180, radius: 25 },
      { x: 600, y: 140, radius: 20 }
    ],
    distance: 4632,
    estimatedTime: 112,
    energyCurve: Array.from({ length: 30 }, (_, i) => ({
      t: i,
      battery: 100 - i * 1.2 - Math.sin(i / 3) * 2,
    })),
    backgroundImage: null,
    environment: {
      "Surface Temperature": "-183 °C",
      "Illumination": "92%",
      "Solar Elevation": "12.4°",
      "Comm Delay": "1.28 sec",
      "Dust Activity": "Low",
    },
    systems: [
      { name: "Mobility System", status: "Nominal" },
      { name: "Navigation System", status: "Nominal" },
      { name: "Communication", status: "Nominal" },
      { name: "Science Payload", status: "Nominal" },
      { name: "Thermal System", status: "Nominal" },
      { name: "Power System", status: "Nominal" },
    ],
    collection: {
      target: "Water Ice (H₂O)",
      estimated: "115 ± 16 M kg"
    }
  };

  const simData = context?.missionSimulation || defaultSimData;

  // Animation States
  const [currentSegment, setCurrentSegment] = useState(0);
  const [phase, setPhase] = useState<"rotating" | "moving" | "stopped" | "completed">("stopped");
  const [phaseProgress, setPhaseProgress] = useState(0);

  const waypoints = simData.waypoints || [];
  const numSegments = waypoints.length > 1 ? waypoints.length - 1 : 0;

  const waypointsStr = JSON.stringify(waypoints);
  useEffect(() => {
    setCurrentSegment(0);
    setPhase("stopped");
    setPhaseProgress(0);
  }, [waypointsStr]);

  // Helper to compute angle between two 2D points (Forward direction is along x+ axis / 0 degrees)
  const getAngle = (fromPt: { x: number; y: number }, toPt: { x: number; y: number }) => {
    if (!fromPt || !toPt) return 0;
    return Math.atan2(toPt.y - fromPt.y, toPt.x - fromPt.x) * (180 / Math.PI);
  };

  // State loop driver
  useEffect(() => {
    if (!waypoints || waypoints.length < 2 || phase === "completed") return;

    const tick = () => {
      setPhaseProgress((prev) => {
        const speed = phase === "rotating" ? 0.05 : phase === "moving" ? 0.015 : 0.03; // progress speed increments
        const next = prev + speed;
        if (next >= 1) {
          // Transition phases
          if (phase === "stopped") {
            setPhase("rotating");
            return 0;
          } else if (phase === "rotating") {
            setPhase("moving");
            return 0;
          } else if (phase === "moving") {
            if (currentSegment + 1 >= numSegments) {
              setPhase("completed");
              return 1;
            } else {
              setPhase("stopped");
              setCurrentSegment((s) => s + 1);
              return 0;
            }
          }
          return 1;
        }
        return next;
      });
    };

    const timer = setInterval(tick, 45); // ~22 frames per second
    return () => clearInterval(timer);
  }, [phase, currentSegment, numSegments, waypointsStr]); // Depend on waypointsStr instead of raw waypoints

  // Calculate position (rx, ry) and orientation (angle) in real-time safely
  let rx = waypoints[0]?.x ?? 0;
  let ry = waypoints[0]?.y ?? 0;
  let angle = 0;

  if (waypoints.length >= 2) {
    if (phase === "stopped") {
      const curr = Math.min(currentSegment, waypoints.length - 1);
      rx = waypoints[curr]?.x ?? 0;
      ry = waypoints[curr]?.y ?? 0;
      const fromPt = waypoints[Math.max(0, curr - 1)];
      const toPt = waypoints[curr];
      if (fromPt && toPt) angle = getAngle(fromPt, toPt);
    } else if (phase === "rotating") {
      const curr = Math.min(currentSegment, waypoints.length - 1);
      rx = waypoints[curr]?.x ?? 0;
      ry = waypoints[curr]?.y ?? 0;
      const fromPt = waypoints[Math.max(0, curr - 1)];
      const toPt = waypoints[curr];
      const nextPt = waypoints[Math.min(waypoints.length - 1, curr + 1)];

      if (fromPt && toPt && nextPt) {
        const prevAngle = curr > 0 ? getAngle(fromPt, toPt) : getAngle(toPt, nextPt) - 90;
        const targetAngle = getAngle(toPt, nextPt);
        let diff = targetAngle - prevAngle;
        while (diff < -180) diff += 360;
        while (diff > 180) diff -= 360;
        angle = prevAngle + diff * phaseProgress;
      }
    } else if (phase === "moving") {
      const curr = Math.min(currentSegment, waypoints.length - 2);
      const fromPt = waypoints[curr];
      const toPt = waypoints[curr + 1];
      if (fromPt && toPt) {
        rx = fromPt.x + (toPt.x - fromPt.x) * phaseProgress;
        ry = fromPt.y + (toPt.y - fromPt.y) * phaseProgress;
        angle = getAngle(fromPt, toPt);
      }
    } else if (phase === "completed") {
      rx = waypoints[waypoints.length - 1]?.x ?? 0;
      ry = waypoints[waypoints.length - 1]?.y ?? 0;
      const fromPt = waypoints[waypoints.length - 2];
      const toPt = waypoints[waypoints.length - 1];
      if (fromPt && toPt) angle = getAngle(fromPt, toPt);
    }
  }

  // Pixel to Meters conversion based on calculated total A* distance
  let totalPixelDist = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    if (p1 && p2) {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      totalPixelDist += Math.sqrt(dx * dx + dy * dy);
    }
  }

  const scaleFactor = totalPixelDist > 0 ? simData.distance / totalPixelDist : 1;

  let traveledPixelDist = 0;
  const maxSeg = Math.min(currentSegment, waypoints.length - 1);
  for (let i = 0; i < maxSeg; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    if (p1 && p2) {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      traveledPixelDist += Math.sqrt(dx * dx + dy * dy);
    }
  }

  if (phase === "moving") {
    const p1 = waypoints[currentSegment];
    const p2 = waypoints[currentSegment + 1];
    if (p1 && p2) {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      traveledPixelDist += Math.sqrt(dx * dx + dy * dy) * phaseProgress;
    }
  } else if (phase === "completed") {
    traveledPixelDist = totalPixelDist;
  }

  const distanceTraveled = traveledPixelDist * scaleFactor;
  const remainingDistance = Math.max(0, simData.distance - distanceTraveled);

  // Speed: 0.15 m/s base
  const speed = 0.15;
  const timeLeftSec = remainingDistance / speed;

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const remainingTimeStr = formatTime(timeLeftSec);
  const elapsedTimeStr = formatTime(distanceTraveled / speed);

  // Dynamic cost-dependent battery model
  const energyRemaining = Math.max(0, Math.round(100 - (distanceTraveled / simData.distance) * 70));

  // Determine active simulation status
  let simStatus = "Planning";
  if (phase === "completed") {
    simStatus = "Mission Completed";
  } else if (currentSegment === waypoints.length - 2 && phase === "moving") {
    simStatus = "Navigating";
  } else if (currentSegment === waypoints.length - 2 && phase === "stopped") {
    simStatus = "Target Reached";
  } else if (phase === "stopped") {
    simStatus = "Obstacle Avoidance";
  } else if (phase === "rotating") {
    simStatus = "Planning";
  } else if (phase === "moving") {
    simStatus = "Navigating";
  }

  // Draw Polylines
  const getPolylinePoints = (pts: Array<{ x: number; y: number }>) => {
    return pts.map((p) => p ? `${p.x},${p.y}` : "0,0").join(" ");
  };

  const traveledPoints = [];
  const travelLimit = Math.min(currentSegment, waypoints.length - 1);
  for (let i = 0; i <= travelLimit; i++) {
    if (waypoints[i]) traveledPoints.push(waypoints[i]);
  }
  if (phase !== "completed") {
    traveledPoints.push({ x: rx, y: ry });
  }

  const remainingPoints = [{ x: rx, y: ry }];
  if (phase !== "completed") {
    for (let i = currentSegment + 1; i < waypoints.length; i++) {
      if (waypoints[i]) remainingPoints.push(waypoints[i]);
    }
  }

  // Generate log events dynamically
  const getEventLog = () => {
    const logs = [{ time: "00:00:00", text: "Lander telemetry established. Rover deployed.", kind: "start" }];
    const logLimit = Math.min(currentSegment, waypoints.length - 1);
    for (let i = 1; i <= logLimit; i++) {
      const timeVal = formatTime((i * (simData.estimatedTime * 60)) / numSegments);
      if (waypoints[i]) {
        logs.push({
          time: timeVal,
          text: `Waypoint ${waypoints[i].id} reached safely. Terrain scan complete.`,
          kind: "info"
        });
      }
    }
    if (phase === "completed") {
      logs.push({
        time: formatTime(simData.estimatedTime * 60),
        text: "Target destination reached. Scientific drill initiated.",
        kind: "start"
      });
      logs.push({
        time: formatTime(simData.estimatedTime * 60 + 300),
        text: "Water ice extraction completed. Sample cached.",
        kind: "info"
      });
    }
    return logs;
  };

  // Ice collection dynamics
  const isTargetZone = currentSegment === waypoints.length - 2 && phase === "moving";
  const iceCollectedPct = phase === "completed" ? 100 : isTargetZone ? Math.round(phaseProgress * 100) : 0;
  const iceAmount = phase === "completed" 
    ? "115.00 kg" 
    : isTargetZone 
      ? `${(phaseProgress * 115).toFixed(2)} kg` 
      : "0.00 kg";

  return (
    <>
      <TopBar title="Mission Simulation" subtitle="Simulate the mission to validate plan, energy usage and resource collection" />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Panel title="Mission Simulation View" subtitle={
            <span className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> Landing Site</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Traversable Path</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> Path Traveled</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> Target</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> Hazard Zones</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-info" /> Safe Regions</span>
            </span>
          } padded={false}>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-b-2xl bg-[#080b0f]">
              {/* GIS Terrain Imagery Background */}
              <img 
                src={simData.backgroundImage || DEMO_ASSETS.ohrc} 
                alt="Planetary GIS Raster Layer" 
                className="absolute inset-0 h-full w-full object-cover opacity-45 mix-blend-screen"
              />

              <svg viewBox={`0 0 ${simData.width} ${simData.height}`} className="absolute inset-0 h-full w-full">
                {/* 1. Safe Regions (Green Dashed circles) */}
                {simData.safeRegions?.map((sr: any, idx: number) => (
                  <circle key={`safe-${idx}`} cx={sr.x} cy={sr.y} r={sr.radius} stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 6" fill="rgba(34, 197, 94, 0.03)" />
                ))}

                {/* 2. Crater Boundaries (Red dashed circles) */}
                {simData.craters?.map((c: any, idx: number) => (
                  <circle key={`crater-${idx}`} cx={c.x} cy={c.y} r={c.radius} stroke="#ef4444" strokeWidth="2.0" strokeDasharray="4 4" fill="rgba(239, 68, 68, 0.05)" />
                ))}

                {/* 3. Hazard Regions (Orange dashed circles) */}
                {simData.hazards?.map((hz: any, idx: number) => (
                  <circle key={`hazard-${idx}`} cx={hz.x} cy={hz.y} r={hz.radius} stroke="#f97316" strokeWidth="1.5" strokeDasharray="5 3" fill="rgba(249, 115, 22, 0.05)" />
                ))}

                {/* 4. Alternate Trajectories (Decorative thin gray dashed routes) */}
                <path d={`M ${waypoints[0].x} ${waypoints[0].y} C ${waypoints[0].x + 50} ${waypoints[0].y + 60}, ${simData.target.x - 120} ${simData.target.y + 100}, ${simData.target.x} ${simData.target.y}`} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 6" fill="none" />
                <path d={`M ${waypoints[0].x} ${waypoints[0].y} C ${waypoints[0].x - 60} ${waypoints[0].y - 80}, ${simData.target.x - 80} ${simData.target.y - 120}, ${simData.target.x} ${simData.target.y}`} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 6" fill="none" />

                {/* 5. Path Traveled (Solid Green Polyline) */}
                {traveledPoints.length > 1 && (
                  <polyline points={getPolylinePoints(traveledPoints)} stroke="oklch(0.68 0.17 155)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                )}

                {/* 6. Remaining Path (Dashed Blue Polyline) */}
                {remainingPoints.length > 1 && (
                  <polyline points={getPolylinePoints(remainingPoints)} stroke="oklch(0.55 0.22 264)" strokeWidth="2.5" strokeDasharray="6 6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                )}

                {/* 7. Waypoint Marker Nodes */}
                {waypoints.map((wp: any, idx: number) => {
                  const isCompleted = idx < currentSegment || phase === "completed";
                  const isActive = idx === currentSegment && phase !== "completed";
                  return (
                    <g key={wp.id}>
                      <circle 
                        cx={wp.x} 
                        cy={wp.y} 
                        r="6" 
                        fill={isCompleted ? "oklch(0.68 0.17 155)" : isActive ? "oklch(0.55 0.22 264)" : "#1e293b"} 
                        stroke="#080b0f" 
                        strokeWidth="1.5" 
                        className={isActive ? "animate-pulse" : ""} 
                      />
                      <text 
                        x={wp.x + 8} 
                        y={wp.y - 5} 
                        fill="white" 
                        fontSize="9" 
                        fontWeight="800" 
                        className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
                      >
                        {wp.id}
                      </text>
                    </g>
                  );
                })}

                {/* 8. Rotate-oriented Rover Vector Graphic */}
                <g transform={`translate(${rx}, ${ry}) rotate(${angle})`}>
                  {/* Wheel track shadow */}
                  <rect x="-14" y="-12" width="28" height="24" rx="3" fill="rgba(0,0,0,0.5)" />
                  {/* Wheel segments */}
                  <rect x="-15" y="-13" width="7" height="4" rx="1" fill="#111" />
                  <rect x="8" y="-13" width="7" height="4" rx="1" fill="#111" />
                  <rect x="-15" y="9" width="7" height="4" rx="1" fill="#111" />
                  <rect x="8" y="9" width="7" height="4" rx="1" fill="#111" />
                  <rect x="-4" y="-13" width="7" height="4" rx="1" fill="#111" />
                  <rect x="-4" y="9" width="7" height="4" rx="1" fill="#111" />
                  {/* Main Chassis Frame */}
                  <rect x="-11" y="-9" width="22" height="18" rx="2" fill="#0f172a" stroke="oklch(0.55 0.22 264)" strokeWidth="1.5" />
                  {/* Solar panel layer */}
                  <rect x="-7" y="-6" width="14" height="12" fill="#1e3a8a" stroke="oklch(0.68 0.17 155)" strokeWidth="1" />
                  <line x1="-7" y1="0" x2="7" y2="0" stroke="oklch(0.68 0.17 155)" strokeWidth="0.5" />
                  {/* NavCam/Pulsing Mast */}
                  <circle cx="7" cy="0" r="3" fill="oklch(0.55 0.22 264)" />
                  <circle cx="8" cy="0" r="1.2" fill="#ef4444" className={phase !== "completed" ? "animate-pulse" : ""} />
                </g>
              </svg>

              {/* Position Readouts */}
              <div className="absolute left-3 bottom-3 rounded-lg bg-background/85 backdrop-blur p-2.5 text-[11px] font-mono border border-border shadow-lg">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`h-2 w-2 rounded-full ${phase === "completed" ? "bg-success" : "bg-primary animate-pulse"}`} />
                  <span className="font-bold">Rover Navigation GIS</span>
                </div>
                <div>X-Coord: {Math.round(rx)} px</div>
                <div>Y-Coord: {Math.round(ry)} px</div>
                <div>Heading: {Math.round(angle)}°</div>
              </div>

              {/* GIS Terrain Legend */}
              <div className="absolute right-3 bottom-3 rounded-lg bg-background/85 backdrop-blur px-3 py-2 text-[10px] border border-border shadow-lg">
                <div className="font-bold">Terrain Cost Model</div>
                <div className="mt-1 h-2 w-32 rounded-full bg-gradient-to-r from-success via-warning to-destructive" />
                <div className="flex justify-between mt-0.5 font-mono text-[9px]"><span>Low</span><span>Moderate</span><span>High</span></div>
              </div>
            </div>
          </Panel>

          {/* Right Metrics Panels */}
          <div className="space-y-4">
            <Panel title={<span className="flex items-center justify-between">Mission Status <StatusBadge tone={simStatus === "Mission Completed" ? "success" : "warning"}>{simStatus}</StatusBadge></span>}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Clock, label: "Elapsed Time", value: elapsedTimeStr, sub: "hh : mm : ss" },
                  { icon: Gauge, label: "Distance Traveled", value: `${(distanceTraveled / 1000).toFixed(2)} km`, sub: `of ${(simData.distance / 1000).toFixed(2)} km` },
                  { icon: Battery, label: "Energy Remaining", value: `${energyRemaining}%`, sub: `Est. 18.6 Wh capacity` },
                  { icon: Hourglass, label: "Time to Target", value: remainingTimeStr, sub: "hh : mm : ss" },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg border border-border bg-background p-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><m.icon className="h-3 w-3" /> {m.label}</div>
                    <div className="mt-0.5 text-base font-bold font-mono text-foreground">{m.value}</div>
                    <div className="text-[10px] text-muted-foreground">{m.sub}</div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Rover Systems">
              <ul className="space-y-2 text-sm">
                {simData.systems?.map((s: any) => (
                  <li key={s.name} className="flex items-center justify-between">
                    <span>{s.name}</span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-success">{s.status} <Check className="h-3.5 w-3.5" /></span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>

        {/* Dynamic Waypoint Checklist */}
        <Panel title="Mission Progress (Waypoints)">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
            {waypoints.map((w: any, idx: number) => {
              const isCompleted = idx < currentSegment || phase === "completed";
              const isActive = idx === currentSegment && phase !== "completed";
              return (
                <div key={w.id} className="flex items-center gap-2 shrink-0">
                  <div className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold ${
                    isCompleted 
                      ? "bg-success text-success-foreground" 
                      : isActive 
                        ? "bg-primary text-primary-foreground animate-pulse ring-2 ring-primary/45" 
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {isCompleted ? <Check className="h-3 w-3" /> : idx}
                  </div>
                  <span className="font-semibold text-foreground">{w.id}</span>
                  {idx < waypoints.length - 1 && <span className="h-px w-6 bg-border" />}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="text-xs text-muted-foreground">Path Traversed: <span className="font-semibold text-foreground">{(distanceTraveled / 1000).toFixed(2)} / {(simData.distance / 1000).toFixed(2)} km</span></div>
            <div className="flex-1 h-2 overflow-hidden rounded-full bg-muted">
              <motion.div className="h-full bg-success" initial={{ width: 0 }} animate={{ width: `${Math.round((distanceTraveled / simData.distance) * 100)}%` }} transition={{ duration: 0.3 }} />
            </div>
            <div className="text-xs font-bold text-foreground">{Math.round((distanceTraveled / simData.distance) * 100)}%</div>
          </div>
        </Panel>

        {/* Bottom grid */}
        <div className="grid gap-6 lg:grid-cols-4">
          <Panel title="Energy Consumption Model">
            {simData.energyCurve ? (
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={simData.energyCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="battery" stroke="oklch(0.55 0.22 264)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[150px] items-center justify-center">
                <span className="text-sm text-muted-foreground">Running battery curve analysis...</span>
              </div>
            )}
            <div className="text-xs text-center text-muted-foreground">Current: <span className="font-bold text-foreground">{energyRemaining}%</span></div>
          </Panel>

          <Panel title="Resource Extraction Dynamics">
            <div className="flex items-center gap-3">
              <div className="relative grid h-20 w-20 place-items-center shrink-0">
                <svg viewBox="0 0 100 100" className="h-20 w-20 -rotate-90">
                  <circle cx="50" cy="50" r="40" stroke="oklch(0.92 0.01 250)" strokeWidth="10" fill="none" />
                  <circle cx="50" cy="50" r="40" stroke="oklch(0.55 0.22 264)" strokeWidth="10" fill="none" strokeDasharray={`${(iceCollectedPct / 100) * 251} 251`} />
                </svg>
                <div className="absolute text-center">
                  <div className="text-sm font-bold text-foreground">{iceCollectedPct}%</div>
                  <div className="text-[9px] text-muted-foreground">Extracted</div>
                </div>
              </div>
              <dl className="flex-1 space-y-1 text-xs">
                <div className="flex justify-between"><dt className="text-muted-foreground font-semibold">Target</dt><dd className="font-bold text-foreground">{simData.collection?.target || "H₂O Ice"}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground font-semibold">Drilled</dt><dd className="font-bold text-success">{iceAmount}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground font-semibold">Est. Yield</dt><dd className="font-bold text-foreground">{simData.collection?.estimated}</dd></div>
              </dl>
            </div>
            <div className="mt-2 text-[11px] text-primary text-center">
              {simStatus === "Mission Completed" ? "Extraction sequence completed." : isTargetZone ? "Drilling in progress..." : "Awaiting target arrival."}
            </div>
          </Panel>

          <Panel title="Planetary Conditions">
            <dl className="space-y-1.5 text-sm">
              {simData.environment && Object.entries(simData.environment).map(([k, v]: any) => (
                <div key={k} className="flex justify-between"><dt className="text-muted-foreground">{k}</dt><dd className="font-bold text-foreground">{v}</dd></div>
              ))}
            </dl>
          </Panel>

          <Panel title="Event Log (Telemetry)">
            <ul className="space-y-2 text-xs overflow-y-auto max-h-[150px]">
              {getEventLog().map((e, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${e.kind === "start" ? "bg-primary" : "bg-success"}`} />
                  <span className="font-mono text-muted-foreground text-[10px]">{e.time}</span>
                  <span className="flex-1 text-foreground truncate">{e.text}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Bottom Nav Links */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/resource-estimation" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted"><ArrowLeft className="h-4 w-4" /> Back to Resource Estimation</Link>
          <Link to="/mission-report" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Continue to Mission Report <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </>
  );
}
