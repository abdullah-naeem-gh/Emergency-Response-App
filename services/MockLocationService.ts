import { useAppStore } from '../store/useAppStore';

// Mock coordinates for a "Red Zone" (e.g., a known flood-prone area)
const RED_ZONE_COORDS = {
  latitude: 33.6844,
  longitude: 73.0479,
  radiusKm: 2.0,
};

export const MockLocationService = {
  /**
   * Simulates entering/exiting a Red Zone.
   * In a real app, this would check actual GPS coordinates against geofences.
   */
  checkLocation: (latitude: number, longitude: number) => {
    // specific logic for demo purposes: 
    // If lat/long are close to Red Zone, return true.
    // For now, we'll just expose a manual toggle in the UI or rely on this function being called with specific test coords.
    
    const distance = Math.sqrt(
      Math.pow(latitude - RED_ZONE_COORDS.latitude, 2) + 
      Math.pow(longitude - RED_ZONE_COORDS.longitude, 2)
    );
    
    // Rough approximation: 0.01 degrees is approx 1.11km
    const isInside = distance < 0.02; 
    
    const store = useAppStore.getState();
    if (isInside !== store.isRedZone) {
      store.setRedZone(isInside);
      if (isInside && store.mode === 'PEACE') {
          // Optional: Auto-trigger Panic or Predictive mode? 
          // Project context says Panic is triggered by shaking OR Red Zone GPS.
          // Let's set it to predictive or just flag it for now.
          // Rule 9 in context: "Panic State: Triggered by shaking/running or Red Zone GPS"
          // So we might want to auto-switch or prompt.
          // For this step, I'll just update the isRedZone flag.
      }
    }
    
    return isInside;
  },

  /**
   * Force simulator to enter Red Zone
   */
  simulateEnterRedZone: () => {
    useAppStore.getState().setRedZone(true);
    useAppStore.getState().setMode('PANIC');
  },

  /**
   * Force simulator to exit Red Zone
   */
  simulateExitRedZone: () => {
    useAppStore.getState().setRedZone(false);
    useAppStore.getState().setMode('PEACE');
  }
};

