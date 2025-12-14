import { create } from 'zustand';

export type AppMode = 'PEACE' | 'PANIC' | 'PREDICTIVE';

interface Report {
  id: string;
  timestamp: number;
  type: string;
  details: string;
}

export type Language = 'en' | 'ur';

interface AppState {
  mode: AppMode;
  isRedZone: boolean;
  connectivity: boolean;
  reportQueue: Report[];
  language: Language;
  
  // Volunteer Stats
  volunteerTasksDone: number;
  volunteerLevel: 'Rookie' | 'Helper' | 'Hero' | 'Legend';
  
  // Actions
  setMode: (mode: AppMode) => void;
  setRedZone: (inZone: boolean) => void;
  setConnectivity: (connected: boolean) => void;
  addToQueue: (report: Report) => void;
  clearQueue: () => void;
  incrementVolunteerTasks: () => void;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  mode: 'PEACE',
  isRedZone: false,
  connectivity: true,
  reportQueue: [],
  language: 'en',
  volunteerTasksDone: 0,
  volunteerLevel: 'Rookie',

  setMode: (mode) => set({ mode }),
  setRedZone: (isRedZone) => set({ isRedZone }),
  setConnectivity: (connectivity) => set({ connectivity }),
  addToQueue: (report) => set((state) => ({ reportQueue: [...state.reportQueue, report] })),
  clearQueue: () => set({ reportQueue: [] }),
  incrementVolunteerTasks: () => set((state) => {
    const newCount = state.volunteerTasksDone + 1;
    let newLevel: 'Rookie' | 'Helper' | 'Hero' | 'Legend' = 'Rookie';
    if (newCount >= 50) newLevel = 'Legend';
    else if (newCount >= 20) newLevel = 'Hero';
    else if (newCount >= 5) newLevel = 'Helper';
    return { 
      volunteerTasksDone: newCount,
      volunteerLevel: newLevel,
    };
  }),
  setLanguage: (language) => set({ language }),
  toggleLanguage: () => set((state) => ({ language: state.language === 'en' ? 'ur' : 'en' })),
}));

