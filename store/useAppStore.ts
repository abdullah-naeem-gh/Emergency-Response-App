import { create } from 'zustand';

export type AppMode = 'PEACE' | 'PANIC' | 'PREDICTIVE';

interface Report {
  id: string;
  timestamp: number;
  type: string;
  details: string;
}

interface AppState {
  mode: AppMode;
  isRedZone: boolean;
  connectivity: boolean;
  reportQueue: Report[];
  
  // Actions
  setMode: (mode: AppMode) => void;
  setRedZone: (inZone: boolean) => void;
  setConnectivity: (connected: boolean) => void;
  addToQueue: (report: Report) => void;
  clearQueue: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  mode: 'PEACE',
  isRedZone: false,
  connectivity: true,
  reportQueue: [],

  setMode: (mode) => set({ mode }),
  setRedZone: (isRedZone) => set({ isRedZone }),
  setConnectivity: (connectivity) => set({ connectivity }),
  addToQueue: (report) => set((state) => ({ reportQueue: [...state.reportQueue, report] })),
  clearQueue: () => set({ reportQueue: [] }),
}));

