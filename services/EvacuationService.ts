import * as Location from 'expo-location';

export interface ShelterLocation {
  id: string;
  name: string;
  type: 'shelter' | 'hospital' | 'safe_zone' | 'evacuation_center';
  location: { latitude: number; longitude: number };
  capacity?: number;
  currentOccupancy?: number;
  facilities: string[];
  contact?: string;
  distance?: number; // in meters
}

export interface EvacuationRoute {
  id: string;
  name: string;
  startLocation: { latitude: number; longitude: number };
  endLocation: { latitude: number; longitude: number };
  waypoints?: { latitude: number; longitude: number }[];
  distance: number; // in meters
  estimatedTime: number; // in minutes
  status: 'safe' | 'moderate' | 'unsafe' | 'blocked';
  obstacles?: string[];
  lastUpdated: number;
}

export interface RouteObstruction {
  id: string;
  location: { latitude: number; longitude: number };
  type: 'flooding' | 'debris' | 'traffic' | 'damage' | 'other';
  severity: 'low' | 'medium' | 'high';
  description: string;
  reportedAt: number;
}

/**
 * Mock Evacuation Service
 * In production, this would integrate with real mapping services and emergency management APIs
 */
class EvacuationService {
  private mockShelters: ShelterLocation[] = [
    {
      id: '1',
      name: 'Karachi Central Shelter',
      type: 'shelter',
      location: { latitude: 24.8607, longitude: 67.0011 },
      capacity: 500,
      currentOccupancy: 320,
      facilities: ['Food', 'Water', 'Medical', 'Restrooms'],
      contact: '+92-21-1234567',
    },
    {
      id: '2',
      name: 'Jinnah Hospital',
      type: 'hospital',
      location: { latitude: 24.8700, longitude: 67.0100 },
      capacity: 1000,
      currentOccupancy: 750,
      facilities: ['Medical', 'Emergency Services', 'Food'],
      contact: '+92-21-2345678',
    },
    {
      id: '3',
      name: 'North Zone Safe Zone',
      type: 'safe_zone',
      location: { latitude: 24.9500, longitude: 67.0500 },
      capacity: 2000,
      currentOccupancy: 1200,
      facilities: ['Food', 'Water', 'Shelter', 'Security'],
      contact: '+92-21-3456789',
    },
    {
      id: '4',
      name: 'Emergency Evacuation Center',
      type: 'evacuation_center',
      location: { latitude: 24.8400, longitude: 66.9900 },
      capacity: 800,
      currentOccupancy: 450,
      facilities: ['Food', 'Water', 'Medical', 'Restrooms', 'Communication'],
      contact: '+92-21-4567890',
    },
  ];

  private mockObstructions: RouteObstruction[] = [
    {
      id: '1',
      location: { latitude: 24.8650, longitude: 67.0050 },
      type: 'flooding',
      severity: 'high',
      description: 'Major road flooded, impassable',
      reportedAt: Date.now() - 3600000,
    },
    {
      id: '2',
      location: { latitude: 24.8750, longitude: 67.0150 },
      type: 'debris',
      severity: 'medium',
      description: 'Debris blocking road',
      reportedAt: Date.now() - 7200000,
    },
  ];

  /**
   * Get nearby shelters
   */
  async getNearbyShelters(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<ShelterLocation[]> {
    // In production, fetch from API
    const shelters = this.mockShelters.map((shelter) => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        shelter.location.latitude,
        shelter.location.longitude
      );
      return { ...shelter, distance };
    });

    return shelters
      .filter((s) => (s.distance || 0) <= radiusKm * 1000)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  /**
   * Get evacuation routes from current location to destination
   */
  async getEvacuationRoutes(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number
  ): Promise<EvacuationRoute[]> {
    // In production, use routing API (Google Maps, Mapbox, etc.)
    const distance = this.calculateDistance(startLat, startLon, endLat, endLon);
    const baseTime = Math.round((distance / 1000 / 5) * 60); // Assume 5 km/h walking speed

    return [
      {
        id: '1',
        name: 'Primary Route',
        startLocation: { latitude: startLat, longitude: startLon },
        endLocation: { latitude: endLat, longitude: endLon },
        distance,
        estimatedTime: baseTime,
        status: 'safe',
        lastUpdated: Date.now(),
      },
      {
        id: '2',
        name: 'Alternative Route',
        startLocation: { latitude: startLat, longitude: startLon },
        endLocation: { latitude: endLat, longitude: endLon },
        waypoints: [
          { latitude: startLat + 0.01, longitude: startLon + 0.01 },
          { latitude: endLat - 0.01, longitude: endLon - 0.01 },
        ],
        distance: distance * 1.2,
        estimatedTime: Math.round(baseTime * 1.2),
        status: 'moderate',
        obstacles: ['Minor flooding reported'],
        lastUpdated: Date.now() - 1800000,
      },
      {
        id: '3',
        name: 'Emergency Route',
        startLocation: { latitude: startLat, longitude: startLon },
        endLocation: { latitude: endLat, longitude: endLon },
        waypoints: [
          { latitude: startLat - 0.01, longitude: startLon - 0.01 },
          { latitude: endLat + 0.01, longitude: endLon + 0.01 },
        ],
        distance: distance * 1.5,
        estimatedTime: Math.round(baseTime * 1.5),
        status: 'moderate',
        lastUpdated: Date.now() - 3600000,
      },
    ];
  }

  /**
   * Get route obstructions
   */
  async getRouteObstructions(
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    }
  ): Promise<RouteObstruction[]> {
    // In production, fetch from API
    return this.mockObstructions.filter((obs) => {
      const { latitude, longitude } = obs.location;
      return (
        latitude >= bounds.south &&
        latitude <= bounds.north &&
        longitude >= bounds.west &&
        longitude <= bounds.east
      );
    });
  }

  /**
   * Report route obstruction
   */
  async reportObstruction(obstruction: RouteObstruction): Promise<void> {
    // In production, send to API
    this.mockObstructions.push(obstruction);
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get user's current location and find nearby shelters
   */
  async getSheltersForCurrentLocation(): Promise<{
    shelters: ShelterLocation[];
    userLocation: { latitude: number; longitude: number };
  }> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      const shelters = await this.getNearbyShelters(latitude, longitude, 10);

      return {
        shelters,
        userLocation: { latitude, longitude },
      };
    } catch (error) {
      console.error('Error getting shelters for current location:', error);
      // Return default data
      const shelters = await this.getNearbyShelters(24.8607, 67.0011, 10);
      return {
        shelters,
        userLocation: { latitude: 24.8607, longitude: 67.0011 },
      };
    }
  }
}

export const evacuationService = new EvacuationService();

