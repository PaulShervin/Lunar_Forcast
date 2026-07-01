import { create } from "zustand";

interface MissionState {
  name: string;
  id: string;
  region: string;
  status: string;
  activeMissionId: string;
  setMission: (m: Partial<MissionState>) => void;
}

export const useMissionStore = create<MissionState>((set) => ({
  name: "",
  id: "",
  region: "",
  status: "",
  activeMissionId: "",
  setMission: (m) => set((s) => ({ ...s, ...m })),
}));
