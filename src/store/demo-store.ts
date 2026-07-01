/**
 * Demo Mode Store
 * ─────────────────────────────────────────────────────────────────────────────
 * Controls whether the application runs in Demo Mode (showing demonstration
 * images) or Production Mode (using real Chandrayaan-2 datasets + backend).
 *
 * Default value is read from the VITE_DEMO_MODE environment variable.
 * To avoid SSR/hydration mismatches and infinite render loops in React 18/19,
 * initial state is identical on server and client, and the stored value is
 * loaded asynchronously on the client post-hydration.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

interface DemoState {
  /** true = Demo Mode (demo images, no backend). false = Production Mode. */
  isDemo: boolean;
  /** Toggle or explicitly set Demo Mode. */
  setDemoMode: (value: boolean) => void;
  toggleDemo: () => void;
}

export const useDemoStore = create<DemoState>((set) => ({
  isDemo: true,
  setDemoMode: (value) => {
    set({ isDemo: value });
  },
  toggleDemo: () => {
    set((s) => ({ isDemo: !s.isDemo }));
  },
}));

/** Convenience hook — use this in route components. */
export const useDemoMode = () =>
  useDemoStore(
    useShallow((s) => ({
      isDemo: s.isDemo,
      toggleDemo: s.toggleDemo,
      setDemoMode: s.setDemoMode,
    }))
  );
