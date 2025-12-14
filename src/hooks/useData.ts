import { useMemo } from 'react';
import {
  getAlerts,
  getCriticalAlerts,
  getAlertsByLocation,
  getEmergencyContacts,
  getContactsByCity,
  getGuides,
  searchGuides,
  getGuideById,
  getRescueTasks,
  getOpenTasks,
  getHighUrgencyTasks,
  getTasksNearLocation,
} from '../services/dataService';
import type { NewsItem, EmergencyContact, Guide, RescueTask } from '../data';

/**
 * Hook to get alerts with optional filters
 */
export const useAlerts = (filters?: {
  severity?: NewsItem['severity'];
  location?: string;
  source?: NewsItem['source'];
}) => {
  return useMemo(() => getAlerts(filters), [
    filters?.severity,
    filters?.location,
    filters?.source,
  ]);
};

/**
 * Hook to get critical alerts
 */
export const useCriticalAlerts = () => {
  return useMemo(() => getCriticalAlerts(), []);
};

/**
 * Hook to get alerts by location
 */
export const useAlertsByLocation = (location: string) => {
  return useMemo(() => getAlertsByLocation(location), [location]);
};

/**
 * Hook to get emergency contacts with filters
 */
export const useEmergencyContacts = (filters?: {
  city?: EmergencyContact['city'];
  category?: EmergencyContact['category'];
  is24_7?: boolean;
}) => {
  return useMemo(() => getEmergencyContacts(filters), [
    filters?.city,
    filters?.category,
    filters?.is24_7,
  ]);
};

/**
 * Hook to get contacts by city
 */
export const useContactsByCity = (city: EmergencyContact['city']) => {
  return useMemo(() => getContactsByCity(city), [city]);
};

/**
 * Hook to get guides with filters
 */
export const useGuides = (filters?: {
  category?: Guide['category'];
  isOfflineReady?: boolean;
}) => {
  return useMemo(() => getGuides(filters), [filters?.category, filters?.isOfflineReady]);
};

/**
 * Hook to search guides
 */
export const useSearchGuides = (query: string) => {
  return useMemo(() => searchGuides(query), [query]);
};

/**
 * Hook to get a guide by ID
 */
export const useGuide = (id: string) => {
  return useMemo(() => getGuideById(id), [id]);
};

/**
 * Hook to get rescue tasks with filters
 */
export const useRescueTasks = (filters?: {
  type?: RescueTask['type'];
  urgency?: RescueTask['urgency'];
  status?: RescueTask['status'];
}) => {
  return useMemo(() => getRescueTasks(filters), [
    filters?.type,
    filters?.urgency,
    filters?.status,
  ]);
};

/**
 * Hook to get open tasks (for volunteers)
 */
export const useOpenTasks = () => {
  return useMemo(() => getOpenTasks(), []);
};

/**
 * Hook to get high urgency tasks
 */
export const useHighUrgencyTasks = () => {
  return useMemo(() => getHighUrgencyTasks(), []);
};

/**
 * Hook to get tasks near a location
 */
export const useTasksNearLocation = (
  lat: number,
  long: number,
  radiusKm: number = 5
) => {
  return useMemo(() => getTasksNearLocation(lat, long, radiusKm), [lat, long, radiusKm]);
};

