# HCI & UX Guidelines

## 1. HCI Laws to Enforce
*   **Fitts’ Law:** Critical buttons (SOS) must occupy 50%+ of the screen in Panic Mode. Targets must be large (min 80px).
*   **Hick’s Law:** 
    *   Peace Mode: Max 5 options.
    *   Panic Mode: 1 option (SOS).
*   **Defensive Design:** 
    *   SOS requires "Slide to Confirm" or "Long Press" (prevent accidental triggers).
    *   Disable keyboard in Panic Mode (assume loss of fine motor skills).

## 2. Accessibility & Inclusivity
*   **High Contrast:** Dark mode default. Red (#FF3B30) for Danger, Green (#32D74B) for Safe.
*   **Haptic Feedback:** Crucial. Every interaction in Panic Mode must trigger device vibration (Visuals might be obscured by rain/debris).
*   **Language:** UI must support RTL layouts (Urdu) conceptually (prepare text strings for localization).

## 3. Intelligent Behaviors
*   **Rage Tap Detection:** If user taps screen > 3 times in 1 second, force switch to Voice Recording mode.
*   **Shake-to-Panic:** Accelerometer data > threshold triggers navigation to SOS screen.