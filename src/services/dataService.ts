import { alertsData, NewsItem } from '../data/alertsData';
import { contactsData, EmergencyContact } from '../data/contactsData';
import { guidesData, Guide } from '../data/guidesData';
import { tasksData, RescueTask } from '../data/tasksData';

/**
 * Get all alerts, optionally filtered by severity or location
 */
export const getAlerts = (filters?: {
  severity?: NewsItem['severity'];
  location?: string;
  source?: NewsItem['source'];
}): NewsItem[] => {
  let filtered = [...alertsData];

  if (filters?.severity) {
    filtered = filtered.filter(alert => alert.severity === filters.severity);
  }

  if (filters?.location) {
    filtered = filtered.filter(alert =>
      alert.location.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }

  if (filters?.source) {
    filtered = filtered.filter(alert => alert.source === filters.source);
  }

  // Sort by timestamp (newest first)
  return filtered.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

/**
 * Get alerts by city/district
 */
export const getAlertsByLocation = (location: string): NewsItem[] => {
  return alertsData.filter(alert =>
    alert.location.toLowerCase().includes(location.toLowerCase())
  );
};

/**
 * Get critical alerts only
 */
export const getCriticalAlerts = (): NewsItem[] => {
  return getAlerts({ severity: 'CRITICAL' });
};

/**
 * Get emergency contacts, optionally filtered by city or category
 */
export const getEmergencyContacts = (filters?: {
  city?: EmergencyContact['city'];
  category?: EmergencyContact['category'];
  is24_7?: boolean;
}): EmergencyContact[] => {
  let filtered = [...contactsData];

  if (filters?.city) {
    filtered = filtered.filter(contact =>
      contact.city === filters.city || contact.city === 'ALL'
    );
  }

  if (filters?.category) {
    filtered = filtered.filter(contact => contact.category === filters.category);
  }

  if (filters?.is24_7 !== undefined) {
    filtered = filtered.filter(contact => contact.is24_7 === filters.is24_7);
  }

  return filtered;
};

/**
 * Get contacts for a specific city
 */
export const getContactsByCity = (city: EmergencyContact['city']): EmergencyContact[] => {
  return getEmergencyContacts({ city });
};

/**
 * Get all guides, optionally filtered by category
 */
export const getGuides = (filters?: {
  category?: Guide['category'];
  isOfflineReady?: boolean;
}): Guide[] => {
  let filtered = [...guidesData];

  if (filters?.category) {
    filtered = filtered.filter(guide => guide.category === filters.category);
  }

  if (filters?.isOfflineReady !== undefined) {
    filtered = filtered.filter(guide => guide.isOfflineReady === filters.isOfflineReady);
  }

  return filtered;
};

/**
 * Search guides by tags or title
 */
export const searchGuides = (query: string): Guide[] => {
  const lowerQuery = query.toLowerCase();
  return guidesData.filter(guide =>
    guide.title.toLowerCase().includes(lowerQuery) ||
    guide.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Get a guide by ID
 */
export const getGuideById = (id: string): Guide | undefined => {
  return guidesData.find(guide => guide.id === id);
};

/**
 * Get all rescue tasks, optionally filtered by type, urgency, or status
 */
export const getRescueTasks = (filters?: {
  type?: RescueTask['type'];
  urgency?: RescueTask['urgency'];
  status?: RescueTask['status'];
}): RescueTask[] => {
  let filtered = [...tasksData];

  if (filters?.type) {
    filtered = filtered.filter(task => task.type === filters.type);
  }

  if (filters?.urgency) {
    filtered = filtered.filter(task => task.urgency === filters.urgency);
  }

  if (filters?.status) {
    filtered = filtered.filter(task => task.status === filters.status);
  }

  return filtered;
};

/**
 * Get open tasks only (for volunteers)
 */
export const getOpenTasks = (): RescueTask[] => {
  return getRescueTasks({ status: 'OPEN' });
};

/**
 * Get high urgency tasks
 */
export const getHighUrgencyTasks = (): RescueTask[] => {
  return getRescueTasks({ urgency: 'HIGH' });
};

/**
 * Get tasks near a location (within radius)
 */
export const getTasksNearLocation = (
  lat: number,
  long: number,
  radiusKm: number = 5
): RescueTask[] => {
  return tasksData.filter(task => {
    // Simple distance calculation (Haversine approximation)
    const latDiff = task.coords.lat - lat;
    const longDiff = task.coords.long - long;
    // Rough approximation: 1 degree ≈ 111km
    const distanceKm = Math.sqrt(latDiff * latDiff + longDiff * longDiff) * 111;
    return distanceKm <= radiusKm;
  });
};

