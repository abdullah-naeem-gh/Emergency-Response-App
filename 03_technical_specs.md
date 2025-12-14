# Technical Specifications

## Framework
*   **React Native** (Expo Go SDK 50+)
*   **Language:** TypeScript
*   **Styling:** NativeWind (TailwindCSS) or StyleSheet

## Navigation
*   **Expo Router** (File-based routing)

## Key Libraries (Expo Managed)
1.  **Sensors:** `expo-sensors` (Accelerometer for Shake detection).
2.  **Location:** `expo-location` (Geofencing and GPS).
3.  **Haptics:** `expo-haptics` (Feedback loops).
4.  **Audio:** `expo-av` (Voice recording).
5.  **Storage:** `AsyncStorage` or `expo-sqlite` (Offline queuing).

## State Management
*   **Zustand** (Preferred for simplicity).
*   **Store Structure:**
    *   `appState`: 'PEACE' | 'PANIC' | 'PREDICTIVE'
    *   `connectivity`: boolean
    *   `reportQueue`: Array<Report>

## Logic Flow
*   **Root Layout:** Contains a global `SensorProvider` that listens to Accelerometer. If `shake` detected -> `router.push('/panic')`.