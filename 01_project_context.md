# Project Context: Muhafiz (Intelligent Emergency Interface)

## 1. Overview
Muhafiz is an intelligent, adaptive emergency response mobile application designed for disaster zones (floods, earthquakes) in Pakistan. It solves the problem of complex UIs failing during panic situations.

## 2. Core Philosophy
The interface is a "Liquid Interface" that changes state based on user context:
1.  **Peace State:** Informational dashboard (Weather, Prep guides).
2.  **Panic State:** Triggered by shaking/running or Red Zone GPS. Minimalist SOS interface.
3.  **Predictive State:** Crowd-sourced intelligence (e.g., "20 people reported floods here, are you?").

## 3. User Types
*   **Victim (Primary):** High stress, potentially injured, low literacy.
*   **Volunteer (Secondary):** Medium stress, needs navigation to victims.

## 4. Key Technical Features
*   **No Authentication:** Uses Device ID for tracking to reduce friction.
*   **Offline-First:** Queues reports locally if internet fails.
*   **Sensor Fusion:** Uses Accelerometer (Panic detection) and GPS (Location clustering).
*   **Voice-First:** Prioritizes audio recording over typing during panic.