# 05_data_structures.md (Mock Database Schema)

## 1. Alerts & News Data Structure
Type: `NewsItem`
- id: string
- title: string (e.g., "Flash Flood Warning in Malir")
- severity: 'CRITICAL' | 'WARNING' | 'INFO'
- location: string (City/District e.g., "Karachi", "Swat")
- timestamp: ISO String
- source: 'NDMA' | 'Met Dept' | 'Crowdsourced'
- content: string (Full text)

## 2. Emergency Directory (Pakistan)
Type: `EmergencyContact`
- id: string
- name: string (e.g., "Edhi Foundation", "Chippa", "Rescue 1122")
- category: 'AMBULANCE' | 'POLICE' | 'DISASTER_SQUAD'
- phone: string
- city: 'ALL' | 'KARACHI' | 'LAHORE' etc.
- is24_7: boolean

## 3. Knowledge Base (First Aid & Guides)
Type: `Guide`
- id: string
- title: string (e.g., "CPR for Drowning Victim", "Snake Bite Treatment")
- category: 'FIRST_AID' | 'EVACUATION' | 'SURVIVAL'
- tags: string[] (for AI search)
- steps: Array<{ stepNumber: number, text: string, imageUrl: string }>
- isOfflineReady: boolean

## 4. Volunteer Tasks
Type: `RescueTask`
- id: string
- type: 'FOOD_DROP' | 'MEDICAL_EVAC' | 'SANDBAG_DUTY'
- coords: { lat: number, long: number }
- urgency: 'HIGH' | 'MEDIUM'
- requestedBy: string (User ID)
- status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'