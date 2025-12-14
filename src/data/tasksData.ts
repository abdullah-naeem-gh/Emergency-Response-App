export interface RescueTask {
  id: string;
  type: 'FOOD_DROP' | 'MEDICAL_EVAC' | 'SANDBAG_DUTY';
  coords: { lat: number; long: number };
  urgency: 'HIGH' | 'MEDIUM';
  requestedBy: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
}

// Karachi coordinates: 24.8607° N, 67.0011° E
// Generating tasks around Karachi with slight variations
const KARACHI_CENTER = { lat: 24.8607, long: 67.0011 };

// Helper to generate random coordinates near Karachi (within ~10km radius)
const generateNearKarachi = (offset: number): { lat: number; long: number } => {
  // 1 degree ≈ 111km, so 0.01° ≈ 1.1km
  const latOffset = (Math.random() - 0.5) * 0.1; // ±0.05° ≈ ±5.5km
  const longOffset = (Math.random() - 0.5) * 0.1;
  return {
    lat: KARACHI_CENTER.lat + latOffset + (offset * 0.01),
    long: KARACHI_CENTER.long + longOffset + (offset * 0.01),
  };
};

export const tasksData: RescueTask[] = [
  // High Urgency Tasks
  {
    id: 'task-001',
    type: 'MEDICAL_EVAC',
    coords: generateNearKarachi(1),
    urgency: 'HIGH',
    requestedBy: 'user-123',
    status: 'OPEN',
  },
  {
    id: 'task-002',
    type: 'FOOD_DROP',
    coords: generateNearKarachi(2),
    urgency: 'HIGH',
    requestedBy: 'user-456',
    status: 'OPEN',
  },
  {
    id: 'task-003',
    type: 'MEDICAL_EVAC',
    coords: generateNearKarachi(3),
    urgency: 'HIGH',
    requestedBy: 'user-789',
    status: 'IN_PROGRESS',
  },
  {
    id: 'task-004',
    type: 'SANDBAG_DUTY',
    coords: generateNearKarachi(4),
    urgency: 'HIGH',
    requestedBy: 'user-101',
    status: 'OPEN',
  },
  {
    id: 'task-005',
    type: 'FOOD_DROP',
    coords: generateNearKarachi(5),
    urgency: 'HIGH',
    requestedBy: 'user-202',
    status: 'OPEN',
  },

  // Medium Urgency Tasks
  {
    id: 'task-006',
    type: 'FOOD_DROP',
    coords: generateNearKarachi(6),
    urgency: 'MEDIUM',
    requestedBy: 'user-303',
    status: 'OPEN',
  },
  {
    id: 'task-007',
    type: 'SANDBAG_DUTY',
    coords: generateNearKarachi(7),
    urgency: 'MEDIUM',
    requestedBy: 'user-404',
    status: 'IN_PROGRESS',
  },
  {
    id: 'task-008',
    type: 'MEDICAL_EVAC',
    coords: generateNearKarachi(8),
    urgency: 'MEDIUM',
    requestedBy: 'user-505',
    status: 'OPEN',
  },
  {
    id: 'task-009',
    type: 'FOOD_DROP',
    coords: generateNearKarachi(9),
    urgency: 'MEDIUM',
    requestedBy: 'user-606',
    status: 'OPEN',
  },
  {
    id: 'task-010',
    type: 'SANDBAG_DUTY',
    coords: generateNearKarachi(10),
    urgency: 'MEDIUM',
    requestedBy: 'user-707',
    status: 'OPEN',
  },
  {
    id: 'task-011',
    type: 'FOOD_DROP',
    coords: generateNearKarachi(11),
    urgency: 'MEDIUM',
    requestedBy: 'user-808',
    status: 'COMPLETED',
  },
  {
    id: 'task-012',
    type: 'MEDICAL_EVAC',
    coords: generateNearKarachi(12),
    urgency: 'MEDIUM',
    requestedBy: 'user-909',
    status: 'OPEN',
  },
  {
    id: 'task-013',
    type: 'SANDBAG_DUTY',
    coords: generateNearKarachi(13),
    urgency: 'MEDIUM',
    requestedBy: 'user-1010',
    status: 'IN_PROGRESS',
  },
  {
    id: 'task-014',
    type: 'FOOD_DROP',
    coords: generateNearKarachi(14),
    urgency: 'MEDIUM',
    requestedBy: 'user-1111',
    status: 'OPEN',
  },
  {
    id: 'task-015',
    type: 'MEDICAL_EVAC',
    coords: generateNearKarachi(15),
    urgency: 'MEDIUM',
    requestedBy: 'user-1212',
    status: 'COMPLETED',
  },
];

