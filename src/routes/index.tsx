import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Rocket, FolderOpen, Play, Radar, Mountain, Navigation, Snowflake, ArrowRight, Satellite, MapPin } from "lucide-react";
import moonHero from "@/assets/moon-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LMDSS — Lunar Mission Decision Support System" },
      { name: "description", content: "AI-powered lunar mission planning platform using DFSAR, OHRC, DEM and illumination data." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Radar, label: "Radar Analysis", desc: "CPR + DOP Processing", tone: "bg-primary-soft text-primary" },
  { icon: Mountain, label: "Terrain Intelligence", desc: "Slope & Hazard Analysis", tone: "bg-success/15 text-success" },
  { icon: Rocket, label: "Landing Optimization", desc: "Multi-objective Planning", tone: "bg-warning/25 text-warning-foreground" },
  { icon: Navigation, label: "Rover Navigation", desc: "Safe Traverse Planning", tone: "bg-accent text-accent-foreground" },
  { icon: Snowflake, label: "Resource Estimation", desc: "Ice Volume Assessment", tone: "bg-info/15 text-info" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top brand bar */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-info text-white shadow-soft">
              <Satellite className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-black tracking-tight text-primary sm:text-base">LUNAR MISSION DECISION SUPPORT SYSTEM</div>
              <div className="text-[11px] text-muted-foreground">ISRO Lunar Exploration Planning Platform</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
            <button className="rounded-lg px-3 py-1.5 hover:bg-muted">Settings</button>
            <button className="rounded-lg px-3 py-1.5 hover:bg-muted">Help</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center"
          >
            <h1 className="text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
              Lunar Mission<br />
              <span className="text-gradient-primary">Decision Support System</span>
            </h1>
            <div className="mt-4 h-1 w-16 rounded-full bg-primary" />
            <p className="mt-6 max-w-xl text-lg text-white/90">
              AI-powered mission planning using DFSAR, OHRC, DEM and Lunar Illumination Data.
            </p>
            <p className="mt-3 max-w-xl text-sm text-white/65">
              Analyze Chandrayaan-2 datasets to detect potential subsurface ice, evaluate terrain safety,
              optimize landing locations, generate rover traverses and estimate lunar resources through a
              unified mission planning platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                <Rocket className="h-4 w-4" /> Start New Mission
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                <Play className="h-4 w-4" /> Demo Mission
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative mx-auto aspect-square max-w-xl">
              <img
                src={moonHero}
                alt="Moon"
                width={1536}
                height={1024}
                className="h-full w-full rounded-full object-cover shadow-[0_0_120px_rgba(56,128,255,0.25)]"
              />
              <motion.div
                className="absolute right-6 top-10 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase text-white/90 backdrop-blur"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Satellite className="h-3.5 w-3.5" /> Chandrayaan-2 Orbiter
              </motion.div>
              <div className="absolute bottom-12 left-1/3 flex flex-col items-center gap-1">
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-10 w-10 rounded-full border border-info"
                />
                <div className="absolute top-3 grid h-4 w-4 place-items-center rounded-full bg-info text-white">
                  <MapPin className="h-2.5 w-2.5" />
                </div>
                <div className="mt-6 text-center">
                  <div className="text-xs font-bold uppercase text-white">South Pole</div>
                  <div className="text-[10px] text-info">Exploration Target</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature cards */}
        <div className="relative mx-auto -mb-12 max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-3 rounded-3xl border border-border bg-card p-4 shadow-elevated sm:grid-cols-3 md:gap-4 md:p-6 lg:grid-cols-5">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                whileHover={{ y: -3 }}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className={`grid h-12 w-12 place-items-center rounded-full ${f.tone}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <div className="mt-3 text-sm font-bold uppercase tracking-wide text-foreground">{f.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{f.desc}</div>
                <Link to="/dashboard" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:gap-2 transition-all">
                  Explore <ArrowRight className="h-3 w-3" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-16 border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-xs text-muted-foreground">
          <div>Version 1.0 • Developed for Bharatiya Antariksh Hackathon</div>
          <div>© 2024 Team Stellaris</div>
        </div>
      </footer>
    </div>
  );
}
